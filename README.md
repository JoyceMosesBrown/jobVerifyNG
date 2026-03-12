<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center">JobVerify NG</h1>

<p align="center">
  <strong>Nigeria's Job Advertisement Verification Platform</strong><br/>
  A web-based decision support system that helps job seekers assess the legitimacy of job advertisements using automated risk scoring before engaging with recruiters.
</p>

---

## Overview

JobVerify NG analyzes job adverts across **4 risk categories** using **16 automated checks**, producing a weighted risk score that classifies postings as Low Risk, Moderate Risk, or High Risk. The system accepts input via text, URL, PDF document, or image screenshot (OCR).

---

## Key Features

**Verification Engine**
> Text Analysis | URL Crawling | PDF Extraction | Image OCR

**User Dashboard**
> Verification History | Saved Results | Scam Reports | In-App Messages

**Admin Dashboard**
> Platform Stats | Verification Management | Blacklist CRUD | Report Resolution | Message Replies

---

## Technology Stack

```
Frontend          React 18 (TypeScript) + Vite + Tailwind CSS + Shadcn/UI + Framer Motion
Backend           Node.js + Express.js
Database          MongoDB Atlas (Mongoose ODM)
Authentication    JWT + bcryptjs
File Processing   Multer | PDF.js | Tesseract.js (OCR)
Web Scraping      Cheerio (HTML parsing) | RDAP API (domain age)
Design            Figma
```

---

## Risk Scoring Engine

The verification engine runs 16 checks and sums weighted scores to produce a verdict.

### Categories & Weights

```
RECRUITER IDENTITY
  [3] Free email domain        Recruiter uses Gmail, Yahoo, Hotmail, etc.
  [1] No company name          No Ltd, Inc, PLC found in text
  [2] Company mismatch         Email domain does not match company in advert

CONTENT-BASED
  [5] Payment request          Asks for fees, deposits, or money transfers
  [2] Urgency language         "Act fast", "limited slots", "hurry"
  [2] Unrealistic salary       "Earn 500k weekly", "make $5000/day"
  [1] No interview             Claims no interview is needed
  [1] Instant hiring           "Start immediately", "hired today"
  [1] Generic description      "Easy money", "no experience needed" (2+ matches)
  [1] Poor grammar             Multiple spelling/grammar errors (3+ matches)

TECHNICAL INDICATORS
  [1] URL shortener            bit.ly, tinyurl used to hide destination
  [1] Suspicious TLD           .xyz, .tk, .buzz domains
  [1] Non-secure website       HTTP instead of HTTPS
  [4] New domain               Registered < 6 months ago (RDAP lookup)
  [3] Blacklisted entity       Email, phone, or domain on admin blacklist
```

### Verdict Bands

```
Score 0-4     LOW RISK         Likely legitimate
Score 5-8     MODERATE RISK    Needs further review
Score 9+      HIGH RISK        Likely a scam
```

### Smart Exceptions

The engine reduces false positives in two contexts:
- **Procurement/Government** — Payment keywords are suppressed when tender, ministry, or procurement language is detected
- **Official Domains** — Payment keywords are suppressed when the recruiter email is from `.gov.ng`, `.edu.ng`, or similar institutional domains

---

## Project Structure

