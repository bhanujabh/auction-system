import io from "socket.io-client";

const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Re-register all listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  joinAuction(auctionId) {
    this.emit("join_auction", auctionId);
  }

  leaveAuction(auctionId) {
    this.emit("leave_auction", auctionId);
  }
}

export default new SocketService();
