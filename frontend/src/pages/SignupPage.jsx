import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({ firstname:'', lastname:'', email:'', password:'', year:'1' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({...formData, year: parseInt(formData.year)});
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="blob"></div>
        <h1>Placement Syndicate</h1>
        <p>Join the community today</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} id="signup-form">
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="input-group" style={{flex:1}}>
                <label>First Name</label>
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required id="signup-fn" />
              </div>
              <div className="input-group" style={{flex:1}}>
                <label>Last Name</label>
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required id="signup-ln" />
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required id="signup-email" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required id="signup-password" />
            </div>
            <div className="input-group">
              <label>Year</label>
              <select name="year" value={formData.year} onChange={handleChange} id="signup-year">
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{width:'100%', marginTop:'1rem'}} id="signup-btn">Sign Up</button>
          </form>
          <div className="auth-switch">Already have an account? <Link to="/login">Log In</Link></div>
        </div>
      </div>
    </div>
  );
}
