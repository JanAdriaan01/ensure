import { Providers } from './Providers';
import './globals.css';

export const metadata = {
  title: 'Ensure System',
  description: 'Project Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}