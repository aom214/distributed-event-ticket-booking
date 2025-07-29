const User = require('../models/user.schema.js');
const jwt = require('jsonwebtoken');
const generateTokens = require('../utils/GenerateTokens.js');

// Register Controller
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Input validation
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

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Create new user
    const newUser = await User.create({ name, email, phone, password });

    if (!newUser) {
      return res.status(500).json({ message: "Internal server error while creating user" });
    }

    return res.status(201).json({ message: "User registered successfully", userId: newUser._id });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    if (req.user) {
      return res.status(400).json({ message: "User is already logged in" });
    }
    const { email, password } = req.body;


    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or user does not exist" });
    }

    const isPasswordCorrect = await existingUser.comparePass(password, existingUser);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(existingUser);

    // Save refresh token
    await User.updateOne({ _id: existingUser._id }, { refreshToken });

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Logout Controller
const logout = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "User is not logged in" });
    }

    // Invalidate refresh token in DB
    await User.findByIdAndUpdate(req.user.id, { $set: { refreshToken: undefined } });

    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
};

module.exports = {
  register,
  login,
  logout,
};
