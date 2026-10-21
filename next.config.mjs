/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // السطر السحري الذي يحول التطبيق إلى ملفات ثابتة تعمل بدون خادم
  images: { unoptimized: true }, // مطلوب للتصدير الثابت
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};
export default nextConfig;