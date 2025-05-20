import { AxiosError } from 'axios';

import { DEFAULT_GAIA_URL } from './constants.js';

/**
 * Enumeration of error codes for Gaia API errors.
 * These codes help identify specific error conditions when interacting with the Gaia API.
 */
export enum GaiaErrorCode {
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  TIMEOUT = 'TIMEOUT',
  API_ERROR = 'API_ERROR',
}

/**
 * Mapping of Gaia error codes to user-friendly error messages.
 * These messages provide clear instructions for users when specific errors occur.
 */
export const GaiaErrorMessages = {
  [GaiaErrorCode.TIMEOUT]: `Your image generation may take longer than expected and still be running on Gaia. Please check your creation page to see the results at ${DEFAULT_GAIA_URL}/my-creations`,
  [GaiaErrorCode.SUBSCRIPTION_EXPIRED]: `Your subscription has ended. Please update to access features here: ${DEFAULT_GAIA_URL}/settings/account?tab=Plans&plan=subscription`,
  [GaiaErrorCode.API_ERROR]: 'An error occurred while communicating with the Gaia API',
};

function getGaiaErrorCode(error: Error): GaiaErrorCode {
  // Check if error is timeout error
  if (
    error.message.toLowerCase().includes('timeout') ||
    error.message.toLowerCase().includes('timed out') ||
    (error instanceof AxiosError && error.code === 'ECONNABORTED')
  ) {
    return GaiaErrorCode.TIMEOUT;
  }

  // Check if error is subscription expired error
  if (error.message.toLowerCase().startsWith('your subscription has ended')) {
    return GaiaErrorCode.SUBSCRIPTION_EXPIRED;
  }

  // Otherwise it's an API error
  return GaiaErrorCode.API_ERROR;
}

function getGaiaErrorMessage(error: Error): string {
  // If it just an api error normally, return the error message
  if (getGaiaErrorCode(error) === GaiaErrorCode.API_ERROR) {
    return error.message;
  }

  return GaiaErrorMessages[getGaiaErrorCode(error)];
}

/**
 * Custom error class for handling Gaia API errors.
 * Extends the standard Error class with additional properties specific to Gaia API interactions.
 *
 * @class GaiaError
 * @extends {Error}
 * @property {Error} [cause] - The underlying error that caused this GaiaError
 */
export class GaiaError extends Error {
  public readonly cause?: Error;

  /**
   * Creates a new GaiaError instance.
   *
   * @param {Error} error - The original error to wrap
   */
  constructor(error: Error) {
    super(getGaiaErrorMessage(error));
    this.name = 'GaiaError';
    this.cause = error;
  }
}

export function isGaiaError(error: unknown): error is GaiaError {
  return (
    error !== null && typeof error === 'object' && 'name' in error && error.name === 'GaiaError'
  );
}
