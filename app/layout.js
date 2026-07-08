import './globals.css';

export const metadata = {
  title: 'Task Planner — AI Business OS',
  description: 'AI-powered task planner and business operating system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
