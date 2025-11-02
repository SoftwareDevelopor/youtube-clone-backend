const mongoose = require("mongoose");
let videoSchema = new mongoose.Schema(
  {
    videotitle: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    videofile: {
      type: String,
      required: true,
    },
    videochannel: {
      type: String,
      ref: "Users"
    },
    video_category: {
      type: String,
      required: true,
    },
    playlist: {
      type: String,
      default: null
    },
    comments: {
      type: Array,
      default: []
    },
    like: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true,
    },
    agerestriction: {
      type: Number,
      required: true,
      default: 0
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    deleted_at: {
      type: Date,
      default: Date.now,
    },

  },
);

const video = new mongoose.model("Videos", videoSchema);
module.exports = video;
