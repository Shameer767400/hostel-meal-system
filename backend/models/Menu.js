const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  publishWindowStart: {
    type: Date,
    required: true
  },
  publishWindowEnd: {
    type: Date,
    required: true
  },
  selectionWindowEnd: {
    type: Date,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft',
    index: true
  }
}, {
  timestamps: true
});

// Compound index for uniqueness
menuSchema.index({ mealType: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);