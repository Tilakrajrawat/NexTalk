# 💬 NexTalk — Real-Time Messaging Platform

NexTalk is a MERN-style chat platform with:
- a React frontend (`client/`) for chat UI flows,
- a Node.js + Express + Socket.IO backend (`backend/`) for auth, messaging, rooms, presence, typing, and file upload.

---

## ✅ Feature Audit Result

All features listed below are now implemented in the codebase.

### 🔐 JWT authentication
- Register, login, and `me` endpoints are implemented.
- Passwords are hashed with bcrypt.
- Protected routes are enforced via JWT middleware.

### 💬 Private 1-on-1 messaging
- DM history endpoint exists.
- Direct messages can be sent through REST and Socket.IO.

### 👥 Multi-user chat rooms
- Create room, join room, leave room endpoints exist.
- Room message history endpoint validates membership.

### 🧭 Socket.IO room-based event routing
- `join_room` / `leave_room` map users to Socket.IO rooms.
- Room messages are emitted only to relevant room channels.

### 🟢 Live presence indicators
- Users are marked online on socket connect and offline on disconnect.
- Presence events are broadcast with `user_online` / `user_offline`.

### ⌨️ Typing events
- `typing_start` and `typing_stop` are handled for both DMs and rooms.
- Server emits `typing` and `stop_typing` to target participants.

### 📎 File and image sharing (Multer)
- `POST /api/messages/upload` accepts files.
- File type + max size validation is enforced.
- Upload metadata can be attached to messages.

### 🔍 User search with real-time results
- `GET /api/users/search?q=` supports partial match on username/email.
- Response includes presence fields (`isOnline`, `lastSeen`) for live UI usage.

### 🗄️ MongoDB indexes
- Messages indexed on `{ room, createdAt }`.
- Messages indexed on `{ sender, receiver }`.

### ⚡ Socket.IO events covered
- Client → Server: `join_room`, `leave_room`, `send_message`, `typing_start`, `typing_stop`
- Server → Client: `receive_message`, `user_online`, `user_offline`, `typing`, `stop_typing`

---

## 🏗️ Architecture

- **Client**: React + Vite + Tailwind UI and chat screens.
- **Backend API**: Express REST endpoints for auth, users, rooms, and messages.
- **Realtime Layer**: Socket.IO with JWT-authenticated sockets and room/personal channels.
- **Database**: MongoDB (Mongoose models: User, Room, Message).
- **File Storage**: Local disk uploads served from `/uploads`.

---

## 📂 Project Structure

```
NexTalk/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── multer.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── messageController.js
│   │   │   ├── roomController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Message.js
│   │   │   ├── Room.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   ├── uploads/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── client/
    └── src/
```

---

## 🚀 Getting Started

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend default URL: `http://localhost:5000`

### 2) Client
```bash
cd client
npm install
npm run dev
```

Client default URL: `http://localhost:5173`

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)

### Messages
- `GET /api/messages/:roomId` (JWT required)
- `GET /api/messages/dm/:userId` (JWT required)
- `POST /api/messages` (JWT required)
- `POST /api/messages/upload` (JWT required)

### Rooms
- `GET /api/rooms` (JWT required)
- `POST /api/rooms` (JWT required)
- `POST /api/rooms/:id/join` (JWT required)
- `POST /api/rooms/:id/leave` (JWT required)

### Users
- `GET /api/users/search?q=` (JWT required)
- `GET /api/users/:id` (JWT required)

### Utility
- `GET /api/health`

---

## 🔌 Socket.IO Events

### Client → Server
- `join_room` (`roomId`)
- `leave_room` (`roomId`)
- `send_message` (`{ content, roomId?, receiverId?, fileUrl?, fileType? }`)
- `typing_start` (`{ roomId?, receiverId? }`)
- `typing_stop` (`{ roomId?, receiverId? }`)

### Server → Client
- `receive_message` (message object)
- `user_online` (`userId`)
- `user_offline` (`userId`)
- `typing` (`{ userId, roomId?, receiverId? }`)
- `stop_typing` (`{ userId, roomId?, receiverId? }`)

---

## 🧰 Tech Stack

- React + Vite + Tailwind CSS
- Node.js + Express + Socket.IO
- MongoDB + Mongoose
- JWT + bcrypt
- Multer
