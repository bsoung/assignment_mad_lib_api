const SECRET = process.env['secret'] || 'puppies';
const md5 = require('md5');
const User = require('../models');

const loggedInOnly = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

const loggedOutOnly = (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    res.redirect('/');
  }
};

const onLogout = (req, res, next) => {
  req.logout();

  // Ensure always redirecting as GET
  req.method = 'GET';
  res.redirect('/login');
};

const generateSignature = username => md5(username + SECRET);

const createSignedSessionId = username => {
  return `${username}:${generateSignature(username)}`;
};

const loginMiddleware = (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return next();

  //const username = sessionId;
  const [username, signature] = sessionId.split(':');
  User.findOne({ username: username }, (err, user) => {
    if (signature === generateSignature(username)) {
      req.user = user;
      res.locals.CurrentUser = user;
      next();
    } else {
      res.send("You've tampered with your cookie!");
    }
  });
};

module.exports = {
  createSignedSessionId,
  loginMiddleware,
  loggedInOnly,
  loggedOutOnly,
  onLogout
};
