import axios from 'axios';
import { imageSize } from 'image-size';
import { Logger } from 'pino';

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
import { HttpClient, createHttpClient } from '../utils/http-client.js';
import { createLogger } from '../utils/logger.js';

const MULTIPART_FILE_CHUNK = 1024 * 1024 * 10;
// 90 seconds timeout for API requests. It depends on the Gateway's timeout
const REQUEST_TIMEOUT = 1000 * 90;

/**
 * Client for interacting with the Gaia API
 */
export class ApiClient {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;
  private readonly timeout: number;

  /**
   * Creates a new instance of the ApiClient
   *
   * @param options - Configuration options for the client
   * @param options.baseUrl - The base URL of the Gaia API
   * @param options.apiKey - Optional API key for authentication
   * @param options.logger - Optional Pino logger instance
   * @param options.timeout - Optional request timeout in milliseconds (default: 60000)
   */
  constructor({
    baseUrl,
    apiKey,
    logger,
    timeout,
  }: {
    baseUrl: string;
    apiKey?: string;
    logger?: Logger;
    timeout?: number;
  }) {
    // Store the timeout value for use in other Axios calls
    this.timeout = timeout || REQUEST_TIMEOUT;

    this.httpClient = createHttpClient({
      baseURL: baseUrl,
      timeout: this.timeout,
    });

    if (apiKey) {
      this.httpClient.setHeaders({
        Authorization: `Bearer ${apiKey}`,
      });
    }

    // Use provided logger or create a child logger from the default logger
    this.logger = logger || createLogger({ name: 'ApiClient' });
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
        this.logger.warn(`Skipping non-HTTP image URL: ${imageUrl}`);
        failedUrls.push({ url: imageUrl, error: 'URL must start with http:// or https://' });
        continue;
      }

      try {
        this.logger.info(`Processing image from URL: ${imageUrl}`);

        // Fetch the image with retry logic
        const base64Image = await fetchImage(imageUrl);

        const parts = base64Image.split(',');
        if (!parts[1]) {
          throw new Error(`Invalid base64 image format for ${imageUrl}`);
        }

        const imageBuffer = Buffer.from(parts[1], 'base64');
        const fileSize = imageBuffer.length;

        this.logger.info(`Successfully fetched image (${fileSize} bytes) from: ${imageUrl}`);

        // Extract image dimensions using image-size
        const metadata = imageSize(imageBuffer);
        if (!metadata.width || !metadata.height) {
          throw new Error('Failed to extract image dimensions');
        }

        this.logger.info(`Image dimensions: ${metadata.width}x${metadata.height}`);

        // Initialize upload
        this.logger.info(`Initializing upload for image: ${imageUrl}`);
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

        const uploadInfo = initResponse[0];
        if (!uploadInfo) {
          throw new Error('Failed to initialize upload: No upload info returned from API');
        }

        // Upload parts
        this.logger.info(`Uploading ${uploadInfo.uploadUrls.length} chunks for image: ${imageUrl}`);
        const uploadPromises = uploadInfo.uploadUrls.map(async (url: string, index: number) => {
          const start = index * MULTIPART_FILE_CHUNK;
          const end = Math.min(start + MULTIPART_FILE_CHUNK, imageBuffer.length);
          const chunk = imageBuffer.slice(start, end);
          const partNumber = index + 1;

          try {
            // Create completely new axios instance
            const res = await axios.put(url, chunk, {
              headers: {
                'Content-Type': 'application/octet-stream',
              },
              timeout: this.timeout,
            });

            return {
              eTag: res.headers['etag'],
              partNumber,
            };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to upload chunk ${partNumber} for ${imageUrl}: ${errorMsg}`);
            throw error;
          }
        });

        const uploadResults = await Promise.all(uploadPromises);
        this.logger.info(`Successfully uploaded all chunks for image: ${imageUrl}`);

        // Complete upload
        this.logger.info(`Completing upload for image: ${imageUrl}`);
        await this.httpClient.post('/api/upload/complete', [
          {
            key: uploadInfo.key,
            uploadId: uploadInfo.uploadId,
            parts: uploadResults,
          },
        ]);

        this.logger.info(`Upload completed successfully for image: ${imageUrl}`);
        uploadedFiles.push(uploadInfo.file);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to process image from URL ${imageUrl}: ${errorMsg}`);
        failedUrls.push({ url: imageUrl, error: errorMsg });
      }
    }

    if (failedUrls.length > 0) {
      this.logger.warn(
        `${failedUrls.length} of ${imageUrls.length} image uploads failed: ${failedUrls.map(f => `${f.url} (${f.error})`).join(', ')}`,
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
    return await this.httpClient.post<GaiaSdStyle>('/api/sd-styles', {
      images: imageUrls.map(url => ({
        url,
        weight: 0.5,
      })),
      name,
      description,
      isDraft: false, // Public style
    });
  }

  /**
   * Executes a recipe task on the Gaia platform
   *
   * @param request - The recipe task request containing recipe ID and parameters
   * @returns The created recipe task object
   * @throws Will throw an error if the recipe task execution fails
   */
  async doRecipeTask(request: GaiaRecipeTaskRequest): Promise<GaiaRecipeTask> {
    return await this.httpClient.post<GaiaRecipeTask>('/api/recipe/tasks/', {
      recipeId: request.recipeId,
      params: request.params,
    });
  }

  /**
   * Generates images using a recipe task on the Gaia platform
   *
   * @param request - The recipe task request containing recipe ID and parameters
   * @returns The generated images response
   * @throws Will throw an error if the image generation fails
   */
  async generateImages(request: GaiaGenerateImagesRequest) {
    return await this.httpClient.post<GaiaImagesResponse>('/api/recipe/agi-tasks/create-task', {
      recipeId: request.recipeId,
      params: request.params,
    });
  }
}
