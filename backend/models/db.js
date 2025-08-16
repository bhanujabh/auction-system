const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const User = require("./User")(sequelize, Sequelize.DataTypes);
const Auction = require("./Auction")(sequelize, Sequelize.DataTypes);
const Bid = require("./Bid")(sequelize, Sequelize.DataTypes);
const Notification = require("./Notification")(sequelize, Sequelize.DataTypes);

// Define associations
User.hasMany(Auction, { foreignKey: "sellerId", as: "auctions" });
Auction.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

User.hasMany(Bid, { foreignKey: "bidderId", as: "bids" });
Bid.belongsTo(User, { foreignKey: "bidderId", as: "bidder" });

Auction.hasMany(Bid, { foreignKey: "auctionId", as: "bids" });
Bid.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Auction,
  Bid,
  Notification,
};
