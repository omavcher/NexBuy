const User = require('../models/User'); 

exports.SignUp = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ message: 'Please enter a stronger password. It must be at least 6 characters long.' });
    }


    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Please enter a valid mobile number with exactly 10 digits.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password, 
      mobile
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
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
  
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }
  
      res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email, mobile: user.mobile } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };