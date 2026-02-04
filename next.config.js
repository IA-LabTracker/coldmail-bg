/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remover images: { unoptimized: true } para aproveitar otimização da Vercel
  images: {
    domains: [], // Adicione domínios de imagens externas aqui se necessário
  },
  // Configuração para melhor performance na Vercel
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
