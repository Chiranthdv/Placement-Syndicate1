import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleMenu = () => setIsOpen(!isOpen);
  
  if (location.pathname === '/login' || location.pathname === '/signup') return null;
  
  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <Link to="/" id="nav-brand-link">PS <span>Placement Syndicate</span></Link>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          ☰
        </button>
      </div>
      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''} id="nav-home">Dashboard</Link>
        <Link to="/experiences" className={location.pathname === '/experiences' ? 'active' : ''} id="nav-exp">Experiences</Link>
        <Link to="/my-experiences" className={location.pathname === '/my-experiences' ? 'active' : ''} id="nav-mine">Mine</Link>
        <Link to="/experiences/new" className={location.pathname === '/experiences/new' ? 'active' : ''} id="nav-share">Share</Link>
        <Link to="/upload-resume" className={location.pathname === '/upload-resume' ? 'active' : ''} id="nav-resume">AI Advisor</Link>
        {hasRole('Admin') && (
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} id="nav-admin">Admin</Link>
        )}
      </div>
      <div className={`nav-user ${isOpen ? 'open' : ''}`}>
        <button onClick={toggleTheme} className="theme-toggle" id="theme-toggle" style={{ transition: 'transform 0.5s ease', transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <Link to="/profile" id="nav-profile">{user?.name || 'Profile'}</Link>
        <button onClick={logout} className="btn-logout" id="nav-logout">Logout</button>
      </div>
    </nav>
  );
}
