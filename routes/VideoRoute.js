const express = require("express");
const multer = require('multer')
const path = require('path');
const { uploadvideo, viewVideo, downloadvideo, watchLater, getallvideos } = require("../Controllers/VideoController");
const videoroute = express.Router();
const uploads = multer({
  dest: "uploads/videos/videofile",
});
const thumbnailUploads = multer({
  dest: "uploads/videos/thumbnails",
});

module.exports = (app) => {

  // Configure multer for video uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname == 'videofile') {
        cb(null, path.join(__dirname, '..', 'uploads', 'videos', 'videofile'));
      } else if (file.fieldname == 'thumbnail') {
        cb(null, path.join(__dirname, '..', 'uploads', 'videos', 'thumbnails'));
      } else {
        cb(new Error('Invalid field name'), null);
      }
    },
    filename: (req, file, cb) => {
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      // console.log('Original filename:', file.originalname);
      let ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);

    }
  });

  const upload = multer({ storage: storage });

  const uploadFields = upload.fields([
    { name: 'videofile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]);

  videoroute.post("/uploadvideo", uploadFields, uploadvideo);

  videoroute.get('/getallvideos', getallvideos)

  videoroute.post("/view-video", viewVideo)

  // videoroute.post('/incrementlikes', incrementsLike)

  videoroute.post('/download-video',downloadvideo)

  videoroute.post('/watch-later',watchLater)

  app.use('/api/video', videoroute)

}


// videoroute.patch("/like/:id", (req, res, next) => {
//   console.log('Like route hit');
//   console.log('Video ID:', req.params.id);
//   console.log('Method:', req.method);
//   console.log('URL:', req.url);
//   next();
// }, incrementLike);

// videoroute.get("/download/:id", downloadVideo);

// videoroute.get("/test-download", (req, res) => {
//   res.json({ message: "Download endpoint is working" });
// });

// // Debug route to list files in uploads directory


// videoroute.post("/downloadandsave", downloadAndSaveVideo);


// module.exports = videoroute