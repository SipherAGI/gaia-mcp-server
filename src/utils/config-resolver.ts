import { isSSMParameterReference, resolveSSMParameter } from './aws-ssm.js';
import { logger } from './logger.js';

const configLogger = logger.child({ component: 'ConfigResolver' });

/**
 * Resolve a configuration value, handling SSM parameter references
 * @param value The configuration value to resolve
 * @returns The resolved value
 */
export async function resolveConfigValue<T>(value: T): Promise<T> {
  // Handle string values that might be SSM parameter references
  if (typeof value === 'string' && isSSMParameterReference(value)) {
    try {
      const resolvedValue = await resolveSSMParameter(value);
      configLogger.debug({ originalValue: value }, 'Resolved SSM parameter reference');
      return resolvedValue as unknown as T;
    } catch (error) {
      configLogger.error(
        { error, value },
        'Failed to resolve SSM parameter reference, using original value',
      );
      return value;
    }
  }

  // Handle objects recursively
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const result: Record<string, any> = {};

    for (const [key, val] of Object.entries(value)) {
      result[key] = await resolveConfigValue(val);
    }

    return result as unknown as T;
  }

  // Handle arrays recursively
  if (Array.isArray(value)) {
    const result = [];

    for (const item of value) {
      result.push(await resolveConfigValue(item));
    }

    return result as unknown as T;
  }

  // Return primitive values as is
  return value;
}

/**
 * Resolve all configuration values in an object, handling SSM parameter references
 * @param config The configuration object to resolve
 * @returns The resolved configuration object
 */
export async function resolveConfig<T extends Record<string, any>>(config: T): Promise<T> {
  return (await resolveConfigValue(config)) as T;
}
