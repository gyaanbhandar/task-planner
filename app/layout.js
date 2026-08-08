import './globals.css';

export const metadata = {
  title: 'AnuTask — Smart SaaS OS by Anukant',
  description: 'AI-powered smart SaaS operating system for managing tasks, clients, and business workflows',
  icons: {
    icon: '/favicon.ico',
    apple: '/branding/icon-180x180.png',
  },
  openGraph: {
    title: 'AnuTask — Smart SaaS OS by Anukant',
    description: 'AI-powered smart SaaS operating system for managing tasks, clients, and business workflows',
    images: ['/branding/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
