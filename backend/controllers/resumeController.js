const db = require('../db');
const { extractTextFromPdf, analyzeResumeText } = require('../services/analysisService');

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumeText = await extractTextFromPdf(req.file.buffer);
    const analysis = await analyzeResumeText(resumeText);

    const insertQuery = `
      INSERT INTO resumes (
        file_name, name, email, phone, linkedin_url, portfolio_url, summary,
        work_experience, education, technical_skills, soft_skills, projects, certifications,
        resume_rating, improvement_areas, upskill_suggestions
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      ) RETURNING *;
    `;

    const values = [
      req.file.originalname,
      analysis.name || null,
      analysis.email || null,
      analysis.phone || null,
      analysis.linkedin_url || null,
      analysis.portfolio_url || null,
      analysis.summary || null,
      JSON.stringify(analysis.work_experience || []),
      JSON.stringify(analysis.education || []),
      JSON.stringify(analysis.technical_skills || []),
      JSON.stringify(analysis.soft_skills || []),
      JSON.stringify(analysis.projects || []),
      JSON.stringify(analysis.certifications || []),
      analysis.resume_rating || null,
      analysis.improvement_areas || null,
      JSON.stringify(analysis.upskill_suggestions || [])
    ];

    const { rows } = await db.query(insertQuery, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to analyze resume' });
  }
}

async function getAllResumes(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM resumes ORDER BY uploaded_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch resumes' });
  }
}

async function getResumeById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM resumes WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch resume' });
  }
}

module.exports = { uploadResume, getAllResumes, getResumeById };


