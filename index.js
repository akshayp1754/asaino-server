const express = require("express");
const sequelize = require("./DB");
const userRoutes = require("./routes/user");
const imageRoutes = require("./routes/image");
const cors = require("cors");

const axios = require("axios");
const FormData = require("form-data");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.json({ greetings: "Hare Krishna" });
});



app.get("/seed-db", async (req, res) => {
  const imageCount = 15;
  const imageWidths = Array.from(
    { length: imageCount },
    () => Math.floor(Math.random() * 1000) + 200
  );
  const imageHeights = Array.from(
    { length: imageCount },
    () => Math.floor(Math.random() * 1000) + 200
  );
  const imageUrls = Array.from(
    { length: imageCount },
    (_, i) => `https://picsum.photos/${imageWidths[i]}/${imageHeights[i]}`
  );

  const dataArr = [];
  for (let i = 0; i < imageCount; i++) {
    const response = await axios.get(imageUrls[i], {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data, "binary");
    const fd = new FormData();
    fd.append(`image`, buffer, { filename: `image-${i}.jpg` });
    fd.append(`title`, `Random Image ${i}`);
    dataArr.push(fd);
  }

  const postPromises = [];
  for (let i = 0; i < imageCount; i++) {
   const fd = dataArr[i];
   postPromises.push(
    axios.post("http://localhost:5001/api/images", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6InRlc3QiLCJsYXN0TmFtZSI6InVzZXIiLCJpYXQiOjE3NDE0MzcyMjYsImV4cCI6MTc0MTUyMzYyNn0.6c4grzFiq8Jdbfgxgw4zzhqqXql0qSgUUNuxkrVDbN8`,
      },
    })
  );
  }

  Promise.all(postPromises)
    .then(() => {
      res.send("Posts created successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error creating posts");
    });
});

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Unable to connect to the database:", err));
