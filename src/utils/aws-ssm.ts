import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';

import { logger } from './logger.js';

// Cache for SSM parameters to avoid repeated API calls
const parameterCache: Record<string, { value: string; timestamp: number }> = {};
// Cache expiration time in milliseconds (default: 5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * SSM parameter client for retrieving parameters from AWS Parameter Store
 */
export class SSMParameterClient {
  private client: SSMClient;
  private logger = logger.child({ component: 'SSMParameterClient' });

  constructor(region?: string) {
    const clientConfig: any = {
      region: region || process.env.AWS_REGION || 'ap-southeast-1',
    };

    // Use AWS profile if specified (for local development)
    if (process.env.AWS_PROFILE) {
      this.logger.info({ profile: process.env.AWS_PROFILE }, 'Using AWS profile for credentials');
      clientConfig.credentials = fromIni({
        profile: process.env.AWS_PROFILE,
      });
    }

    this.client = new SSMClient(clientConfig);
  }

  /**
   * Get a parameter from SSM Parameter Store
   * @param parameterName The name of the parameter to retrieve
   * @returns The parameter value
   */
  async getParameter(parameterName: string): Promise<string> {
    // Check cache first
    const cachedParam = parameterCache[parameterName];
    const now = Date.now();

    if (cachedParam && now - cachedParam.timestamp < CACHE_EXPIRATION_MS) {
      this.logger.debug({ parameterName }, 'Using cached SSM parameter');
      return cachedParam.value;
    }

    try {
      this.logger.debug({ parameterName }, 'Fetching SSM parameter');
      const command = new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true, // Automatically decrypt SecureString parameters
      });

      const response = await this.client.send(command);

      if (!response.Parameter?.Value) {
        throw new Error(`Parameter ${parameterName} not found or has no value`);
      }

      const value = response.Parameter.Value;

      // Cache the result
      parameterCache[parameterName] = {
        value,
        timestamp: now,
      };

      return value;
    } catch (error) {
      this.logger.error({ error, parameterName }, 'Failed to get SSM parameter');
      throw error;
    }
  }
}

// Singleton instance
let ssmClientInstance: SSMParameterClient | null = null;

/**
 * Get the SSM client instance (singleton)
 */
export function getSSMClient(region?: string): SSMParameterClient {
  if (!ssmClientInstance) {
    ssmClientInstance = new SSMParameterClient(region);
  }
  return ssmClientInstance;
}

/**
 * Check if a string is an SSM parameter reference
 * @param value The string to check
 * @returns True if the string is an SSM parameter reference
 */
export function isSSMParameterReference(value: string): boolean {
  return value.startsWith('ssm:');
}

/**
 * Extract the parameter name from an SSM parameter reference
 * @param reference The SSM parameter reference (e.g., ssm:/path/to/parameter)
 * @returns The parameter name
 */
export function extractParameterName(reference: string): string {
  // Remove the 'ssm:' prefix
  return reference.substring(4);
}

/**
 * Resolve an SSM parameter reference to its actual value
 * @param reference The SSM parameter reference (e.g., ssm:/path/to/parameter)
 * @returns The resolved parameter value
 */
export async function resolveSSMParameter(reference: string): Promise<string> {
  if (!isSSMParameterReference(reference)) {
    return reference;
  }

  const parameterName = extractParameterName(reference);
  const client = getSSMClient();
  return await client.getParameter(parameterName);
}
