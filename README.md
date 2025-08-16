# Mini Auction System

A full-stack real-time auction platform built with **React**, **Node.js**, **Express.js**, **Sequelize**, **PostgreSQL (Supabase)**, **Redis (Upstash)**, and **WebSockets**. Users can create auctions, place bids, and receive real-time notifications.

## Features

- User authentication with JWT
- Create, view, and manage auctions
- Real-time bidding via WebSockets
- Notifications for bids and status changes
- Dockerized frontend and backend

## Tech Stack

**Frontend:** React, Axios, React Router
**Backend:** Node.js, Express.js, Sequelize ORM
**Database:** PostgreSQL (Supabase)
**Cache / Realtime:** Redis (Upstash), WebSockets
**Authentication:** JWT

## Getting Started

### Backend

```bash
cd backend
npm install
# create .env with DATABASE_URL, REDIS_URL, JWT_SECRET, CLIENT_URL
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker

```bash
docker build -t mini-auction-backend ./backend
docker run -p 5001:5001 --env-file ./backend/.env mini-auction-backend

docker build -t mini-auction-frontend ./frontend
docker run -p 3000:3000 mini-auction-frontend
```

## Environment Variables

**Backend (.env):**
`PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CLIENT_URL`

**Frontend (.env):**
`REACT_APP_API_URL=http://localhost:3000/api`

## API Endpoints

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`
**Auctions:** `GET /api/auctions`, `GET /api/auctions/:id`, `POST /api/auctions`, `PATCH /api/auctions/:id/status`
**Bids:** `POST /api/bids`
**Notifications:** `GET /api/notifications`
