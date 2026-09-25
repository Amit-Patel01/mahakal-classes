# 🕉️ MAHAKAL CLASSES – FULL-STACK EDUCATION PLATFORM & LMS

An enterprise-grade, high-performance, and unified Learning Management System (LMS) designed for competitive exam preparation (JEE, NEET, Board examinations, and Foundation batches). 

Built with a modern reactive **Next.js 14 Web Application**, a cross-platform **Flutter 3 Mobile Application**, an asynchronous **Express.js & TypeScript Backend**, and **MongoDB 7.0 with native GridFS chunked binary streaming**.

---

## 🚀 Key Highlights & Architecture

- **Database**: MongoDB with Prisma ORM (`@id @default(auto()) @map("_id") @db.ObjectId`).
- **MongoDB GridFS File Streamer**: Large file storage engine chunked into 255KB blocks supporting **HTTP 206 Partial Content byte-range video streaming**, zero-buffer PDF downloads, and categorized asset pipelines.
- **Unified Auth & RBAC**: Dual-token JWT architecture (Access + Refresh tokens) strictly guarding **Admin**, **Teacher**, and **Student** endpoints.
- **Online CBT Test Engine**: Full Computer Based Test engine with configurable timers, question palette (Answered, Flagged, Unvisited), negative marking calculation, auto-submit on countdown expiry, and instant scorecards.
- **Interactive Dashboards**:
  - **Student**: Enrolled courses, live masterclasses, HE materials, video lectures, CBT tests & performance analytics.
  - **Teacher**: Material upload to GridFS, live schedule management, test creator & question builder, student performance review.
  - **Admin**: Multi-metric KPI analytics, student & faculty roster controls, course cataloging, photo gallery curation, sitewide broadcasts.
- **Flutter Mobile App**: Android & iOS ready, Material 3 theme, Riverpod state management, Dio networking, secure token storage, and responsive layouts.

---

## 📂 Project Structure

```
mahakalclasses/
├── backend/                       # Node.js + TypeScript REST API
│   ├── prisma/
│   │   └── schema.prisma         # MongoDB Prisma Data Model
│   ├── src/
│   │   ├── config/               # DB (Prisma + GridFSBucket singleton), Env
│   │   ├── constants/            # Role definitions & status enums
│   │   ├── controllers/          # 12 REST API Controllers
│   │   ├── middlewares/          # Auth, RBAC, Multer memory storage, Error handlers
│   │   ├── routes/v1/            # API Route definitions mounted at /api/v1
│   │   ├── services/             # GridFS Streamer, Auth, Test Evaluation
│   │   ├── seed.ts               # Database seed script with sample mock & GridFS files
│   │   ├── app.ts                # Express application setup
│   │   └── server.ts             # Server entry point
│   └── package.json
│
├── web/                           # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/         # Landing page, Courses, Materials, Gallery, About, Contact
│   │   │   ├── login/ & register/# Authentication flows with demo account auto-fill
│   │   │   ├── student/          # Student LMS Portal (Tests, Results, Live, Lectures, Materials)
│   │   │   ├── teacher/          # Teacher CMS & Test Engine Portal
│   │   │   └── admin/            # Administrative Analytics & User Management Portal
│   │   ├── components/           # Navbar, Sidebar, Footer, MediaModal (GridFS Streamer)
│   │   └── lib/                  # Axios API client & AuthContext
│   └── package.json
│
├── mobile/                        # Flutter Mobile Application
│   ├── lib/
│   │   ├── core/                 # Theme, ApiClient, SecureStorage, Constants
│   │   ├── data/models/          # User, Course, Subject, Material, Test & Attempt models
│   │   ├── presentation/
│   │   │   ├── providers/        # Riverpod Auth & Dashboard state notifiers
│   │   │   └── screens/          # Splash, Onboarding, Auth, MainNav, Tests, CBT, Live, etc.
│   │   └── main.dart
│   ├── android/                  # Android build configurations & manifests
│   └── pubspec.yaml
│
├── docs/
│   └── SYSTEM_DOCUMENTATION.md   # Comprehensive 28-Section System Architecture & Specs
│
├── start-mongo.bat                # 1-Click Local MongoDB Runner with Replica Set (No Docker)
├── run-dev.bat                    # 1-Click Backend & Web Dev Server Launcher
├── package.json                   # Root workspace scripts
└── README.md
```

