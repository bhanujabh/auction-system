const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const Redis = require("ioredis");

const { sequelize } = require("./models/db");
const authRoutes = require("./routes/authRoute");
const auctionRoutes = require("./routes/auctionRoute");
const bidRoutes = require("./routes/bidsRoute");
const notificationRoutes = require("./routes/notificationRoutes");
const { authenticateSocket } = require("./middlewares/authMiddleware");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const redis = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/notifications", notificationRoutes);

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("join-auction", (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`User ${socket.userId} joined auction ${auctionId}`);
  });

  socket.on("leave-auction", (auctionId) => {
    socket.leave(`auction-${auctionId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

app.set("io", io);
app.set("redis", redis);

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
    return sequelize.sync();
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
