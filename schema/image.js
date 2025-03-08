const { DataTypes } = require("sequelize");
const sequelize = require('../DB');
const User = require("./user");

const Image = sequelize.define("Image", {
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    // allowNull: false,
    defaultValue: 'radha rani'
  },
  title: {
    type: DataTypes.STRING,
    // allowNull: false,
    defaultValue: 'radha rani'
  },
  userId: {
    type: DataTypes.INTEGER,
    // allowNull: false,
    // defaultValue: '123',
    references: {
      model: "Users", // Table name
      key: "id",
    },
    onDelete: "CASCADE", // Deletes posts if the user is deleted
  },
}, {
  timestamps: true, // Adds createdAt & updatedAt automatically
});

User.hasMany(Image, { foreignKey: "userId", onDelete: "CASCADE" });
Image.belongsTo(User, { foreignKey: "userId" });

module.exports = Image;
