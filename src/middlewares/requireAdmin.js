const requireAdmin = (req, res, next) => {
  if (req.user?.isAdmin) {
    return next();
  }

  return next({
    statusCode: 403,
    message: "Admin privileges required.",
  });
};

module.exports = requireAdmin;
