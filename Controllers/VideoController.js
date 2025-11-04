

const video = require("../Models/Video.js");
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
    thumbnail: req.files.thumbnail[0].path,
    videofile: req.files.videofile[0].path
  };
  
  try {
    const insertdata=await video(data)
    const result=await insertdata.save()
    const obj={
      status:true,
      msg:"Uploaded a video..!",
      _data:result
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

// exports.incrementsLike = async (request, response) => {
//     // 1. Get IDs
//     const videoId = request.params.id || request.query.id;
    
//     // --- Basic Input Validation ---
//     if (!videoId) {
//         return response.send({
//             status: false,
//             msg: "No video ID provided.",
//             _data: null
//         });
//     }


//     try {
//         // 2. Check if the 'like' entry already exists
//         const existingLike = await Like.findById(videoId);

//         let videoUpdate;
//         let message;
//         let isLiked;

//         if (existingLike) {
//             // --- A. UNLIKE (If the user already liked it) ---
//             await Like.deleteOne({ _id: existingLike._id });
            
//             // Decrement the total like count on the Video document
//             videoUpdate = await video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { like: -1 } },
//                 { new: true }
//             ).populate("videochannel");
            
//             message = "Video unliked successfully.";
//             isLiked = false;

//         } else {
//             // --- B. LIKE (If the user has not liked it yet) ---
//             const newLike = new Like(videoId);
//             await newLike.save();

//             // Increment the total like count on the Video document
//             videoUpdate = await video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { like: 1 } },
//                 { new: true }
//             ).populate("videochannel");

//             message = "Video liked and added to your liked videos.";
//             isLiked = true;
//         }

//         // 3. Handle Video Not Found
//         if (!videoUpdate) {
//             return response.send({
//                 status: false,
//                 msg: "Video not found.",
//                 _data: null
//             });
//         }

//         // 4. Success Response
//         return response.send({
//             status: true,
//             msg: message,
//             _data: {
//                 video: videoUpdate,
//                 isLiked: isLiked // Indicate the new state of the like
//             }
//         });

//     } catch (error) {
//         console.error("Error in incrementsLike:", error);
//         return response.status(500).send({
//             status: false,
//             msg: "An error occurred while processing the like request.",
//             _data: null
//         });
//     }
// };


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
    if(!downloadedvideo){
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

    if (!existingEntry) {
      return response.send({
        status:false,
        msg:"Video does not in Watch later..!",
        _data:null
      })
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


