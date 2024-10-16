const Product = require('../models/Product.js');
const Brand = require("../models/Brand.js")

exports.AllProductNameSuggesttion = async (req, res) => {
  try {
    let { category } = req.body;
    category = category?.toLowerCase(); // Apply toLowerCase() to the category


    // Build the query to filter products by category
    let query = {};
    if (category && category !== 'all categories') {
      query.category = category; // Adjust the field name if necessary
    }


    // Fetch products based on the category
    const products = await Product.find(query, '_id title');

    // Map the products to return their IDs and names
    const productData = products.map(product => ({
      id: product._id,
      name: product.title
    }));

    res.status(200).json(productData);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.DetailedProductByID = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if productId contains multiple IDs separated by commas
    const productIds = productId.includes(',') ? productId.split(',') : [productId];

    // Fetch products matching the IDs
    const products = await Product.find({ _id: { $in: productIds } });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Products not found' });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.AllProducts = async (req, res) => {
  try {

    const product = await Product.find({});
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.FindBrandByName = async (req, res) => {
  try {
    const brand = await Brand.findOne({ name: req.params.name });
    if (!brand) {
        return res.status(404).send('Brand not found');
    }
    res.send(brand);
} catch (err) {
    res.status(500).send('Server error');
}
};



exports.OM = async (req, res) => {
  try {
    const products = await Product.findById('66f3bfefda49e664647db7ac');

    // Check if any products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }


    // Send all categories in one response
    res.status(200).json(products);

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
