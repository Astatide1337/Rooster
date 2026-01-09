# Rooster

Tired of juggling class schedules, grades, and announcements in a sea of sticky notes and group chats? Rooster is your all-in-one web app that turns student chaos into a sleek, organized roster—built for students, by a student mindset.

[![React](https://img.shields.io/badge/React-18.2-blue?style=flat&logo=react)](https://reactjs.org/) [![Python](https://img.shields.io/badge/Python-3.12-yellow?style=flat&logo=python)](https://python.org/) [![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat&logo=mongodb)](https://mongodb.com/) [![Docker](https://img.shields.io/badge/Docker-24-blue?style=flat&logo=docker)](https://docker.com/)

Rooster streamlines campus life: instructors manage rosters and post updates, while students track grades and check in for attendance—all in a responsive, themeable interface powered by shadcn/ui. No more LMS overload; just the essentials, with CSV imports for quick setup using `roster_sample.csv`.

## 🚀 Getting Started

Fire up Rooster in minutes with Docker—no fussing over dependencies. Perfect for quick demos or testing on your laptop between classes.

### Prerequisites
- Docker (latest)
- Docker Compose (v2+)

### Quick Setup
1. Clone the repo:
   ```
   git clone https://github.com/Astatide1337/Rooster.git
   cd Rooster
   ```

2. Copy `.env.example` to `.env` and add your Google OAuth credentials (for auth):
   ```
   OAUTH_CLIENT_ID=your_google_client_id
   OAUTH_CLIENT_SECRET=your_google_client_secret
   SECRET_KEY=your_flask_secret_key
   MONGO_URI=mongodb://mongo:27017/class_roster  # Defaults to this in docker-compose
   FRONTEND_URL=http://localhost:80
   OAUTH_REDIRECT_URI=http://localhost:5000/auth
   ```

3. Spin it up:
   ```
   docker-compose up -d
   ```
   This builds the React frontend (served via Nginx on port 80), Python/Flask backend (port 5000), and MongoDB. Watch logs with `docker-compose logs -f`.

4. Access the app: Open [http://localhost](http://localhost) in your browser.

Success! Sign in with Google to set up your profile. For sample data, import `server/roster_sample.csv` via the roster tab (instructor view). Shut down with `docker-compose down`.

If MongoDB env vars need tweaking (e.g., for a remote instance), update `docker-compose.yml` under the `server` service.

## ✨ Features

Rooster keeps it simple and student-focused: no enterprise bloat, just tools that fit your workflow. Built with shadcn/ui for a clean, responsive design that switches between light/dark themes seamlessly.

- **Interactive Dashboard**: Overview of your classes with quick join/create options. Tabs for easy navigation—powered by React Router.
- **Roster Management**: Import/export CSVs (try `roster_sample.csv` for instant demo rosters). Add/remove students manually, with join codes for seamless enrollment.
- **Grade Tracking & Visualization**: Instructors assign points and feedback; students see scores with due dates. Export CSV reports for easy analysis.
- **Announcements Feed**: Post/read updates tied to classes—real-time without the noise of group chats.
- **Attendance Sessions**: Quick check-ins via 4-digit codes (students) or manual marking (instructors). Track rates and export histories.
- **Secure Auth & Profiles**: Google OAuth login, with role-based access (student/instructor). Personalize with major, grad year, and student ID.
- **Theming & UX Polish**: Toggle dark/light mode (via `theme-provider.jsx`); responsive design that works on mobile for on-the-go check-ins.

| Before Rooster | With Rooster |
|---------------|--------------|
| Sticky notes for schedules, endless emails for announcements | Centralized dashboard with tabs for classes, grades, and updates |
| Manual grade spreadsheets, forgotten due dates | Automated tracking with CSV exports and visual feedback |
| Group chat chaos for attendance | Coded check-ins and session reports—exportable in one click |

## 📱 User Journey

Rooster feels like a personal assistant: log in, set up once, and dive into your classes. Here's how it flows, from first sign-in to managing your roster.

1. **Sign In**: Hit the Google button on the login page (`Login.jsx`). Redirects to `/auth` (backend handles OAuth in `routes/auth.py`), then back to the app. Session stored securely.

   Example API call (from `apiClient.js`):
   ```js
   // In App.jsx, after auth
   const res = await getUser();  // Fetches /api/user
   if (res.ok) setUser(res.user);
   ```

2. **Profile Setup**: If incomplete, `ProfileSetup.jsx` prompts for role, major, etc. Submit updates via `updateUser()` to `/api/user/update`.

3. **Dashboard View**: Land on `/` (`Dashboard.jsx`). See your classes in a grid. Students join with a code; instructors create new ones.

   ```js
   // Fetch classes
   const data = await getClassrooms();  // Calls /api/classrooms/
   setClasses(data);
   ```

4. **Class Details**: Click a class to `/class/:id` (`ClassDetail.jsx`). Tabs for home (announcements), attendance, grades. Instructors get roster/stats.

   Example: Check in for attendance:
   ```js
   const res = await checkinAttendance(sessionId, code);  // POST to /api/roster/attendance/checkin
   if (res.ok) toast.success('Checked in!');
   ```

5. **Manage & Export**: Instructors import rosters (`importRosterCSV()` with FormData) or export grades (`exportGradesCSV()` opens CSV download). Students view personal grades/feedback.

Pro tip: Use the navbar for quick profile tweaks or logout—always one click away.

## 🛠 Tech Stack & Architecture

Rooster's full-stack setup is dev-friendly: modern frontend for snappy UIs, lightweight backend for data handling, and MongoDB for flexible schemas. Everything containerized for easy deploys.

- **Frontend**: React 18 + Vite (fast builds), shadcn/ui components (customizable buttons, tables, dialogs), Tailwind CSS for styling. Theme toggle via `next-themes` for light/dark modes.
- **Backend**: Python 3.12 + Flask (REST API in `routes/`), MongoEngine for ODM (schemas in `models.py`). Google OAuth integrated.
- **Database**: MongoDB for users, classrooms, grades, etc. Sample data in `server/roster_sample.csv` for quick seeding.
- **Deployment**: Docker multi-stage builds (`client/Dockerfile` for React/Nginx, `server/Dockerfile` for Flask). `docker-compose.yml` orchestrates all.

Architecture flow:

```mermaid
graph TD
    A[Browser: React App<br>(Vite + shadcn/ui)] -->|API Calls (apiClient.js)| B[Flask Backend<br>(routes/*.py)]
    B -->|MongoEngine Queries| C[MongoDB<br>(models.py)]
    D[Google OAuth] -->|Auth Redirect| B
    E[Nginx<br>(nginx.conf)] --> A
    F[Sample CSV<br>(roster_sample.csv)] -->|Import| B
```

Data flows from UI components (e.g., `Table` for rosters) to API endpoints (e.g., `/api/roster/:id/students`), persisting in Mongo. For local tweaks, seed with the sample CSV via the import UI.

## 🔧 Development & Customization

Tinker locally without Docker for faster iterations—great for adding features like calendar sync.

### Local Setup
1. **Frontend** (`client/`):
   ```
   cd client
   npm install
   npm run dev  # Runs on http://localhost:5173 (proxies /api to backend)
   ```
   - ESLint via `eslint.config.js` for clean JS.
   - Customize themes in `theme-provider.jsx` (add icons for dark/light in `theme-toggle.jsx`).

2. **Backend** (`server/`):
   ```
   cd server
   # Using uv (from pyproject.toml) for speed
   uv sync  # Or pip install -r requirements.txt
   uv run main.py  # Runs on http://localhost:5000
   ```
   - Flask routes in `routes/` (e.g., extend `classrooms.py` for new features).
   - Env: Set `MONGO_URI` and OAuth vars in `.env`.

Update Vite proxy in `vite.config.js` if ports change. For VSCode, use `.vscode/settings.json` for integrated terminal setups.

### Custom Ideas
- **Theming**: Swap icons in `public/` (RoosterDark.ico/RoosterLight.ico) and update `App.jsx` useEffect.
- **New Routes**: Add a calendar endpoint in `routes.py`, call from `apiClient.js`. E.g., integrate iCal exports for grades.
- **Mobile Tweaks**: Enhance responsiveness in `globals.css`—test with `npm run preview`.
- **Data Seeding**: Load `roster_sample.csv` on startup in `main.py` for dev.

Lint with `npm run lint` (client) or `uv run flake8` (server).

## 🤝 Contributing

Rooster's open for student devs to make it even better—think UI polish or backend enhancements. Let's ease more campus chaos together!

1. Fork the repo and create a branch: `git checkout -b feature/mobile-roster`.
2. Commit changes: `git commit -m "Add mobile-responsive roster view"`.
3. Push and open a PR: Link to an issue like "Enhance mobile responsiveness" or "Add CSV export for announcements".

Check `.gitignore` for ignores (node_modules, .env). Use VSCode with `settings.json` for Python/JS extensions. Focus on student pain points—PRs for calendar integration or export improvements welcome!

## 📞 Support & Feedback

Hit a snag or have ideas? Open a GitHub issue—describe your setup (e.g., Docker vs local) and what you're seeing. We're growing this for real student needs, so feedback like "Need better roster views for large classes?" shapes the next update.

Star the repo if it helps your workflow! 🚀