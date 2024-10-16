const User = require('../models/User'); 
const Review = require('../models/Review'); 
const Product = require('../models/Product'); 
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 
const Feedback = require('../models/Feedback');

const Brand = require('../models/Brand');


const bcrypt = require('bcryptjs');

exports.SignUp = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number.' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      mobile
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('SignUp Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.LogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        _id: user._id  // Ensure _id is included here
      },
      token
    });
  } catch (err) {
    console.error('LogIn Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};






  
exports.ReviewGetByID = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch all reviews
    const reviews = await Review.find({});

    let match_review = null;

    // Loop through reviews to find the one with the matching ID
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i]._id.equals(id)) {  // Use the 'equals' method to compare ObjectIds
        match_review = reviews[i];
        break;
      }
    }

    // If no review is found
    if (!match_review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Return the matched review
    res.json(match_review);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};






  

exports.ReviewSubmit = async (req, res) => {
    try {
        const { rating, text, product } = req.body;
        const user = '66c9afb25bbf6c85d43d135a'; // Replace this with the actual user ID

        // Check for missing fields
        if (!rating || !text || !product) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create the review
        const review = new Review({
            rating,
            comment: text,
            userId: user,
            productId: product,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Save the review
        const savedReview = await review.save();

        // Add the review ID to the product's reviews array
        const updatedProduct = await Product.findByIdAndUpdate(
            product,
            { $push: { reviews: savedReview._id } },
            { new: true } // Option to return the updated document
        );


        if (!updatedProduct) {
            return res.status(500).json({ message: 'Failed to update product with review.' });
        }

        // Return the review as the response
        res.status(201).json(savedReview);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.GetUserInfoById = async (req, res) => {
  try {
      const { userId } = req.params;

      // Ensure the userId is provided
      if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      // Find the user by ID
      const findedUser = await User.findById(userId);

      // If the user is not found
      if (!findedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Respond with the found user
      res.status(200).json(findedUser);
  } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.FinduBrands = async (req, res) => {
  try {
             const data = await Feedback.findOne({})
    res.status(200).json({ message: 'User updated successfully', data });
  } catch (err) {
    // Handle errors
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.VerifyToken = async (req, res) => {
  try {
      const { token } = req.body;

      if (!token) {
          return res.status(400).json({ valid: false, message: 'Token is required' });
      }

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) {
              return res.status(401).json({ valid: false, message: 'Invalid token' });
          }

          // Token is valid
          res.status(200).json({ valid: true, userId: decoded.id });
      });
  } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.Userdetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Adjust to your JWT secret or use config

    // Find user by ID (assuming the token contains user ID)
    const user = await User.findById(decoded.id).select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user details as response
    res.status(200).json(user);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.Orderdetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.orders); 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.Addressesdetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('shipping_add');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user); 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.AddressesCreate = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAddress = req.body;
    user.shipping_add.push(newAddress);
    await user.save();
    
    res.status(201).json(newAddress);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request', message: err.message });
  }
};

exports.AddressesEdit = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.shipping_add && Array.isArray(user.shipping_add) && user.shipping_add.length > 0) {
      user.shipping_add.forEach((address, index) => {
        console.log(`Address ${index + 1}:`);
        console.log(address);
      });
    } else {
      console.log('No shipping addresses found or invalid format.');
    }
    
        if (!user.shipping_add || !Array.isArray(user.shipping_add)) {
      return res.status(400).json({ error: 'Shipping addresses are not defined' });
    }

    const { id, ...updatedAddress } = req.body;

    // Log request data for debugging
    console.log('Request Body:', req.body);
    console.log('User Shipping Addresses:', user.shipping_add);

    // Debugging: Log each address and the id being searched for
    console.log(`Searching for address with ID: ${id}`);
    user.shipping_add.forEach((address, index) => {
      console.log(`Address ${index}: ${address._id.toString()}`);
    });

    // Find the address index
    const addressIndex = user.shipping_add.findIndex(address => address._id.toString() === id);
    console.log(`Found address index: ${addressIndex}`);

    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Update the address
    user.shipping_add[addressIndex] = { ...user.shipping_add[addressIndex], ...updatedAddress };
    await user.save();

    // Return the updated address
    res.json(user.shipping_add[addressIndex]);
  } catch (err) {
    console.error('Error in AddressesEdit:', err);
    res.status(400).json({ error: 'Bad Request', message: err.message });
  }
};




