const mongoose = require("mongoose")

const RecordingSchema= new mongoose.Schema({
    roomId:{
        type: String,
        required: true
    },
    recordedBy:{
        type: String,   // storing the user id who are calling
        required: true
    },
    startTime:{
        type: Date,
        required: true,
        default: Date.now
    },
    endTime:{
        type: String,
        required: true
    },
    filepath:{
        type: String,       // Path to the stored video file (if server-side)
        required: true
    },
})

module.exports=mongoose.model("Recordings", RecordingSchema)