import { createStyleTool } from './create-style.js';
import { faceEnhancerTool } from './face-enhancer.js';
import { generateImageTool } from './generate-image.js';
import { remixTool } from './remix.js';
import { uploadImageTool } from './upload-image.js';
import { upscalerTool } from './upscaler.js';

export const tools = [
  uploadImageTool,
  createStyleTool,
  generateImageTool,
  remixTool,
  faceEnhancerTool,
  upscalerTool,
];
