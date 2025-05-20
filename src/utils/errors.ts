import { AxiosError } from 'axios';

import { DEFAULT_GAIA_API_URL } from './constants.js';

/**
 * Error codes for Gaia API errors
 */
export enum GaiaErrorCode {
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  TIMEOUT = 'TIMEOUT',
  API_ERROR = 'API_ERROR',
}

export const GaiaErrorMessages = {
  [GaiaErrorCode.TIMEOUT]: `Your image generation may take longer than expected and still be running on Gaia. Please check your creation page to see the results at ${DEFAULT_GAIA_API_URL}/my-creations`,
  [GaiaErrorCode.SUBSCRIPTION_EXPIRED]: `Your subscription has ended. Please update to access features here: ${DEFAULT_GAIA_API_URL}/settings/account?tab=Plans&plan=subscription`,
};

/**
 * Error class for Gaia API errors
 *
 * @property cause - The cause of the error
 * @property httpStatusCode - The HTTP status code associated with the error
 * @property errorCode - The Gaia error code associated with the error
 */
export class GaiaError extends Error {
  public readonly cause?: Error;
  public readonly httpStatusCode?: number;
  public readonly errorCode?: GaiaErrorCode;

  constructor(error: Error) {
    super(error.message);
    this.name = 'GaiaError';
    this.cause = error;
    this.httpStatusCode = error instanceof AxiosError ? error.response?.status : undefined;
    this.errorCode = this.getErrorCode();
  }

  get message(): string {
    // If it just an api error normally, return the error message
    if (this.errorCode === GaiaErrorCode.API_ERROR) {
      return this.cause?.message || 'Unexpected error';
    }

    return GaiaErrorMessages[this.errorCode as keyof typeof GaiaErrorMessages];
  }

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
