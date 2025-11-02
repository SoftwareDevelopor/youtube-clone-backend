const mongoose = require("mongoose");

const watchLaterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index to prevent duplicate entries
watchLaterSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model("WatchLater", watchLaterSchema);