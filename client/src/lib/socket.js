import { io } from "socket.io-client";
import { SERVER_URL } from "./constants";

class SocketService {
  socket = null;

  connect(token) {
    if (!token) return null;

    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SERVER_URL, {
      auth: {
        token
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, handler) {
    this.socket?.on(event, handler);
  }

  off(event, handler) {
    this.socket?.off(event, handler);
  }

  emit(event, payload, callback) {
    this.socket?.emit(event, payload, callback);
  }

  get instance() {
    return this.socket;
  }

  get connected() {
    return !!this.socket?.connected;
  }
}

const socketService = new SocketService();

export default socketService;