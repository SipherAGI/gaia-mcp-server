import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { ApiClient } from '../../api/client.js';
import { gaiaFaceEnhancerParamsSchema } from '../../api/types.js';
import { imageResponseFormatter } from '../../utils/formatter.js';
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

      logger.info('Face enhancement completed successfully');

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

      logger.error({ error }, `Failed to enhance face's details: ${errorMessage}`);

      return {
        content: [
          {
            type: 'text',
            text: `Failed to enhance face's details in the image: ${errorMessage}`,
          },
        ],
      };
    }
  },
});
