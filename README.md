# 🔭 RepoLens AI

> AI-powered repository intelligence platform that helps developers understand, visualize, and explore codebases faster.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-repolens.rahulvaddi.me-6366f1?style=for-the-badge)](https://repolens.rahulvaddi.me)
[![GitHub](https://img.shields.io/badge/GitHub-Rahulv--17%2FRepoLens--AI-181717?style=for-the-badge&logo=github)](https://github.com/Rahulv-17/RepoLens-AI)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](./LICENSE)

---

## 🚀 Overview

RepoLens AI is a full-stack developer tool that analyzes GitHub repositories and transforms complex codebases into understandable, visual, and AI-powered insights.

Instead of manually exploring hundreds of files, developers simply paste a GitHub repository URL and instantly get:

| What You Get | Description |
|---|---|
| 🏛️ **Architecture Map** | High-level system design breakdown |
| 🗂️ **Interactive File Explorer** | VS Code-style folder tree with previews |
| 🕸️ **Dependency Graph** | Visual import/export relationship graph |
| 🤖 **AI Chat** | Ask any question about the codebase |
| 📊 **Health Insights** | Complexity metrics, hotspots & maintainability |
| 🛠️ **Tech Stack Detection** | Automatic language & framework detection |

> **The goal:** *Make understanding any codebase fast, visual, and intelligent.*

---

## ✨ Core Features

### 1. 🔗 GitHub Repository Import
- Import any **public GitHub repository** via URL
- Secure repository cloning using `simple-git`
- Deep structure analysis stored per user account
- Repository history with quick re-access

### 2. 🔐 User Authentication
- Email / Password signup & login
- **Google OAuth 2.0** One-Tap integration
- **JWT-based** stateless authentication
- **Forgot Password / Reset** flow via email (Nodemailer + SMTP)
- Protected dashboard routes
- Profile management with avatar cropping

### 3. 🌳 AST-Based Repository Analysis
RepoLens uses **Tree-sitter** (via `web-tree-sitter`) to parse source code at the AST level, enabling highly accurate structural analysis.

Detected constructs:
- Imports & exports
- Functions & classes
- Modules & file relationships
- Circular dependency paths

**Supported languages:** JavaScript · TypeScript *(extensible)*

### 4. 🛠️ Tech Stack Detection
Automatically identifies technologies across a wide range:

| Category | Technologies |
|---|---|
| **Languages** | JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, PHP, SQL, HTML/CSS |
| **Frameworks** | React, Next.js, Express, Django, Flask, FastAPI |
| **Databases** | MongoDB, PostgreSQL |
| **Tools** | Tailwind CSS, Docker |

### 5. 🤖 AI-Powered Repository Summary
Powered by **Google Gemini API**, RepoLens generates intelligent natural-language explanations for:
- The full repository
- Individual folders & modules
- Critical files and entry points

```
The project follows a modular MERN architecture.
Authentication is handled using JWT middleware.
Database operations are centralized inside the services layer.
```

### 6. 📁 Interactive File Explorer
A VS Code-inspired file tree that lets you:
- Expand/collapse folders
- Preview file contents
- Highlight important files
- Read AI-generated folder explanations
- **Global search** across all files

```
src/
 ├── components/
 ├── auth/
 ├── services/
 ├── routes/
 └── utils/
```

### 7. 🕸️ Dependency Graph Visualization
Interactive, pannable graph powered by **@xyflow/react** (React Flow):
- Visualize internal imports & file relationships
- Identify highly connected modules
- Detect **circular dependencies**
- Click nodes to navigate to files
- Zoom, pan, and explore freely

### 8. 💬 AI Repository Chat
Ask natural language questions directly about the codebase:

```
User: Where is authentication implemented?

AI: Authentication is handled inside authMiddleware.ts and
    authController.ts using JWT validation middleware applied
    to all protected routes.
```

Example questions you can ask:
- *"How does the login flow work?"*
- *"Which files connect to MongoDB?"*
- *"Explain the folder structure."*
- *"Where is the database configuration defined?"*

### 9. ⭐ Important Files Detection
Automatically surfaces:
- Entry points (`server.ts`, `main.tsx`)
- Highly connected hub modules
- Core business logic files
- Critical services & configs

### 10. 📈 Repository Health Insights
- Largest files by line count
- Most imported modules
- Deeply nested folder structures
- Circular dependency chains
- Maintainability hotspots

---

## 🧱 Application Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Landing Page** | Platform intro with instant repo analysis CTA |
| `/login` | **Login** | Email/password & Google One-Tap login |
| `/signup` | **Signup** | Account creation |
| `/forgot-password` | **Forgot Password** | Email-based reset flow |
| `/reset-password` | **Reset Password** | Token-verified password change |
| `/dashboard` | **Dashboard** | Repository list, recent activity, analyze CTA |
| `/repo/:id` | **Analysis View** | Full analysis: Explorer, Graph, AI Chat, Insights |

### Repository Analysis Page Layout
```
┌──────────────────────────────────────────────────────┐
│  Navbar: [Global Search]          [Repo Name]        │
├──────────┬───────────────────────────────────────────┤
│  File    │  Tab 1: Overview  (AI Summary + Tech Stack)│
│ Explorer │  Tab 2: Dependency Graph                  │
│          │  Tab 3: AI Chat                           │
│          │  Tab 4: Complexity Insights               │
└──────────┴───────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 + Vite + TypeScript | Core framework |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side routing |
| @xyflow/react (React Flow) | Dependency graph visualization |
| Framer Motion | Animations |
| Zustand | Global state management |
| Axios | HTTP client |
| react-hot-toast | Notifications |
| react-markdown | AI response rendering |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express + TypeScript | API server |
| MongoDB + Mongoose | Database |
| `simple-git` | Repository cloning |
| `web-tree-sitter` + `tree-sitter-wasms` | AST parsing |
| Google Gemini API (`@google/genai`) | AI summaries & chat |
| JWT + bcrypt | Authentication & security |
| Nodemailer | Password reset emails |
| `google-auth-library` | OAuth 2.0 token verification |

### Deployment
| Layer | Platform |
|---|---|
| Frontend | Vercel (Custom domain via Namecheap) |
| Backend | Render Web Services |
| Database | MongoDB Atlas |

---

## 🗄️ Database Schema

**Users**
```json
{
  "username": "Rahul",
  "email": "rahul@gmail.com",
  "password": "hashedPassword",
  "profilePicture": "https://...",
  "googleId": "optional_google_id"
}
```

**Repositories**
```json
{
  "userId": "...",
  "repoName": "RepoLens-AI",
  "repoUrl": "https://github.com/...",
  "techStack": ["TypeScript", "React", "Express"],
  "summary": "AI-generated summary...",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Chat History**
```json
{
  "repoId": "...",
  "question": "Where is authentication implemented?",
  "answer": "Authentication is handled inside..."
}
```

---

## 🏗️ System Architecture

```
User (Browser)
      │
      ▼
Frontend — React + Tailwind (Vercel)
      │
      ▼
Backend API — Express + TypeScript (Render)
      │
      ├──► MongoDB Atlas  (User, Repo, Chat data)
      │
      ▼
Repository Cloning  (simple-git)
      │
      ▼
Repository Scanner
      │
      ▼
Tree-sitter AST Parser  (web-tree-sitter)
      │
      ▼
Dependency Extractor & Graph Generator
      │
      ▼
AI Context Builder
      │
      ▼
Google Gemini API
      │
      ▼
Repository Summary · AI Chat · Insights
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API Key** — [Get one free at AI Studio](https://aistudio.google.com/apikey)
- **Google OAuth Client ID** (optional, for Google login)

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/Rahulv-17/RepoLens-AI.git
cd RepoLens-AI
```

**2. Install all dependencies at once:**
```bash
npm run install-all
```

**3. Configure environment variables:**

In `backend/`, create a `.env` file (use `.env.example` as a reference):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/repolens

JWT_SECRET=your_long_random_secret_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — Email config for password reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=RepoLens AI <your_email@gmail.com>
```

In `frontend/`, create a `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

### Running the Application

```bash
# From the root directory — starts both frontend and backend concurrently
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |

---

## 📁 Project Structure

```text
RepoLens-AI/
├── frontend/                   # React + TypeScript + Vite
│   ├── public/                 # Static assets
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Route-level page components
│       ├── store/              # Zustand state management
│       ├── hooks/              # Custom React hooks
│       └── lib/                # API clients and utilities
│
├── backend/                    # Express + TypeScript API
│   └── src/
│       ├── controllers/        # Route handler logic
│       ├── routes/             # Express route definitions
│       ├── models/             # Mongoose schemas
│       ├── middleware/         # Auth & validation middleware
│       ├── services/           # Core business logic
│       │   ├── astParser/      # Tree-sitter AST analysis
│       │   ├── repoScanner/    # Repository structure scanning
│       │   └── gemini/         # Gemini AI integration
│       └── utils/              # Helpers and shared utilities
│
└── package.json                # Root scripts (dev, install-all)
```

---

## 🎯 Real-World Use Cases

- 🚀 **Faster Onboarding** — New developers understand a codebase in minutes, not days
- 🏛️ **Legacy System Exploration** — Navigate and comprehend old, undocumented code
- 🤝 **Open Source Contributions** — Quickly grasp unfamiliar repositories before contributing
- 🎓 **Learning** — Explore how large-scale production codebases are structured
- 🔍 **Code Auditing** — Identify technical debt, circular dependencies, and hotspots
- 💼 **Technical Interviews** — Quickly ramp up on a company's codebase

---

## 🔐 Security Considerations

- JWT tokens for stateless, secure session management
- Passwords hashed with `bcrypt`
- Google OAuth 2.0 token verification via `google-auth-library`
- Sandboxed repository cloning in isolated temp directories
- Temporary repository cleanup after analysis
- File size limits to prevent abuse

---

## 🚧 Known Challenges

- **Large Repository Handling** — Chunking and streaming analysis for repos with 1000+ files
- **AST Parsing Optimization** — Tree-sitter WASM initialization overhead
- **Dependency Graph Scaling** — Graph layout performance for densely connected codebases
- **AI Context Window** — Efficiently fitting large codebase context within Gemini's token limits

---

## 📈 Future Scope

- [ ] 🧩 **VS Code Extension** — Analyze repos directly inside your editor
- [ ] 📦 **GitHub App Integration** — One-click analysis from GitHub's interface
- [ ] 🔀 **Multi-Repository Analysis** — Cross-repo dependency and architecture comparison
- [ ] 🔍 **PR Review Assistant** — AI-generated pull request summaries
- [ ] 💡 **Refactoring Suggestions** — AI-powered code improvement recommendations
- [ ] 🌐 **More Language Support** — Python, Go, Rust, Java AST analysis

---

## 🌟 Vision

> *"The fastest way to understand any codebase."*

A developer should be able to paste a repository URL and instantly understand — **how it works, which files matter, how modules interact, and how the system is structured** — without manually exploring hundreds of files.

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](./LICENSE) file for details.
