const jwt = require("jsonwebtoken");

/**
 * Middleware to verify user from accessToken in cookies.
 */
const verifyUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };
      } catch (err) {
        console.warn("Invalid token. Proceeding unauthenticated.");
      }
    }

    return next(); // Proceed whether authenticated or not
  } catch (err) {
    console.error("Error in verifyUser middleware:", err);
    return next();
  }
};

module.exports = verifyUser;
