import axios, { AxiosInstance } from 'axios';
import { imageSize } from 'image-size';

import {
  FileAssociatedResource,
  GaiaInitUploadResponse,
  GaiaRecipeTask,
  GaiaRecipeTaskRequest,
  GaiaSdStyle,
  GaiaUploadFile,
  GaiaGenerateImagesRequest,
  GaiaImagesResponse,
} from './types.js';
import { fetchImage } from '../utils/fetch-image.js';

const MULTIPART_FILE_CHUNK = 1024 * 1024 * 10;

/**
 * Client for interacting with the Gaia API
 */
export class ApiClient {
  private readonly httpClient: AxiosInstance;

  /**
   * Creates a new instance of the ApiClient
   *
   * @param options - Configuration options for the client
   * @param options.baseUrl - The base URL of the Gaia API
   * @param options.apiKey - Optional API key for authentication
   */
  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey?: string }) {
    this.httpClient = axios.create({
      baseURL: baseUrl,
    });

    if (apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  /**
   * Uploads multiple images to the Gaia API
   *
   * @param imageUrls - The URLs of the images to upload
   * @param associatedResource - The resource type to associate the uploaded file with
   * @returns An array of uploaded file information
   */
  async uploadImages(
    imageUrls: string[],
    associatedResource: FileAssociatedResource = FileAssociatedResource.STYLE,
  ): Promise<GaiaUploadFile[]> {
    const uploadedFiles: GaiaUploadFile[] = [];
    const failedUrls: { url: string; error: string }[] = [];

    for (const imageUrl of imageUrls) {
      if (!imageUrl.startsWith('http')) {
        console.warn(`Skipping non-HTTP image URL: ${imageUrl}`);
        failedUrls.push({ url: imageUrl, error: 'URL must start with http:// or https://' });
        continue;
      }

      try {
        console.info(`Processing image from URL: ${imageUrl}`);

        // Fetch the image with retry logic
        const base64Image = await fetchImage(imageUrl);

        const parts = base64Image.split(',');
        if (!parts[1]) {
          throw new Error(`Invalid base64 image format for ${imageUrl}`);
        }

        const imageBuffer = Buffer.from(parts[1], 'base64');
        const fileSize = imageBuffer.length;

        console.info(`Successfully fetched image (${fileSize} bytes) from: ${imageUrl}`);

        // Extract image dimensions using image-size
        const metadata = imageSize(imageBuffer);
        if (!metadata.width || !metadata.height) {
          throw new Error('Failed to extract image dimensions');
        }

        console.info(`Image dimensions: ${metadata.width}x${metadata.height}`);

        // Initialize upload
        console.info(`Initializing upload for image: ${imageUrl}`);
        const initResponse = await this.httpClient.post<GaiaInitUploadResponse[]>(
          '/api/upload/initialize',
          {
            files: [
              {
                filename: `image_${Date.now()}.png`,
                mimetype: 'image/png',
                metadata: {
                  width: metadata.width,
                  height: metadata.height,
                },
                fileSize,
              },
            ],
            associatedResource,
            chunkSize: MULTIPART_FILE_CHUNK,
          },
        );

        const uploadInfo = initResponse.data[0];
        if (!uploadInfo) {
          throw new Error('Failed to initialize upload: No upload info returned from API');
        }

        // Upload parts
        console.info(`Uploading ${uploadInfo.uploadUrls.length} chunks for image: ${imageUrl}`);
        const uploadPromises = uploadInfo.uploadUrls.map(async (url: string, index: number) => {
          const start = index * MULTIPART_FILE_CHUNK;
          const end = Math.min(start + MULTIPART_FILE_CHUNK, imageBuffer.length);
          const chunk = imageBuffer.slice(start, end);
          const partNumber = index + 1;

          try {
            const res = await axios.put(url, chunk, {
              headers: {
                'Content-Type': 'application/octet-stream',
              },
            });

            return {
              eTag: res.headers['etag'],
              partNumber,
            };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`Failed to upload chunk ${partNumber} for ${imageUrl}: ${errorMsg}`);
            throw error; // Re-throw to be caught by Promise.all
          }
        });

        const uploadResults = await Promise.all(uploadPromises);
        console.info(`Successfully uploaded all chunks for image: ${imageUrl}`);

        // Complete upload
        console.info(`Completing upload for image: ${imageUrl}`);
        await this.httpClient.post('/api/upload/complete', [
          {
            key: uploadInfo.key,
            uploadId: uploadInfo.uploadId,
            parts: uploadResults,
          },
        ]);

        console.info(`Upload completed successfully for image: ${imageUrl}`);
        uploadedFiles.push(uploadInfo.file);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Failed to process image from URL ${imageUrl}: ${errorMsg}`);
        failedUrls.push({ url: imageUrl, error: errorMsg });
        continue;
      }
    }

    if (failedUrls.length > 0) {
      console.warn(
        `${failedUrls.length} of ${imageUrls.length} image uploads failed:`,
        failedUrls.map(f => `${f.url} (${f.error})`).join(', '),
      );
    }

    return uploadedFiles;
  }

  /**
   * Creates a new style in the Gaia platform based on provided images
   *
   * @param imageUrls - Array of image URLs to use for creating the style
   * @param name - The name of the style to create
   * @param description - Optional description for the style
   * @returns The created style object
   * @throws Will throw an error if the style creation fails
   */
  async createStyle(imageUrls: string[], name: string, description?: string): Promise<GaiaSdStyle> {
    try {
      const res = await this.httpClient.post<GaiaSdStyle>('/api/sd-styles', {
        images: imageUrls.map(url => ({
          url,
          weight: 0.5,
        })),
        name,
        description,
        isDraft: false, // Public style
      });

      return res.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';

      throw new Error(`Failed to create style: ${message}`);
    }
  }

  /**
   * Executes a recipe task on the Gaia platform
   *
   * @param request - The recipe task request containing recipe ID and parameters
   * @returns The created recipe task object
   * @throws Will throw an error if the recipe task execution fails
   */
  async doRecipeTask(request: GaiaRecipeTaskRequest): Promise<GaiaRecipeTask> {
    try {
      const res = await this.httpClient.post<GaiaRecipeTask>('/api/recipe/tasks/', {
        recipeId: request.recipeId,
        params: request.params,
      });

      return res.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';

      throw new Error(`Failed to do recipe task: ${message}`);
    }
  }

  /**
   * Generates images using a recipe task on the Gaia platform
   *
   * @param request - The recipe task request containing recipe ID and parameters
   * @returns The generated images response
   * @throws Will throw an error if the image generation fails
   */
  async generateImages(request: GaiaGenerateImagesRequest) {
    try {
      const res = await this.httpClient.post<GaiaImagesResponse>(
        '/api/recipe/agi-tasks/create-task',
        {
          recipeId: request.recipeId,
          params: request.params,
        },
      );

      return res.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';

      throw new Error(`Failed to generate images: ${message}`);
    }
  }
}
