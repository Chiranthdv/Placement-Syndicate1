# 🚀 Placement Syndicate — MERN Stack

A scalable microservices-based placement preparation platform built with **MongoDB, Express.js, React, and Node.js**. Features interview experience sharing, AI-powered resume analysis, real-time notifications via Kafka, and JWT authentication.

## Architecture

```
Frontend (React + Vite :3000)
    ↓
API Gateway (Express.js :8200) — JWT Auth + Rate Limiting + Proxy
    ├── User Service (Express.js :8081) — Auth + Profile — MongoDB
    ├── Experience Service (Express.js :8082) — CRUD — MongoDB + Kafka Producer
    ├── Resume Service (Express.js :8050) — Upload + AI Proxy — RabbitMQ
    └── Notification Service (Express.js :8083) — Kafka Consumer + Email
Service Registry (Express.js :8100) — Custom Discovery
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, React Router 6 |
| Backend | Express.js, Mongoose, JWT, Joi |
| Database | MongoDB |
| Messaging | KafkaJS, amqplib (RabbitMQ) |
| Email | Nodemailer |
| Gateway | http-proxy-middleware, express-rate-limit |
| AI/NLP | Python FastAPI (external service) |

## Prerequisites

- **Node.js 18+** and **npm**
- **MongoDB** running on `localhost:27017`
- **Docker** (optional, for Kafka/RabbitMQ/Redis)

## Quick Start

### 1. Infrastructure (Docker)
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
# Install all service dependencies
cd services/user-service && npm install && cd ../..
cd services/experience-service && npm install && cd ../..
cd services/api-gateway && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
cd services/resume-service && npm install && cd ../..
cd services/registry-service && npm install && cd ../..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings (email, secrets, etc.)
```

### 4. Start Services
```bash
# Start each service in separate terminals:
cd services/user-service && npm start        # Port 8081
cd services/experience-service && npm start  # Port 8082
cd services/notification-service && npm start # Port 8083
cd services/resume-service && npm start      # Port 8050
cd services/registry-service && npm start    # Port 8100
cd services/api-gateway && npm start         # Port 8200

# Start frontend
cd frontend && npm run dev                   # Port 3000
```

### 5. Open App
Navigate to `http://localhost:3000`

## Features

- 🔐 **JWT Authentication** — Signup/Login with role-based access
- 📝 **Interview Experiences** — Share and browse company-wise experiences
- 🤖 **AI Resume Advisor** — Upload resume for NLP-powered analysis
- 📧 **Email Notifications** — Kafka-driven alerts for new content
- 🎨 **Dark/Light Theme** — Premium UI with glassmorphism design
- 👑 **Admin Dashboard** — User management and moderation
- 📱 **Responsive** — Works on all screen sizes

## API Endpoints

### Auth (Public)
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Sign in

### Users (Authenticated)
- `GET /api/users/me` — My profile
- `GET /api/users/:id` — User by ID
- `GET /api/users/all` — All users

### Experiences (Authenticated)
- `POST /api/experience/register` — Create experience
- `GET /api/experience/me` — My experiences
- `GET /api/experience/companies` — All companies
- `GET /api/experience/company/:name` — By company
- `DELETE /api/experience/delete/:id` — Delete own
- `DELETE /api/experience/admin/:id` — Admin delete

### Resume (Authenticated)
- `POST /api/resume/upload` — Upload resume
- `GET /api/resume/feedback/:filename` — Get AI feedback

## License

MIT
