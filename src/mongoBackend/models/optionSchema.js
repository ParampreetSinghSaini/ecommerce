const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Option = mongoose.model('Option', optionSchema);
module.exports = Option;
