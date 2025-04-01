const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.register = async  (req, res) => {
   
    try {
        const { name, email, password, cartItems } = req.body;
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create a new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        const token = jwt.sign(
          { id: newUser._id, email: newUser.email, name: newUser.name },
          process.env.JWT_SECRET || 'test@ecommerceWebsite12345'
        );
        
        if (cartItems && cartItems.length > 0) {
          try {
            await axios.post(
              'http://localhost:3001/api/cart/sync',
              { cartItems }, // Wrap the array in an object
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (syncError) {
            console.error('Cart sync failed:', syncError);
            // Optionally: you can decide to proceed with login even if syncing fails.
          }
        }

         
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
      const { email, password, cartItems } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email' });
      }
  
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    
      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET || 'test@ecommerceWebsite12345', 
        { expiresIn: '1h' }
      );

      if (cartItems && cartItems.length > 0) {
        try {
          await axios.post(
            'http://localhost:3001/api/cart/sync',
            { cartItems }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (syncError) {
          console.error('Cart sync failed:', syncError);
       
        }
      }
     
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to login' });
    }
  };
  