import { z } from 'zod';

import { ApiClient } from '../../api/client.js';
import { imageResponseToToolResult, imageResponseToText } from '../../utils/image-response.js';
import { createLogger } from '../../utils/logger.js';
import { createTool, ToolContext } from '../base.js';

const upscalerSchema = z.object({
  image: z.string().url().describe("The image URL to upscale. It must be a valid GAIA's image URL"),
  ratio: z
    .number()
    .optional()
    .default(2)
    .describe('The ratio to upscale the image. It must be a number between 1 and 4'),
});

export const upscalerTool = createTool({
  name: 'upscaler',
  description: 'Enhance the resolution quality of images',
  parameters: upscalerSchema,
  handler: async (args: z.infer<typeof upscalerSchema>, context: ToolContext) => {
    const { image, ratio } = args;

    // Get logger from context or fallback to default logger
    const logger =
      context.logger?.child({ tool: 'upscaler' }) || createLogger({ name: 'upscaler' });

    logger.info('Starting image upscaling', { image, ratio });

    const apiClient = new ApiClient({
      baseUrl: context.apiConfig.url,
      apiKey: context.apiConfig.key,
      logger,
    });

    try {
      logger.info('Upscaling image', { image, ratio });

      const imageResponse = await apiClient.generateImages({
        recipeId: 'upscaler',
        params: {
          image: image as string,
          upscale_mode: '4x-Ultrasharp.pt',
          upscale_ratio: ratio ?? 2,
        },
      });

      if (!imageResponse.images[0]) {
        throw new Error('No image was generated');
      }

      const imageResponseContent = await imageResponseToToolResult(imageResponse.images[0]);

      logger.info('Upscaled image', { imageResponse });

      return {
        content: [
          {
            type: 'text',
            text: imageResponseToText(imageResponse),
          },
          imageResponseContent,
        ],
      };
    } catch (error: unknown) {
      logger.error({ error }, `Failed to upscale image`);

      return {
        content: [
          {
            type: 'text',
            text: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
        isError: true,
      };
    }
  },
});
