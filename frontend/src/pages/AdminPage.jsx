import React, { useState } from 'react';
import { registerUser, getUserById } from '../api';
import './AdminPage.css';

export default function AdminPage() {
  const [formData, setFormData] = useState({ 
    firstname:'', lastname:'', email:'', password:'', year:'1', role:'Junior' 
  });
  const [searchId, setSearchId] = useState('');
  const [userResult, setUserResult] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({...formData, year: parseInt(formData.year)});
      alert('User registered successfully');
      setFormData({ firstname:'', lastname:'', email:'', password:'', year:'1', role:'Junior' });
    } catch(err) { alert('Registration failed: ' + (err.response?.data?.error || err.message)); }
  };

  const handleSearch = async () => {
    try {
      const res = await getUserById(searchId);
      setUserResult(res.data);
    } catch(err) { alert('User not found'); setUserResult(null); }
  };

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <div className="admin-grid">
        <div className="card admin-card">
          <h3>Register New User</h3>
          <form onSubmit={handleRegister} id="admin-reg-form">
            <div className="form-grid">
              <div className="input-group"><label>First Name</label><input required value={formData.firstname} onChange={e=>setFormData({...formData, firstname:e.target.value})} /></div>
              <div className="input-group"><label>Last Name</label><input required value={formData.lastname} onChange={e=>setFormData({...formData, lastname:e.target.value})} /></div>
              <div className="input-group"><label>Email</label><input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} /></div>
              <div className="input-group"><label>Password</label><input required type="password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} /></div>
              <div className="input-group">
                <label>Year</label>
                <select value={formData.year} onChange={e=>setFormData({...formData, year:e.target.value})}>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                </select>
              </div>
              <div className="input-group">
                <label>Role</label>
                <select value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value})}>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{marginTop:'1.5rem'}}>Register User</button>
          </form>
        </div>
        
        <div className="card admin-card">
          <h3>User Lookup</h3>
          <div className="input-group">
            <label>User ID</label>
            <div style={{display:'flex', gap:'1rem'}}>
              <input value={searchId} onChange={e=>setSearchId(e.target.value)} style={{flex:1}} id="admin-search-id" />
              <button className="btn-secondary" onClick={handleSearch} id="admin-search-btn">Search</button>
            </div>
          </div>
          {userResult && (
            <div className="user-result">
              <p><strong>Name:</strong> {userResult.firstname} {userResult.lastname}</p>
              <p><strong>Email:</strong> {userResult.email}</p>
              <p><strong>Role:</strong> {userResult.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
