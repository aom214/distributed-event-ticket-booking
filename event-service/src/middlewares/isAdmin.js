const isAdmin = (req, res, next) => {
  const user = req.user;

  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  return next();
};

module.exports = isAdmin;

