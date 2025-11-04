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
