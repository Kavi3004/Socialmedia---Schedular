# Social Scheduler

A social media automation project with a React/Vite frontend and an Express/Node backend.

## Repository structure

- `client/` – React app built with Vite
- `server/` – Express + TypeScript API server

## Local setup

1. Install dependencies:
   - `cd client && npm install`
   - `cd server && npm install`

2. Configure environment variables:
   - Copy `client/.env.example` to `client/.env.local`
   - Copy `server/.env.example` to `server/.env`

3. Start the app:
   - `cd server && npm run start`
   - `cd client && npm run dev`

## GitHub deployment readiness

- `.gitignore` excludes `node_modules`, `.env`, and `client/.env.local`
- GitHub Actions are configured in `.github/workflows/ci.yml`

## GitHub push

1. Initialize git:
   - `git init`
2. Add remote:
   - `git remote add origin git@github.com:<your-user>/<your-repo>.git`
3. Push to GitHub:
   - `git add .`
   - `git commit -m "Initial commit"
   - `git push -u origin main`

## Notes

- Image generation relies on Leonardo/Cloudinary API keys.
- Keep secret keys out of source control.
