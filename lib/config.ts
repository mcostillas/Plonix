export const OCR_CONFIG = {
  provider: 'google-vision', // 'google-vision' | 'azure' | 'aws-textract'
  
  googleVision: {
    apiKey: process.env.GOOGLE_VISION_API_KEY,
    endpoint: 'https://vision.googleapis.com/v1/images:annotate',
    features: ['TEXT_DETECTION'],
    costPerImage: 1.50 // PHP
  },
  
  azure: {
    apiKey: process.env.AZURE_VISION_API_KEY,
    endpoint: process.env.AZURE_VISION_ENDPOINT,
    costPerImage: 2.00 // PHP
  },
  
  awsTextract: {
    region: 'ap-southeast-1',
    costPerImage: 3.00 // PHP
  },
  
  fallback: {
    useGPT4oMini: true,
    costPerImage: 5.00 // PHP
  }
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/heic'
]

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
