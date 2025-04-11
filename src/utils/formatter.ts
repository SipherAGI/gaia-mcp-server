import { GaiaImagesResponse } from '../api/types.js';

export const imageResponseFormatter = (imageResponse: GaiaImagesResponse) => {
  return `Successfully generated ${imageResponse.images.length} images.\n
Image urls:\n
${imageResponse.images.map((image, index) => `- [image-${index + 1}](${image})`).join('\n')}
  `;
};
