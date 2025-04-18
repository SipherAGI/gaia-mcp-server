import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { ApiClient } from '../../api/client.js';
import { gaiaFaceEnhancerParamsSchema } from '../../api/types.js';
import { imageResponseToToolResult, imageResponseToText } from '../../utils/image-response.js';
import { createLogger } from '../../utils/logger.js';
import { createTool, ToolContext } from '../base.js';

export const faceEnhancerTool = createTool({
  name: 'face-enhancer',
  description: "Enhance face's details in an existing image",
  parameters: gaiaFaceEnhancerParamsSchema,
  handler: async (args, context: ToolContext) => {
    // Get logger from context or fallback to default logger
    const logger =
      context.logger?.child({ tool: 'face-enhancer' }) || createLogger({ name: 'face-enhancer' });

    logger.info('Starting face enhancement', { args: JSON.stringify(args) });

    const apiClient = new ApiClient({
      baseUrl: context.apiConfig.url,
      apiKey: context.apiConfig.key,
      logger,
    });

    try {
      logger.info('Calling Gaia API to enhance face details');

      const imageResponse = await apiClient.generateImages({
        recipeId: 'face-enhancer',
        params: args,
      });

      if (!imageResponse.images[0]) {
        throw new Error('No image was generated');
      }

      const imageResponseContent = await imageResponseToToolResult(imageResponse.images[0]);

      logger.info('Face enhancement completed successfully');

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

      logger.error({ error }, `Failed to enhance face's details: ${errorMessage}`);

      // Provide a more informative message for timeout errors
      const userMessage = isTimeoutError
        ? `Failed to enhance face's details in the image: ${errorMessage}. Note that your face enhancement may still be running on Gaia. Please check your Gaia workspace to see the results.`
        : `Failed to enhance face's details in the image: ${errorMessage}`;

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
