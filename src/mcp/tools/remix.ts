import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ApiClient } from "../../api/client";
import { createTool, ToolContext } from "../base";
import { gaiaRemixParamsSchema } from "../../api/types";

export const remixTool = createTool({
  name: "remix",
  description: "Create new variations of an existing image",
  parameters: gaiaRemixParamsSchema,
  handler: async (args, context?: ToolContext) => {
    const logger = context?.logger?.child({ tool: "remix" }) || console;

    logger.info("Starting remix operation", { args: JSON.stringify(args) });

    const apiClient = new ApiClient({
      baseUrl: context?.apiConfig?.url ?? process.env.GAIA_API_URL ?? "https://api.protogaia.com",
      apiKey: context?.apiConfig?.key ?? process.env.GAIA_API_KEY,
    });

    try {
      logger.info("Calling Gaia API to generate image variations");

      const imageResponse = await apiClient.generateImages({
        recipeId: "remix",
        params: args,
      });

      logger.info(`Successfully created ${imageResponse.images.length} variations`);

      const result: CallToolResult = {
        content: [
          {
            type: "text",
            text: `Successfully created ${imageResponse.images.length} variations of the image`,
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

      logger.error({ error }, `Failed to create image variations: ${errorMessage}`);

      return {
        content: [
          {
            type: "text",
            text: `Failed to create variations of the image: ${errorMessage}`
          }
        ]
      };
    }
  }
})