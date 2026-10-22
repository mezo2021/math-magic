/**
 * ==========================================
 * 📂 المسار: next.config.mjs
 * ⚙️ الوظيفة: إعدادات Next.js للتصدير الثابت (Static Export) والتوافق مع مسارات GitHub Pages.
 * 📅 تاريخ الفحص: 2024-05-24
 * 🛠️ التعديلات: لا يوجد تعديل برمجي (الإعدادات مثالية). تمت إضافة الوسم فقط.
 * ==========================================
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/math-magic',
  assetPrefix: '/math-magic/',
  images: { 
    unoptimized: true 
  },
  trailingSlash: true,
  typescript: { 
    ignoreBuildErrors: true 
  },
  eslint: { 
    ignoreDuringBuilds: true 
  },
};

export default nextConfig;