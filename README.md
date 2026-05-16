# ThemeCP-LeetCode Deployment

This repository contains a deployable copy of the public ThemeCP-LeetCode frontend and backend.

## Structure

- `frontend`: Vite React app.
- `backend`: Express API with MySQL persistence.

## Backend Setup

1. Create a MySQL database.
2. Run `backend/db/schema.sql` in the database.
3. Set backend environment variables from `backend/.env.example`.
4. Seed problems:

```sh
cd backend
npm install
npm run seed:problems -- ../frontend/data/ratings.txt
```

## Frontend Setup

Set frontend environment variables from `frontend/.env.example`, then deploy with Vercel using `frontend` as the project root.

Auth0 callback, logout, and web origins should include the final frontend URL.
