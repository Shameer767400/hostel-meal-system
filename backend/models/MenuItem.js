const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['main', 'side', 'beverage', 'dessert'],
    required: true,
    index: true
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  allergens: [{
    type: String
  }],
  calories: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

menuItemSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
