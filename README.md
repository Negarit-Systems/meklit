# Meklit Dynamic Analytics Dashboard

## Overview

This repository contains the full-stack application developed by **Negarit Systems** as part of the technical challenge for the Full Stack Developer position at Meklit. The application is a core component of the Administrative Suite: the Reports and Analytics Dashboard for the Meklit App, a digital helper for early learning centers.

The dashboard provides Office Administrators (OAs) with an intuitive interface to analyze key data from daily logs, health records, and other activities. It features dynamic filtering, data visualization, and responsive design, built within a realistic time constraint to demonstrate rapid prototyping skills.

Key highlights:
- **Frontend**: Built with React.js, using a component-based architecture for scalability.
- **Backend**: Node.js with Express.js, serving a simple API.
- **Database**: Firestore (Google Firebase) seeded with mock data for demonstration.
- **Deployment**: The app is deployed on a VPS for production-like testing.
- **Innovation**: Includes features like data comparison across children/classes, staff activity analysis, and mobile responsiveness.

This project reflects our proficiency in UI/UX design, dynamic data handling, and full-stack development, aligning with the challenge's evaluation criteria (UI/UX 40%, Technical Proficiency 30%, Functionality 20%, Code Quality 10%).

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
git clone <repository-url>
cd <repository-name></repository-name></repository-url>


2. Install dependencies for both frontend and backend:
cd client && npm install
cd ../server && npm install


3. Configure environment variables:
- Create `.env` files in `/client` and `/server` (see sub-READMEs for required keys, e.g., Firebase credentials).

4. Seed the database (from backend):
cd server && npm run seed


5. Run the backend:
cd server && npm run start:dev


6. Run the frontend:
cd client && npm run dev

7. Access the app at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend API).

## Deployment

The application is deployed on a VPS 

## API Documentation

Swagger UI is integrated. After starting the backend, access docs at `http://localhost:5000/api-docs`.

## Team

Developed by **Negarit Systems**. For questions or collaboration, contact us at [your-email@example.com].
