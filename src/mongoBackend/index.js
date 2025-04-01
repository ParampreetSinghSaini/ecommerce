const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
require('dotenv').config();



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static('public/productImg'));




const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const productRoutes = require('./routes/productRoutes.js');
app.use('/api/product', productRoutes);


const categoryRoutes = require('./routes/categoryRoutes.js');
app.use('/api/category', categoryRoutes);


const cartRoutes = require('./routes/cartRoutes.js');
app.use('/api/cart', cartRoutes);


app.get("/", (req, res) => {
  res.status(200).json("Hello from server")
})

const dbConfig = require('./config/db.js');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database.', err);
  process.exit();
});




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
