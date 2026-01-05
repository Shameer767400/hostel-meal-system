const mongoose = require('mongoose');

const userSelectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
    index: true
  },
  selectedItems: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    }
  }],
  selectionDate: {
    type: Date,
    default: Date.now
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for uniqueness and query optimization
userSelectionSchema.index({ user: 1, menu: 1 }, { unique: true });
userSelectionSchema.index({ menu: 1, isLocked: 1 });

module.exports = mongoose.model('UserSelection', userSelectionSchema);
