import z from "zod";
import { createTool, ToolContext } from "../base";
import { ApiClient } from "../../api/client";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const createStyleTool = createTool({
  name: "create-style",
  description: "Create a new style in the Gaia platform using provided images",
  parameters: z.object({
    imageUrls: z.array(z.string()).describe("The URLs of the images to use for the style"),
    name: z.string().describe("The name of the style to create"),
    description: z.string().optional().describe("Optional description for the style"),
  }),
  handler: async (args, context?: ToolContext) => {
    const { imageUrls, name, description } = args;

    // Get logger from context or fallback to console
    const logger = context?.logger?.child({ tool: "create-style" }) || console;

    logger.info("Starting style creation", { styleName: name, imageCount: imageUrls.length });

    const apiClient = new ApiClient({
      baseUrl: context?.apiConfig?.url ?? process.env.GAIA_API_URL ?? "https://api.protogaia.com",
      apiKey: context?.apiConfig?.key ?? process.env.GAIA_API_KEY,
    });

    try {
      // First upload the images
      logger.info("Uploading images for style creation", { count: imageUrls.length });
      const uploadedFiles = await apiClient.uploadImages(imageUrls);
      const uploadedImageUrls = uploadedFiles
        .filter(file => file.url)
        .map(file => file.url as string);

      if (uploadedImageUrls.length === 0) {
        logger.error("No images were successfully uploaded");
        throw new Error("No images were successfully uploaded");
      }

      logger.info("Successfully uploaded images", {
        uploaded: uploadedImageUrls.length,
        total: imageUrls.length
      });

      // Create the style using the uploaded images
      logger.info("Creating style with uploaded images", { styleName: name });
      const style = await apiClient.createStyle(
        uploadedImageUrls,
        name,
        description
      );

      logger.info("Style created successfully", { styleId: style.id, styleName: name });

      const result: CallToolResult = {
        content: [
          {
            type: "text",
            text: `
Successfully created style "${name}" with ID ${style.id}
Result:\n\n
\`\`\`json
${JSON.stringify(style, null, 2)}
\`\`\`
            `,
          },
          {
            type: "image",
            data: style.thumbnailUrl,
            mimeType: "image/png",
          }
        ]
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error occurred";

      logger.error({ error }, `Failed to create style: ${errorMessage}`);

      return {
        content: [
          {
            type: "text",
            text: `Failed to create style: ${errorMessage}`
          }
        ]
      };
    }
  }
}); 