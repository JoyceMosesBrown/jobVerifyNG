# JobVerify NG - Backend API

Node.js + Express + MongoDB backend for the JobVerify NG platform.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file from the example:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret.

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/admin-login` - Admin login with code
- `GET /api/auth/me` - Get current user (protected)

### Verification
- `POST /api/verify` - Verify a job advert
- `GET /api/verify/:id` - Get verification result
- `PUT /api/verify/:id/save` - Save verification to history (protected)

### Dashboard
- `GET /api/dashboard` - Get user dashboard data (protected)

### Reports
- `POST /api/reports` - Submit a report

### Admin
- `GET /api/admin/reports` - Get all reports (admin)
- `PUT /api/admin/reports/:id/resolve` - Resolve a report (admin)
- `GET /api/admin/verifications` - Get all verifications (admin)
- `GET /api/admin/blacklist` - Get blacklist (admin)
- `POST /api/admin/blacklist` - Add to blacklist (admin)
- `DELETE /api/admin/blacklist/:id` - Remove from blacklist (admin)

### Health
- `GET /api/health` - API health check
