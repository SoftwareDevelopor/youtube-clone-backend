const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const user = require('../Models/User_Auth')

exports.register = async (request, response) => {
  if (!request || !request.body) {
    const obj = {
      status: false,
      msg: "No data provided",
      _data: null
    }
    return response.send(obj)
  }

  var existingUser = await user.findOne({ email: request.body.email, deleted_at: null })
  if (existingUser) {
    const obj = {
      status: false,
      msg: "User with this email already exists",
      _data: null
    }
    return response.send(obj)
  }

  let saltRounds=10
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds)
  const newUser = {
    name: request.body.name,
    email: request.body.email,
    password: hashedPassword,
  }

  if (request.file) {
    newUser.image = request.file.filename
  }

  
  try {
    const insertdata = await user(newUser)
    const result = await insertdata.save()
    var token = jwt.sign({ userdata: result }, process.env.secret_key)
    const base_url='https://youtube-clone-backend-j5yz.onrender.com';
    let image_url=null
    if(result.image){
      let timestamp = result.updated_at.getTime()
      image_url=`${base_url}/uploads/users/${result.image}?v=${timestamp}`
    }
    const objectdata = {
      status: true,
      msg: "User registered successfully",
      _data: result,
      image_url: image_url,
      token: token,
    }
    return response.send(objectdata)
  } catch (error) {
    var errormessages = [];
    for (let err in error.errors) {
      errormessages.push(error.errors[err].message);
    }
    const output = {
      status: false,
      msg: "Something went wrong",
      _data: error,
      errorMsg: errormessages,
    };
    return response.send(output);
  }
}

exports.login = async (request, response) => {
  if (!request || !request.body) {
    const obj = {
      status: false,
      msg: "No data provided",
      _data: null
    }
    return response.send(obj)
  }

  const existingUser = await user.findOne({ email: request.body.email, deleted_at: null })
  if (!existingUser) {
    const obj = {
      status: false,
      msg: "User not found",
      _data: null
    }
    return response.send(obj)
  }

  const isMatch = await bcrypt.compare(request.body.password, existingUser.password)
  if (!isMatch) {
    const obj = {
      status: false,
      msg: "Invalid password",
      _data: null
    }
    return response.send(obj)
  }

  if (existingUser.status == false) {
    const obj = {
      status: false,
      msg: "Your account has been deactivated. Please contact support.",
      _data: null
    }
    return response.send(obj)
  }
  const base_url='https://youtube-clone-backend-j5yz.onrender.com';
    let image_url=null
    if(existingUser.image){
      let timestamp = existingUser.updated_at.getTime()
      image_url = `${base_url}/uploads/users/${existingUser.image}?v=${timestamp}`
    }
  var token = jwt.sign({ userdata: existingUser }, process.env.secret_key)

  const objectdata = {
    status: true,
    msg: "User logged in successfully",
    _data: existingUser,
    token: token,
    imageurl: image_url
  }
  return response.send(objectdata)
}

exports.viewProfile = async (request, response) => {

  var token = request.headers.authorization;
  if (!token) {
    const obj = {
      status: false,
      msg: "No token provided",
      _data: null
    }
    return response.send(obj)
  }
  try {
    var token = token.split(" ")[1];
    var decoded = jwt.verify(token, process.env.secret_key);
    var userdataid = decoded.userdata._id;
    var userdata = await user.findOne({ _id: userdataid, deleted_at: null });
    if (!userdata) {
      const obj = {
        status: false,
        msg: "User not found",
        _data: null
      }
      return response.send(obj)
    }
    const base_url='https://youtube-clone-backend-j5yz.onrender.com';
    let image_url=null
    if(userdata.image){
      let timestamp = userdata.updated_at.getTime()
      image_url = `${base_url}/uploads/users/${userdata.image}?v=${timestamp}`
    }
    const objectdata = {
      status: true,
      msg: "User profile fetched successfully",
      _data: userdata,
      imageurl: image_url
    }
    return response.send(objectdata)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Invalid token",
      _data: null
    }
    return response.send(obj)
  }
}

exports.updateprofile = async (request, response) => {
  if (!request || !request.body) {
    const obj = {
      status: false,
      msg: "No data provided",
      _data: null
    }
    return response.send(obj)
  }

  var token = request.headers.authorization;
  if (!token) {
    const obj = {
      status: false,
      msg: "No token provided",
      _data: null
    }
    return response.send(obj)
  }
  try {

    var token = token.split(" ")[1];
    var decoded = jwt.verify(token, process.env.secret_key);
    var userdataid = decoded.userdata._id;
    var userdata = await user.findOne({ _id: userdataid, deleted_at: null });
    if (!userdata) {
      const obj = {
        status: false,
        msg: "User not found",
        _data: null
      }
      return response.send(obj)
    }
    let updateData = request.body;
    if (request.file) {
      updateData.image = request.file.filename
    }

    let userupdatedata = await user.updateOne(
      {
        _id: userdataid
      },
      {
        $set: updateData
      }
    )
    const objectdata = {
      status: true,
      msg: "User profile updated successfully",
      _data: userupdatedata,
      token: token,
      image_path:'https://youtube-clone-backend-j5yz.onrender.com'
    }
    return response.send(objectdata)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Error updating profile",
      _data: error
    }
    return response.send(obj)
  }
}

