import axios from 'axios';

/**
 * Fetches an image from a URL and returns it as a base64 data URL
 * @param url The URL of the image to fetch
 * @param retryCount Number of retries if fetch fails (default 3)
 * @param retryDelay Delay between retries in ms (default 1000)
 * @returns A promise that resolves to a base64 data URL
 */
export async function fetchImage(url: string, retryCount = 3, retryDelay = 1000): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      // Only add delay for retry attempts (not the first attempt)
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      // Use a regular axios instance without the Gaia API key for external image fetching
      const response = await axios.get(url, {
        signal: controller.signal,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'image/*',
        },
        validateStatus: status => status >= 200 && status < 300, // Only accept 2xx responses
      });

      clearTimeout(timeoutId);

      // Check if response is ok and is an image
      const contentType = response.headers['content-type'];
      if (!contentType?.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      return `data:${contentType};base64,${base64}`;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);

      // Log retry attempts
      if (attempt < retryCount) {
        console.warn(
          `Failed to fetch image from URL ${url} (attempt ${attempt + 1}/${retryCount + 1}): ${lastError.message}. Retrying...`,
        );
      }
    }
  }

  // If we get here, all attempts failed
  throw new Error(
    `Failed to fetch image from URL ${url} after ${retryCount + 1} attempts: ${lastError?.message}`,
  );
}
