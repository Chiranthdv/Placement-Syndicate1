import React, { useState, useEffect } from 'react';
import { getMyExperiences, deleteExperience } from '../api';
import './MyExperiencesPage.css';

export default function MyExperiencesPage() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    getMyExperiences().then(res => setExperiences(res.data)).catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this experience?')) return;
    try {
      await deleteExperience(id);
      setExperiences(experiences.filter(e => e.id !== id));
    } catch(err) { alert('Failed to delete'); }
  };

  return (
    <div className="my-exp-page">
      <h2>My Experiences</h2>
      <div className="my-exp-grid">
        {experiences.length === 0 ? <p>You haven't shared any experiences yet.</p> : null}
        {experiences.map(exp => (
          <div key={exp.id} className="card my-exp-card">
            <div className="my-exp-header">
              <div>
                <h3>{exp.companyName} - {exp.role}</h3>
                <span className={`badge badge-${exp.difficultyLevel?.toLowerCase() || 'medium'}`}>{exp.difficultyLevel}</span>
              </div>
              <button className="btn-danger" onClick={() => handleDelete(exp.id)} id={`del-my-${exp.id}`}>Delete</button>
            </div>
            <p className="my-exp-date">Year: {exp.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
