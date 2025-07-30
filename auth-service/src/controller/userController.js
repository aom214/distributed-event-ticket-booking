const User = require("../models/user.schema");
const generateTokens = require("../utils/GenerateTokens");

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const newUser = await User.create({ name, email, phone, password });
    return res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    if (req.user) {
      return res.status(400).json({ message: "User already logged in" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePass(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    await User.updateOne({ _id: user._id }, { refreshToken });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

const logout = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "User not logged in" });
    }

    await User.findByIdAndUpdate(req.user.id, { $set: { refreshToken: undefined } });

    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "Strict" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error during logout" });
  }
};

module.exports = { register, login, logout };
