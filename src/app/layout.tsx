import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سحر الرياضيات | Math Magic",
  description: "تطبيق ألغاز رياضية ومنطقية تفاعلية يعمل بمحرك Rust",
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