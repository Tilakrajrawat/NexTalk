# 💬 NexTalk — Real-Time Messaging Platform

A **full-stack real-time messaging platform** built with the MERN stack and Socket.IO, supporting both **private 1-on-1 conversations** and **multi-user chat rooms** with live presence indicators, typing events, file sharing, and persistent message history.

---

## 🎯 Problem Statement

Modern teams and communities need fast, reliable messaging with real-time feedback. NexTalk provides a lightweight but complete messaging experience — instant message delivery, live presence awareness, file sharing, and searchable user discovery, all backed by a scalable Node.js and Socket.IO architecture.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────┐
│              React Frontend                   │
│   Chat UI │ Room Management │ User Search     │
└───────────────────────┬──────────────────────┘
                        │ REST API + WebSocket
┌───────────────────────▼──────────────────────┐
│            Node.js + Express Backend          │
│   JWT Auth │ Socket.IO Server │ File Upload   │
│   Room Management │ Message API │ User API    │
└───────────────────────┬──────────────────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
     ┌────────▼────────┐  ┌────────▼────────┐
     │    MongoDB       │  │   File Storage   │
     │ Users, Messages  │  │ Uploaded images  │
     │ Rooms, Sessions  │  │ and files        │
     └─────────────────┘  └─────────────────┘
```

---

## ✨ Core Features

### 🔐 Authentication
- JWT-based stateless authentication
- Secure register and login flow
- BCrypt password hashing
- Protected routes on frontend and backend
- Persistent sessions via JWT token storage

---

### 💬 Messaging

**Private 1-on-1 Messaging**
- Direct message any user on the platform
- Private conversation thread per user pair
- Full message history loaded on conversation open
- Real-time message delivery via Socket.IO

**Multi-User Chat Rooms**
- Create named chat rooms
- Join and leave rooms freely
- Room-based Socket.IO routing for scalability
- All room members receive messages instantly
- Room member list with live presence status

---

### ⚡ Real-Time Features (Socket.IO)

**Presence Indicators**
- Online/offline status updated in real time
- Status visible on user list and conversation headers
- Offline status set automatically on disconnect

**Typing Events**
- Live "User is typing..." indicator
- Typing state cleared automatically after inactivity
- Shown in both private chats and group rooms

**Instant Message Delivery**
- Messages delivered via Socket.IO room-based routing
- No polling — pure event-driven architecture
- New messages appear instantly without page refresh

---

### 📎 File & Image Sharing
- Upload and share images and files in any conversation
- Files stored on server with reference saved in MongoDB
- Inline image preview in chat window
- Download support for shared files
- File type and size validation on upload

---

### 🔍 User Search
- Search users by name or username
- Real-time search results as you type
- Start a private conversation directly from search results
- Search results show online/offline status

---

## 🗄️ Data Models

### User Schema
```javascript
{
  username: String,        // Unique username
  email: String,           // Unique email
  password: String,        // BCrypt hashed
  avatar: String,          // Profile picture URL
  isOnline: Boolean,       // Real-time presence
  lastSeen: Date,          // Last active timestamp
  createdAt: Date
}
```

### Message Schema
```javascript
{
  sender: ObjectId,        // Reference to User
  content: String,         // Message text
  fileUrl: String,         // Optional file/image URL
  fileType: String,        // image / file
  room: ObjectId,          // Reference to Room (null for DMs)
  receiver: ObjectId,      // Reference to User (null for rooms)
  createdAt: Date
}
```

### Room Schema
```javascript
{
  name: String,            // Room display name
  members: [ObjectId],     // Array of User references
  createdBy: ObjectId,     // Reference to User
  createdAt: Date
}
```

---

## 🔑 Key Design Decisions

**Why Socket.IO over plain WebSockets?**
Socket.IO provides automatic reconnection, room-based event routing, and fallback to long-polling when WebSocket is unavailable. This makes it significantly more reliable across different network conditions compared to raw WebSockets.

**Why room-based routing?**
Rather than broadcasting all events to all connected clients, Socket.IO rooms ensure each message is only delivered to relevant participants — reducing unnecessary network traffic and improving scalability.

**Why MongoDB with indexing?**
Messages are indexed on `room` and `createdAt` fields to enable fast retrieval of conversation history in chronological order without full collection scans. For DMs, messages are indexed on `sender + receiver` pair.

**Why JWT over sessions?**
Stateless JWT authentication allows the backend to scale horizontally — any server instance can validate any token without shared session storage.

---

## 🧰 Tech Stack

### Frontend
- React
- Axios
- React Router
- Socket.IO Client
- Tailwind CSS

### Backend
- Node.js + Express.js
- Socket.IO
- JWT Authentication
- BCrypt
- Multer (file uploads)
- Mongoose

### Database
- MongoDB (users, messages, rooms)

---

## 📂 Project Structure

```
NexTalk/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── messageController.js
│   │   │   ├── roomController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Message.js
│   │   │   └── Room.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   ├── uploads/
│   │   └── config/
│   │       └── db.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Chat.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── PresenceBadge.jsx
│   │   │   ├── RoomList.jsx
│   │   │   ├── UserSearch.jsx
│   │   │   └── FilePreview.jsx
│   │   └── lib/
│   │       ├── api.js
│   │       └── socket.js
```

---

## 🚀 Getting Started

### Prerequisites
```
Node.js 18+
MongoDB (local) or MongoDB Atlas connection string
```

### Clone Repository
```bash
git clone https://github.com/Tilakrajrawat/NexTalk.git
cd NexTalk
```

### Backend Setup
```bash
cd backend
cp .env.example .env
# Add MongoDB URI and JWT secret to .env
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000 in .env
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login and receive JWT | Public |
| GET | /api/auth/me | Get current user | Authenticated |

