import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="blob"></div>
        <h1>Placement Syndicate</h1>
        <p>Premium placement preparation platform</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} id="login-form">
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required id="login-email" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required id="login-password" />
            </div>
            <button type="submit" className="btn-primary" style={{width:'100%', marginTop:'1rem'}} id="login-btn">Sign In</button>
          </form>
          <div className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></div>
        </div>
      </div>
    </div>
  );
}
