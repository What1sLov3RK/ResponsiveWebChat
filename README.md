# 💬 Responsive WebChat

Real-time, full-stack chat application designed for seamless communication. Built with a modern tech stack (Node.js, React, Socket.IO) and a focus on performance, security, and responsive design.

![Tests](https://github.com/What1sLov3RK/ResponsiveWebChat/actions/workflows/tests.yml/badge.svg)
![Deployment](https://img.shields.io/badge/Deployed%20on-Railway-purple)
![Docker](https://img.shields.io/badge/Containerized-Docker-blue)

---

🌐 **Live Demo:** [ResponsiveWebChat on Railway](https://blissful-sparkle-production.up.railway.app/)

## 🚀 Key Features

- 🔐 **Secure Authentication** — JWT-based registration and login system with access/refresh tokens.
- 💬 **Real-time Messaging** — Instant delivery of messages and chat updates via Socket.IO.
- 👤 **Customizable Profiles** — Users can upload their own profile pictures, stored locally on the server.
- 🤖 **Interactive Bots** — Pre-configured bots with randomized LEGO-style avatars for a fun onboarding experience.
- 🕒 **Smart Chat List** — Automatic sorting of chats by the latest message, including relative timestamps (Today, Yesterday, etc.).
- 📱 **Fully Responsive** — Optimized UI that works perfectly on desktop, tablet, and mobile devices.
- 🛡️ **Error Resilience** — Integrated toast notifications for immediate user feedback on actions and errors.

## ✨ What Makes It Unique?

- **Optimized Real-time Sync**: Uses a smart synchronization logic that prevents race conditions and ensures the UI stays in sync across all clients immediately after a chat is created.
- **Reactive State Management**: Leveraging **MobX** for high-performance, predictable state management in the React frontend.
- **Bot-First Experience**: New users are automatically greeted by diverse bots, each with a unique identity and randomized avatar.
- **Modular & Clean Architecture**: The backend is built with a strictly modular structure (Controllers, Services, Routers), making it highly maintainable and easy to scale.
- **Production-Ready Logging**: Uses **Pino** for structured JSON logging, ready for ingestion by log analysis tools.

---

## 🏗️ Tech Stack

### Frontend
- **React** (v18+)
- **MobX** (Reactive State Management)
- **Socket.IO Client** (Real-time events)
- **Axios** (API requests)
- **React-Toastify** (Dynamic notifications)

### Backend
- **Node.js / Express**
- **Socket.IO** (WebSockets)
- **MongoDB / Mongoose** (NoSQL Database)
- **JWT** (Authentication)
- **Multer** (File uploads & static storage)
- **Pino** (Structured logging)

### DevOps & QA
- **Docker** (Containerized orchestration)
- **GitHub Actions** (CI/CD Pipeline)
- **Jest / Supertest** (Integration & Unit testing)
- **Railway** (Automated deployment)

---

## 📂 Project Structure

```text
/backend  
├── src/  
│   ├── config/ → Env setup & App config  
│   ├── db/models/ → Mongoose schemas (Users, Messages, Chats)  
│   ├── middleware/ → JWT, Auth & Socket validation  
│   ├── modules/ → Domain modules (User, Chat, Message)  
│   ├── sockets/ → WebSocket event handlers  
│   ├── uploads/ → Local storage for profile images  
│   └── app.js → Express & Static file configuration  
/frontend  
└── src/  
    ├── components/ → UI Components (ActiveChat, ChatsList, etc.)  
    ├── stores/ → MobX Stores (chatStore.js)  
    └── sockets/ → Client-side socket handlers  
```

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/What1sLov3RK/ResponsiveWebChat.git
cd ResponsiveWebChat
```

### 2. Configure Environment Variables
Create a `.env` file in `backend/` based on `.env.example`:
```env
PORT=4000
DB_URL=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=dev
```

### 3. Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend/API: `http://localhost:4000`

### 4. Manual Installation

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 🧪 Testing
The project includes a comprehensive test suite using Jest and MongoDB Memory Server.
```bash
cd backend
npm test
```

---

*Built with ❤️ by [What1sLov3RK](https://github.com/What1sLov3RK)*

