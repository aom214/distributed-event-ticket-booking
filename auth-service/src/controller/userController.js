const user = require('../models/user.schema.js')
const jwt = require('jsonwebtoken')
const GenerateTokens = require('../utils/GenerateTokens.js')

const register = async (req,res)=>{
    try {
      const {name,email,phone,password} = req.body;
      if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
  
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await user.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const newUser = await user.create({
          name,email,phone,password
      })
      if(!newUser){
          return res.status(500).json({message:"server error"})
      }
      res.status(201).json({ message: "User registered successfully", userId: newUser._id });
    } catch (error) {
      console.log("error:- ",error)
      return res.status(500).json({message:"server error"})
    }

}


const Login = async(req,res)=>{
  try {
    const {email,password} = req.body
    if(!email || !password){
      return res.status(400).json({message:"password is required"})
    }
  
    const get_user = await user.findOne({email})
  
    if(!get_user){
      return res.status(400).json({message:"email is incorrect"})
    }
  
    const is_pass_correct = await get_user.comparePass(password,get_user);
  
    if(!is_pass_correct){
      return res.status(400).json({message:"password is incorrect"})
    }

    const {accessToken,refreshToken} = await GenerateTokens(get_user)
    console.log(accessToken,refreshToken)
    await user.updateOne({_id:get_user._id},{refreshToken:refreshToken})
    res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true, 
    sameSite: 'Strict',
    maxAge: 1000 * 60 * 15 
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });

  return res.status(200).json({ message: "completed" }); 


  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"server error"})
  }
}


const logout = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "User is not logged in" });
    }
  
    // Clear the refresh token in the database
    await user.findByIdAndUpdate(req.user.id, {
      $set: { refreshToken: undefined }
    });
  
    // Clear cookies on client
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });
  
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error:- ", error)
    return res.status(500).json({message:"server error"})
  }
};

module.exports = {register,Login,logout}