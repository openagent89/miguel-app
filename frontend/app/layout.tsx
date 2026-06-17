import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Miguel Warenwirtschaft',
  description: 'Professionelle Warenwirtschaft für M&I Deals',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}