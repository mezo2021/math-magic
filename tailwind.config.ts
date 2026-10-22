/**
 * ==========================================
 * 📂 المسار: tailwind.config.ts
 * ⚙️ الوظيفة: إعدادات Tailwind CSS وتحديد مسارات الملفات التي سيتم فحصها لتوليد الأنماط.
 * 📅 تاريخ الفحص: 2024-05-24
 * 🛠️ التعديلات: لا يوجد تعديل برمجي (الإعدادات قياسية). تمت إضافة الوسم فقط.
 * ==========================================
 */
import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
export default config;
