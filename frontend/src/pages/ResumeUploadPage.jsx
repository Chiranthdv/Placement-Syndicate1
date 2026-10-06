import React, { useState, useEffect } from 'react';
import { uploadResume, getResumeFeedback } from '../resumeService';
import './ResumeUploadPage.css';

const CircularProgress = ({ score }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="svg-score-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle className="bg-circle" cx="50" cy="50" r={radius} />
        <circle 
          className="progress-circle" 
          cx="50" cy="50" r={radius} 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
        />
        <text x="50" y="55" className="score-text-svg">{progress}%</text>
      </svg>
    </div>
  );
};

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [filename, setFilename] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (e) => setFile(e.target.files[0]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

  const handleUpload = async () => {
    if(!file) return;
    setStatus('uploading');
    try {
      const res = await uploadResume(file);
      setFilename(res.data.filename || res.data.fileId || file.name);
      setStatus('processing');
    } catch(err) { setStatus('error'); }
  };

  useEffect(() => {
    if(status === 'processing' && filename) {
      const interval = setInterval(async () => {
        try {
          const res = await getResumeFeedback(filename);
          if(res.data && res.data.status !== 'processing') {
            setFeedback(res.data);
            setStatus('completed');
            clearInterval(interval);
          }
        } catch(err) {
          // ignore until ready
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status, filename]);

  return (
    <div className="resume-page">
      <div className="card resume-card">
        <h2>AI Resume Advisor</h2>
        <p className="subtitle">Upload your resume for instant AI analysis and company matching.</p>
        
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input type="file" accept=".pdf,.docx" onChange={handleFile} id="resume-file" style={{display: 'none'}} />
          <label htmlFor="resume-file" className="upload-label">
            <div className="upload-icon">📁</div>
            <p>Drag & Drop your resume here or <span>click to browse</span></p>
          </label>
          
          {file && (
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({formatSize(file.size)})</span>
            </div>
          )}

          <button className="btn-primary" onClick={handleUpload} disabled={!file || status==='uploading'} id="resume-upload-btn" style={{marginTop: '1rem'}}>
            {status === 'uploading' ? 'Uploading...' : 'Analyze Resume'}
          </button>
        </div>

        {status === 'uploading' && (
          <div className="upload-progress">
            <div className="progress-bar-container">
              <div className="progress-bar-fill animated"></div>
            </div>
            <p>Uploading document...</p>
          </div>
        )}

        {status === 'processing' && (
          <div className="status-box processing">
            <div className="spinner"></div>
            <p>AI is analyzing your resume... This may take a few moments.</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="status-box error">Failed to upload or process resume.</div>
        )}

        {status === 'completed' && feedback && (
          <div className="feedback-results slide-in">
            <h3>Analysis Complete</h3>
            <div className="score-card" style={{flexDirection: 'column', alignItems: 'center'}}>
              <CircularProgress score={feedback.score || 85} />
              <div className="score-text" style={{marginTop: '0.5rem'}}>Overall Match Score</div>
            </div>
            <div className="feedback-details">
              <h4>Strengths</h4>
              <p>{feedback.strengths || 'Strong educational background and clear formatting.'}</p>
              <h4>Areas for Improvement</h4>
              <p>{feedback.improvements || 'Add more quantifiable metrics to your experience.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
