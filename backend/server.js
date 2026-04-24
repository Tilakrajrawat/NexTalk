const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./src/config/db");
const app = require("./src/app");
const initializeSocket = require("./src/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
      },
      transports: ["websocket", "polling"]
    });

    app.set("io", io);

    initializeSocket(io);

    server.listen(PORT, () => {
      console.log(`🚀 NexTalk backend running on port ${PORT}`);
      console.log(`📁 Uploads served from: ${path.join(process.cwd(), "uploads")}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();