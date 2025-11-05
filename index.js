const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config()
const mongoose = require("mongoose");
const path = require("path");
const socketio = require("socket.io");
const Recording = require("./Models/Recording.js"); // Fixed casing to match file system

const app = express();

const server = http.createServer(app);

const corsoption={
  origin:['https://youtube-clone-backend-j5yz.onrender.com/' , 'https://youtube-clone-backend-j5yz.onrender.com'],
  methods: ['GET' , 'POST'],
  credentials: true
}

const io = socketio(server,  cors(corsoption));

app.use(bodyparser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsoption))


// Serve uploads folder statically
app.use("/uploads/users", express.static('uploads/users'));
app.use("/uploads/videos/thumbnails", express.static('uploads/videos/thumbnails'));
app.use("/uploads/videos/videofile", express.static('uploads/videos/videofile'));


io.on("connection", (socket) => {


  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);

    socket.to(roomId).emit("user-connected", userId); // Notify others in the room
  });

  // WebRTC Signaling
  socket.on("signal", (data) => {
    // data contains targetId (recipient socket ID) and signal (WebRTC signaling data)
    io.to(data.targetId).emit("signal", {
      senderId: socket.id,
      signal: data.signal,
    });
  });

  // Screen Sharing Signal
  socket.on("screen-share-signal", (data) => {
    io.to(data.targetId).emit("screen-share-signal", {
      senderId: socket.id,
      signal: data.signal,
    });
  });
  let currentRecording = null; // To store recording object

  socket.on("start-recording", async (roomId) => {

    io.to(roomId).emit("recording-status", "started");

    // Create a new recording entry in DB
    try {
      currentRecording = new Recording({
        roomId: roomId,
        recordedBy: socket.id, // Or actual user ID if authenticated
        startTime: new Date(),
      });
      await currentRecording.save();

    } catch (err) {
      console.error("Error saving recording start to DB:", err);
    }
  });

  socket.on("stop-recording", async (roomId) => {

    io.to(roomId).emit("recording-status", "stopped");

    if (currentRecording) {
      try {
        currentRecording.endTime = new Date();
        // In a real app, you'd save the actual video file on the server
        // and store its path here. For now, just marking end time.
        await currentRecording.save();

      } catch (err) {
        console.error("Error saving recording stop to DB:", err);
      } finally {
        currentRecording = null;
      }
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("User connected", socket.id);
  });
});



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

