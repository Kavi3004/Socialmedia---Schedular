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

1. Initialize git (already done if repo exists locally):
   - `git init`
2. Add remote:
   - `git remote add origin https://github.com/Kavi3004/Socialmedia---Schedular.git`
3. Push to GitHub:
   - `git add .`
   - `git commit -m "Initial commit"
   - `git push -u origin main`

## Deployment options

### Option 1: Vercel for frontend

1. Connect your GitHub repository to Vercel.
2. Set the project root to `client/`.
3. Add environment variables under Vercel Settings:
   - `VITE_API_BASE_URL`
4. Deploy.

### Option 2: Render / Railway / Fly for backend

1. Connect your GitHub repository to the chosen service.
2. Set the project root to `server/`.
3. Configure environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ZERNIO_API_KEY`
   - `GOOGLE_API_KEY`
   - `PORT`
4. Start the server with:
   - `npm run start`

## Notes

- Image generation relies on Leonardo/Cloudinary API keys.
- Keep secret keys out of source control.
- `.env` and `.env.local` are excluded from version control.
