const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text || '';
}

function buildPrompt(resumeText) {
  return `You are an expert technical recruiter and career coach. Analyze the following resume text and extract the information into a valid JSON object. The JSON object must conform to the following structure, and all fields must be populated. Do not include any text or markdown formatting before or after the JSON object.\n\nResume Text:\n"""\n${resumeText}\n"""\n\nJSON Structure:\n{\n  "name": "string | null",\n  "email": "string | null",\n  "phone": "string | null",\n  "linkedin_url": "string | null",\n  "portfolio_url": "string | null",\n  "summary": "string | null",\n  "work_experience": [{ "role": "string", "company": "string", "duration": "string", "description": ["string"] }],\n  "education": [{ "degree": "string", "institution": "string", "graduation_year": "string" }],\n  "technical_skills": ["string"],\n  "soft_skills": ["string"],\n  "projects": [{"name":"string","description":"string"}],\n  "certifications": ["string"],\n  "resume_rating": "number (1-10)",\n  "improvement_areas": "string",\n  "upskill_suggestions": ["string"]\n}`;
}

async function analyzeResumeText(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildPrompt(resumeText);
  const result = await model.generateContent(prompt);
  const response = await result.response.text();
  // Ensure we only parse JSON
  const jsonStart = response.indexOf('{');
  const jsonEnd = response.lastIndexOf('}');
  const jsonString = jsonStart !== -1 ? response.slice(jsonStart, jsonEnd + 1) : '{}';
  return JSON.parse(jsonString);
}

module.exports = {
  extractTextFromPdf,
  analyzeResumeText,
};


