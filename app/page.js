'use client';

import { useState } from 'react';

export default function Home() {
  const [clicked, setClicked] = useState(false);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🔧 ENSURE System - Test Mode</h1>
      
      <button 
        onClick={() => {
          setClicked(true);
          alert('Button works! JavaScript is running.');
        }}
        style={{
          background: '#0070f3',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Test Button
      </button>
      
      {clicked && <p style={{ marginTop: '20px', color: 'green' }}>✓ JavaScript is working!</p>}
      
      <div style={{ marginTop: '30px, padding: '20px', background: '#f0f0f0' }}>
        <p>If you see this and the button works, then the issue is with your data fetching.</p>
        <p>Check the browser console for errors (F12).</p>
      </div>
    </div>
  );
}