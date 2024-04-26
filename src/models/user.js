const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: String,
  email: { type: String, required: true },
  phone: String,
  address: String,
  zipcode: String,
  city: String,
  dateOfBirth: Date,
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);




