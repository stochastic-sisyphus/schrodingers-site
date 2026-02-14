/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export for Cloudflare Pages
  distDir: 'dist', // Output to dist directory for Cloudflare Pages
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
