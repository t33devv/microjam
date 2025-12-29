# Micro Jam Website

the official website for the 48-hour Game Jam **Micro Jam** competition that runs every 2 weeks.

## About

Micro Jam is a game development competition hosted on itch.io, aiming to become the world's largest weekend Jam. The website features a dark, code-editor-inspired aesthetic with smooth interactions and hover effects.

## Tech Stack

-   **React 19** - UI library
-   **Vite** - Build tool and dev server
-   **Tailwind CSS** - Styling
-   **React Router** - Client-side routing
-   **Axios** - HTTP client for API requests
-   **Knex** - PostgreSQL database query builder (w/ Supabase)

## Authentication

The site uses **Discord OAuth** for user authentication. Users can log in with their Discord account to access features like voting. Authentication is handled via cookies and JWT tokens managed by the backend API.

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and other assets
│   │   └── react.svg
│   ├── components/         # Reusable React components
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── pages/              # Page components
│   │   └── Home.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── eslint.config.js
├── index.html              # HTML template
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
