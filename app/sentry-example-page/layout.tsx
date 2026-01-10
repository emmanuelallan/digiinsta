// Sentry example page layout - provides html/body

export default function SentryExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
