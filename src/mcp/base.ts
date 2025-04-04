import z from "zod";
import { ZodRawShape } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Schema definition for a tool
 */
export const toolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.any()),
  handler: z.function().args(z.record(z.string(), z.any())).returns(z.any()),
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
    handler: (args: z.infer<z.ZodObject<P>>) => R | Promise<R>;
  }
): Tool {
  // Extract parameter descriptions and types for MCP
  const parameterShape = parameters.shape;
  const mcpParameters: Record<string, any> = {};

  // Convert Zod schema to MCP-compatible format
  for (const [key, zodType] of Object.entries(parameterShape)) {
    mcpParameters[key] = {
      type: getTypeFromZod(zodType),
      description: getDescriptionFromZod(zodType)
    };
  }

  return {
    name,
    description,
    parameters: mcpParameters,
    handler: async (args: Record<string, any>) => {
      const result = await handler(args as z.infer<z.ZodObject<P>>);

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

/**
 * Helper function to extract description from a Zod schema
 */
function getDescriptionFromZod(zodType: z.ZodTypeAny): string {
  return (zodType as any)._def?.description || '';
}

/**
 * Helper function to get the JSON schema type from a Zod schema
 */
function getTypeFromZod(zodType: z.ZodTypeAny): string {
  if (zodType instanceof z.ZodString) return 'string';
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'boolean';
  if (zodType instanceof z.ZodArray) return 'array';
  if (zodType instanceof z.ZodObject) return 'object';
  return 'string'; // Default to string for unknown types
}