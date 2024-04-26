const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemRef: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Menu', 'Product']
  },
  quantity: { type: Number, required: true, min: 1 },
  selectedOptions: {
    size: { type: String, enum: ['medium', 'large'] }, 
  },
});


module.exports = orderItemSchema;

