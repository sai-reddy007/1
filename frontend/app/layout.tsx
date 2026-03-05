import './globals.css';
import Nav from '../components/Nav';

export const metadata = { title: 'PentestAI' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
