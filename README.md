# Rooster

A full-stack classroom management platform for tracking rosters, attendance, grades, and announcements.

[![React](https://img.shields.io/badge/React-19-blue?logo=react&style=for-the-badge)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Python-Flask-yellow?logo=python&style=for-the-badge)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&style=for-the-badge)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb&style=for-the-badge)](https://www.mongodb.com/)

---

## Overview

Rooster provides instructors and students with a centralized platform for classroom management. Instructors can create classes, manage rosters, track attendance with secure session codes, grade assignments, and post announcements. Students can join classes, check in to attendance sessions, and view their grades.

**Key capabilities:**
- Google OAuth authentication with role-based access control
- CSV import/export for rosters, attendance, and grades
- Real-time attendance tracking with 4-digit session codes
- Full gradebook with assignment management and feedback
- Class announcements
- Responsive design with dark/light theme support

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │Dashboard│  │ Class   │  │ Landing │  │ Profile Setup   │ │
│  │         │  │ Detail  │  │ Page    │  │                 │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
│       │            │            │                 │          │
│       └────────────┴────────────┴─────────────────┘          │
│                           │                                  │
│                    Shadcn/UI + Tailwind                      │
└───────────────────────────┼──────────────────────────────────┘
                            │ REST API
┌───────────────────────────┼──────────────────────────────────┐
│                     Server (Flask)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   Auth   │  │  Roster  │  │  Grades  │  │Announcements │ │
│  │  Routes  │  │  Routes  │  │  Routes  │  │    Routes    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │             │               │          │
│       └─────────────┴─────────────┴───────────────┘          │
│                           │                                  │
│                      MongoEngine                             │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   MongoDB 7   │
                    └───────────────┘
```

**Tech Stack:**
- **Frontend:** React 19, Vite, Shadcn/UI, Tailwind CSS, Framer Motion
- **Backend:** Python 3.12, Flask, Gunicorn, MongoEngine
- **Database:** MongoDB 7
- **Infrastructure:** Docker Compose, Nginx

---

## Features

### For Instructors

| Feature | Description |
|---------|-------------|
| **Class Management** | Create classes with name, term, and section. Each class gets a unique 6-character join code. |
| **Roster Management** | Add students manually or import via CSV. Export roster data at any time. |
| **Attendance Tracking** | Start attendance sessions with auto-generated 4-digit codes. View who checked in and manually mark students if needed. Export attendance records. |
| **Gradebook** | Create assignments with point values and due dates. Enter scores and feedback per student. Export all grades to CSV. |
| **Announcements** | Post, edit, and delete class announcements. |
| **Analytics** | View attendance rates and grade distributions per class. |

### For Students

| Feature | Description |
|---------|-------------|
| **Join Classes** | Enter a 6-character join code to enroll in a class. |
| **Check In** | Enter the 4-digit session code to mark attendance. |
| **View Grades** | See assignment scores and instructor feedback. |
| **Announcements** | Read class announcements from instructors. |

### Platform Features

- **Google OAuth:** Sign in with your Google account.
- **Command Palette:** Press `Ctrl+K` (Windows) or `Cmd+K` (Mac) for quick navigation.
- **Theme Toggle:** Switch between dark and light mode.
- **Responsive Design:** Works on desktop and mobile devices.
- **Skeleton Loading:** Smooth loading states throughout the app.

---

## Quick Start

### Prerequisites

- Docker Desktop (running)

### 1. Clone and Configure

```bash
git clone https://github.com/Astatide1337/Rooster.git
cd Rooster
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required: Get these from Google Cloud Console
OAUTH_CLIENT_ID=your-google-client-id
OAUTH_CLIENT_SECRET=your-google-client-secret
OAUTH_REDIRECT_URI=http://localhost:5000/auth

# Required: Generate a strong secret key
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-64-character-secret-key

# URLs
FRONTEND_URL=http://localhost:80
MONGO_URI=mongodb://mongo:27017/class_roster

# Debug mode (set to False for production)
FLASK_DEBUG=True
```

### 2. Start the Application

```bash
docker-compose up -d
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:5000

### 3. First Login

1. Navigate to http://localhost:5173
2. Click "Sign In" and authenticate with Google
3. Complete your profile setup (select role, enter details)

---

## Local Development (Without Docker)

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check (includes DB ping) |
| GET | `/api/user` | Get current user |
| GET | `/api/classrooms/` | List user's classrooms |
| POST | `/api/classrooms/` | Create classroom |
| POST | `/api/classrooms/join` | Join classroom with code |
| GET | `/api/roster/<id>` | Get class roster |
| POST | `/api/roster/<id>/import` | Import roster CSV |
| GET | `/api/roster/<id>/export` | Export roster CSV |
| POST | `/api/roster/<id>/session` | Create attendance session |
| POST | `/api/roster/checkin` | Student check-in |
| GET | `/api/grades/<id>/assignments` | List assignments |
| POST | `/api/grades/<id>/assignments` | Create assignment |
| GET | `/api/grades/assignment/<id>/grades` | Get grades for assignment |
| POST | `/api/grades/assignment/<id>/grades` | Update grade |
| GET | `/api/announcements/<id>/announcements` | List announcements |
| POST | `/api/announcements/<id>/announcements` | Create announcement |

---

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API client
│   │   └── lib/            # Utilities
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Flask backend
│   ├── routes/             # API route handlers
│   ├── models.py           # MongoDB schemas
│   ├── main.py             # Application entry point
│   ├── gunicorn.conf.py    # Production WSGI config
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OAUTH_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `OAUTH_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `OAUTH_REDIRECT_URI` | OAuth callback URL | `http://localhost:5000/auth` |
| `SECRET_KEY` | Flask session secret (64+ chars) | `a1b2c3...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/class_roster` |
| `FLASK_DEBUG` | Enable debug mode | `True` or `False` |

---

## Sample Data

A sample CSV file is included at `server/roster_sample.csv` for testing the roster import feature.

---

## License

MIT
