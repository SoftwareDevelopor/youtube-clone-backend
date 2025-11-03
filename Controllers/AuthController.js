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
  const newUser = new user({
    name: request.body.name,
    email: request.body.email,
    password: hashedPassword,
  })

  console.log(request.file)

  if (request.file) {
    newUser.image = request.file.path.replace('/opt/render/project/src','')
  }

  
  try {
    const insertdata = await user(newUser)
    const result = await insertdata.save()
    var token = jwt.sign({ userdata: result }, process.env.secret_key)
    
    const objectdata = {
      status: true,
      msg: "User registered successfully",
      _data: result,
      image_url: `https://youtube-clone-backend-j5yz.onrender.com${result.image}`,
      token: token
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

  if (existingUser.statu == false) {
    const obj = {
      status: false,
      msg: "Your account has been deactivated. Please contact support.",
      _data: null
    }
    return response.send(obj)
  }

  var token = jwt.sign({ userdata: existingUser }, process.env.secret_key)

  const objectdata = {
    status: true,
    msg: "User logged in successfully",
    _data: existingUser,
    token: token
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
    const objectdata = {
      status: true,
      msg: "User profile fetched successfully",
      _data: userdata
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

// // Register new user
// exports.register = async (req, res) => {
//     try {
//         const { name, email, password, phonenumber, logo } = req.body;

//         // Validate required fields
//         if (!name || !email || !password || !phonenumber) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'All fields are required'
//             });
//         }

//         // Check if user already exists
//         const existingUser = await Userdata.findOne({
//             $or: [{ email }, { phonenumber }]
//         });

//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User with this email or phone number already exists'
//             });
//         }

//         // Hash password
//         const saltRounds = 12;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         // Create new user
//         const newUser = new Userdata({
//             name,
//             email,
//             password: hashedPassword,
//             phonenumber,
//             logo: logo || 'default-avatar.png'
//         });

//         await newUser.save();

//         // Create corresponding User record for points/premium features
//         const userRecord = new User({
//             username: name,
//             email,
//             points: 0,
//             isPremium: false
//         });

//         await userRecord.save();

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: newUser._id, email: newUser.email },
//             JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         res.status(201).json({
//             success: true,
//             message: 'User registered successfully',
//             data: {
//                 user: {
//                     id: newUser._id,
//                     name: newUser.name,
//                     email: newUser.email,
//                     phonenumber: newUser.phonenumber,
//                     logo: newUser.logo
//                 },
//                 token
//             }
//         });

//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Login user
// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate required fields
//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Email and password are required'
//             });
//         }

//         // Find user by email
//         const user = await Userdata.findOne({ email });

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid email or password'
//             });
//         }

//         // Check password
//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid email or password'
//             });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: user._id, email: user.email },
//             JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         res.status(200).json({
//             success: true,
//             message: 'Login successful',
//             data: {
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     phonenumber: user.phonenumber,
//                     logo: user.logo
//                 },
//                 token
//             }
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Get user profile
// exports.getProfile = async (req, res) => {
//     try {
//         const userId = req.user.userId;

//         const user = await Userdata.findById(userId).select('-password');
//         const userStats = await User.findOne({ email: user.email });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: {
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     phonenumber: user.phonenumber,
//                     logo: user.logo
//                 },
//                 stats: {
//                     points: userStats?.points || 0,
//                     isPremium: userStats?.isPremium || false,
//                     premiumExpiry: userStats?.premiumExpiry || null
//                 }
//             }
//         });

//     } catch (error) {
//         console.error('Get profile error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Update user profile
// exports.updateProfile = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const { name, phonenumber, logo } = req.body;

//         const updateData = {};
//         if (name) updateData.name = name;
//         if (phonenumber) updateData.phonenumber = phonenumber;
//         if (logo) updateData.logo = logo;

//         const updatedUser = await Userdata.findByIdAndUpdate(
//             userId,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password');

//         if (!updatedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Profile updated successfully',
//             data: {
//                 user: {
//                     id: updatedUser._id,
//                     name: updatedUser.name,
//                     email: updatedUser.email,
//                     phonenumber: updatedUser.phonenumber,
//                     logo: updatedUser.logo
//                 }
//             }
//         });

//     } catch (error) {
//         console.error('Update profile error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Change password
// exports.changePassword = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const { currentPassword, newPassword } = req.body;

//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Current password and new password are required'
//             });
//         }

//         const user = await Userdata.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         // Verify current password
//         const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

//         if (!isCurrentPasswordValid) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Current password is incorrect'
//             });
//         }

//         // Hash new password
//         const saltRounds = 12;
//         const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

//         // Update password
//         user.password = hashedNewPassword;
//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: 'Password changed successfully'
//         });

//     } catch (error) {
//         console.error('Change password error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Logout (client-side token removal)
// exports.logout = async (req, res) => {
//     try {
//         // In a stateless JWT system, logout is handled client-side
//         // You can implement token blacklisting here if needed
//         res.status(200).json({
//             success: true,
//             message: 'Logged out successfully'
//         });
//     } catch (error) {
//         console.error('Logout error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// // Middleware to verify JWT token
// exports.verifyToken = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Access token is required'
//             });
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid token'
//             });
//         }
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Token expired'
//             });
//         }
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// }; 