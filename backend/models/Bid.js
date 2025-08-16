module.exports = (sequelize, DataTypes) => {
  const Bid = sequelize.define("Bid", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  return Bid;
};
