import sharp from 'sharp';

import { fetchImage } from './fetch-image.js';
import { GaiaImagesResponse } from '../api/types.js';

// Maximum width/height to resize the image to
const MAX_IMAGE_DIMENSION = 1024;

export const imageResponseToToolResult = async (
  imageUrl: string,
): Promise<{ type: 'image'; data: string; mimeType: string }> => {
  // Fetch image as a data URL
  const base64DataUrl = await fetchImage(imageUrl);

  // Extract the pure base64 data
  const parts = base64DataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid base64 data URL format');
  }

  // We've already checked that parts[1] exists in the condition above
  const base64Data = parts[1]!;

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Resize the image to reduce file size
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside', // Preserve aspect ratio
      withoutEnlargement: true, // Don't enlarge if smaller than the max dimensions
    })
    .toFormat('jpeg', { quality: 80 }) // Convert to JPEG with 80% quality
    .toBuffer();

  // Convert resized image back to base64
  const resizedBase64 = resizedImageBuffer.toString('base64');

  return {
    type: 'image' as const,
    data: resizedBase64,
    mimeType: 'image/jpeg',
  };
};

export const imageResponseToText = (imageResponse: GaiaImagesResponse) => {
  return `Successfully generated ${imageResponse.images.length} images.\n
${imageResponse.images.map(image => `${image}`).join('\n')}
  `;
};
