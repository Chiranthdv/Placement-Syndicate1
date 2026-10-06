import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getShortName } from '../utils/displayName';
import './HomePage.css';

const StatCounter = ({ end, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="stat-box">
      <h3>{count}+</h3>
      <p>{label}</p>
    </div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  
  return (
    <div className="home-page">
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      <header className="hero">
        <h1>Welcome, <span>{getShortName(user)}</span></h1>
        <p>Accelerate your career with insights from peers who've been there.</p>
        <div className="hero-ctas">
          <Link to="/experiences" className="btn-primary" id="home-cta-browse">Browse Experiences</Link>
          <Link to="/upload-resume" className="btn-secondary" id="home-cta-resume">AI Resume Advisor</Link>
        </div>
      </header>
      
      <section className="stats-section glass-panel">
        <StatCounter end={500} label="Experiences" />
        <StatCounter end={50} label="Companies" />
        <StatCounter end={1000} label="Users" />
      </section>

      <section className="bento-grid">
        <div className="bento-card card glass-panel" id="bento-advisor">
          <h3>AI Resume Advisor</h3>
          <p>Get instant feedback and match scores for your target companies.</p>
          <Link to="/upload-resume">Try it now &rarr;</Link>
        </div>
        <div className="bento-card card glass-panel" id="bento-experiences">
          <h3>Shared Library</h3>
          <p>Access 24x7 preparation material and interview experiences.</p>
          <Link to="/experiences">View Library &rarr;</Link>
        </div>
        <div className="bento-card card glass-panel" id="bento-add">
          <h3>Contribute</h3>
          <p>Share your own interview journey to help others.</p>
          <Link to="/experiences/new">Add Experience &rarr;</Link>
        </div>
        <div className="bento-card card glass-panel" id="bento-profile">
          <h3>Your Dashboard</h3>
          <p>Track your contributions and profile stats.</p>
          <Link to="/profile">View Profile &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
