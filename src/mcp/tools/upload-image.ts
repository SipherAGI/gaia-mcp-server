import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import z from 'zod';

import { ApiClient } from '../../api/client.js';
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

    // Get logger from context or fallback to console
    const logger = context?.logger?.child({ tool: 'upload-image' }) || console;

    logger.info('Starting image upload', { count: imageUrls.length });

    const apiClient = new ApiClient({
      baseUrl: context?.apiConfig?.url ?? process.env.GAIA_API_URL ?? 'https://api.protogaia.com',
      apiKey: context?.apiConfig?.key ?? process.env.GAIA_API_KEY,
    });

    try {
      logger.info('Uploading images to Gaia API', { urls: imageUrls });

      const uploadedFiles = await apiClient.uploadImages(imageUrls);

      logger.info(`Successfully uploaded ${uploadedFiles.length} images`);

      const imageResultParts: CallToolResult['content'] = [];

      for (const file of uploadedFiles) {
        imageResultParts.push({
          type: 'image',
          data: file.url ?? '',
          mimeType: 'image/png',
        });
      }

      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: `Uploaded ${uploadedFiles.length} images`,
          },
          ...imageResultParts,
        ],
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error({ error }, `Failed to upload images: ${errorMessage}`);

      return {
        content: [
          {
            type: 'text',
            text: `Failed to upload images: ${errorMessage}`,
          },
        ],
      };
    }
  },
});
