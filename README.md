## Resume Analyzer

### Project Structure

```
resume-analyzer/
├── backend/
├── frontend/
├── sample_data/
└── screenshots/
```

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Google Gemini API key

### Backend Setup

1. Create database and run schema:
   - Update connection values and run `backend/schema.sql` in your Postgres instance.
2. Configure environment:
   - Create `backend/.env` using the template in `backend/.env.example`.
3. Install deps and start server:
   - `cd backend`
   - `npm install`
   - `npm run start`

Server runs on `http://localhost:5000`.

### Frontend Setup

1. Bootstrap React app (if not already):
   - `cd frontend`
   - `npx create-react-app . --use-npm`
2. Install axios:
   - `npm install axios`
3. Start frontend:
   - `npm start`

App runs on `http://localhost:3000`.

### API Endpoints

- POST `/api/resumes/upload` (multipart form-data, field `resume`)
- GET `/api/resumes`
- GET `/api/resumes/:id`

### Notes

- Store test PDFs in `sample_data/`.
- Add UI screenshots to `screenshots/`.
