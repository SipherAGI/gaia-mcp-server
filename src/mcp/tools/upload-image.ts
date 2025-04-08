import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import z from 'zod';

import { ApiClient } from '../../api/client.js';
import { logger as defaultLogger } from '../../utils/logger.js';
import { createTool, ToolContext } from '../base.js';

const uploadImageSchema = z.object({
  imageUrls: z.array(z.string()).describe('The URLs of the images to upload'),
});

export const uploadImageTool = createTool({
  name: 'upload-image',
  description: 'Upload images to the Gaia platform',
  parameters: uploadImageSchema,
  handler: async (args: z.infer<typeof uploadImageSchema>, context?: ToolContext) => {
    const { imageUrls } = args;

    // Get logger from context or fallback to default logger
    const logger =
      context?.logger?.child({ tool: 'upload-image' }) ||
      defaultLogger.child({ tool: 'upload-image' });

    logger.info('Starting image upload', { count: imageUrls.length, urls: imageUrls });

    if (!imageUrls.length) {
      logger.warn('No image URLs provided');
      return {
        content: [
          {
            type: 'text',
            text: 'No image URLs provided. Please provide at least one image URL.',
          },
        ],
      };
    }

    const apiClient = new ApiClient({
      baseUrl: context?.apiConfig?.url ?? process.env.GAIA_API_URL ?? 'https://api.protogaia.com',
      apiKey: context?.apiConfig?.key ?? process.env.GAIA_API_KEY,
      logger,
    });

    try {
      logger.info('Uploading images to Gaia API');

      const uploadedFiles = await apiClient.uploadImages(imageUrls);

      if (uploadedFiles.length === 0) {
        logger.warn('No images were successfully uploaded', { requestedCount: imageUrls.length });
        return {
          content: [
            {
              type: 'text',
              text: `Failed to upload any images. Please check the provided URLs and try again.`,
            },
          ],
        };
      }

      logger.info(`Successfully uploaded ${uploadedFiles.length} of ${imageUrls.length} images`);

      const successRatio = uploadedFiles.length / imageUrls.length;
      const imageResultParts: CallToolResult['content'] = [];

      for (const file of uploadedFiles) {
        if (!file.url) {
          logger.warn('Uploaded file missing URL', { file });
          continue;
        }

        imageResultParts.push({
          type: 'image',
          data: file.url,
          mimeType: 'image/png',
        });
      }

      // Determine appropriate message based on success rate
      let resultMessage = `Uploaded ${uploadedFiles.length} of ${imageUrls.length} images`;
      if (successRatio < 1) {
        resultMessage += `. Some images could not be uploaded. Please check the image URLs.`;
      }

      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: resultMessage,
          },
          ...imageResultParts,
        ],
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error({ error }, `Failed to upload images: ${errorMessage}`);

      // Provide more helpful error message
      let userFriendlyMessage = `Failed to upload images: ${errorMessage}`;

      // Add troubleshooting tips based on common errors
      if (errorMessage.includes('status code 500')) {
        userFriendlyMessage +=
          '\n\nThe server encountered an internal error. This might be due to:' +
          '\n- Temporary server issues' +
          '\n- The image URL being inaccessible' +
          '\n- The image format being unsupported' +
          '\n\nPlease try with a different image URL or try again later.';
      } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        userFriendlyMessage +=
          '\n\nCould not connect to the image server. Please check:' +
          '\n- If the URL is correct' +
          '\n- If the server is currently accessible' +
          '\n- Your internet connection';
      }

      return {
        content: [
          {
            type: 'text',
            text: userFriendlyMessage,
          },
        ],
      };
    }
  },
});
