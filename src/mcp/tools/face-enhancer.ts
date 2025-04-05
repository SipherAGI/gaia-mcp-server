import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ApiClient } from "../../api/client";
import { gaiaFaceEnhancerParamsSchema } from "../../api/types";
import { createTool, ToolContext } from "../base";

export const faceEnhancerTool = createTool({
  name: "face-enhancer",
  description: "Enhance face's details in an existing image",
  parameters: gaiaFaceEnhancerParamsSchema,
  handler: async (args, context?: ToolContext) => {
    // Get logger from context or fallback to console
    const logger = context?.logger?.child({ tool: "face-enhancer" }) || console;

    logger.info("Starting face enhancement", { args: JSON.stringify(args) });

    const apiClient = new ApiClient({
      baseUrl: context?.apiConfig?.url ?? process.env.GAIA_API_URL ?? "https://api.protogaia.com",
      apiKey: context?.apiConfig?.key ?? process.env.GAIA_API_KEY,
    });

    try {
      logger.info("Calling Gaia API to enhance face details");

      const imageResponse = await apiClient.generateImages({
        recipeId: "face-enhancer",
        params: args,
      });

      logger.info("Face enhancement completed successfully");

      const result: CallToolResult = {
        content: [
          {
            type: "text",
            text: `Successfully enhanced face's details in the image`,
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

      logger.error({ error }, `Failed to enhance face's details: ${errorMessage}`);

      return {
        content: [
          {
            type: "text",
            text: `Failed to enhance face's details in the image: ${errorMessage}`
          }
        ]
      };
    }
  }
})