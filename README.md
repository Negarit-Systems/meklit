# Meklit Dynamic Analytics Dashboard

## Overview

This repository contains the full-stack application developed by **Negarit Systems** as part of the technical challenge for the Full Stack Developer position at Meklit. The application is a core component of the Administrative Suite: the Reports and Analytics Dashboard for the Meklit App, a digital helper for early learning centers.

The dashboard provides Office Administrators (OAs) with an intuitive interface to analyze key data from daily logs, health records, and other activities. It features dynamic filtering, data visualization, and responsive design, built within a realistic time constraint to demonstrate rapid prototyping skills.

## 🌟 Core Features
- **Dynamic Filtering** – filter by center, class, child, and activity type.  
- **Data Visualization** – interactive charts (meals, naps, health incidents, moods, etc.) powered by Chart.js.  
- **Daily Logs Tracking** – granular records of children’s daily activities (meals, naps, moods, general activities).  
- **Health Records** – incident reports, medications administered, and actions taken, all tied to children’s profiles.  
- **Mobile-Responsive Design** – optimized for both desktop and mobile use.  
- **Comparison Views** – analyze and compare data across children, staff, or classes.  
- **Secure API Layer** – JWT authentication, email verification with OTP, input validation with Zod, and structured Firestore database.  
- **Swagger API Docs** – auto-generated documentation for backend endpoints.  
- **Seeding & Mock Data** – quickly populate Firestore with sample data for testing/demo purposes.  

Key highlights:
- **Frontend**: Built with React.js, using a component-based architecture for scalability.
- **Backend**: Node.js with Express.js, serving a simple API.
- **Database**: Firestore (Google Firebase) seeded with mock data for demonstration.
- **Deployment**: The app is deployed on a VPS for production-like testing.
- Includes features like data comparison across children/classes, staff activity analysis, and mobile responsiveness.

This project reflects our proficiency in design, dynamic data handling, and full-stack development, aligning with the challenge's evaluation criteria.

## Project Structure

- `/client`: Frontend application (React.js).
- `/server`: Backend API (Node.js/Express).
- Other files: Configuration, documentation, etc.

## Prerequisites

- Node.js (v18 or higher recommended).
- Yarn or npm for package management.
- Firebase account for Firestore (configure with your own project credentials).
- Environment variables (see respective READMEs for details).

## Setup and Running Locally

1. Clone the repository:
```bash
git clone <https://github.com/Negarit-Systems/meklit.git>
cd meklit
```

2. Install dependencies for both frontend and backend:
```bash
cd client && npm install
cd ../server && npm install
```

3. Configure environment variables:
- Create `.env` files in `/client` and `/server` (see sub-READMEs for required keys, e.g., Firebase credentials).

4. Seed the database (from backend):
```bash
cd server && npm run seed
```

5. Run the backend:
```
cd server && npm run start:dev
```

6. Run the frontend:
```bash
cd client && npm run dev
```

7. Access the app at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend API).

## Deployment

The application is deployed on a VPS

## API Documentation

Swagger UI is integrated. After starting the backend, access docs at `http://localhost:5000/api/docs`.

## Team

Developed by **Negarit Systems**. For questions or collaboration, contact us at negarit.system.tech@gmail.com.

## 🔗 Live Demo
The app is deployed on our VPS and can be accessed here:  
👉 [Meklit App – Reports & Analytics Dashboard](https://meklit.negaritsystems.com.et/)

