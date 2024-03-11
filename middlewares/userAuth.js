const jwt = require('jsonwebtoken');
require('dotenv').config();

const KEY = process.env.KEY;

module.exports = function userAuth(req, res, next) {
  const token = req.cookies.token;
  console.log(token)
  if (!token) {
    return res.status(403).json({
      err: 'No access'
    });
  }

  try {
    const decoded = jwt.verify(token, KEY);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({
      err: 'No access'
    });
  }
};