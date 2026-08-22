# RepoLens AI

> AI-powered repository intelligence platform that helps developers understand, visualize, and explore codebases faster.

**🌐 Live Demo:** [https://repolens.rahulvaddi.me](https://repolens.rahulvaddi.me)

# 🚀 Overview

RepoLens AI is a full-stack developer tool that analyzes GitHub repositories and transforms complex codebases into understandable visual and AI-powered insights.

Instead of manually exploring hundreds of files, developers can simply paste a GitHub repository URL and instantly understand:

* Project architecture
* Repository structure
* Important files and modules
* Dependency relationships
* Code flow
* Tech stack
* Technical hotspots
* Overall system design

The goal is simple:

> Make understanding any codebase fast, visual, and intelligent.

# ✨ Core Features

# 1. GitHub Repository Import

* Import public GitHub repositories using URL
* Clone repositories securely
* Analyze repository structure
* Store analyzed repositories for users

# 2. User Authentication

* User signup and login
* **Google OAuth 2.0 Integration**
* JWT-based authentication
* Password hashing using bcrypt
* **Forgot Password / Password Reset functionality via Email**
* Protected dashboard routes
* User profile management

# 3. AST-Based Repository Analysis

RepoLens AI uses Abstract Syntax Tree (AST) parsing to analyze repository structure more accurately.

AST parsing helps detect:

* Imports & exports
* Functions
* Classes
* Modules
* File relationships
* Dependency structure

Initially supported:

* JavaScript
* TypeScript

Technology used:

* Tree-sitter

# 4. Tech Stack Detection

Automatically detect:

### Languages

* JavaScript
* TypeScript
* Python
* Java
* C/C++
* Go
* Rust
* PHP
* SQL
* HTML/CSS

### Frameworks & Tools

* React
* Next.js
* Express
* Django
* Flask
* FastAPI
* MongoDB
* PostgreSQL
* Tailwind CSS
* Docker

# 5. AI-Powered Repository Summary

Generate intelligent explanations for:

* Entire repositories
* Important folders
* Core modules
* Important files

Example:

```txt
The project follows a modular MERN architecture.
Authentication is handled using JWT middleware.
Database operations are centralized inside the services layer.
```

# 6. Interactive File Explorer

Visualize repository structure using a VS Code-like explorer.

Example:

```txt
src/
 ├── components/
 ├── auth/
 ├── services/
 ├── routes/
 └── utils/
```

Features:

* Expand/collapse folders
* File previews
* Important file highlighting
* Folder explanations
* **Global Search functionality**

# 7. Dependency Graph Visualization

Generate interactive dependency graphs using AST analysis.

Visualize:

* Internal imports
* File relationships
* Highly connected modules
* Circular dependencies
* Service interactions

Features:

* Interactive graph nodes
* Zoom & pan
* Clickable files
* Relationship visualization
* Hotspot highlighting

# 8. AI Repository Chat

Ask natural language questions about the repository.

Example:

```txt
User: Where is authentication implemented?

AI: Authentication is handled inside authMiddleware.js and authController.js using JWT validation middleware.
```

Possible Questions:

* How does login work?
* Which files connect to MongoDB?
* Explain the folder structure
* Which module handles authentication?
* Where is database configuration defined?

# 9. Important Files Detection

Automatically identify:

* Entry points
* Core business logic files
* Highly connected modules
* Critical services
* Configuration files

Example:

```txt
server.js acts as the backend entry point.
authService.js is connected across multiple authentication modules.
```

# 10. Repository Health Insights

Generate repository insights such as:

* Largest files
* Most imported modules
* Deeply nested folders
* Circular dependencies
* Potential maintainability hotspots

# 🧱 Main Application Pages

# 1. Landing Page (`/`)

## Purpose
Introduce the platform and allow users to analyze repositories quickly.

# 2. Authentication Pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`)

## Components
* Traditional Email/Password Auth
* Google "One-Tap" Login Integration
* Secure Password Reset Flow

# 3. Dashboard Page (`/dashboard`)

## Layout
* Sidebar with settings, profiles, and repositories
* Welcome Section
* Analyze Repository Card
* Recent Repositories Section

# 4. Repository Analysis Page (`/repo/:id`)

## Layout
* **Left Sidebar**: Repository File Explorer
* **Top Navbar**: Global Search, Repository Name
* **Main Area Tabs**:
  * **Tab 1 — Overview**: AI Summary, Tech Stack, Stats
  * **Tab 2 — Dependency Graph**: Interactive Flow Graph
  * **Tab 3 — AI Chat**: Repository-aware AI Assistant
  * **Tab 4 — Complexity Insights**: Largest files, circular dependencies

# 5. Settings & Profile

## Features
* Update profile picture and username
* Dark/light theme toggle
* Account management

# 🛠️ Final Tech Stack

# Frontend

* React (Vite)
* Tailwind CSS
* React Router
* React Flow
* Framer Motion
* Zustand (State Management)

# Backend

* Node.js
* Express.js
* TypeScript

# Database

* MongoDB Atlas 

# AI

* Google Gemini API 

# Authentication

* JWT & bcrypt
* Google OAuth 2.0 Client

# AST Parsing

* Tree-sitter

# Deployment

* **Frontend**: Vercel (Custom Domain connected via Namecheap)
* **Backend**: Render Web Services

# 🗄️ Database Collections

## Users

```json
{
  "username": "Rahul",
  "email": "rahul@gmail.com",
  "password": "hashedPassword",
  "profilePicture": "https://...",
  "googleId": "..."
}
```

## Repositories

```json
{
  "userId": "...",
  "repoName": "RepoLens",
  "repoUrl": "...",
  "techStack": [],
  "summary": "...",
  "createdAt": "..."
}
```

## Chat History

```json
{
  "repoId": "...",
  "question": "...",
  "answer": "..."
}
```

# 🏗️ System Architecture

```txt
Frontend (React + Tailwind)
        ↓
Backend API Server (Render)
        ↓
Repository Cloning Service
        ↓
Repository Scanner
        ↓
Tree-sitter AST Parser
        ↓
Dependency Extractor
        ↓
Graph Generator
        ↓
AI Context Builder
        ↓
Gemini API
        ↓
Repository Chat & Insights
```

# 🎯 Real-World Use Cases

* Faster developer onboarding
* Understanding legacy systems
* Open-source contribution support
* Architecture visualization
* Technical interviews
* Repository auditing
* Learning large codebases

# 🚧 Challenges

* Large repository handling
* AST parsing optimization
* Dependency graph scaling
* Repository chunking
* Context optimization for AI

# 🔐 Security Considerations

* Secure JWT authentication
* Password hashing
* Sandboxed repository analysis
* File size limits
* Temporary repository cleanup

# 📈 Future Scope

* VS Code extension
* GitHub App integration
* Multi-repository analysis
* PR review assistant
* AI-generated refactoring suggestions

# 🌟 Vision

RepoLens AI aims to become:

> “The fastest way to understand any codebase.”

A developer should be able to upload a repository and instantly understand:

* How it works
* Which files matter most
* How modules interact
* Where important logic exists
* How the system is structured

without manually exploring hundreds of files.
