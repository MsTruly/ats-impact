// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body suppressHydrationWarning={true}>
        <div>{children}</div>
      </body>
    </html>
  );
}
