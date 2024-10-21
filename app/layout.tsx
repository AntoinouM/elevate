import type { Metadata } from 'next';
import './styles/_main.scss';

export const metadata: Metadata = {
  title: 'elevate!',
  description: 'Mobile friendly browser game. Have fun!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
