import { AxiosError } from 'axios';

import { DEFAULT_GAIA_API_URL } from './constants.js';

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
  [GaiaErrorCode.TIMEOUT]: `Your image generation may take longer than expected and still be running on Gaia. Please check your creation page to see the results at ${DEFAULT_GAIA_API_URL}/my-creations`,
  [GaiaErrorCode.SUBSCRIPTION_EXPIRED]: `Your subscription has ended. Please update to access features here: ${DEFAULT_GAIA_API_URL}/settings/account?tab=Plans&plan=subscription`,
};

/**
 * Custom error class for handling Gaia API errors.
 * Extends the standard Error class with additional properties specific to Gaia API interactions.
 *
 * @class GaiaError
 * @extends {Error}
 * @property {Error} [cause] - The underlying error that caused this GaiaError
 * @property {number} [httpStatusCode] - The HTTP status code associated with the error (if applicable)
 * @property {GaiaErrorCode} [errorCode] - The specific Gaia error code categorizing this error
 */
export class GaiaError extends Error {
  public readonly cause?: Error;
  public readonly httpStatusCode?: number;
  public readonly errorCode?: GaiaErrorCode;

  /**
   * Creates a new GaiaError instance.
   *
   * @param {Error} error - The original error to wrap
   */
  constructor(error: Error) {
    super(error.message);
    this.name = 'GaiaError';
    this.cause = error;
    this.httpStatusCode = error instanceof AxiosError ? error.response?.status : undefined;
    this.errorCode = this.getErrorCode();
  }

  /**
   * Gets the appropriate error message based on the error code.
   * For API errors, returns the original error message.
   * For known error types, returns the corresponding user-friendly message.
   *
   * @returns {string} The user-friendly error message
   */
  get message(): string {
    // If it just an api error normally, return the error message
    if (this.errorCode === GaiaErrorCode.API_ERROR) {
      return this.cause?.message || 'Unexpected error';
    }

    return GaiaErrorMessages[this.errorCode as keyof typeof GaiaErrorMessages];
  }

  /**
   * Determines the appropriate GaiaErrorCode based on the error properties.
   * Analyzes the error message and HTTP status code to categorize the error.
   *
   * @private
   * @returns {GaiaErrorCode} The determined error code
   */
  private getErrorCode(): GaiaErrorCode {
    // Check if error is timeout error
    if (
      this.cause?.message?.toLowerCase().includes('timeout') ||
      this.cause?.message?.toLowerCase().includes('timed out') ||
      (this.cause instanceof AxiosError && this.cause.code === 'ECONNABORTED')
    ) {
      return GaiaErrorCode.TIMEOUT;
    }

    // Check if error is subscription expired error
    if (
      this.httpStatusCode === 400 &&
      this.cause?.message?.toLowerCase().startsWith('your subscription has ended')
    ) {
      return GaiaErrorCode.SUBSCRIPTION_EXPIRED;
    }

    // Otherwise it's an API error
    return GaiaErrorCode.API_ERROR;
  }
}
