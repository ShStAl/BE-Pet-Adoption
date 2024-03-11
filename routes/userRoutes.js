const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  getUserInfo,
  getUserInfoById,
  logout,
  updateUser,
  savePet,
  ownPet,
  unsavePet,
  returnPet,
  getAllUsers,
  getUsersPets,
  updateUserRole
} = require('../controllers/userController.js');

const userAuth = require('../middlewares/userAuth.js');
const userAuthAdmin = require('../middlewares/userAuthAdmin.js');
const userUpdateValidation = require('../middlewares/userUpdateValidation.js');
const userValidation = require('../middlewares/userValidation.js');

router.post('/signup', userValidation, signup);

router.post('/login', login);

router.get('/user', userAuth, getUserInfo);

router.get('/logout', userAuth, logout);

router.put('/update_user', userAuth, userUpdateValidation, updateUser);

router.put('/update_role', userAuthAdmin, updateUserRole);

router.get('/users/:id', userAuthAdmin, getUserInfoById);

router.get('/users', userAuthAdmin, getAllUsers);

router.put('/pets/:id/save', userAuth, savePet);

router.put('/pets/:id/:status', userAuth, ownPet);

router.delete('/pets/:id/unsave', userAuth, unsavePet);

router.delete('/pets/:id/return', userAuth, returnPet);

router.get('/pets/user', userAuth, getUsersPets);

module.exports = router;