exports.changepassword = async (request, response) => {
  let token = request.headers.authorization;
  if (!token) {
    return response.send({
      status: false,
      msg: "No Token Provided. So, Token is required",
      _data: [],
    });
  }
  try {
    token = token.split(" ")[1]; // Bearer <token> format in header is splitted to get only token part
    let decoded = jwt.verify(token, "123456");
    let userdataid = decoded.userdata._id;
    var userData = await user.findOne({ _id: userdataid, deleted_at: null });
    if (!userData) {
      return response.send({
        status: false,
        msg: "User not found",
        _data: [],
      });
    }

    var currentPassword = request.body.current_password;
    var newPassword = request.body.new_password;
    var confirmPassword = request.body.confirm_password;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return response.send({
        status: false,
        msg: "current_password, new_password and confirm_password are required",
        _data: [],
      });
    }

    let verifypassword = await bcrypt.compare(
      currentPassword,
      userData.password
    );
    if (!verifypassword) {
      return response.send({
        status: false,
        msg: "Invalid current password",
        _data: [],
      });
    }

    if (currentPassword == newPassword) {
      return response.send({
        status: false,
        msg: "New password and Current password cannot be same",
        _data: [],
      });
    }

    if (newPassword != confirmPassword) {
      return response.send({
        status: false,
        msg: "New password and Confirm password must be same",
        _data: [],
      });
    }
    var Changedpassword = await bcrypt.hash(newPassword, 10);
    var userupdatedata = await user.updateOne(
      {
        _id: userdataid,
      },
      {
        $set: { password: Changedpassword },
      }
    );
    const result = {
      _status: true,
      msg: "Password changed successfully",
      _data: userupdatedata,
    };
    response.send(result);
  } catch (error) {
    return response.send({
      status: false,
      msg: "Failed to authenticate token !",
      _data: [],
    });
  }
};


exports.forgotPassword = async (request, response) => {
  var email = request.body.email;
  var userData = await user.findOne({
    email: email,
    deleted_at: ""
  });
  if (!userData) {
    return response.send({
      status: false,
      msg: "Email does not exists",
      _data: [],
    });
  }

  var token = jwt.sign({ userdata: userData }, process.env.secret_key, { expiresIn: "1h" }); //token will expire in 1 hour
  // Implement your forgot password logic here (e.g., send reset link to email)

  return response.send({
    status: true,
    msg: "Forgot password process initiated. Please check your email.",
    _data: [],
    token: token
  });
};

exports.resetPassword = async (request, response) => {
  var token = request.headers.authorization;
  if (!token) {
    return response.send({
      status: false,
      msg: "No Token Provided. So, Token is required",
      _data: [],
    });
  }
  try {
    token = token.split(" ")[1]; // Bearer <token> format in header is splitted to get only token part
    let decoded = jwt.verify(token, process.env.secret_key);
    let userdataid = decoded.userdata._id;
    var userData = await userModel.findOne({ _id: userdataid, deleted_at: null });
    if (!userData) {
      return response.send({
        status: false,
        msg: "User not found",
        _data: [],
      });
    }
    var newPassword = request.body.new_password;
    var confirmPassword = request.body.confirm_password;
    if (!newPassword || !confirmPassword) {
      return response.send({
        status: false,
        msg: "new_password and confirm_password are required",
        _data: [],
      });
    }
    if (newPassword != confirmPassword) {
      return response.send({
        status: false,
        msg: "New password and Confirm password must be same",
        _data: [],
      });
    }
    var Changedpassword = await bcrypt.hash(newPassword, 10);
    var userupdatedata = await user.updateOne(
      {
        _id: userdataid,
      },
      {
        $set: { password: Changedpassword },
      }
    );
    const result = {
      _status: true,
      msg: "Password reset successfully",
      _data: userupdatedata,
    };
    response.send(result);
  } catch (error) {
    return response.send({
      status: false,
      msg: "Failed to authenticate token or Token may be expired!",
      _data: [],
    });
  }
};

