# AI-Powered SIWES Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC.svg)](https://tailwindcss.com/)

An end-to-end, intelligent web application designed for tertiary institutions (such as **Lead City University, Ibadan**) to digitize, streamline, and automate the **Student Industrial Work Experience Scheme (SIWES)**.

---

## 🌟 Key Features

### 🎓 1. AI Industrial Placement Matching Engine
- **Automated Recommendation Algorithm**: Ranks internship opportunities based on a 3-tier matching matrix:
  - **Skill Overlap (0-60 pts)**: Matches student technical skills against firm requirements.
  - **Course Relevance (0-30 pts)**: Aligns academic discipline with firm industry sector.
  - **Location Proximity (0-10 pts)**: Calculates distance using Haversine formulas.
- **Gemini AI & Python Integration**: Ranks companies in real-time and provides human-readable match explanations.

### 📍 2. GPS Geofencing & Live Attendance Verification
- **Workplace Radius Lock**: Ensures students submit daily logbook entries while physically within their assigned workplace boundaries.
- **Drift Tolerance & Location Requests**: Features live GPS monitoring, radius drift tolerance, and an official location update request workflow for students working off-site.

### ✨ 3. AI Weekly Logbook Assistant & Refiner
- **ITF-Compliant Formatting**: Converts raw student notes into a structured 4-part technical report:
  1. *Technical Work Performed*
  2. *Tools, Software & Infrastructure Utilized*
  3. *Competencies Gained & Skill Application*
  4. *Industry Standards & Safety Compliance*

### 💡 4. Real-Time AI Career Advisor
- **Personalized Career Guidance**: Analyzes real-world student work entries and assigned placement data to provide actionable career advice, technical tools to master, and SIWES defense preparation strategies.

### 🛡️ 5. Supervisor & Admin Management Portal
- **Real-Time Student Monitoring**: Live dashboards for supervisors to review student attendance, inspect attached logbook photos, approve placement firms, and track verified vs. flagged logs.
- **Official PDF Report Generator**: Exports comprehensive SIWES logbooks and placement summaries formatted with `jsPDF` and `AutoTable`.

### 🔐 6. Security & Access Control
- **Multi-Factor Auth & OTP**: Email verification via Nodemailer OTP.
- **Matriculation Validation**: Strict format enforcement (e.g. `LCU/UG/YY/NNNNN`).
- **Protection**: Rate limiting, brute-force lockout, bcrypt password hashing, and HTTP security headers (`Helmet`, `CORS`).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS 4, Lucide Icons, Framer Motion, Leaflet (Interactive Maps), Recharts, jsPDF
- **Backend**: Express.js (Node.js), TypeScript, Multer (File Uploads), Nodemailer (SMTP)
- **Database**: SQLite (`better-sqlite3`) & PostgreSQL (`pg`) support
- **AI Integration**: `@google/genai` (Google Gemini API), Python 3 AI Analytics (`ai_engine.py`)

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.8+ (optional, for standalone `ai_engine.py`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Joshcodings/siwes-management-system..git
cd ai-powered-siwes-management-system
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3001`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Folder Structure

```
├── public/                # Static assets (HTML diagrams, QR code, icons)
├── src/                   # React frontend application
│   ├── App.tsx            # Main application shell, router, and dashboards
│   ├── main.tsx           # React DOM root entry point
│   ├── index.css          # Tailwind CSS & Google Fonts imports
│   ├── db.ts              # SQLite / PostgreSQL database client initializer
│   └── companies_list.ts  # Pre-seeded Nigerian industrial firms list
├── server.ts              # Express server, authentication, & API endpoints
├── ai_engine.py           # Standalone Python AI recommendation module
├── package.json           # Project scripts and dependencies
└── README.md              # Project documentation
```

---

## 📄 License

Licensed under the [Apache-2.0 License](LICENSE).
