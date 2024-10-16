const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product Schema
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sub_category: {
    type: String,
    required: true,
  },
  image: [
    {
      img: {
        type: String,
        required: true, // Ensure that each image has a valid URL
      }
    }
  ], 
  rating: {
    rate: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  stock: {
    type: Number,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  totalbuys: {
    type: Number,
    default: 0,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
