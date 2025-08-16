const express = require("express");
const { Auction } = require("../models/Auction");
const { User } = require("../models/User");
const { Bid } = require("../models/Bid");
const { Notification } = require("../models/Notification");
const { authenticate } = require("../middlewares/authMiddleware");
const { createNotification } = require("../services/notificationService");

// Place bid
exports.placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const redis = req.app.get("redis");
    const io = req.app.get("io");

    // Get auction
    const auction = await Auction.findByPk(auctionId, {
      include: [{ model: User, as: "seller" }],
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Check if auction is active
    const now = new Date();
    const auctionStart = new Date(auction.goLiveTime);
    const auctionEnd = new Date(auction.endTime);

    if (now < auctionStart) {
      return res.status(400).json({ message: "Auction has not started yet" });
    }

    if (now > auctionEnd) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    if (auction.status !== "active") {
      return res.status(400).json({ message: "Auction is not active" });
    }

    // Prevent seller from bidding on own auction
    if (auction.sellerId === req.userId) {
      return res
        .status(400)
        .json({ message: "Cannot bid on your own auction" });
    }

    // Get current highest bid from Redis
    const currentHighestBidStr = await redis.get(
      `auction:${auctionId}:highest_bid`
    );
    const currentHighestBid = currentHighestBidStr
      ? parseFloat(currentHighestBidStr)
      : auction.startingPrice;
    const currentHighestBidderId = await redis.get(
      `auction:${auctionId}:highest_bidder`
    );

    // Validate bid amount
    const minimumBid = currentHighestBid + auction.bidIncrement;
    if (bidAmount < minimumBid) {
      return res.status(400).json({
        message: `Bid must be at least ${minimumBid}`,
      });
    }

    // Create bid record
    const bid = await Bid.create({
      auctionId,
      bidderId: req.userId,
      bidAmount,
    });

    // Update Redis with new highest bid
    await redis.set(`auction:${auctionId}:highest_bid`, bidAmount);
    await redis.set(`auction:${auctionId}:highest_bidder`, req.userId);

    // Update auction in database
    auction.currentHighestBid = bidAmount;
    auction.winnerId = req.userId;
    await auction.save();

    // Get bidder info
    const bidder = await User.findByPk(req.userId, {
      attributes: ["id", "username"],
    });

    // Notify previous highest bidder (if exists and different)
    if (currentHighestBidderId && currentHighestBidderId !== req.userId) {
      await createNotification({
        userId: currentHighestBidderId,
        auctionId,
        type: "outbid",
        message: `You have been outbid on "${auction.itemName}". New highest bid: $${bidAmount}`,
      });

      // Send real-time notification
      io.to(`user-${currentHighestBidderId}`).emit("notification", {
        type: "outbid",
        auctionId,
        message: `You have been outbid on "${auction.itemName}"`,
      });
    }

    // Notify seller
    await createNotification({
      userId: auction.sellerId,
      auctionId,
      type: "new_bid",
      message: `New bid of $${bidAmount} placed on "${auction.itemName}" by ${bidder.username}`,
    });

    // Broadcast to all users in auction room
    io.to(`auction-${auctionId}`).emit("new-bid", {
      auctionId,
      bidAmount,
      bidderId: req.userId,
      bidderUsername: bidder.username,
      timestamp: bid.createdAt,
    });

    // Send notification to seller
    io.to(`user-${auction.sellerId}`).emit("notification", {
      type: "new_bid",
      auctionId,
      message: `New bid of $${bidAmount} on your auction`,
    });

    res.status(201).json({
      message: "Bid placed successfully",
      bid: {
        ...bid.toJSON(),
        bidder: bidder,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get bids for an auction
exports.getBids = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const bids = await Bid.findAndCountAll({
      where: { auctionId },
      include: [
        {
          model: User,
          as: "bidder",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      bids: bids.rows,
      totalCount: bids.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(bids.count / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
