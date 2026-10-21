/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/math-magic',
  assetPrefix: '/math-magic/',
  images: { unoptimized: true },
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;