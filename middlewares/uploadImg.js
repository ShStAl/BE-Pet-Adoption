const cloudinary = require('../utils/cloudinary.js');


module.exports = async function uploadImg(req, res, next) {
  try {
    const file = req.file;

    if (file != undefined) {
      const result = await cloudinary.uploader.upload(file.path);
      req.body.imageURL = result.public_id //secure_url
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json('Image upload error!');
  }
};