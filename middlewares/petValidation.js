const validator = require('validator');

module.exports = function petValidation(req, res, next) {

  const { type, name, status, height, weight, hypoallergenic } = req.body;

  if (!validator.isAlpha(type)) {
    return res.status(400).json('Invalid type format');
  }

  if (!validator.isIn(status, ["Adopted", "Fostered", "Available"])) {
    return res.status(400).json('Invalid status');
  }

  if (!validator.isAlphanumeric(name)) {
    return res.status(400).json("Invalid name format");
  }

  if (height && !validator.isInt(height)) {
    return res.status(400).json("Invalid height format");
  }

  if (weight && !validator.isInt(weight)) {
    return res.status(400).json("Invalid weight format");
  }

  if (hypoallergenic && !validator.isBoolean(hypoallergenic)) {
    return res.status(400).json("Invalid hypoallergenic format");
  }

  next();

};
