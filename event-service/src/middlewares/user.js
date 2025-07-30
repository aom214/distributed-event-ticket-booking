const jwt = require('jsonwebtoken');

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
        console.warn('Invalid token');
      }
    }

    return next();
  } catch (err) {
    console.error('Error in verifyUser:', err);
    return next();
  }
};

module.exports = verifyUser;
