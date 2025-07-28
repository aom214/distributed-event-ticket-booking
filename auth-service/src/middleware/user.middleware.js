const jwt = require("jsonwebtoken");
const User = require('../models/user.schema.js');
const GenerateTokens = require('../utils/GenerateTokens.js');

const verify_user = async (req, res, next) => {
  try {

    console.log(req.cookies)

    
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // ✅ Step 1: If access token exists, try to verify it
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = {
          id: decoded._id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        };
        return next(); // ✅ exit middleware here
      } catch (err) {
        // access token invalid — fallback to refresh token
      }
    }

    // ✅ Step 2: If refresh token exists, verify and issue new tokens
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const get_user = await User.findById(decoded._id);
      if (!get_user || get_user.refreshToken !== refreshToken) {
        return next(); // token doesn't match — treat as not logged in
      }

      const { new_accessToken, new_refreshToken } = await GenerateTokens(get_user);
      get_user.refreshToken = new_refreshToken;
      await get_user.save();

      res.cookie('accessToken', new_accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 15 // 15 min
      });

      res.cookie('refreshToken', new_refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });

      req.user = {
        id: get_user._id,
        email: get_user.email,
        name: get_user.name,
        role: get_user.role
      };

      return next(); // ✅ exit here after success
    }

    // ✅ No tokens or invalid — treat as guest
    return next();
  } catch (err) {
    console.error("Error in verify_user:", err);
    return next(); // Continue as unauthenticated
  }
};

module.exports = verify_user;
