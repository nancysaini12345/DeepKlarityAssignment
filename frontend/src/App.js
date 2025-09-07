import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function ResumeUploader({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await axios.post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(data);
    } catch (e) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div
        className={`dropzone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f && f.type === 'application/pdf') setFile(f);
        }}
      >
        <div><strong>Drag & drop your PDF here</strong></div>
        <div className="drop-hint">or choose a file below</div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="button" onClick={handleUpload} disabled={loading || !file}>
          {loading ? 'Uploading...' : (file ? `Upload ${file.name}` : 'Upload')}
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div className="muted" style={{ marginTop: 8 }}>PDF only. Max 5 MB.</div>
    </div>
  );
}

function ResumeDetails({ resume }) {
  if (!resume) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <h3>{resume.name || 'Unknown Name'}</h3>
      <div>Email: {resume.email || '-'}</div>
      <div>Phone: {resume.phone || '-'}</div>
      <div>LinkedIn: {resume.linkedin_url || '-'}</div>
      <div>Portfolio: {resume.portfolio_url || '-'}</div>
      <p style={{ whiteSpace: 'pre-wrap' }}>{resume.summary || ''}</p>
      <h4>Work Experience</h4>
      <ul>
        {(resume.work_experience || []).map((w, idx) => (
          <li key={idx}>
            <strong>{w.role}</strong> @ {w.company} ({w.duration})
          </li>
        ))}
      </ul>
      <h4>Education</h4>
      <ul>
        {(resume.education || []).map((e, idx) => (
          <li key={idx}>
            {e.degree} - {e.institution} ({e.graduation_year})
          </li>
        ))}
      </ul>
      <h4>Technical Skills</h4>
      <div>{(resume.technical_skills || []).join(', ')}</div>
      <h4>Soft Skills</h4>
      <div>{(resume.soft_skills || []).join(', ')}</div>
      <h4>Projects</h4>
      <ul>
        {(resume.projects || []).map((p, idx) => (
          <li key={idx}>{p.name ? `${p.name}: ${p.description}` : p}</li>
        ))}
      </ul>
      <h4>Certifications</h4>
      <div>{(resume.certifications || []).join(', ')}</div>
      <h4>Rating</h4>
      <div>{resume.resume_rating || '-'}</div>
      <h4>Improvement Areas</h4>
      <p style={{ whiteSpace: 'pre-wrap' }}>{resume.improvement_areas || ''}</p>
      <h4>Upskill Suggestions</h4>
      <ul>
        {(resume.upskill_suggestions || []).map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function PastResumesTable({ onSelect }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/resumes');
        setRows(data);
      } catch (e) {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Uploaded</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{r.name || '-'}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{r.email || '-'}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{new Date(r.uploaded_at).toLocaleString()}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
              <button onClick={() => onSelect(r.id)}>Details</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return <div className="toast" onClick={onClose}>{message}</div>;
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{title}</strong>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('analyze');
  const [current, setCurrent] = useState(null);
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState(null);

  const loadResume = async (id) => {
    const { data } = await axios.get(`/api/resumes/${id}`);
    setCurrent(data);
    setOpenId(id);
  };

  return (
    <div className="container">
      <h2>Resume Analyzer</h2>
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === 'analyze' ? 'active' : ''}`} onClick={() => setTab('analyze')}>Analyze</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'analyze' && (
        <>
          <ResumeUploader onUploaded={(data) => setCurrent(data)} />
          <div className="section">
            <ResumeDetails resume={current} />
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="card">
          <PastResumesTable onSelect={loadResume} />
        </div>
      )}

      <Modal open={!!openId} title="Resume Details" onClose={() => setOpenId(null)}>
        <ResumeDetails resume={current} />
      </Modal>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}


