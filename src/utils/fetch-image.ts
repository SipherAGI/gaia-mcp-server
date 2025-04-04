import axios from "axios";

export async function fetchImage(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Use a regular axios instance without the Gaia API key for external image fetching
    const response = await axios.get(url, {
      signal: controller.signal,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'image/*',
      },
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
    throw new Error(`Failed to fetch image from URL ${url}: ${error}`);
  }
}
