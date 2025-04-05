import z from "zod";
import { ZodRawShape } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Logger } from "pino";

/**
 * Tool context containing configuration required for execution
 */
export interface ToolContext {
  apiConfig: {
    url: string;
    key: string;
  };
  logger?: Logger;
}

/**
 * Schema definition for a tool
 */
export const toolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.any()),
  handler: z.function().args(z.record(z.string(), z.any()), z.any()).returns(z.any()),
});

/**
 * Type representing a tool based on the schema
 */
export type Tool = z.infer<typeof toolSchema>;

/**
 * Creates a tool with typed parameters and return value
 * 
 * @param options - Tool configuration options
 * @param options.name - Name of the tool
 * @param options.description - Description of what the tool does
 * @param options.parameters - Zod schema for tool parameters
 * @param options.handler - Function that implements the tool's behavior
 * @returns A properly typed Tool object
 */
export function createTool<P extends ZodRawShape, R>(
  {
    name,
    description,
    parameters,
    handler
  }: {
    name: string;
    description: string;
    parameters: z.ZodObject<P>;
    handler: (args: z.infer<z.ZodObject<P>>, context?: ToolContext) => R | Promise<R>;
  }
): Tool {
  // Return the original Zod schema objects directly instead of converting them
  // This matches how test-tool is registered
  return {
    name,
    description,
    parameters: parameters.shape,
    handler: async (args: Record<string, any>, context?: ToolContext) => {
      const result = await handler(args as z.infer<z.ZodObject<P>>, context);

      // If result is already a CallToolResult, return it directly
      if (result && typeof result === 'object' && 'content' in result) {
        return result;
      }

      // Otherwise, wrap the result in a CallToolResult format
      const callToolResult: CallToolResult = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };

      return callToolResult;
    },
  };
}