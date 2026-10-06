import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerExperience } from '../api';
import './AddExperiencePage.css';

export default function AddExperiencePage() {
  const [formData, setFormData] = useState({ 
    companyName: '', role: '', year: new Date().getFullYear(), 
    difficultyLevel: 'MEDIUM', quetions: '', tips: '' 
  });
  const [rounds, setRounds] = useState([]);
  const navigate = useNavigate();

  const handleAddRound = () => setRounds([...rounds, { roundName: '', description: '' }]);
  const handleRoundChange = (index, field, val) => {
    const newRounds = [...rounds];
    newRounds[index][field] = val;
    setRounds(newRounds);
  };
  const handleRemoveRound = (index) => setRounds(rounds.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerExperience({ ...formData, rounds });
      navigate('/my-experiences');
    } catch(err) { alert('Failed to submit experience'); }
  };

  return (
    <div className="add-exp-page">
      <div className="card add-exp-card">
        <h2>Share Your Experience</h2>
        <form onSubmit={handleSubmit} id="add-exp-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Company Name</label>
              <input type="text" required value={formData.companyName} onChange={e=>setFormData({...formData, companyName: e.target.value})} id="add-comp" />
            </div>
            <div className="input-group">
              <label>Role</label>
              <input type="text" required value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} id="add-role" />
            </div>
            <div className="input-group">
              <label>Year</label>
              <input type="number" required value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} id="add-year" />
            </div>
            <div className="input-group">
              <label>Difficulty</label>
              <select value={formData.difficultyLevel} onChange={e=>setFormData({...formData, difficultyLevel: e.target.value})} id="add-diff">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Questions Asked</label>
            <textarea rows="4" required value={formData.quetions} onChange={e=>setFormData({...formData, quetions: e.target.value})} id="add-q"></textarea>
          </div>
          <div className="input-group">
            <label>Tips for Candidates</label>
            <textarea rows="3" required value={formData.tips} onChange={e=>setFormData({...formData, tips: e.target.value})} id="add-tips"></textarea>
          </div>
          
          <div className="rounds-section">
            <div className="rounds-header">
              <h3>Interview Rounds</h3>
              <button type="button" className="btn-secondary" onClick={handleAddRound} id="add-round-btn">+ Add Round</button>
            </div>
            {rounds.map((r, i) => (
              <div key={i} className="round-input-card">
                <div className="input-group">
                  <label>Round Name</label>
                  <input type="text" required value={r.roundName} onChange={e=>handleRoundChange(i, 'roundName', e.target.value)} id={`round-name-${i}`} />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea rows="2" required value={r.description} onChange={e=>handleRoundChange(i, 'description', e.target.value)} id={`round-desc-${i}`}></textarea>
                </div>
                <button type="button" className="btn-danger" onClick={()=>handleRemoveRound(i)}>Remove</button>
              </div>
            ))}
          </div>
          
          <button type="submit" className="btn-primary" style={{marginTop: '2rem', width: '100%'}} id="submit-exp-btn">Publish Experience</button>
        </form>
      </div>
    </div>
  );
}
