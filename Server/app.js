const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS middleware

dotenv.config();

const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(express.json());

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', 
}));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to MongoDB using the connection string from environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

app.use('/api', userRoutes);

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to NexBuy!');
});

const port = process.env.PORT || 8080;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
