import z from 'zod';

export enum FileAssociatedResource {
  USER_AVATAR = 'USER_AVATAR',
  USER_COVER_IMAGE = 'USER_COVER_IMAGE',
  WORKSPACE = 'WORKSPACE',
  ARTICLE_COVER_IMAGE = 'ARTICLE_COVER_IMAGE',
  ARTICLE_FILE = 'ARTICLE_FILE',
  STYLE = 'STYLE',
  SD_WORKFLOW = 'SD_WORKFLOW',
  CHAT_ROOM_THUMBNAIL = 'CHAT_ROOM_THUMBNAIL',
  SD_MODEL = 'SD_MODEL',
  SD_MODEL_TRAINING = 'SD_MODEL_TRAINING',
  PROMPT_LIBRARY = 'PROMPT_LIBRARY',
  NONE = 'NONE',
}

export const gaiaRecipeTaskStatus = [
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'DELETED',
  'FAILED',
  'CANCELED',
  'DRAFT',
] as const;

export const gaiaRecipeType = [
  'normal',
  'inpaint',
  'chain',
  'comfyui',
  'describe',
  'turbo',
  'other',
] as const;

export const gaiaPromptStyles = [
  'base',
  'enhance',
  'anime',
  'photographic',
  'cinematic',
  'analog film',
  'digital art',
  'fantasy art',
  'line art',
  'pixel art',
  'artstyle-watercolor',
  'comic book',
  'neonpunk',
  '3d-model',
  'misc-fairy tale',
  'misc-gothic',
  'photo-long exposure',
  'photo-tilt-shift',
  'lowpoly',
  'origami',
  'craft clay',
  'game-minecraft',
] as const;

export const gaiaAspectRatios = ['1:1', '3:2', '2:3', '16:9', '9:16'] as const;

export const gaiaQueueType = ['default', 'fast', 'flux1', 'dedicated'] as const;

export const recipeIds = ['image-generator-simple', 'remix', 'face-enhancer', 'upscaler'] as const;

export const gaiaUploadFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  url: z.string().nullable(),
  ownerUid: z.string(),
  createdAt: z.string(),
  uploaded: z.boolean(),
});

export const gaiaInitUploadResponseSchema = z.object({
  key: z.string(),
  filename: z.string(),
  uploadId: z.string(),
  uploadUrls: z.array(z.string()),
  file: gaiaUploadFileSchema,
});

export const gaiaSdStyleCreatorSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string(),
  picture: z.string(),
  username: z.string(),
});

export const gaiaSdStyleTagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const gaiaSdStyleWorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: z.string(),
});

export const gaiaSdStyleImageSchema = z.object({
  url: z.string(),
  weight: z.number(),
});

export const gaiaSdStyleCapabilitiesSchema = z.object({
  canView: z.boolean(),
  canUpdate: z.boolean(),
  canMove: z.boolean(),
  canDelete: z.boolean(),
  canRecover: z.boolean(),
  canShare: z.boolean(),
  canAddToLibrary: z.boolean(),
  canRemoveFromLibrary: z.boolean(),
});

export const gaiaSdStyleMetricSchema = z.object({
  id: z.number(),
  favoriteCount: z.number(),
});

export const gaiaSdStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumbnailUrl: z.string(),
  thumbnailWidth: z.number(),
  thumbnailHeight: z.number(),
  thumbnailModerationRating: z.enum(['unrated', 'safe', 'sensitive', 'unsafe']),
  isDraft: z.boolean(),
  description: z.string(),
  discoverableAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  sharingMode: z.enum(['restricted', 'public', 'private']),
  creator: gaiaSdStyleCreatorSchema,
  tags: z.array(gaiaSdStyleTagSchema),
  workspace: gaiaSdStyleWorkspaceSchema,
  workspaceId: z.string(),
  images: z.array(gaiaSdStyleImageSchema),
  pinned: z.boolean(),
  capabilities: gaiaSdStyleCapabilitiesSchema,
  favoritedByUser: z.boolean(),
  metric: gaiaSdStyleMetricSchema,
  createdAt: z.string(),
});

export const gaiaRecipeTaskRequestSchema = z.object({
  recipeId: z.string(),
  params: z.record(z.string(), z.any()),
});

