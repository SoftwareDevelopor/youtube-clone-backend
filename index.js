const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config()
const mongoose = require("mongoose");
const app = express();

const corsoption={
  origin:['http://localhost:5000' , 'http://localhost:5000/'],
  methods: ['GET' , 'POST'],
  credentials: true
}

app.use(bodyparser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsoption))


// Serve uploads folder statically
app.use("/uploads/users", express.static('uploads/users'));
app.use("/uploads/videos/thumbnails", express.static('uploads/videos/thumbnails'));
app.use("/uploads/videos/videofile", express.static('uploads/videos/videofile'));

app.get("/", (request, response) => {
  response.send("Youtube API Working !");
});

require('./routes/AuthRoute.js')(app);
require('./routes/VideoRoute.js')(app);

const dburl = process.env.DB_URL;
// Connect to MongoDB first, then start the HTTP server (with socket.io)
mongoose
  .connect(dburl)
  .then(() => {
    console.log("MongoDB connection established successfully!");
    const port = process.env.PORT;
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

