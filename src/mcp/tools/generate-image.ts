import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ApiClient } from "../../api/client";
import { gaiaImageGeneratorSimpleParamsSchema } from "../../api/types";
import { createTool, ToolContext } from "../base";

export const generateImageTool = createTool({
  name: "generate-image",
  description: "Generate images with Protogaia",
  parameters: gaiaImageGeneratorSimpleParamsSchema,
  handler: async (args, context?: ToolContext) => {
    // Get logger from context or fallback to console
    const logger = context?.logger?.child({ tool: "generate-image" }) || console;

    logger.info("Starting image generation", { args: JSON.stringify(args) });

    const apiClient = new ApiClient({
      baseUrl: context?.apiConfig?.url ?? process.env.GAIA_API_URL ?? "https://api.protogaia.com",
      apiKey: context?.apiConfig?.key ?? process.env.GAIA_API_KEY,
    });

    try {
      logger.info("Calling Gaia API to generate images");

      const imageResponse = await apiClient.generateImages({
        recipeId: "image-generator-simple",
        params: args,
      });

      logger.info(`Successfully generated ${imageResponse.images.length} images`);

      const result: CallToolResult = {
        content: [
          {
            type: "text",
            text: `Successfully generated ${imageResponse.images.length} images`,
          },
          ...imageResponse.images.map((image) => ({
            type: "image" as const,
            data: image as string,
            mimeType: "image/png",
          })),
        ],
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error occurred";

      logger.error({ error }, `Failed to generate images: ${errorMessage}`);

      return {
        content: [
          {
            type: "text",
            text: `Failed to generate images: ${errorMessage}`
          }
        ]
      };
    }
  }
})