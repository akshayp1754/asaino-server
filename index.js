const express = require("express");
const sequelize = require("./DB");
const userRoutes = require("./routes/user");
const imageRoutes = require("./routes/image");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.json({ greetings: "Hare Krishna" });
});

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Unable to connect to the database:", err));
