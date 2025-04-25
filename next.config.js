/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Disable image optimization since it's not supported with static exports
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 