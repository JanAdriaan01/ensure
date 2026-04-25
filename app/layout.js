import './globals.css';

export const metadata = {
  title: 'ENSURE System',
  description: 'Complete Project & Workforce Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <a href="/">🔧 ENSURE System</a>
            </div>
            <div className="nav-links">
              <a href="/">Dashboard</a>
              <a href="/jobs">Jobs</a>
              <a href="/employees">Employees</a>
              <a href="/clients">Clients</a>
              <a href="/quotes">Quotes</a>
            </div>
            <div className="nav-actions">
              <Link href="/employees/time" className="nav-time-btn">⏰ Log Time</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </style>
    </html>
  );
}