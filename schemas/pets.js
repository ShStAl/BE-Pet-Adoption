const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Adopted", "Fostered", "Available"],
      required: true,
      default: "Available"
    },
    image: {
      type: String,
      required: true
    },
    height: Number,
    weight: Number,
    color: String,
    bio: String,
    hypoallergenic: Boolean,
    dietaryRestrictions: String,
    breed: String,
    owner: mongoose.SchemaTypes.ObjectId,
    savedBy: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "User",
      required: true,
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);





