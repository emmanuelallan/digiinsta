// Root layout - minimal wrapper
// Route group layouts handle html/body for their specific routes
// Note: This may cause issues with Next.js 16 which requires html/body in root layout
// but is necessary for compatibility with Payload CMS which has its own html/body

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
