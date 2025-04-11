import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { ApiClient } from '../../api/client.js';
import { gaiaImageGeneratorSimpleParamsSchema } from '../../api/types.js';
import { imageResponseFormatter } from '../../utils/formatter.js';
import { createLogger } from '../../utils/logger.js';
import { createTool, ToolContext } from '../base.js';

export const generateImageTool = createTool({
  name: 'generate-image',
  description: 'Generate images with Protogaia',
  parameters: gaiaImageGeneratorSimpleParamsSchema,
  handler: async (
    args: z.infer<typeof gaiaImageGeneratorSimpleParamsSchema>,
    context: ToolContext,
  ) => {
    // Get logger from context or fallback to default logger
    const logger =
      context.logger?.child({ tool: 'generate-image' }) || createLogger({ name: 'generate-image' });

    logger.info('Starting image generation', { args: JSON.stringify(args) });

    const apiClient = new ApiClient({
      baseUrl: context.apiConfig.url,
      apiKey: context.apiConfig.key,
      logger,
    });

    try {
      logger.info('Calling Gaia API to generate images');

      const imageResponse = await apiClient.generateImages({
        recipeId: 'image-generator-simple',
        params: {
          ...args,
          numberOfImages: 1, // Always generate 1 image
        },
      });

      logger.info(`Successfully generated ${imageResponse.images.length} images`);

      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: imageResponseFormatter(imageResponse),
          },
        ],
      };
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logger.error({ error }, `Failed to generate images: ${errorMessage}`);

      return {
        content: [
          {
            type: 'text',
            text: `Failed to generate images: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});
