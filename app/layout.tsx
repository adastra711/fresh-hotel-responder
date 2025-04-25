import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Response Generator',
  description: 'Generate professional responses to hotel reviews',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
