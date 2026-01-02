function requireAuth(req, res, next) {
  if (req.session?.userId) return next();
  return res.redirect("/");
}

function redirectIfAuthed(req, res, next) {
  if (req.session?.userIDd) return res.redirect("/");
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.userId) return res.redirect("/");
    if (req.session?.role !== role) return res.status(403).send("Forbidden");
    next();
  };
}

module.exports = { requireAuth, redirectIfAuthed, requireRole };
