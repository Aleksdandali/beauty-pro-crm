import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Не ігнорувати помилки TypeScript при білді
  typescript: {
    ignoreBuildErrors: false,
  },
  // Оптимізація зображень
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Заборонити автоматичні редіректи з trailing slash
  trailingSlash: false,
  // Суворий режим React
  reactStrictMode: true,
};

export default nextConfig;
