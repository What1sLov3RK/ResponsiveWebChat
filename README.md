# 💬 Responsive WebChat

Real-time chat app using Node.js, React, and Socket.IO — with JWT auth, Pino logging, Jest tests, and Dockerized CI/CD on Railway.

A full-stack real-time chat system built with Express, Socket.IO, and React, connected to MongoDB Atlas.
Implements modular backend design, JWT auth, Pino structured logging, and in-memory Jest tests for models and endpoints.
Fully Dockerized with Compose and integrated into a CI/CD pipeline that runs automated tests before each deployment.

![Tests](https://github.com/What1sLov3RK/ResponsiveWebChat/actions/workflows/tests.yml/badge.svg)
![Deployment](https://img.shields.io/badge/Deployed%20on-Railway-purple)
![Docker](https://img.shields.io/badge/Containerized-Docker-blue)

---

🌐 **Live Demo:** [ResponsiveWebChat on Railway](https://blissful-sparkle-production.up.railway.app/)

## 🚀 Features

- 🔐 **JWT Authentication** — secure registration, login, refresh tokens, and logout  
- 💬 **Real-time messaging** — powered by Socket.IO  
- 👥 **Private & group chats**  
- 🧱 **REST API** for user management and chat history  
- 🧩 **Modular backend** with Express & Mongoose (MongoDB Atlas)  
- 🧪 **Automated testing** — Jest + Supertest + MongoDB Memory Server  
- ⚙️ **CI/CD pipeline** via GitHub Actions and Railway auto-deploy  
- 🎨 **Responsive UI** built with React, styled for both desktop and mobile  

---

## 🏗️ Tech Stack

**Frontend:**  
- React  
- Axios  
- Socket.IO Client  

**Backend:**  
- Node.js / Express  
- Socket.IO  
- MongoDB (Mongoose)  
- JWT (Access & Refresh tokens)  
- Jest / Supertest (tests)  

**DevOps & Deployment:**  
- Docker (containerized backend)  
- GitHub Actions (CI tests)  
- Railway (CD deployment)  

---

## 📂 Project Structure

/backend  
│  
├── src/  
│ ├── config/ → env setup & app config  
│ ├── db/  
│ │ ├── models/ → MongoDB schemas (Users, Messages, Chats)  
│ │ └── users/ → UserRepository layer  
│ ├── docs/ → Swagger auto-generated API docs  
│ ├── middleware/ → JWT & Socket authentication  
│ ├── modules/  
│ │ ├── users/ → Controller, Router, Service  
│ │ ├── chats/ → Controller, Router, Service  
│ │ └── message/ → Controller, Router, Service  
│ ├── sockets/ → WebSocket event handlers & logger  
│ ├── utils/ → helpers (cookieOptions, etc.)  
│ ├── app.js → express app initialization  
│ └── server.js → socket + express server entry point  
│  
├── tests/ → Jest unit & integration tests  
│ ├── auth-integration.test.js  
│ ├── user-model.test.js  
│ └── testSetupDB.js  
│  
├── .env.example → environment template  
├── Dockerfile  
├── eslint.config.js  
├── package.json  
└── README.md  
  
/frontend  
│ └── React client  
  

---

## ⚙️ Environment Variables

Create `.env` file inside `/backend/src/config/`:

```env
PORT=4000
DB_URL=your_mongo_db_url
CLIENT_URL=http://localhost:3000

JWT_ACCESS_SECRET=yourAccessSecret
JWT_REFRESH_SECRET=yourRefreshSecret
CORS_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
COOKIE_DOMAIN=localhost
NODE_ENV=dev
```

## 🧪 Run Tests
```bash
cd backend
npm test
```

---
### Build and Run

## 🐳 Docker & Docker Compose

You can run the full stack (frontend + backend) using Docker Compose.

```bash
# From project root
docker-compose up --build
```

This will:

build both backend and frontend containers

start MongoDB connection via environment variables

expose:

http://localhost:3000
 → frontend (React)

http://localhost:4000
 → backend (API + WebSockets)

## Stop Containers

```bash
docker-compose down
```

## 🖥️ Local Setup

# Clone repo
```bash
git clone https://github.com/What1sLov3RK/ResponsiveWebChat.git
```

# Backend
```bash
cd backend
npm install
npm run dev
```

# Frontend
```bash
cd ../frontend
npm install
npm start
```
