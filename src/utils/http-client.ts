import axios, {
  AxiosInstance,
  CreateAxiosDefaults,
  AxiosHeaderValue,
  AxiosError,
  AxiosRequestConfig,
} from 'axios';

import { GaiaError } from './errors.js';

/**
 * HTTP client wrapper around axios instance for better error handling and simplified API
 *
 * @remarks
 * This class provides a simplified interface for making HTTP requests with built-in
 * error handling through axios interceptors.
 *
 * @example
 * ```typescript
 * const client = new HttpClient();
 * const data = await client.get<ResponseType>('https://api.example.com/resource');
 * ```
 */
export class HttpClient {
  /**
   * The underlying axios instance used for making HTTP requests
   * @private
   */
  private readonly axiosInstance: AxiosInstance;

  /**
   * Creates a new HttpClient instance
   *
   * @param config - Optional axios configuration options
   */
  constructor(config?: CreateAxiosDefaults) {
    this.axiosInstance = axios.create(config);

    this.axiosInstance.interceptors.response.use(
      response => response,
      this.handleErrorResponse.bind(this),
    );
  }

  /**
   * Gets the underlying axios instance
   *
   * @returns The axios instance used by this client
   */
  get axios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Factory method to create a new HttpClient instance
   *
   * @param config - Optional axios configuration options
   * @returns A new HttpClient instance
   */
  static create(config?: CreateAxiosDefaults): HttpClient {
    return new HttpClient(config);
  }

  /**
   * Sets common headers for all requests made by this client
   *
   * @param headers - Key-value pairs of headers to set
   */
  setHeaders(headers: Record<string, AxiosHeaderValue>) {
    this.axiosInstance.defaults.headers.common = {
      ...this.axiosInstance.defaults.headers.common,
      ...headers,
    };
  }

  /**
   * Performs a GET request
   * @param url - The URL to request
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the response data
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Performs a POST request
   * @param url - The URL to request
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the response data
   */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a PUT request
   * @param url - The URL to request
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the response data
   */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a DELETE request
   * @param url - The URL to request
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the response data
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Performs a PATCH request
   * @param url - The URL to request
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the response data
   */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Handles error responses from the axios instance
   *
   * @param error - The axios error object
   * @private
   * @throws GaiaError
   */
  private handleErrorResponse(error: AxiosError) {
    throw new GaiaError(error);
  }
}

/**
 * Convenience function to create a new HttpClient instance
 *
 * @param config - Optional axios configuration options
 * @returns A new HttpClient instance
 */
export function createHttpClient(config?: CreateAxiosDefaults): HttpClient {
  return HttpClient.create(config);
}