```
jobVerifyNG/
|
+-- src/                              Frontend (React + TypeScript)
|   +-- pages/
|   |   +-- Index.tsx                 Landing page
|   |   +-- VerifyPage.tsx            Verification form
|   |   +-- ResultPage.tsx            Risk score results
|   |   +-- DashboardPage.tsx         User dashboard
|   |   +-- AdminPage.tsx             Admin dashboard (5 tabs)
|   |   +-- LoginPage.tsx             Authentication
|   |   +-- SignupPage.tsx            Registration
|   |   +-- ContactPage.tsx           Contact form
|   |   +-- AboutPage.tsx             About us
|   |   +-- HowItWorksPage.tsx        How it works
|   |   +-- TermsPage.tsx             Terms of service
|   |   +-- PrivacyPage.tsx           Privacy policy
|   +-- components/
|   |   +-- layout/                   Navbar, Footer
|   |   +-- verify/                   VerifyForm component
|   |   +-- ui/                       Shadcn/UI components
|   +-- hooks/                        useAuth, useToast
|   +-- lib/api.ts                    API client
|
+-- backend/                          Backend (Node.js + Express)
|   +-- server.js                     Server entry point
|   +-- config/
|   |   +-- riskWeights.js            Scoring weights & risk bands
|   +-- routes/
|   |   +-- verify.js                 Verification engine (16 checks)
|   |   +-- auth.js                   Auth routes
|   |   +-- admin.js                  Admin routes
|   |   +-- contact.js                Contact message routes
|   +-- models/
|   |   +-- User.js                   User accounts
|   |   +-- Verification.js           Verification records
|   |   +-- VerificationLimit.js      Rate limiting
|   |   +-- Blacklist.js              Blacklisted entities
|   |   +-- Report.js                 Scam reports
|   |   +-- ContactMessage.js         Contact messages
|   +-- middleware/
|       +-- auth.js                   JWT middleware
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register       Register a new user
POST   /api/auth/login          Login
POST   /api/auth/admin-login    Admin login
GET    /api/auth/me             Get current user profile
```

### Verification
```
POST   /api/verify              Verify job advert (text or link)
POST   /api/verify/document     Verify uploaded file (PDF or image)
GET    /api/verify/:id          Get verification result by ID
PUT    /api/verify/:id/save     Save verification to user account
```

### Admin (Protected)
```
GET    /api/admin                    Platform statistics
GET    /api/admin/verifications      All verifications
GET    /api/admin/reports            All user reports
PUT    /api/admin/reports/:id/resolve   Resolve a report
GET    /api/admin/blacklist          Get blacklist entries
POST   /api/admin/blacklist          Add to blacklist
DELETE /api/admin/blacklist/:id      Remove from blacklist
GET    /api/admin/messages           Get contact messages
PUT    /api/admin/messages/:id/read  Mark message as read
PUT    /api/admin/messages/:id/reply Reply to a message
DELETE /api/admin/messages/:id       Delete a message
```

### Contact
```
POST   /api/contact             Submit a contact message
GET    /api/contact/my-messages  Get user's messages with admin replies
```

---

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

---

## References

The risk scoring indicators and weight assignments are informed by the following sources:

**Government & Law Enforcement**
- [FBI IC3 — 2024 Internet Crime Report](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf)
- [FBI IC3 — PSA: Work-From-Home Scams (2024)](https://www.ic3.gov/PSA/2024/PSA240604)
- [FTC — Job Scams Consumer Advice](https://consumer.ftc.gov/all-scams/job-scams)
- [EFCC Nigeria — Economic and Financial Crimes Commission](https://www.efcc.gov.ng)

**Academic Research**
- [EMSCAD — Employment Scam Aegean Dataset (University of the Aegean)](http://emscad.samos.aegean.gr/)
- [Springer — A Machine Learning Approach to Detecting Fraudulent Job Types](https://link.springer.com/article/10.1007/s00146-022-01469-0)
- [Springer — Fraud-BERT: Transformer-Based Online Recruitment Fraud Detection](https://link.springer.com/article/10.1007/s10791-025-09502-8)
- [IEEE — Online Recruitment Fraud Detection Using ANN](https://ieeexplore.ieee.org/document/9636978/)

---

## Deployment

The application is deployed separately — frontend on Netlify and backend on Render.

```
Frontend (Netlify):   https://jobverify-ng.netlify.app
Backend  (Render):    https://jobverify-ng-api.onrender.com
```

> **Note:** The backend runs on Render's free tier and may take ~50 seconds to respond on the first request after a period of inactivity.

---

## License

Developed as part of an academic capstone project. All rights reserved.
