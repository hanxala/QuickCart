import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value.trim() === '')
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingEnvVars);
  console.error('Please set the following variables in your .env file:');
  missingEnvVars.forEach(varName => {
    console.error(`- ${varName}`);
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export configuration status along with cloudinary instance
export const isConfigured = missingEnvVars.length === 0;
export const missingVars = missingEnvVars;
export default cloudinary;
