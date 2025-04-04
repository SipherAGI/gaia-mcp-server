import axios, { AxiosInstance } from "axios";
import {
  FileAssociatedResource,
  GaiaInitUploadResponse,
  GaiaRecipeTask,
  GaiaRecipeTaskRequest,
  GaiaSdStyle,
  GaiaUploadFile,
} from './types';
import { fetchImage } from '@/utils/fetch-image';
import { imageSize } from 'image-size';

const MULTIPART_FILE_CHUNK = 1024 * 1024 * 10;

export class ApiClient {
  private readonly httpClient: AxiosInstance;

  constructor({ baseUrl, apiKey }: { baseUrl: string, apiKey?: string }) {
    this.httpClient = axios.create({
      baseURL: baseUrl,
    });

    if (apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  /**
   * Uploads multiple images to the Gaia API
   * @param imageUrls - The URLs of the images to upload
   * @param associatedResource - The resource type to associate the uploaded file with
   * @returns An array of uploaded file information
   */
  async uploadImages(
    imageUrls: string[],
    associatedResource: FileAssociatedResource = FileAssociatedResource.STYLE,
  ) {
    const uploadedFiles: GaiaUploadFile[] = [];

    for (const imageUrl of imageUrls) {
      if (!imageUrl.startsWith('http')) {
        // skip non-http image urls
        continue;
      }

      try {
        // Fetch the image
        const base64Image = await fetchImage(imageUrl);

        const parts = base64Image.split(',');
        if (!parts[1]) {
          throw new Error(`Invalid base64 image format for ${imageUrl}`);
        }

        const imageBuffer = Buffer.from(parts[1], 'base64');
        const fileSize = imageBuffer.length;

        // Extract image dimensions using image-size
        const metadata = imageSize(imageBuffer);
        if (!metadata.width || !metadata.height) {
          throw new Error('Failed to extract image dimensions');
        }

        // Initialize upload
        const initResponse = await this.httpClient.post<GaiaInitUploadResponse[]>(
          '/api/upload/initialize',
          {
            file: [
              {
                filename: 'image.png',
                size: fileSize,
                mimeType: 'image/png',
                metadata: {
                  width: metadata.width,
                  height: metadata.height,
                }
              },
              fileSize,
            ],
            associatedResource,
            chunkSize: MULTIPART_FILE_CHUNK,
          }
        )

        const uploadInfo = initResponse.data[0];
        if (!uploadInfo) {
          throw new Error('Failed to initialize upload');
        }

        // Upload parts
        const uploadPromises = uploadInfo.uploadUrls.map(
          async (url, index) => {
            const start = index * MULTIPART_FILE_CHUNK;
            const end = Math.min(
              start + MULTIPART_FILE_CHUNK,
              imageBuffer.length,
            );
            const chunk = imageBuffer.slice(start, end);
            const partNumber = index + 1;

            const res = await axios.put(url, chunk, {
              headers: {
                'Content-Type': 'application/octet-stream',
              },
            });

            return {
              eTag: res.headers['etag'],
              partNumber,
            };
          },
        )

        const uploadResults = await Promise.all(uploadPromises);

        // Complete upload
        await this.httpClient.post('/api/upload/complete', [
          {
            key: uploadInfo.key,
            uploadId: uploadInfo.uploadId,
            parts: uploadResults,
          },
        ]);

        uploadedFiles.push(uploadInfo.file);
      } catch (error) {
        console.error(`Failed to fetch image from URL ${imageUrl}: ${error}`);
        continue;
      }
    }

    return uploadedFiles;
  }

  async createStyle(
    imageUrls: string[],
    name: string,
    description?: string,
  ): Promise<GaiaSdStyle> {
    try {
      const res = await this.httpClient.post<GaiaSdStyle>(
        '/api/sd-styles',
        {
          images: imageUrls.map((url) => ({
            url,
            weight: 0.5,
          })),
          name,
          description,
          isDraft: false, // Public style
        },
      );

      return res.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new Error(`Failed to create style: ${message}`);
    }
  }

  async doRecipeTask(
    request: GaiaRecipeTaskRequest,
  ): Promise<GaiaRecipeTask> {
    try {
      const res = await this.httpClient.post<GaiaRecipeTask>(
        '/api/recipe/tasks/',
        {
          recipeId: request.recipeId,
          params: request.params,
        },
      );

      return res.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new Error(`Failed to do recipe task: ${message}`);
    }
  }
}