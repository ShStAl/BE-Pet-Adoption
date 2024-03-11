const Pet = require('../schemas/pets.js');

const addPet = async (req, res) => {
  const { type, name, status, imageURL, height, weight, color, bio, hypoallergenic, dietaryRestrictions, breed } = req.body;

  try {
    const existingPet = await Pet.findOne({ name: name });
    if (existingPet && (existingPet.type == type) && (existingPet.breed == breed)) {
      return res.status(409).json('Pet already exists');
    }

    const doc = new Pet({
      type: type,
      name: name,
      status: status,
      image: imageURL,
      height: height,
      weight: weight,
      color: color,
      bio: bio,
      hypoallergenic: hypoallergenic,
      dietaryRestrictions: dietaryRestrictions,
      breed: breed,
    });

    const pet = await doc.save();

    res.json({
      message: 'New pet added!',
      data: pet
    });

  } catch (err) {
    console.log(err)
    res.status(500).json('Failed to add pet');
  }
};

const getPetInfoById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ err: 'Pet not found' });
    }

    res.json({
      pet,
      savedByUser: req.savedByUser,
      adoptedByUser: req.adoptedByUser,
      fosteredByUser: req.fosteredByUser,
    });

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'Failed to load pet info'
    });
  }
};

const getAllPets = async (req, res) => {

  const { type, status, name, height, weight, offset, limit } = req.query

  try {
    const max = limit ?? 99999;
    const query = {};
    if (type) { query.type = type }
    if (status) { query.status = status }
    if (name) {
      query.name = new RegExp('^' + name, 'i');
    }
    if (height) { query.height = { $gte: height } }
    if (weight) { query.weight = { $gte: weight } }

    const pets = await Pet.find(query).sort({ createdAt: -1 }).limit(max).skip(offset);

    if (!pets) {
      return res.status(404).json({ err: 'Failed to load pets list' });
    }

    res.json(pets);

  } catch (err) {

    console.log(err)

    res.status(403).json({
      message: 'No access'
    });
  }
};

const updatePet = async (req, res) => {
  const { type, name, status, imageURL, height, weight, color, bio, hypoallergenic, dietaryRestrictions, breed } = req.body;

  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(400).json('Update failed');
    }

    pet.type = type;
    pet.name = name;
    pet.status = status;
    pet.image = imageURL;
    pet.height = height;
    pet.weight = weight;
    pet.color = color;
    pet.bio = bio;
    pet.hypoallergenic = hypoallergenic;
    pet.dietaryRestrictions = dietaryRestrictions;
    pet.breed = breed;

    await pet.save();

    res
      .json({
        message: 'Pet updated',
      });

  } catch (err) {
    console.log(err)
    res.status(500).json('Update failed');
  }

};

module.exports = {
  addPet,
  getPetInfoById,
  getAllPets,
  updatePet
};