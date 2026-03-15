## Overview

JobVerify NG is a rule-based system application that helps job seekers assess the legitimacy of job advertisements before engaging with recruiters.

## Technology Stack

```
Frontend          React  (TypeScript) + Vite + Tailwind CSS
Backend           Node.js + Express.js
Database          MongoDB Atlas (Mongoose ODM)
Authentication    JWT + bcryptjs
File Processing   Multer | PDF.js | Tesseract.js (OCR)
Design            Figma
```

## Project Structure

### Frontend (`src/`)

| File |
|------|
| `pages/Index.tsx` |
| `pages/VerifyPage.tsx` |
| `pages/ResultPage.tsx` |
| `pages/DashboardPage.tsx` |
| `pages/AdminPage.tsx` |
| `pages/LoginPage.tsx` |
| `pages/SignupPage.tsx` |
| `pages/ContactPage.tsx` |
| `pages/AboutPage.tsx` |
| `pages/HowItWorksPage.tsx` |
| `pages/TermsPage.tsx` |
| `pages/PrivacyPage.tsx` |
| `components/layout/` |
| `components/verify/` |
| `components/ui/` |
| `hooks/` |
| `lib/api.ts` |

### Backend (`backend/`)

| File |
|------|
| `server.js` |
| `config/riskWeights.js` |
| `routes/verify.js` |
| `routes/auth.js` |
| `routes/admin.js` |
| `routes/contact.js` |
| `models/User.js` |
| `models/Verification.js` |
| `models/VerificationLimit.js` |
| `models/Blacklist.js` |
| `models/Report.js` |
| `models/ContactMessage.js` |
| `middleware/auth.js` |

## Setup & Installation

**Prerequisites:** Node.js v18+ and a MongoDB Atlas account.

```bash
# 1. Clone the repository
git clone https://github.com/JoyceMosesBrown/jobVerifyNG.git
cd jobVerifyNG

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Create backend/.env
#    MONGO_URI=your_mongodb_connection_string
#    JWT_SECRET=your_jwt_secret_key
#    PORT=5000

# 5. Start backend (from backend/ folder)
npm start

# 6. Start frontend (from root folder, separate terminal)
npm run dev
```

```
Frontend:  http://localhost:8080
Backend:   http://localhost:5000
```

## Deployment

The application is deployed separately — frontend on Netlify and backend on Render.

- **Frontend (Netlify):** [https://jobverify-ng.netlify.app](https://jobverify-ng.netlify.app)
- **Backend (Render):** [https://jobverify-ng-api.onrender.com](https://jobverify-ng-api.onrender.com)

## Video Documentation

- **Demo Video:** [https://youtu.be/Piq-stMpYIg](https://youtu.be/Piq-stMpYIg)
