/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  },
  experimental: {
    serverActions: true,
  },
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig 