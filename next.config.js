/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify requer output standalone ou padrão — padrão funciona com @netlify/plugin-nextjs
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['oauth-1.0a', 'crypto-js'],
  },
}

module.exports = nextConfig
