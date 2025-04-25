/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      console.log('Server-side environment variables:');
      console.log('AZURE_OPENAI_API_KEY length:', process.env.AZURE_OPENAI_API_KEY?.length);
      console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
      console.log('AZURE_OPENAI_DEPLOYMENT_NAME:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
    }
    return config;
  }
}

module.exports = nextConfig 