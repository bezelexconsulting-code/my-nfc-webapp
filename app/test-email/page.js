'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/debug/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Email Functionality</h1>
      <p>This page helps test the password reset email functionality.</p>
      
      <form onSubmit={handleTestEmail}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email Address:</label><br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Enter your email address"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: result.error ? '#f8d7da' : '#d4edda', borderRadius: '4px' }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.resetLink && (
            <div style={{ marginTop: '15px' }}>
              <p><strong>Reset Link Generated:</strong></p>
              <a 
                href={result.resetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#007bff', wordBreak: 'break-all' }}
              >
                {result.resetLink}
              </a>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Enter your email address above</li>
          <li>Click "Send Test Email"</li>
          <li>Check your email for the reset button/link</li>
          <li>Verify that the button is clickable and works properly</li>
        </ol>
        
        <p><strong>What to look for in the email:</strong></p>
        <ul>
          <li>A blue "Reset Password" button that is clickable</li>
          <li>An alternative text link that says "Click here to reset your password"</li>
          <li>The full URL displayed at the bottom for copy/paste</li>
        </ul>
      </div>
    </div>
  );
}