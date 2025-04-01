const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');

const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    image: String,
    new_Price: Number,
    old_price: Number
});

const productModel = mongoose.model("products", productSchema);

app.get("/getProducts", (req, res) => {
    productModel.find({}).then(function (products) {
        res.json(products);
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch data" });
    });
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