---

## 🔑 Default Demo Credentials

All seed accounts are initialized with password: `Password@123`

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Administrator** | `admin@mahakalclasses.com` | Complete system control, user moderation, analytics, announcements |
| **Faculty / Teacher** | `teacher@mahakalclasses.com` | Material uploads, test creation, live session controls |
| **Student** | `student@mahakalclasses.com` | Course access, CBT tests, recorded lectures, material downloads |

---

## 🛠️ Quick Start & Local Setup (No Docker Required)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x)
- [MongoDB](https://www.mongodb.com/) (v6.0+ local server OR free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- [Flutter SDK](https://flutter.dev/) (v3.19+, for mobile app)

---

### Step 1: Start MongoDB

#### Option A: Local MongoDB (Windows 1-Click)
Double-click `start-mongo.bat` in the project root. This starts MongoDB with replica set `rs0` on port 27017 using `data/db/` and initializes the replica set for Prisma ORM.

#### Option B: MongoDB Atlas (Cloud)
In `backend/.env`, set your Atlas connection string:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/mahakal_classes?retryWrites=true&w=majority"
```

---

### Step 2: Initialize Database & Seed Sample Data

Open a terminal in `backend/`:
```bash
cd backend
npm install

# Push Prisma Schema to MongoDB
npx prisma db push

# Seed Initial Sample Data & GridFS Uploads
npm run seed
```

---

### Step 3: Launch Full-Stack Applications

#### ⚡ 1-Click Double-Click (Windows)
Double-click `run-dev.bat` in the project root to automatically launch both the Backend and Web frontend in separate console windows!

#### Or via Command Line:
```bash
# Terminal 1: Backend REST API (Port 5000)
cd backend
npm run dev

# Terminal 2: Next.js Web App (Port 3000)
cd web
npm run dev
```

Access the services:
- **Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

### Step 4: Flutter Mobile Application (Optional)

```bash
cd mobile
flutter pub get

# Run on Android Emulator or Connected Device
flutter run
```
> **Note**: When running on an Android Emulator, point `baseUrl` to `http://10.0.2.2:5000/api/v1` (configured by default in `lib/core/api_constants.dart`).

---

## 📦 MongoDB GridFS File Streamer Architecture

GridFS stores files that exceed the 16MB document limit by dividing them into chunks:
- **`fs.files`**: Holds metadata (`filename`, `contentType`, `length`, `chunkSize: 261120`, `metadata: { uploadedBy, category, refType }`).
- **`fs.chunks`**: Stores raw 255KB binary buffers indexed by `files_id` and `n`.

### Streaming Features
1. **HTTP 206 Partial Content (Byte-Range Requests)**:
   - Supports `Range: bytes=start-end` headers.
   - Allows instant seeking in video lectures on both Web (HTML5 Video) and Mobile (Flutter Video Player).
2. **Inline Document Previewing**:
   - Streams PDFs directly to client renderers with proper `Content-Disposition: inline; filename="..."` headers.
3. **Download Streamer**:
   - Zero-memory-leak download pipes that stream directly from the MongoDB driver to Express `res`.

---

## 🧪 Online CBT Test Engine

- **Timer & Auto-Submit**: Configurable test durations with synchronized client timers. Auto-submits answers when time expires.
- **Negative Marking Calculation**: Automated backend grading engine applying customizable penalties (e.g., `-1` for incorrect, `+4` for correct).
- **Question Palette**: Live status indicators for:
  - 🟢 Answered
  - 🟣 Marked for Review
  - ⚪ Unvisited
- **Instant Result Analytics**:
  - Scorecard with accuracy percentage, percentile score, time taken.
  - Detailed question-by-question solution explanations.

---

## 📖 Comprehensive Documentation

A full 28-section technical specification is available at [docs/SYSTEM_DOCUMENTATION.md](file:///f:/Myproject/mahakalclasses/docs/SYSTEM_DOCUMENTATION.md), covering:
- Context & Entity-Relationship Diagrams (Mermaid)
- High-Level & Low-Level Architectural Diagrams
- Data Flow Diagrams (Level 0, Level 1, Level 2)
- Complete REST API Endpoints Reference
- Security, RBAC, and Token Rotation Policies
- Production Deployment, CI/CD, and NGINX Reverse Proxy configs

---

## 📄 License
Copyright © 2026 Mahakal Classes. All rights reserved.
