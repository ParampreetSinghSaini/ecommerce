
// Product schema with updated fields
const mongoose = require('mongoose');
const Category = require('./categorySchema'); 
const Tag = require('./tagsSchema'); 
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    additional_description: { type: String, required: false },
    additional_info: { type: String, required: false },
    shipping_return: { type: String, required: false },
    meta_title: { type: String, required: false },
    meta_desc: { type: String, required: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    
    category_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      }],
      
      // tags: [{ type: String }],
      tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],

    continue_selling_when_out_of_stock: { type: Boolean, default: false }
});

const Product = mongoose.model('Product', productSchema);

module.exports = { Product, Category,Tag };