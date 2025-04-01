const mongoose = require('mongoose');

const productOptionSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    option_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ProductOption = mongoose.model('ProductOption', productOptionSchema);
module.exports = ProductOption;
