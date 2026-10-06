import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getMyProfile().then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'PS';
  const sysId = user?.sub ? String(user.sub).substring(0,8) : 'N/A';

  return (
    <div className="profile-page">
      <div className="card profile-card glass-panel">
        <div className="profile-header">
          <div className="avatar">{initials}</div>
          <div className="profile-title">
            <h2>{user?.name}</h2>
            <span className="badge badge-easy">{user?.role || 'User'}</span>
          </div>
        </div>
        <div className="profile-details">
          <div className="detail-item">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className="detail-item">
            <label>System ID</label>
            <p>{sysId}</p>
          </div>
          <div className="detail-item">
            <label>Joined</label>
            <p>{(profile?.createdDate || profile?.createdAt) ? new Date(profile.createdDate || profile.createdAt).toLocaleDateString() : 'Recently'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
