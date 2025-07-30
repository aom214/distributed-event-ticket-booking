const jwt = require("jsonwebtoken");
const User = require("../models/user.schema");
const generateTokens = require("../utils/GenerateTokens");

const verifyUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };
        return next();
      } catch (err) {
        // Access token invalid, proceed to refresh token check
      }
    }

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return next();
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);
      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 1000 * 60 * 15,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return next();
    }

    return next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return next();
  }
};

module.exports = verifyUser;