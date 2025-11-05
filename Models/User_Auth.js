const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, 'Name is required']    
    validate: {
      validator: async function(v) {
        const count = await this.constructor.findOne({ name: v });
      },
      message: (props) => `${props.value} already exists!`,
    }
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
    type: Number,
    default: null
  },
  image: {
    type: String,
    default:''
  },
  date_of_birth: {
    type: Date,
    default: null
  },
  subscribers_count:{
    type: Number,
    default: 0
  },
  channel_description: {
    type: String,
    default: ''
  },
  channel_banner_image: {
    type: String,
    default: ''
  },
  channel_name: {
    type: String,
    default: ''
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
    default: ''
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