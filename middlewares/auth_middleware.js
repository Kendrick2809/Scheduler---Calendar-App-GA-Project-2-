module.exports = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.user) {
      res.redirect("/users/login");
      return;
    }

    next();
  },

  setAuthUserVar: (req, res, next) => {
    res.locals.authUser = null;

    res.locals.someKey = "some value";

    if (req.session.user) {
      res.locals.authUser = req.session.user;
    }

    next();
  },
};
