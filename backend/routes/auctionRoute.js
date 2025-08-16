const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  createAuction,
  getAllAuctions,
  getSingleAuction,
  updateAuctionStatus,
} = require("../controllers/auctionController");

const router = express.Router();

router.post("/", authenticate, createAuction);

router.get("/", getAllAuctions);

router.get("/:id", getSingleAuction);

router.patch("/:id/status", updateAuctionStatus);

module.exports = router;
