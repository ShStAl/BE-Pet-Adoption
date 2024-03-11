const express = require('express');
const router = express.Router();

const {
  addPet,
  getPetInfoById,
  getAllPets,
  updatePet
} = require('../controllers/petController.js');

const userAuthAdmin = require('../middlewares/userAuthAdmin.js');
const petValidation = require('../middlewares/petValidation.js');
const uploadImg = require('../middlewares/uploadImg.js');
const upload = require('../middlewares/multer.js');


router.post('/add_pet', upload.single('image'), userAuthAdmin, petValidation, uploadImg, addPet);

router.get('/pets/:id', getPetInfoById);

router.get('/pets', getAllPets);

router.put('/pets/:id', upload.single('image'), userAuthAdmin, petValidation, uploadImg, updatePet)

module.exports = router;