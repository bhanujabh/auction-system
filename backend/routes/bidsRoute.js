const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { placeBid, getBids } = require("../controllers/bidsController");

router.post("/", authenticate, placeBid);

router.get("/auction/:auctionId", getBids);

module.exports = router;
