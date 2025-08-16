const express = require("express");
const { register, login, logout } = require("../controllers/authController.js");
// import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

// router.put("/update-profile", authenticate, updateProfile);
// // authenticate is a middleware

// router.get("/check", authenticate, checkAuth);

module.exports = router;
