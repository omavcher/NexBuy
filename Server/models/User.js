const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Card Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
  card_number: {
    type: String,
    required: true,
    trim: true
  },
  card_name: {
    type: String,
    required: true
  },
  expiry_date: {
    type: String, // Use a format like 'MM/YY'
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  default_payment_method: {
    type: Boolean,
    default: false
  }
}, {
  _id: false // We don't need an _id for sub-documents
});

// Define Address Schema
const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  mobile_number: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  flat_house_no_building: {
    type: String,
    required: true
  },
  area_street_sector_village: {
    type: String,
    required: true
  },
  landmark: {
    type: String
  },
  town_city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  default_address: {
    type: Boolean,
    default: false
  },
  delivery_instructions: {
    type: String
  },
  address_type: {
    type: String,
    enum: ["House", "Apartment", "Business", "Other"],
    required: true
  },
  weekends_delivery: {
    saturdays: {
      type: Boolean,
      default: false
    },
    sundays: {
      type: Boolean,
      default: false
    }
  }
});

// Define Business Account Schema
const businessAccountSchema = new mongoose.Schema({
  business_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone_number: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  logo: {  // New field for logo URL
    type: String,
    required: false  // Set to true if you want it to be required
  },
  listed_product: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    }
  }]
});


// Define Order Schema
const orderSchema = new mongoose.Schema({
  order_no: {
    type: Number,
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  total_amount: {
    type: Number,
    default: 0
  },
  order_products: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: ["Cancelled", "Processing", "Delivered"],
      default: "Processing"
    }
  }],
  tracking_id: {
    type: String,
    default: ''
  }
});

// Define User Schema
const userSchema = new mongoose.Schema({
  account_type: {
    type: String,
    enum: ["user", "business"],
    default: "user"
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  shipping_address: [addressSchema],
  payment_methods: [paymentMethodSchema],
  business_account: businessAccountSchema,
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  orders: [orderSchema],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  cart: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});


const User = mongoose.model('User', userSchema);

module.exports = User;
