import z from "zod";
import { createTool } from "../base";
import { ApiClient } from "../../api/client";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const uploadImageTool = createTool({
  name: "upload-image",
  description: "Upload images to the Gaia platform",
  parameters: z.object({
    imageUrls: z.array(z.string()).describe("The URLs of the images to upload"),
  }),
  handler: async (args) => {
    const { imageUrls } = args;
    const apiClient = new ApiClient({
      baseUrl: process.env.GAIA_API_URL ?? "https://api.protogaia.com",
      apiKey: process.env.GAIA_API_KEY,
    });

    const uploadedFiles = await apiClient.uploadImages(imageUrls);
    const imageResultParts: CallToolResult["content"] = [];

    for (const file of uploadedFiles) {
      imageResultParts.push({
        type: "image",
        data: file.url ?? "",
        mimeType: "image/png",
      });
    }

    const result: CallToolResult = {
      content: [
        {
          type: "text",
          text: `Uploaded ${uploadedFiles.length} images`,
        },
        ...imageResultParts,
      ]
    };

    return result;
  }
});