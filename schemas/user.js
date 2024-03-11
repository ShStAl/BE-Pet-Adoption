const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    bio: String,
    role: { type: String, enum: ['Admin', 'Basic'], default: "Basic", required: true },
    savedPets: { type: [mongoose.SchemaTypes.ObjectId], ref: "Pet", default: [], required: true },
    adoptedPets: { type: [mongoose.SchemaTypes.ObjectId], ref: "Pet", default: [], required: true },
    fosteredPets: { type: [mongoose.SchemaTypes.ObjectId], ref: "Pet", default: [], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);