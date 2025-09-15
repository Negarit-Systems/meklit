# Meklit Dashboard Backend

## Overview

This is the backend API for the Meklit Dynamic Analytics Dashboard, developed by **Negarit Systems**. It handles data retrieval, filtering, and serving for the frontend, using Firestore as the database.

Key features:
- RESTful API endpoints for daily logs and health records.
- Dynamic querying based on filters.
- Seeding script for mock data.
- Swagger documentation for API exploration.
- Authentication stubs (JWT, Bcrypt) for future expansion.

## Tech Stack

- Node.js with Express.js (v5) for the server.
- Firebase Admin SDK for Firestore interactions.
- Zod for schema validation.
- Axios for external requests (if needed).
- CORS and Morgan for middleware.
- Dotenv for environment management.
- Swagger JSDoc and UI Express for API docs.
- Bcrypt and JWT for security features.

Dev tools: TypeScript, ESLint, TSX for development.

## Prerequisites

- Node.js (v18+).
- Firebase project with Firestore enabled.
- Optional: Firebase Emulator for local testing.

## Setup and Running

1. Navigate to the server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with required variables:
- `PORT=5000`
- `JWT_SECRET=nfjkajhejerksldkk234ndsjijo34]jjk`
- `REFRESH_TOKEN_SECRET=nfjkajhejerksldkk234ndsjijo34]kkd`
- `NODE_ENV=development`
- `FIREBASE_SERVICE_ACCOUNT_PATH= path to your serviceAccountKey.json`
- `N8N_WEBHOOK_URL= webhook_url_for_email_service_built_with_n8n` [view email n8n workflow [here](https://i.postimg.cc/ZRxyj33X/Screenshot-from-2025-09-15-09-58-41.png)]
- `MAX_AGE= max_age_for_refreshtoken_in_number`
- `CLIENT_URL=https://your-url.com`

4. Seed the database with mock data:
```bash
npm run seed
```

5. Run in development mode (with hot reload):
```bash
npm run start:dev
```

6. Run in production mode:
```bash
npm run buildhttps://i.postimg.cc/ZRxyj33X/Screenshot-from-2025-09-15-09-58-41.png
npm run start
```

