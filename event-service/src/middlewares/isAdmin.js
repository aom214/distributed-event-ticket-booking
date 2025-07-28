const isAdmin = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(403).json({ message: "unauthorized" });
  }

  if (user.role !== "Admin") {
    return res.status(403).json({ message: "unauthorized" });
  }

  return next(); // Proceed if Admin
};

module.exports = isAdmin;