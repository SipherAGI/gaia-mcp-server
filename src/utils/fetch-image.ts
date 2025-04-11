import axios from 'axios';

/**
 * Fetches an image from a URL and returns it as a base64 data URL
 * @param url The URL of the image to fetch
 * @returns A promise that resolves to a base64 data URL
 */
export async function fetchImage(url: string): Promise<string> {
  try {
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
    if (!contentType?.startsWith('image/') && contentType !== 'binary/octet-stream') {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    return `data:${contentType.startsWith('image/') ? contentType : 'image/png'};base64,${base64}`;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
  }
}
