# Meklit Dashboard Frontend

## Overview

This is the frontend for the Meklit Dynamic Analytics Dashboard, built by **Negarit Systems**. It provides an attractive, intuitive UI for analyzing daily logs and health records, with dynamic filtering and visualizations.

Key features:
- Dynamic filter panel for slicing data by center, class, child, curriculum, symptoms, nap duration, etc.
- Interactive charts (using Chart.js) that update based on filters.
- Responsive design for desktop and mobile.
- Data fetching with Tanstack React Query for efficient API calls.
- Component-based architecture with Radix UI and Tailwind CSS for modern styling.

## Tech Stack

- React.js (v19) with Vite for fast development.
- Tailwind CSS for styling, with plugins like tailwindcss-animate.
- Radix UI components (Dialog, Dropdown, Popover, Select, etc.).
- Tanstack React Query for data fetching and caching.
- Tanstack React Table for tabular data display.
- Chart.js and React Chartjs-2 for visualizations.
- Axios for API requests.
- Date-fns and React Day Picker for date handling.
- Framer Motion for animations.
- Lucide React and React Icons for icons.
- React Router DOM for routing.

Dev tools: TypeScript, ESLint, SWC plugin for Vite.

## Prerequisites

- Node.js (v18+).

## Setup and Running

1. Navigate to the client folder:
- `cd client`

2. Install dependencies:
- `npm install`


3. Create a `.env` file with required variables:
- `VITE_API_URL=http://localhost:5000` (backend API base URL).


4. Run in development mode:
- `npm run dev`
- Access at `http://localhost:5173`.

5. Build for production:
- `npm run build`

