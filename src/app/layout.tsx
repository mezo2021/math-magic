import './globals.css'

export const metadata = {
  title: 'سحر الرياضيات | Math Magic',
  description: 'تطبيق ألغاز رياضية يعمل بمحرك Rust فائق السرعة',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}