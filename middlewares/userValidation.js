const validator = require('validator');

module.exports = function userValidation(req, res, next) {

  const { email, password, passwordConfirm, firstName, lastName, phone } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json('Invalid email format');
  }

  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json('Password must be at least 6 characters long');
  }

  if (password !== passwordConfirm) {
    return res.status(400).json("Passwords don't match");
  }

  if (!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
    return res.status(400).json("Invalid name or surname");
  }

  if (!validator.isMobilePhone(phone)) {
    return res.status(400).json('Invalid phone number');
  }

  next();

};
