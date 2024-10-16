const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Brand Schema
const brandSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true, 
  },
  followers: {
    type: Number,
    default: 0, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Brand model
const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
