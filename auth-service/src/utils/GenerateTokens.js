const jwt = require("jsonwebtoken");

const generateTokens = async (user) => {
  const accessPayload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const refreshPayload = { id: user._id };

  const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;