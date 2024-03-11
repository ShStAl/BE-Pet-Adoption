const jwt = require('jsonwebtoken');
require('dotenv').config();

const KEY = process.env.KEY;

module.exports = async function userAuthAdmin(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({
      err: 'No access'
    });
  }

  try {
    const decoded = jwt.verify(token, KEY);
    req.userId = decoded.id;

    if (decoded.role != 'Admin') {
      return res.status(403).json({ err: 'No access' });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      err: 'No access'
    });
  }
};