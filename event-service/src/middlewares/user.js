const jwt = require("jsonwebtoken");

const verify_user = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = {
          id: decoded._id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };
      } catch (err) {
        console.warn("Invalid token, user not authenticated.");
        // Do NOT throw error, just continue as unauthenticated
      }
    }

    return next(); // Always call next
  } catch (err) {
    console.error("Error in verify_user:", err);
    return next(); // Continue as unauthenticated
  }
};

module.exports = verify_user;
