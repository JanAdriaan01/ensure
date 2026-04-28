'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <span className="brand-icon">🔧</span>
            <span className="brand-name">ENSURE System</span>
          </div>
          <p className="footer-tagline">
            Complete Business Management Platform
          </p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Product</h4>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/demo">Request Demo</Link>
          </div>
          <div className="link-group">
            <h4>Support</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/docs">Documentation</Link>
          </div>
          <div className="link-group">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="copyright">
            © {currentYear} ENSURE System. All rights reserved.
          </div>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">𝕏</a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GH</a>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .footer {
          background: #1f2937;
          color: #e5e7eb;
          margin-top: 3rem;
        }
        .footer-container {
          max-width: 1400px;
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
        .brand-icon {
          font-size: 1.5rem;
        }
        .brand-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }
        .footer-tagline {
          font-size: 0.75rem;
          color: #9ca3af;
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
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s;
        }
        .link-group a:hover {
          color: white;
        }
        .footer-bottom {
          border-top: 1px solid #374151;
        }
        .footer-bottom-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .copyright {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        .social-links {
          display: flex;
          gap: 1rem;
        }
        .social-links a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        .social-links a:hover {
          color: white;
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