exports.getPaymentMethods = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    const user = await User.findById(decoded.id).select('payment_methods'); // Find user by decoded ID
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ payment_methods: user.payment_methods }); // Return payment methods
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.addPaymentMethod = async (req, res) => {
  try {
    const { userId } = req.params;
    const { number, name, expiry, cvc, default_payment_method } = req.body;

    const newPaymentMethod = {
      card_number: number,
      card_name: name,
      expiry_date: expiry,
      cvv: cvc,
      default_payment_method
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.payment_methods.push(newPaymentMethod);
    await user.save();

    // Update existing default payment method if necessary
    if (default_payment_method) {
      await User.updateMany(
        { _id: userId, 'payment_methods._id': { $ne: newPaymentMethod._id } },
        { $set: { 'payment_methods.$[].default_payment_method': false } }
      );
    }

    res.status(201).json(newPaymentMethod);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const { userId, id } = req.params;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set all other payment methods to non-default
    await User.updateOne(
      { _id: userId },
      { $set: { 'payment_methods.$[].default_payment_method': false } }
    );

    // Set the selected payment method as default
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'payment_methods.card_number': id },
      { $set: { 'payment_methods.$.default_payment_method': true } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const updatedPaymentMethod = updatedUser.payment_methods.id(id);
    res.status(200).json(updatedPaymentMethod);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.GetAllReviews = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const user = await User.findById(decoded.id).select('-password'); 
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ reviews: user.reviews }); 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.PasswordChnage = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.RegisterbusinessAcc = async (req, res) => {
  const { business_name, email, phone_number, address } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    user.account_type = 'business';
    user.business_account = {
      business_name,
      email,
      phone_number,
      address
    };

    await user.save();

    res.status(200).json({ message: 'Business registration successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.GetCartItems = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const user = await User.findById(decoded.id); 
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ cart:user.cart }); 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;


  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User's cart:", user.cart.map(item => item._id.toString()));
console.log("Product ID from request:", productId);

const cartItem = user.cart.find(item => item._id.toString() === productId);

if (!cartItem) {
  return res.status(404).json({ message: 'Cart item not found' });
}
    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({ message: 'Quantity updated successfully' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    // Extract and verify token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the cart before filtering
    console.log("User's cart before removal:", user.cart);

    // Check if productId is defined and valid
    if (!productId) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Filter out the item with the matching productId
    user.cart = user.cart.filter(item => {
      if (!item.product_id) {
        console.error('Cart item product_id is undefined');
        return false;
      }
      return item.product_id.toString() !== productId.toString();
    });

    // Save the user document
    await user.save();

    // Log the cart after filtering
    console.log("User's cart after removal:", user.cart);

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.addToFavorites = async (req, res) => {
  const { productId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.status(200).json({ message: 'Added to favorites successfully' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Decode token and check for errors
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
    
    const userId = decoded.id;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product ID or quantity.' });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the product is already in the user's cart
    const existingItemIndex = user.cart.findIndex(item => item.product_id.toString() === productId);

    if (existingItemIndex > -1) {
      // Update the quantity of the existing item
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to the cart
      user.cart.push({ product_id: productId, quantity });
    }

    // Save the user with the updated cart
    await user.save();

    res.status(200).json({ message: 'Product added to cart successfully.', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while adding to cart.' });
  }
};


const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

exports.SubmitOrder = async (req, res) => {
  const { deliveryMethod, shippingAddress, paymentMethod, paymentAmount } = req.body;
  const { userId,cartItems } = req.body;

  try {
      const amountInPaise = paymentAmount * 100; // Convert to paise
      const currency = 'INR';

      const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt: `order_receipt_${Date.now()}`, 
      });


      const user = await User.findById(userId);
      const newOrder = {
          order_no: user.orders.length + 1, 
          order_date: new Date(),
          total_amount: paymentAmount,
          order_products: cartItems, 
          tracking_id: order.id
      };
      user.orders.push(newOrder);
    const saveduser =  await user.save();


      res.json({
          orderId: order.id,
          amount: order.amount / 100, 
          currency: order.currency,
          receipt: order.receipt,
      });
  } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ message: 'Error creating order' });
  }
};



const crypto = require('crypto'); // Ensure you have this module for signature verification

exports.VerifyOrder = async (req, res) => {
  const { userId, orderId, paymentId, signature } = req.body;

  try {
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      console.log(`orderId ${orderId}`);

      // Find the order by tracking_id
      const order = user.orders.find(o => o.tracking_id === orderId);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      // Generate the expected signature
      const generatedSignature = crypto.createHmac('sha256', 'vtIjlY3VXCS6cb4ULskw1Bg9')
                                       .update(`${orderId}|${paymentId}`)
                                       .digest('hex');

      // Verify the signature
      if (generatedSignature === signature) {
          // Update order status to confirmed
          order.status = 'Processing';

          // Clear the cart
          user.cart = [];

          // Save the updated user
          await user.save();

          res.status(200).json({ message: 'Payment verified successfully' });
      } else {
          res.status(400).json({ message: 'Invalid payment signature' });
      }
  } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ message: 'Payment verification failed' });
  }
};


exports.GetOrderDetailById = async (req, res) => {
  const { orderedId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = user.orders.find(order => order.order_no.toString() === orderedId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.SubmitFeedback = async (req, res) => {
  const { feedbackText, orderId } = req.body;

  if (!feedbackText || !orderId) {
    return res.status(400).json({ message: 'Feedback text and order ID are required' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const feedback = new Feedback({
      userId,
      orderId,
      feedbackText
    });

    await feedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};