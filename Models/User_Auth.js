const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: [ true, 'Email is required' ]
  },
  password: {
    type: String,
    required: [ true, 'Password is required' ]
  },
  mobile_number: {
    type: String,
    default: null
  },
  image: {
    type: String,
    required: [ true, 'Image is required' ]
  },
  date_of_birth: {
    type: Date,
    default: Date.now
  },
  subscribers_count:{
    type: Number,
    default: 0
  },
  channel_description: {
    type: String,
    default: null
  },
  channel_banner_image: {
    type: String,
    default: null
  },
  channel_name: {
    type: String,
    default: null
  },
  increment_points:{
    type:Number,
    default:0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: ""
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date,
    default: null
  },
  downloads: [
    {
      date: { type: Date, required: true },
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Videos', required: true }
    }
  ]
});

const user = mongoose.model('Users', userSchema);
module.exports = user;