import './globals.css';

export const metadata = {
  title: 'ENSURE System',
  description: 'Employee & Schedule Management System',
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
              <a href="/employees">Employees</a>
              <a href="/employees/time">Daily Time Entry</a>
              <a href="/jobs">Jobs</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}