const express = require("express");
const { Auction } = require("../models/Auction");
const { User } = require("../models/User");
const { Bid } = require("../models/Bid");

const router = express.Router();

// Create auction
exports.createAuction = async (req, res) => {
  try {
    const {
      itemName,
      description,
      startingPrice,
      bidIncrement,
      goLiveTime,
      durationHours,
    } = req.body;

    const auction = await Auction.create({
      sellerId: req.userId,
      itemName,
      description,
      startingPrice,
      bidIncrement,
      goLiveTime: new Date(goLiveTime),
      durationHours,
      currentHighestBid: startingPrice,
    });

    res.status(201).json({
      message: "Auction created successfully",
      auction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all auctions
exports.getAllAuctions = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;

    const where = status !== "all" ? { status } : {};

    const auctions = await Auction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["goLiveTime", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      auctions: auctions.rows,
      totalCount: auctions.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(auctions.count / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single auction
exports.getSingleAuction = async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "email"],
        },
        {
          model: Bid,
          as: "bids",
          include: [
            {
              model: User,
              as: "bidder",
              attributes: ["id", "username"],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 10,
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Get current highest bid from Redis
    const redis = req.app.get("redis");
    const currentHighestBid = await redis.get(
      `auction:${auction.id}:highest_bid`
    );

    res.json({
      ...auction.toJSON(),
      currentHighestBid: currentHighestBid
        ? parseFloat(currentHighestBid)
        : auction.startingPrice,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update auction status (admin/seller only)
exports.updateAuctionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const auction = await Auction.findByPk(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Check if user is seller or admin
    if (auction.sellerId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    auction.status = status;
    await auction.save();

    const io = req.app.get("io");
    io.to(`auction-${auction.id}`).emit("auction-status-changed", {
      auctionId: auction.id,
      status,
    });

    res.json({ message: "Auction status updated", auction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
