module.exports = (sequelize, DataTypes) => {
  const Auction = sequelize.define("Auction", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    startingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currentHighestBid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    bidIncrement: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    goLiveTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    durationHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("upcoming", "live", "ended"),
      defaultValue: "upcoming",
    },
  });

  return Auction;
};