exports.incrementpoints=async (request,response) => {
  try {
    const id=request.params.id || request.query.id
    if(!id){
      const obj={
        status:false,
        msg:"No any user id found..!",
        _data:null
      }
      return response.send(obj)
    }

    const userdata=await user.findByIdAndUpdate(
      {
        _id:id
      },{
        $inc:{increment_points:5}
      }
    )
    if(!userdata){
      const obj={
        status:false,
        msg:"No any user found..!",
        _data:null
      }
      response.send(obj)
    }
    const obj={
      status:true,
      msg:"Points Incremented by 5",
      _data:userdata
    }
    response.send(obj)
  } catch (error) {
    console.log(error)
  }
}


exports.subscribe=async (request,response) => {
  try {
    const id=request.params.id || request.query.id
    if(!id){
      const obj={
        status:false,
        msg:"No any user id found..!",
        _data:null
      }
      return response.send(obj)
    }

    const userdata=await user.findByIdAndUpdate(
      {
        _id:id
      },{
        $inc:{subscribers_count:1}
      }
    )
    if(!userdata){
      const obj={
        status:false,
        msg:"No any user found..!",
        _data:null
      }
      response.send(obj)
    }
    const obj={
      status:true,
      msg:"Channel is Subscribed..!",
      _data:userdata
    }
    response.send(obj)
  } catch (error) {
    console.log(error)
  }
}


exports.decrementsubscribe=async (request,response) => {
  try {
    const id=request.params.id || request.query.id
    if(!id){
      const obj={
        status:false,
        msg:"No any user id found..!",
        _data:null
      }
      return response.send(obj)
    }

    const userdata=await user.findByIdAndUpdate(
      {
        _id:id
      },{
        $inc:{subscribers_count:-1}
      }
    )
    if(!userdata){
      const obj={
        status:false,
        msg:"No any user found..!",
        _data:null
      }
      response.send(obj)
    }
    const obj={
      status:true,
      msg:"Someone is Unsubscribe Your Channel..!",
      _data:userdata
    }
    response.send(obj)
  } catch (error) {
    console.log(error)
  }
}

// Check if user has a free download left for today
exports.hasFreeDownloadToday = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      console.log('hasFreeDownloadToday: email is missing');
      return res.send({
        message: 'email is required.', 
        free: false, 
        isPremium: false 
      })
    }
    
    console.log('hasFreeDownloadToday: checking for email:', email);
    
    const user = await user.findOne({ email });
    if (!user) {
      console.log('hasFreeDownloadToday: user not found, creating new user');
      await user.save();
      return res.send({
        free: true, 
        isPremium: false,
        message: 'New user created with free download'
      })
    }
    
    console.log('hasFreeDownloadToday: found user, checking premium status');
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      console.log('hasFreeDownloadToday: premium expired, updating user');
      user.isPremium = false;
      user.premiumExpiry = null;
      await user.save();
    }
    
    // Premium users get unlimited downloads
    if (user.isPremium) {
      console.log('hasFreeDownloadToday: user is premium, allowing download');
      res.send({
        free: true, 
        isPremium: true,
        message: 'Premium user - unlimited downloads'
      })
    }
    console.log('hasFreeDownloadToday: user is not premium, checking daily downloads');
    // Free users get 1 download per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ensure downloads array exists
    if (!user.downloads) {
      user.downloads = [];
    }
    
    const downloadsToday = user.downloads.filter(d => {
      console.log(d)
      if (!d.date) return false;
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    });
    
    const hasFreeDownload = downloadsToday.length < 1;
    console.log('hasFreeDownloadToday: downloads today:', downloadsToday.length, 'hasFreeDownload:', hasFreeDownload);
    
    res.send({
      free: hasFreeDownload, 
      isPremium: false,
      downloadsToday: downloadsToday.length,
      message: hasFreeDownload ? 'Free download available' : 'No free downloads left today'
    })
    
  } catch (err) {
    console.error('hasFreeDownloadToday error:', err);
    res.send({ 
      message: 'Server error', 
      error: err.message, 
      free: false, 
      isPremium: false 
    });
  }
};


// Activate premium plan for a user
exports.activatePremium = async (req, res) => {
  try {
    const { email, duration = 30 } = req.body; // duration in days, default 30 days
    if (!email) return res.send({ message: 'email is required.' });
    
    const user = await user.findOne({ email });
    if (!user) return res.send({ message: 'user not found.' });
    
    // Set premium status and expiry date
    user.isPremium = true;
    user.premiumExpiry = new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // Add days to current date
    await user.save();
    
    res.send({ 
      message: 'Premium plan activated successfully', 
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry 
    });
  } catch (err) {
    res.send({ message: 'Server error', error: err.message });
  }
};

// Check premium status
exports.checkPremiumStatus = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.send({ message: 'email is required.' });
    
    const user = await user.findOne({ email });
    if (!user) return res.send({ message: 'user not found.' });
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      user.isPremium = false;
      user.premiumExpiry = null;
      await user.save();
    }
    
    res.send({ 
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry 
    });
  } catch (err) {
    res.send({ message: 'Server error', error: err.message });
  }
}; 