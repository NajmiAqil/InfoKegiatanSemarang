import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || 'Login gagal');
        }
        return res.json();
      })
      .then((data) => {
        const role = data.user?.role || 'bawahan';
        const username = data.user?.username || 'User';
        const name = data.user?.name || 'User';
        const opd = data.user?.opd || 'Diskominfo';
        
        // Store username (not name!) for use in dashboard
        localStorage.setItem('username', username);
        localStorage.setItem('name', name);
        localStorage.setItem('opd', opd);
        localStorage.setItem('role', role);
        
        if (role === 'atasan') {
          window.location.href = '/atasan';
        } else {
          window.location.href = '/bawahan';
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Username atau password salah');
      });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-top">
          <button type="button" className="back-button" onClick={() => (window.location.href = '/')}>Kembali</button>
          <h2>Login</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Login</button>
          
          <div className="signup-link" style={{ 
            textAlign: 'center', 
            marginTop: '15px', 
            color: '#666',
            fontSize: '0.95rem'
          }}>
            Belum punya akun? <a href="/signup" style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontWeight: 600 
            }}>Daftar di sini</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;