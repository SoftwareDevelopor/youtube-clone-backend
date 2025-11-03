

const video = require("../Models/Video.js");
const WatchLater = require("../Models/WatchLater.js");

exports.uploadvideo = async (req, res) => {

  console.log(req.files)
  // Check if files exist
  if (!req.files) {
    return res.send({ 
      status:false,
      message: "No any file exists! Upload a video", 
      _data: null
    });
  }
  
  const data = {
    ...req.body,
    thumbnail: req.files.thumbnail[0].path.replace('/opt/render/project/src',''),
    videofile: req.files.videofile[0].path.replace('/opt/render/project/src','')
  };
  
  try {
    const insertdata=await video(data)
    const result=await insertdata.save()
    const obj={
      status:true,
      msg:"Uploaded a video..!",
      _data:result,
      thumbnail_image_path:`https://youtube-clone-backend-j5yz.onrender.com${result.thumbnail}`,
      videofile_image_path:`https://youtube-clone-backend-j5yz.onrender.com${result.videofile}`
    }
    return res.send(obj)
  } catch (error) {
    console.log('Upload error:', error);
    return res.send({
      status:false,
      msg:"Something went wrong..!",
      _data:error
    })
  }
};

exports.getallvideos=async(request,response)=>{
  try {
    // Fetch all videos and populate the videochannel field to get channel details
    const videos = await video.find().populate("videochannel");
    
    if (!videos || videos.length === 0) {
      return response.send({
        status: false,
        msg: "No videos found",
        _data: []
      });
    }

    const obj = {
      status: true,
      msg: "Videos fetched successfully",
      _data: videos
    };
    return response.send(obj);
  } catch (error) {
    console.log('Get all videos error:', error);
    return response.send({
      status: false,
      msg: "Something went wrong while fetching videos",
      _data: error
    });
  }
}

exports.viewVideo=async(request,response)=>{
  try{
    const id = request.params.id || request.query.id;
    if(!id){
      return response.status(400).send({
        status:false,
        msg: "Missing video id",
        _data: null
      })
    }
    // Atomically increment views and return updated document
    const updated = await video.findById(id).populate("videochannel");
    if(!updated){
      return response.send({
        status:false,
        msg: "Video not found",
        _data: null
      })
    }
    const obj={
      status:true,
      msg:"Video Found..!",
    _data:updated
    }
    return response.send(obj)
  }catch(error){
    console.log('viewVideo error:', error);
    return response.send({
      status:false,
      msg: "Something went wrong",
      _data: error
    })
  }
}

exports.incrementsLike=async(request,response)=>{
  try {
    const id=request.params.id || request.query.id
    if(!id){
      const obj={
        status:false,
        msg:"No any video found with this id..!",
        _data:null
      }
      return response.send(obj)
    }


    const incrementResult = await video.findByIdAndUpdate(
      id,
      { $inc: { like: 1 } },
      { new: true } // This option returns the updated document
    ).populate("videochannel");

    if(!incrementResult){
      const obj={
        status:false,
        msg:"Video not found",
        _data: null
      }
      return response.send(obj)
    }
    const obj={
      status:true,
      msg:"Like is incremented..!",
      _data: incrementResult
    }
    return response.send(obj)
  } catch (error) {
    console.log(error)
  }
}

exports.downloadvideo=async(request,response)=>{
  try {
    const id=request.params.id || request.query.id
    if(!id){
      const obj={
        status:false,
        msg:"Video not found..!",
        _data:null
      }
      response.send(obj)
    }
    const downloadedvideo = await video.findById(id);
    if(!updated){
      return response.send({
        status:false,
        msg: "Video not found",
        _data: null
      })
    }
    const obj={
      status:true,
      msg:"Video Found..!",
    _data:downloadedvideo
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status:false,
      msg: "Something went wrong",
      _data: error
    })
  }
}

// exports.downloadVideo = async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) {
//       console.log('Video not found for ID:', req.params.id);
//       return res.status(404).json({ message: "Video not found" });
//     }
    
//     console.log('Download request for video:', video.videotitle);
//     console.log('File URL:', video.filepath);
    
//     // Set proper headers for video download
//     res.setHeader('Content-Type', video.filetype || 'video/mp4');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
//     // Extract filename from URL for download name
//     const filename = path.basename(video.filepath);
//     const fileExtension = path.extname(filename) || '.mp4';
//     const downloadFilename = `${video.videotitle.replace(/[^a-z0-9]/gi, '_')}${fileExtension}`;
    
//     res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    
//     // Stream the file directly from the URL with better error handling
//     try {
//       const response = await axios({
//         method: 'GET',
//         url: video.filepath,
//         responseType: 'stream',
//         timeout: 30000, // 30 second timeout
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//         }
//       });
      
//       // Check if response is successful
//       if (response.status !== 200) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       // Set content length if available
//       if (response.headers['content-length']) {
//         res.setHeader('Content-Length', response.headers['content-length']);
//       }
      
//       // Pipe the response stream to the client
//       response.data.pipe(res);
      
//       // Handle stream errors
//       response.data.on('error', (error) => {
//         console.error('Stream error:', error);
//         if (!res.headersSent) {
//           res.status(500).json({ message: "Error streaming video" });
//         }
//       });
      
//     } catch (streamError) {
//       console.error('Error streaming video:', streamError);
      