### Messages
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/messages/:roomId | Get room message history | Authenticated |
| GET | /api/messages/dm/:userId | Get DM history with user | Authenticated |
| POST | /api/messages | Send a message | Authenticated |
| POST | /api/messages/upload | Upload file/image | Authenticated |

### Rooms
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/rooms | Get all joined rooms | Authenticated |
| POST | /api/rooms | Create new room | Authenticated |
| POST | /api/rooms/:id/join | Join a room | Authenticated |
| POST | /api/rooms/:id/leave | Leave a room | Authenticated |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users/search?q= | Search users by name | Authenticated |
| GET | /api/users/:id | Get user profile | Authenticated |

---

## ⚡ Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| join_room | roomId | Join a chat room |
| leave_room | roomId | Leave a chat room |
| send_message | { content, roomId/receiverId, fileUrl } | Send a message |
| typing_start | { roomId/receiverId } | Start typing indicator |
| typing_stop | { roomId/receiverId } | Stop typing indicator |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| receive_message | message object | New message received |
| user_online | userId | User came online |
| user_offline | userId | User went offline |
| typing | { userId, roomId } | Someone is typing |
| stop_typing | { userId, roomId } | Someone stopped typing |

---

## 📈 Future Enhancements
- **Message read receipts** — double tick indicators showing delivered and read status
- **Push notifications** — browser notifications for new messages when tab is inactive
- **Google OAuth** — sign in with Google for faster onboarding
- **Message reactions** — emoji reactions on individual messages
- **Message search** — full-text search across conversation history
- **Voice messages** — record and send short audio clips
- **End-to-end encryption** — secure message encryption for private conversations
- **Mobile PWA** — progressive web app for mobile users

---

## 👨‍💻 Author

**Tilak Raj Rawat**
Final Year B.Tech CSE — Graphic Era Hill University
[LinkedIn](https://linkedin.com/in/tilakrajrawat142) | [GitHub](https://github.com/Tilakrajrawat)
