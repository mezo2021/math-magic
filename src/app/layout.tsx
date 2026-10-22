/**
 * ==========================================
 * 📂 المسار: src/app/layout.tsx
 * ⚙️ الوظيفة: الغلاف العام للتطبيق (Root Layout)، إعدادات SEO، والـ PWA، واتجاه الصفحة.
 * 📅 تاريخ التعديل: 2024-05-24
 * 🛠️ التعديلات: 
 * - تحديث وصف التطبيق في الـ Metadata (إزالة ذكر Rust وإضافة محرك TypeScript).
 * ==========================================
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سحر الرياضيات | Math Magic",
  description: "تطبيق ألغاز رياضية ومنطقية تفاعلية يعمل بمحرك TypeScript فائق السرعة",
  manifest: "/math-magic/manifest.json", // ربط ملف الـ PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سحر الرياضيات",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}