//       // Fallback: try to send the video URL directly
//       if (!res.headersSent) {
//         res.status(200).json({ 
//           message: "Video streaming failed, using direct URL",
//           videoUrl: video.filepath,
//           filename: downloadFilename
//         });
//       }
//     }
    
//   } catch (err) {
//     console.error('Error downloading video:', err);
//     if (!res.headersSent) {
//       res.status(500).json({ 
//         message: "Error downloading video",
//         error: err.message 
//       });
//     }
//   }
// };

// exports.downloadAndSaveVideo = async (req, res) => {
//   try {
//     console.log('downloadAndSaveVideo called');
//     console.log('req.body:', req.body);
//     console.log('req.headers:', req.headers);
    
//     // Check if req.body exists
//     if (!req.body) {
//       return res.status(400).json({ 
//         message: "Request body is missing. Make sure to send JSON data.",
//         error: "req.body is undefined"
//       });
//     }
    
//     const { url, videotitle, videochannel, uploader, description, thumbnail } = req.body;
    
//     // Validate required fields
//     if (!url || !videotitle || !videochannel || !uploader || !description || !thumbnail) {
//       return res.status(400).json({ 
//         message: "Missing required fields",
//         required: ["url", "videotitle", "videochannel", "uploader", "description", "thumbnail"],
//         received: Object.keys(req.body)
//       });
//     }
    
//     // Download video file
//     const response = await axios({
//       method: "GET",
//       url,
//       responseType: "stream",
//     });
//     const filetype = response.headers["content-type"] || "video/mp4";
//     const ext = filetype.split("/")[1] || "mp4";
//     const filename = `${Date.now()}-${videotitle.replace(/\s+/g, "_")}.${ext}`;
//     const filepath = path.join("server", "uploads", filename);
//     const fullpath = path.join(__dirname, "..", "uploads", filename);
//     const writer = fs.createWriteStream(fullpath);
//     response.data.pipe(writer);
//     await new Promise((resolve, reject) => {
//       writer.on("finish", resolve);
//       writer.on("error", reject);
//     });
//     const stats = fs.statSync(fullpath);
//     const filesize = stats.size;

//     // Download thumbnail image
//     const thumbResponse = await axios({
//       method: "GET",
//       url: thumbnail,
//       responseType: "stream",
//     });
//     const thumbType = thumbResponse.headers["content-type"] || "image/png";
//     const thumbExt = thumbType.split("/")[1] || "png";
//     const thumbFilename = `${Date.now()}-${videotitle.replace(
//       /\s+/g,
//       "_"
//     )}-thumb.${thumbExt}`;
//     const thumbPath = path.join("server", "uploads", thumbFilename);
//     const thumbFullPath = path.join(__dirname, "..", "uploads", thumbFilename);
//     const thumbWriter = fs.createWriteStream(thumbFullPath);
//     thumbResponse.data.pipe(thumbWriter);
//     await new Promise((resolve, reject) => {
//       thumbWriter.on("finish", resolve);
//       thumbWriter.on("error", reject);
//     });

//     // Save to database
//     const file = new Video({
//       videotitle,
//       filename,
//       filepath,
//       filetype,
//       filesize,
//       videochannel,
//       uploader,
//       description,
//       thumbnail: thumbPath,
//       like: 0,
//       views: 0,
//       _id: new mongoose.Types.ObjectId(),
//     });
//     await file.save();
//     return res
//       .status(201)
//       .json({
//         message: "Video and thumbnail downloaded and saved",
//         video: file,
//       });
//   } catch (error) {
//     console.log('downloadAndSaveVideo error:', error);
//     return res
//       .status(500)
//       .json({ 
//         message: "Failed to download and save video/thumbnail",
//         error: error.message
//       });
//   }
// };

// Toggle watch later status and get updated watch later list
exports.watchLater = async (request, response) => {
  try {
    const videoId = request.params.id || request.query.id;
    const userId = request.body.userId;

    if (!videoId || !userId) {
      return response.send({
        status: false,
        msg: "Video ID and User ID are required",
        _data: null
      });
    }

    // Check if video exists
    const videoExists = await video.findById(videoId);
    if (!videoExists) {
      return response.send({
        status: false,
        msg: "Video not found",
        _data: null
      });
    }

    // Check if video is already in watch later
    const existingEntry = await WatchLater.findOne({ userId, videoId });
    let result;

    if (existingEntry) {
      // If video exists in watch later, remove it
      await WatchLater.findOneAndDelete({ userId, videoId });
      result = {
        isAdded: false,
        msg: "Video removed from watch later"
      };
    } else {
      // If video doesn't exist in watch later, add it
      const watchLater = new WatchLater({
        userId,
        videoId
      });
      await watchLater.save();
      result = {
        isAdded: true,
        msg: "Video added to watch later"
      };
    }

    // Get updated watch later list
    const watchLaterList = await WatchLater.find({ userId })
      .populate({
        path: 'videoId',
        populate: {
          path: 'videochannel'
        }
      })
      .sort({ addedAt: -1 });

    const obj = {
      status: true,
      msg: result.msg,
      isAddedToWatchLater: result.isAdded,
      _data: {
        currentVideo: videoId,
        watchLaterList: watchLaterList
      }
    };
    return response.send(obj);

  } catch (error) {
    console.log('Watch Later error:', error);
    return response.send({
      status: false,
      msg: "Something went wrong with watch later operation",
      _data: error
    });
  }
};

