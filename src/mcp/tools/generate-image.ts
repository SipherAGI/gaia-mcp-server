import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { ApiClient } from '../../api/client.js';
import { gaiaImageGeneratorSimpleParamsSchema } from '../../api/types.js';
import { DEFAULT_GAIA_API_URL } from '../../utils/constants.js';
import { imageResponseToToolResult, imageResponseToText } from '../../utils/image-response.js';
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

      if (!imageResponse.images[0]) {
        throw new Error('No image was generated');
      }

      // Convert the image response to a tool result
      const imageResponseContent = await imageResponseToToolResult(imageResponse.images[0]);

      logger.info(`Successfully generated and resized image`);

      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: imageResponseToText(imageResponse),
          },
          imageResponseContent,
        ],
      };
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Check if the error is related to a timeout
      const isTimeoutError =
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('timed out') ||
        (error instanceof Error && error.name === 'TimeoutError');

      // Log the error
      logger.error({ error }, `Failed to generate images: ${errorMessage}`);

      // Provide a more informative message for timeout errors
      const userMessage = isTimeoutError
        ? `Failed to generate images: ${errorMessage}. Note that your image generation may still be running on Gaia. Please check your creation page to see the results at ${DEFAULT_GAIA_API_URL}/my-creations`
        : `Failed to generate images: ${errorMessage}`;

      return {
        content: [
          {
            type: 'text',
            text: userMessage,
          },
        ],
        isError: true,
      };
    }
  },
});
