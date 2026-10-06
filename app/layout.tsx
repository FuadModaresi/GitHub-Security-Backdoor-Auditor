import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'GitHub Security Auditor',
  description: 'Principal-grade repository threat hunter, backdoor scanner, and vulnerability auditor dashboard with real-time analytics and code diff remediations.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/magic-favicon.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: '/magic-favicon.jpg',
  },
  openGraph: {
    title: 'GitHub Security Auditor',
    description: 'Principal-grade repository threat hunter, backdoor scanner, and vulnerability auditor dashboard with real-time analytics and code diff remediations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Security Auditor',
    description: 'Principal-grade repository threat hunter, backdoor scanner, and vulnerability auditor dashboard with real-time analytics and code diff remediations.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
