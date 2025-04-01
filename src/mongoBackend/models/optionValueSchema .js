
const mongoose = require('mongoose');
const optionValueSchema = new mongoose.Schema({
    option_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
    value: { type: String, required: true },  // Example: 'Red', 'Blue', 'Small'
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const OptionValue = mongoose.model('OptionValue', optionValueSchema);
module.exports = OptionValue;
