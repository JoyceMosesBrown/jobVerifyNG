# JobVerify NG - Backend API

REST API server for the JobVerify NG job advert verification system.

## API Endpoints

| Method | Endpoint              | Description                          | Auth Required |
|--------|-----------------------|--------------------------------------|---------------|
| POST   | `/api/verify`         | Verify job advert text               | No            |
| POST   | `/api/verify/url`     | Verify job advert from URL           | No            |
| POST   | `/api/verify/upload`  | Verify job advert from image/PDF     | No            |
| POST   | `/api/auth/register`  | Register new user                    | No            |
| POST   | `/api/auth/login`     | Login and get JWT token              | No            |
| GET    | `/api/dashboard`      | Get user verification history        | Yes           |
| POST   | `/api/reports`        | Submit a scam report                 | Yes           |
| GET    | `/api/admin/reports`  | Get all reports (admin only)         | Yes           |
| GET    | `/api/admin/blacklist`| Get blacklist entries (admin only)   | Yes           |
| POST   | `/api/contact`        | Submit contact form message          | No            |

## Setup

```bash
npm install
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Run

```bash
npm start
```

## Tests

```bash
node tests/verify.test.js        # 39 unit tests
node tests/integration.test.js   # 17 integration tests
node tests/functional.test.js    # 32 functional tests
```
