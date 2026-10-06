import React, { useState, useEffect } from 'react';
import { getAllCompanies, getByCompanyName, deleteExperienceByAdmin } from '../api';
import { getSimilarCompanies } from '../resumeService';
import { useAuth } from '../context/AuthContext';
import './ExperienceListPage.css';

export default function ExperienceListPage() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [similar, setSimilar] = useState([]);
  const { hasRole } = useAuth();

  useEffect(() => {
    getAllCompanies().then(res => setCompanies(res.data)).catch(console.error);
  }, []);

  const loadExperiences = (comp) => {
    setSelectedCompany(comp);
    getByCompanyName(comp).then(res => setExperiences(res.data)).catch(console.error);
    setSimilar([]);
  };

  const handleSimilar = async () => {
    if(!selectedCompany) return;
    try {
      const res = await getSimilarCompanies(selectedCompany);
      setSimilar(res.data.similarCompanies || res.data);
    } catch(err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this experience?')) return;
    try {
      await deleteExperienceByAdmin(id);
      setExperiences(experiences.filter(e => e.id !== id));
    } catch(err) { alert('Failed to delete'); }
  };

  const filteredCompanies = companies.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="exp-layout">
      <aside className="exp-sidebar card">
        <h3>Companies</h3>
        <input 
          type="text" 
          placeholder="Search companies..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="company-search"
        />
        <div className="company-list">
          {filteredCompanies.map(c => (
            <button key={c} className={`comp-btn ${selectedCompany === c ? 'active' : ''}`} onClick={() => loadExperiences(c)} id={`comp-${c}`}>
              {c}
            </button>
          ))}
        </div>
      </aside>
      <main className="exp-main">
        {selectedCompany ? (
          <>
            <div className="exp-header">
              <h2>{selectedCompany} Experiences</h2>
              <button className="btn-secondary" onClick={handleSimilar} id="btn-similar">Find Similar</button>
            </div>
            {similar.length > 0 && (
              <div className="similar-panel card">
                <h4>Similar Companies</h4>
                <ul>{similar.map(s => <li key={s.companyName}>{s.companyName} (Score: {(s.score*100).toFixed(0)}%)</li>)}</ul>
              </div>
            )}
            <div className="exp-grid">
              {experiences.map(exp => (
                <div key={exp.id} className="exp-card card">
                  <div className="exp-card-header">
                    <h3>{exp.role}</h3>
                    <span className={`badge badge-${exp.difficultyLevel?.toLowerCase() || 'medium'}`}>{exp.difficultyLevel}</span>
                  </div>
                  <p className="exp-meta">Year: {exp.year} | By: {exp.createdBy}</p>
                  <div className="exp-content">
                    <h4>Questions</h4>
                    <p>{exp.quetions || exp.questions}</p>
                    <h4>Tips</h4>
                    <p>{exp.tips}</p>
                    {exp.rounds && exp.rounds.length > 0 && (
                      <div className="exp-rounds">
                        <h4>Rounds</h4>
                        {exp.rounds.map((r, i) => (
                          <div key={i} className="round-item">
                            <strong>{r.roundName}:</strong> {r.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {hasRole('Admin') && (
                    <button className="btn-danger" style={{marginTop:'1rem'}} onClick={() => handleDelete(exp.id)} id={`del-admin-${exp.id}`}>Delete as Admin</button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="exp-empty">Select a company to view experiences</div>
        )}
      </main>
    </div>
  );
}
