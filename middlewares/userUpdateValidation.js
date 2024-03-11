const validator = require('validator');

module.exports = function userUpdateValidation(req, res, next) {

  const { email, password, firstName, lastName, phone } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json('Invalid email format');
  }

  if (password && !validator.isLength(password, { min: 6 })) {
    return res.status(400).json('Password must be at least 6 characters long');
  }

  if (!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
    return res.status(400).json("Name and surname can't be numeric");
  }

  if (!validator.isMobilePhone(phone)) {
    return res.status(400).json('Invalid phone number');
  }

  next();

};
