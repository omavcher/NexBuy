const Product = require('../models/Product'); 
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const cloudinary = require('../cloudinary'); // Import Cloudinary

exports.createProduct = async (req, res) => {
  try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
          return res.status(401).json({ message: 'No token provided, authorization denied' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      console.log(req.body); // Logging the incoming request body for debugging

      // Validate required fields
      const { title, description, category, sub_category, stock, price, images } = req.body;
      if (!title || !description || !category || !sub_category || stock == null || price == null || !images) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      // Convert stock and price to numbers
      const parsedStock = Number(stock);
      const parsedPrice = Number(price);

      // Check if the conversions are valid
      if (isNaN(parsedStock) || isNaN(parsedPrice)) {
          return res.status(400).json({ message: 'Stock and price must be valid numbers' });
      }

      // Ensure images is always an array
      const formattedImages = Array.isArray(images) ? images.map(img => ({ img })) : [{ img: images }];

      const newProduct = new Product({
          title,
          description,
          category,
          sub_category,
          price: parsedPrice,
          stock: parsedStock,
          brand: 'om',
          rating: {
              rate: 0,
              count: 0,
          },
          image: formattedImages, // Store formatted array of image objects
          createdBy: user._id,
      });

      // Save the product to the database
      const savedProduct = await newProduct.save();

      // Add the product ID to the listed_product array of the user's business account
      if (user.business_account) {
          user.business_account.listed_product.push({ product_id: savedProduct._id }); // Add product_id
          await user.save(); // Save the updated user document
      }

      res.status(201).json({ message: 'Product created successfully', product: savedProduct });
  } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};






exports.ProductDetail = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const user = await User.findById(userId).select('listed_product');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
     
      res.status(200).json({ message: 'Added to favorites successfully' });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };



  exports.editListedProduct = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const user = await User.findById(userId).select('listed_product');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const productId = req.params.selectedProduct;
        const productData = req.body; 

        const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteListedProduct = async (req, res) => {
    try {
      // Extract the token from the headers and decode it
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      const user = await User.findById(userId).select('business_account');
      if (!user || !user.business_account) {
        return res.status(404).json({ message: 'User or business account not found' });
      }
  
      const productId = req.params.selectedProduct;
  
      const deletedProduct = await Product.findByIdAndDelete(productId);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      user.business_account.listed_product = user.business_account.listed_product.filter(
        (product) => product.product_id.toString() !== productId
      );
  
      await user.save();
  
      res.status(200).json({ message: 'Product deleted and removed from user listed products successfully' });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  

  exports.updateBrandInfo = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId).select('business_account');
        if (!user || !user.business_account) {
            return res.status(404).json({ message: 'User or business account not found' });
        }

        // Update brand info with data from the request
        const updatedBrandData = req.body;
        user.business_account = {
            ...user.business_account,
            ...updatedBrandData.business_account, // Merge with existing account data
        };

        await user.save(); // Save updated user data

        return res.status(200).json({ message: 'Brand updated successfully', user });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};




exports.OrderInfoForBrand = async (req, res) => {
  try {
    const brand_name = req.params.brand; 
    console.log(brand_name) 
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).select('business_account orders');
    if (!user || !user.business_account) {
      return res.status(404).json({ message: 'User or business account not found' });
    }

    const user_orders = user.orders;

    const allProductIds = user_orders.flatMap(order => order.order_products.map(product => product.product_id));

    const productsByBrand = await Product.find({
      _id: { $in: allProductIds },  
      brand: brand_name                
    });

    const matchingProductIds = new Set(productsByBrand.map(product => product._id.toString()));

    const matchingOrders = user_orders.filter(order => 
      order.order_products.some(product => matchingProductIds.has(product.product_id.toString()))
    );

    return res.status(200).json({ matchingOrders });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.OrderInfoByIds = async (req, res) => {
  try {
      const orderId = req.body.orderId; 
      const token = req.headers.authorization?.split(' ')[1];   
      if (!token) {
          return res.status(401).json({ message: 'No token provided, authorization denied' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const user = await User.findById(userId).select('orders');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      const order = user.orders.find(order => order._id.toString() === orderId);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
  } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.ChangeOrderStatus = async (req, res) => {
  try {
    const { productId, newStatus, orderedId } = req.body; // Destructure from request body

    // Extract and verify the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user by ID and get their orders
    const user = await User.findById(userId).select('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the specific order by orderId
    const order = user.orders.find(order => order._id.toString() === orderedId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the specific product within the order and update its status
    const product = order.order_products.find(p => p.product_id.toString() === productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found in the order' });
    }

    // Update the product's status
    product.status = newStatus;

    // Save the user document with the updated order status
    await user.save();

    // Respond with a success message
    res.status(200).json({ message: 'Order status updated successfully', updatedOrder: order });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.GetBrandName = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Adjust to your JWT secret or use config

    // Find user by ID (assuming the token contains user ID)
    const user = await User.findById(decoded.id).select('business_account'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
 const brand_name = user.business_account;

    res.status(200).json(brand_name.business_name);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};