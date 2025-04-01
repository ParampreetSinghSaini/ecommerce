
const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema({
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    option_value_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OptionValue', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const VariantOption = mongoose.model('VariantOption', variantOptionSchema);
module.exports = VariantOption;
