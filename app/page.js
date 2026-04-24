export default function Home() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>ENSURE System Test</h1>
      <p>If you see this, the page loads correctly.</p>
      <p>Check console for errors: F12 → Console tab</p>
      <button onClick={() => fetch('/api/jobs').then(r => r.json()).then(console.log)}>
        Test API
      </button>
    </div>
  );
}