export const gaiaImageSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  id: z.string(),
  s3Key: z.string(),
  name: z.string(),
  sampler: z.string(),
  steps: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  cfgScale: z.string(),
  seed: z.string(),
  modelHash: z.string(),
  modelName: z.string(),
  prompt: z.string(),
  negativePrompt: z.string(),
  denoisingStrength: z.string(),
  upscaler: z.string(),
  scaleFactor: z.string(),
  blurHash: z.string(),
  note: z.string(),
  tags: z.record(z.any()).optional(),
  owner: z.record(z.any()).optional(),
  ownerUid: z.string(),
  folder: z.record(z.any()).optional(),
  folderId: z.string(),
  deletedAt: z.string().datetime().optional(),
  expireAt: z.string().datetime().optional(),
  originalFolder: z.record(z.any()).optional(),
  recipeTask: z.record(z.any()).optional(),
  recipeTaskId: z.string(),
  recipe: z.record(z.any()).optional(),
  recipeId: z.string(),
  imagePermissions: z.record(z.any()).optional(),
  size: z.number().int(),
  fullMetadata: z.string(),
  url: z.string(),
});

export const gaiaRecipeTaskSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  id: z.string(),
  recipeId: z.string(),
  recipeType: z.enum(gaiaRecipeType).default('normal'),
  params: z.record(z.any()).optional(),
  folderId: z.string(),
  creator: z.object({
    uid: z.string(),
  }),
  status: z.enum(gaiaRecipeTaskStatus),
  priority: z.number().int(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.string().datetime().optional(),
  images: z.array(gaiaImageSchema),
  name: z.string(),
  prompt: z.string(),
  seed: z.number().int(),
  runnerId: z.string(),
  error: z.string().optional(),
  resultImages: z.array(z.string()),
  executionDuration: z.number().int().optional(),
  queueType: z.enum(gaiaQueueType).default('default'),
});

export const gaiaImageGeneratorSimpleParamsSchema = z.object({
  prompt: z.string().describe('The prompt to generate the image.'),
  aspectRatio: z
    .enum(gaiaAspectRatios)
    .default('1:1')
    .optional()
    .describe(
      'Aspect ratio of the image. One of the following: "1:1", "3:2", "2:3", "16:9", "9:16"',
    ),
  promptStyle: z
    .enum(gaiaPromptStyles)
    .default('base')
    .optional()
    .describe(
      "Style to apply to the generated image. Choose from predefined styles. It's not style id and style name.",
    ),
  styleId: z
    .string()
    .optional()
    .describe('The style ID to use. It must be styleId created by createStyleTool from Gaia'),
});

export const gaiaRemixParamsSchema = z.object({
  inputImage: z
    .string()
    .describe(
      "The image URL to remix. It must be GAIA's image url: contains `https://api.protogaia.com/` or `https://artventure-api.sipher.gg`",
    ),
  variationControl: z
    .enum(['subtle', 'medium', 'strong'])
    .optional()
    .default('subtle')
    .describe(
      'The variation control of the remix. One of the following: "subtle", "medium", "strong"',
    ),
});

export const commonImageGeneratorParamsSchema = z.object({
  numberOfImages: z.number().int().optional(),
});

export const gaiaFaceEnhancerParamsSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The image URL to enhance. It must be GAIA's image url: contains `https://api.protogaia.com/` or `https://artventure-api.sipher.gg`",
    ),
  prompt: z.string().describe('Prompt for the enhancement'),
});

export const gaiaImageGeneratedResponseSchema = z.object({
  success: z.boolean(),
  images: z.array(z.string()),
  error: z.string().optional(),
});

export const gaiaUpscalerParamsSchema = z.object({
  image: z.string().url().describe("The image URL to upscale. It must be a valid GAIA's image URL"),
  upscale_mode: z.string().describe('The upscale mode to use.'),
  upscale_ratio: z
    .number()
    .describe('The ratio to upscale the image. It must be a number between 1 and 4'),
});

export const gaiaGenerateImagesRequestSchema = z.object({
  recipeId: z.enum(recipeIds),
  params: z.union([
    gaiaImageGeneratorSimpleParamsSchema,
    gaiaRemixParamsSchema,
    gaiaFaceEnhancerParamsSchema,
    gaiaUpscalerParamsSchema,
    commonImageGeneratorParamsSchema,
  ]),
});

export type GaiaUploadFile = z.infer<typeof gaiaUploadFileSchema>;
export type GaiaInitUploadResponse = z.infer<typeof gaiaInitUploadResponseSchema>;
export type GaiaSdStyle = z.infer<typeof gaiaSdStyleSchema>;
export type GaiaRecipeTaskRequest = z.infer<typeof gaiaRecipeTaskRequestSchema>;
export type GaiaImage = z.infer<typeof gaiaImageSchema>;
export type GaiaRecipeTask = z.infer<typeof gaiaRecipeTaskSchema>;
export type GaiaImagesResponse = z.infer<typeof gaiaImageGeneratedResponseSchema>;
export type GaiaGenerateImagesRequest = z.infer<typeof gaiaGenerateImagesRequestSchema>;
