# RepoLens AI

> AI-powered repository intelligence platform that helps developers understand, visualize, and explore codebases faster.

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
* JWT-based authentication
* Password hashing using bcrypt
* Protected dashboard routes

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

## Sections

### Hero Section

* Large headline
* Short project description
* GitHub repository URL input
* Analyze button

### Feature Showcase

Cards for:

* AI Repository Chat
* Dependency Graphs
* Repository Summaries
* AST-Based Analysis

### Demo Preview

* Graph preview
* Chat UI preview
* File explorer preview

### How It Works

Simple workflow:

1. Paste GitHub URL
2. Repository gets analyzed
3. AST parsing extracts dependencies
4. Graph & insights generated
5. Ask AI questions

### Footer

* GitHub link
* About section
* Contact section

# 2. Login Page (`/login`)

## Components

* Email input
* Password input
* Login button
* Signup redirect link

# 3. Signup Page (`/signup`)

## Components

* Username input
* Email input
* Password input
* Confirm password input
* Create account button

# 4. Dashboard Page (`/dashboard`)

## Purpose

Main user workspace.

## Layout

### Sidebar

* Dashboard
* Repositories
* Settings
* Logout

### Main Content

#### Welcome Section

```txt
Welcome back Rahul 👋
```

#### Analyze Repository Card

* GitHub repository URL input
* Analyze button

#### Recent Repositories Section

Repository cards displaying:

* Repository name
* Tech stack
* Last analyzed date

Example:

```txt
Repo: Ecommerce-App
Stack: MERN
Files: 214
```

# 5. Repository Analysis Page (`/repo/:id`)

## Purpose

Core repository exploration workspace.

## Layout

```txt
Top Navbar
--------------------------------
Sidebar | Main Analysis Area
--------------------------------
```

## Left Sidebar

### Repository File Explorer

Features:

* Expand/collapse folders
* Click files
* Highlight important files

Example:

```txt
src/
 ├── components/
 ├── auth/
 ├── services/
 └── utils/
```

## Top Navbar

* Repository name
* File search
* Refresh analysis button

## Main Analysis Tabs

## Tab 1 — Overview

### Includes

* AI repository summary
* Tech stack badges
* Important files
* Repository statistics

### Statistics

* Total files
* Total folders
* Dependency count

## Tab 2 — Dependency Graph

### Features

* Interactive graph
* AST-generated relationships
* Zoom & pan
* Clickable nodes
* Module relationships

Example:

```txt
AuthController
      ↓
AuthService
      ↓
Database
```

## Tab 3 — AI Chat

### Features

* Chat interface
* Repository-aware responses
* Suggested prompts

Example prompts:

* Where is authentication implemented?
* Explain login flow
* Which files connect to MongoDB?

## Tab 4 — Complexity Insights

### Includes

* Largest files
* Most imported modules
* Deeply nested folders
* Circular dependencies

Example:

```txt
authController.js → 540 lines
database.js used in 14 modules
```

# 6. Settings Page (`/settings`)

## Features

* Update profile
* Dark/light theme toggle
* Logout
* Delete account

# 🛠️ Final Tech Stack

# Frontend

* React
* Tailwind CSS
* React Router
* React Flow

# Backend

* Node.js
* Express.js

# Database

* MongoDB Atlas (Free Tier)

# AI

* Google Gemini API (Free)

# Authentication

* JWT
* bcrypt

# AST Parsing

* Tree-sitter

# Deployment

* Vercel (Frontend)
* Render (Backend)

# 🗄️ Database Collections

## Users

```json
{
  "username": "Rahul",
  "email": "rahul@gmail.com",
  "password": "hashedPassword"
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
Backend API Server
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

# ⚡ Suggested Build Order

```txt
1. Authentication
2. Dashboard UI
3. GitHub Repository Import
4. Repository Scanner
5. AST Parsing
6. Dependency Graph
7. AI Repository Summary
8. AI Chat
9. Complexity Insights
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
