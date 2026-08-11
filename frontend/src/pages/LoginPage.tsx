import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { clearCache } = useFormContext();

  // Wake up Railway backend while user types credentials
  useEffect(() => {
    axios.get('https://fundsroom-assesment-production.up.railway.app/').catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Point this to your backend URL
      const response = await axios.post('https://fundsroom-assesment-production.up.railway.app/api/auth/login', {
        email,
        password
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // FORCED CACHE CLEAR: Fixes bug where using shortcuts bypasses logout clear
      clearCache();

      // Redirect to dashboard
      navigate('/');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left side banner */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Approximated Superset Logo SVG */}
              <path d="M12.5 8.5L28.5 24.5M28.5 8.5L12.5 24.5" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <rect x="2" y="2" width="36" height="36" rx="8" stroke="white" strokeWidth="3" />
              <path d="M8 20L15 27L32 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="login-logo-text">fundsroom product</span>
          </div>



        </div>


      </div>

      {/* Right side form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="form-header">
            <h2 className="form-title">Sign in</h2>
            <p className="form-subtitle">Enter your details below</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <input
                type="email"
                className="form-input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem', position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#a0a7b5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>

            {/* Quick Demo Logins */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #eef2f9', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '10px', textAlign: 'center' }}>Demo Quick Login</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button type="button" onClick={() => { setEmail('admin@fundsroom.com'); setPassword('password123'); setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#4b3b9b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>Login as Admin</button>
                <button type="button" onClick={() => { setEmail('sales@fundsroom.com'); setPassword('password123'); setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#4b3b9b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>Login as Sales</button>
                <button type="button" onClick={() => { setEmail('warehouse@fundsroom.com'); setPassword('password123'); setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#4b3b9b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>Login as Warehouse</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
