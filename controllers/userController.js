const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../schemas/user.js');
const Pet = require('../schemas/pets.js');
require('dotenv').config();


const KEY = process.env.KEY;
const saltRounds = 10;

const signup = async (req, res) => {

  const { email, password, firstName, lastName, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const doc = new User({
      email: email,
      password: passwordHash,
      firstName: firstName,
      lastName: lastName,
      phone: phone
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      }, KEY
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        message: 'New user signed up!',
        role: user.role,
        id: user._id,
      });

  } catch (err) {
    console.log(err)
    res.status(500).json('Registration failed');
  }
};

const login = async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json('Invalid email or password');
    }

    const isPassValid = await bcrypt.compare(password, user.password);

    if (!isPassValid) {
      return res.status(400).json('Invalid email or password');
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      }, KEY
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        message: 'User logged in',
        role: user.role,
        id: user._id,
      });

  } catch (err) {
    console.log(err)
    res.status(404).json({
      message: 'Authentication failed'
    });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found' });
    }

    res.json(user);

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'No access'
    });
  }
};

const getUserInfoById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('adoptedPets', 'type name').populate('fosteredPets', 'type name');

    if (!user) {
      return res.status(404).json({ err: 'User not found' });
    }

    res.json(user);

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'No access'
    });
  }
};

const getAllUsers = async (req, res) => {

  try {

    const users = await User.find().select('firstName lastName role')

    if (!users) {
      return res.status(404).json({ err: 'Failed to load users list' });
    }

    res.json(users);

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'No access'
    });
  }
};

const logout = async (req, res) => {
  return res
    .clearCookie("token")
    .status(200).json({ message: 'User logged out' });
};

const updateUser = async (req, res) => {
  const { email, password, firstName, lastName, phone, bio } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json('Update failed');
    }

    if (user.email != email) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(409).json('This email already exists');
      }
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, saltRounds);

      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phone;
      user.password = passwordHash
      user.email = email;
      user.bio = bio;

      await user.save();

    } else {

      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phone;
      user.email = email;
      user.bio = bio;

      await user.save();

    }

    res
      .json({
        message: 'User updated',
      });

  } catch (err) {
    console.log(err)
    res.status(500).json('Update failed');
  }

};

const savePet = async (req, res) => {
  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found' });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ err: 'Pet not found' });
    }

    if (pet.savedBy.indexOf(req.userId) >= 0) {
      return res.status(400).json({ err: 'Pet already saved' });
    }

    if (user.savedPets.indexOf(req.body.petId) >= 0) {
      return res.status(400).json({ err: 'Pet already saved' });
    }

    pet.savedBy.push(req.userId);
    await pet.save();

    user.savedPets.push(req.params.id);
    await user.save();

    res.json({
      message: 'Pet saved',
      user: user,
      pet: pet
    });

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'Saving failed'
    });
  }
};

const ownPet = async (req, res) => {

  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found' });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ err: 'Pet not found' });
    }

    if (pet.status != 'Available') {

      if (pet.status == 'Adopted') {
        if (pet.owner == req.userId) {
          return res.status(400).json({ err: 'You already adopted this pet' });
        }
        return res.status(400).json({ err: 'Pet is adopted by another user' });
      }

      if (pet.owner != req.userId) {
        return res.status(400).json({ err: 'Pet is fostered by another user' });
      }

      if (req.params.status == 'Fostered') {
        return res.status(400).json({ err: 'You already fostered this pet' });
      }

      user.fosteredPets.splice(user.fosteredPets.indexOf(req.params.id), 1);

    }

    pet.owner = req.userId;
    pet.status = req.params.status;
    await pet.save();

    if (req.params.status == 'Adopted') {
      user.adoptedPets.push(req.params.id);
    } else {
      user.fosteredPets.push(req.params.id);
    }

    await user.save();

    res.json({
      message: `You ${pet.status == 'Adopted' ? 'adopted' : 'fostered'} a pet!`,
      user: user,
      pet: pet
    });

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'Adoption / Fostering failed'
    });
  }
};

const unsavePet = async (req, res) => {
  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found' });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ err: 'Pet not found' });
    }

    if (pet.savedBy.indexOf(req.userId) < 0) {
      return res.status(400).json({ err: 'Pet not saved yet' });
    }

    if (user.savedPets.indexOf(req.params.id) < 0) {
      return res.status(400).json({ err: 'Pet not saved yet' });
    }

    pet.savedBy.splice(pet.savedBy.indexOf(req.userId), 1);
    await pet.save();

    user.savedPets.splice(user.savedPets.indexOf(req.params.id), 1);
    await user.save();

    res.json({
      message: 'Pet unsaved',
      user: user,
      pet: pet
    });

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'Unsaving failed'
    });
  }
};

const returnPet = async (req, res) => {
  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found' });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ err: 'Pet not found' });
    }

    if (pet.owner != req.userId) {
      return res.status(400).json({ err: "User is not an owner" });
    }

    if (user.adoptedPets.indexOf(req.params.id) < 0 && user.fosteredPets.indexOf(req.params.id) < 0) {
      return res.status(400).json({ err: 'User is not an owner' });
    }

    if (pet.status == 'Adopted') {
      user.adoptedPets.splice(user.adoptedPets.indexOf(req.params.id), 1);
    } else {
      user.fosteredPets.splice(user.fosteredPets.indexOf(req.params.id), 1);
    }
    await user.save();

    pet.status = 'Available';
    pet.owner = undefined;
    await pet.save();

    res.json({
      message: 'Pet returned',
      user: user,
      pet: pet
    });

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'Returning failed'
    });
  }
};

const getUsersPets = async (req, res) => {

  try {

    if (req.query.show == 'myPets') {

      const usersPets = await User.findById(req.userId).populate('fosteredPets').populate('adoptedPets').select('fosteredPets adoptedPets')

      if (!usersPets) {
        return res.status(404).json({ err: 'Failed to load pets list' });
      }

      res.json(usersPets);

    } else {

      const usersPets = await User.findById(req.userId).populate('savedPets').select('savedPets')

      if (!usersPets) {
        return res.status(404).json({ err: 'Failed to load pets list' });
      }

      res.json(usersPets);

    }


  } catch (err) {

    console.log(err)

    res.status(403).json({
      err: 'No access'
    });
  }
};

const updateUserRole = async (req, res) => {
  const { role, id } = req.body;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json('Update failed');
    }
    user.role = role
    await user.save();

    res
      .json({
        message: 'User updated',
      });

  } catch (err) {
    console.log(err)
    res.status(500).json('Update failed');
  }

};


module.exports = {
  signup,
  login,
  getUserInfo,
  getUserInfoById,
  getAllUsers,
  logout,
  updateUser,
  savePet,
  ownPet,
  unsavePet,
  returnPet,
  getUsersPets,
  updateUserRole,
};