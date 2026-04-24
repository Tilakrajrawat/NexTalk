const authSocket = require("./authSocket");
const registerSocketEvents = require("./events");
const {
  handleUserConnected,
  handleUserDisconnected
} = require("./presence");

const initializeSocket = (io) => {
  io.use(authSocket);

  io.on("connection", async (socket) => {
    try {
      await handleUserConnected(io, socket);

      socket.emit("server:ready", {
        message: "NexTalk realtime connected",
        userId: socket.user._id.toString()
      });

      registerSocketEvents(io, socket);

      socket.on("disconnect", async () => {
        await handleUserDisconnected(io, socket);
      });
    } catch (error) {
      socket.emit("socket:error", {
        event: "connection",
        message: error.message || "Socket connection failed"
      });

      socket.disconnect(true);
    }
  });
};

module.exports = initializeSocket;