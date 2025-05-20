import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { ApiClient } from '../../api/client.js';
import { gaiaRemixParamsSchema } from '../../api/types.js';
import { GaiaError } from '../../utils/errors.js';
import { imageResponseToToolResult, imageResponseToText } from '../../utils/image-response.js';
import { createLogger } from '../../utils/logger.js';
import { createTool, ToolContext } from '../base.js';

export const remixTool = createTool({
  name: 'remix',
  description: 'Create new variations of an existing image',
  parameters: gaiaRemixParamsSchema,
  handler: async (args, context: ToolContext) => {
    const logger = context.logger?.child({ tool: 'remix' }) || createLogger({ name: 'remix' });

    logger.info('Starting remix operation', { args: JSON.stringify(args) });

    const apiClient = new ApiClient({
      baseUrl: context.apiConfig.url,
      apiKey: context.apiConfig.key,
      logger,
    });

    try {
      logger.info('Calling Gaia API to generate image variations');

      const imageResponse = await apiClient.generateImages({
        recipeId: 'remix',
        params: {
          ...args,
          numberOfImages: 1, // Always generate 1 image
        },
      });

      if (!imageResponse.images[0]) {
        throw new Error('No image was generated');
      }

      const imageResponseContent = await imageResponseToToolResult(imageResponse.images[0]);

      logger.info(`Successfully created ${imageResponse.images.length} variations`);

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
      logger.error({ error }, `Failed to create image variations`);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof GaiaError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        content: [
          {
            type: 'text',
            text: `Failed to create image variations: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});
