# JobVerify NG

A web-based job advert verification tool designed to help Nigerian job seekers identify fraudulent job postings. The system uses a rule-based verification engine with 16 automated risk checks to analyse job adverts and classify them by risk level.

## Features

- Text-based job advert verification with 16 risk checks
- OCR support for image-based job adverts (Tesseract.js)
- URL crawling to extract and verify job adverts from web links (Cheerio + Axios)
- Community blacklist for reporting scam contacts
- Risk score classification: Legit (0), Low Risk (1-3), Moderate Risk (4-6), High Risk (7-10)
- Verification history dashboard for registered users
- Admin panel for managing reports and blacklist entries
- User authentication with JWT tokens

## Tech Stack

| Layer           | Technology                                      |
|-----------------|------------------------------------------------|
| Frontend        | React (TypeScript) + Vite + Tailwind CSS       |
| Backend         | Node.js + Express.js                           |
| Database        | MongoDB Atlas (Mongoose ODM)                   |
| Authentication  | JWT + bcryptjs                                 |
| File Processing | Multer, PDF.js, Tesseract.js (OCR)             |
| Web Scraping    | Cheerio + Axios                                |
| Deployment      | Frontend on Netlify, Backend on Render         |

## Project Structure

```
jobVerifyNG/
├── src/                    # React frontend
│   ├── pages/              # Page components (Verify, Result, Dashboard, Admin, etc.)
│   ├── components/         # Reusable UI components
│   │   ├── landing/        # Homepage sections (Hero, Features, FAQ, Stats)
│   │   ├── layout/         # Navbar and Footer
│   │   ├── verify/         # Verification form, risk meter, report dialog
│   │   └── ui/             # Shadcn/ui base components
│   ├── hooks/              # Custom React hooks (useAuth, useMobile, useToast)
│   └── lib/                # API client and utility functions
├── backend/
│   ├── routes/
│   │   ├── verify.js       # Verification engine with 16 risk checks
│   │   ├── auth.js         # User registration and login
│   │   ├── admin.js        # Admin operations (blacklist, reports)
│   │   ├── dashboard.js    # User verification history
│   │   ├── reports.js      # Scam report handling
│   │   └── contact.js      # Contact form messages
│   ├── models/             # Mongoose schemas (User, Verification, Blacklist, etc.)
│   ├── middleware/          # JWT authentication middleware
│   ├── config/             # Database connection and risk weight configuration
│   ├── utils/              # Domain checking utilities
│   └── tests/              # Unit, integration, and functional tests
├── public/                 # Static assets
└── netlify.toml            # Frontend deployment configuration
```

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB Atlas account (free tier works) or local MongoDB instance

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/JoyceMosesBrown/jobVerifyNG.git
cd jobVerifyNG
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Set up environment variables

Create a `.env` file in the `backend/` folder:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
ADMIN_CODE=your_admin_registration_code
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
FRONTEND_URL=http://localhost:5173
```

### 5. Start the backend server

```bash
cd backend
npm start
```

The backend will run at `http://localhost:5000`

### 6. Start the frontend (in a new terminal)

```bash
# From the project root folder
npm run dev
```

The frontend will open at `http://localhost:5173`

## Running Tests

The project includes 88 test cases across three testing levels:

```bash
# Run unit tests (39 tests)
node backend/tests/verify.test.js

# Run integration tests (17 tests)
node backend/tests/integration.test.js

# Run functional tests (32 tests)
node backend/tests/functional.test.js
```

| Test Type    | Count | What It Tests                                    |
|-------------|-------|--------------------------------------------------|
| Unit        | 39    | Individual risk check functions in isolation      |
| Integration | 17    | Full verification pipeline with combined checks   |
| Functional  | 32    | System-level requirements and user scenarios       |

## How the Verification Engine Works

The verification engine analyses job advert text through 16 independent risk checks:

1. **Payment Detection** (+3) - Detects scam payment phrases like "pay a registration fee"
2. **Generic Description** (+2) - Flags vague phrases like "easy money", "no experience needed"
3. **Free Email Domain** (+1) - Flags use of Gmail, Yahoo, Hotmail for recruitment
4. **Urgency Language** (+1) - Detects pressure tactics like "urgent hiring", "limited slots"
5. **Company Name** (+1) - Checks if a legitimate company name is present
6. **URL Shortener** (+1) - Flags shortened URLs (bit.ly, tinyurl, etc.)
7. **Suspicious TLD** (+1) - Flags suspicious domains (.xyz, .top, .click)
8. **Unrealistic Salary** - Detects unrealistically high salary claims
9. **Contact Information** - Analyses contact details for red flags
10. **WhatsApp Only** - Flags jobs that only provide WhatsApp contact
11. **Poor Grammar** - Detects excessive capitalisation and punctuation
12. **Naira Currency** - Flags Nigerian Naira references in suspicious context
13. **PO Box Address** - Flags use of PO Box instead of office address
14. **Vague Requirements** - Detects missing specific job requirements
15. **Domain Reputation** - Checks website domain age and reputation
16. **Procurement Context** - Identifies government procurement scam patterns

Each check returns a score and matched indicators. The total score determines the risk level:
- **0** = Legit
- **1-3** = Low Risk
- **4-6** = Moderate Risk
- **7+** = High Risk

## Live Demo

- **Frontend:** [https://jobverify-ng.netlify.app](https://jobverify-ng.netlify.app)
- **Backend API:** [https://jobverify-ng-api.onrender.com](https://jobverify-ng-api.onrender.com)

## Video Documentation

- **Demo Video:** [https://youtu.be/Piq-stMpYIg](https://youtu.be/Piq-stMpYIg)

## Author

Joyce Moses Brown - BSc Software Engineering Capstone Project
