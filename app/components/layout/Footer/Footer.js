// app/components/Footer.js
'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <span className="brand-name">ENSURE System</span>
          </div>
          <p className="footer-tagline">
            Complete Business Management Platform
          </p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Financial</h4>
            <Link href="/financial">Dashboard</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/quotes">Quotes</Link>
            <Link href="/invoicing">Invoicing</Link>
          </div>
          <div className="link-group">
            <h4>HR</h4>
            <Link href="/employees">Employees</Link>
            <Link href="/payroll">Payroll</Link>
            <Link href="/employees/skills">Skills</Link>
            <Link href="/employees/certifications">Certifications</Link>
          </div>
          <div className="link-group">
            <h4>Operations</h4>
            <Link href="/tools">Tools</Link>
            <Link href="/inventory">Inventory</Link>
            <Link href="/schedule">Schedule</Link>
            <Link href="/ohs">OHS</Link>
          </div>
          <div className="link-group">
            <h4>System</h4>
            <Link href="/Settings">Settings</Link>
            <Link href="/reports/monthly">Reports</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="copyright">
            © {currentYear} ENSURE System. All rights reserved.
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #2d2d2d;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          color: #e5e7eb;
          margin-top: 3rem;
          border-top: 1px solid #3d3d3d;
        }
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 2rem 1.5rem;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .footer-section {
          flex: 1;
          min-width: 200px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .brand-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }
        .footer-tagline {
          font-size: 0.75rem;
          color: #c0c0c0;
          margin: 0;
        }
        .footer-links {
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
        }
        .link-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .link-group h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.5rem 0;
        }
        .link-group a {
          font-size: 0.75rem;
          color: #c0c0c0;
          text-decoration: none;
          transition: color 0.2s;
        }
        .link-group a:hover {
          color: #22c55e;
        }
        .footer-bottom {
          border-top: 1px solid #3d3d3d;
        }
        .footer-bottom-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .copyright {
          font-size: 0.7rem;
          color: #c0c0c0;
        }
        @media (max-width: 768px) {
          .footer-container {
            flex-direction: column;
            padding: 1.5rem;
          }
          .footer-links {
            gap: 1.5rem;
          }
          .footer-bottom-container {
            flex-direction: column;
            text-align: center;
            padding: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}