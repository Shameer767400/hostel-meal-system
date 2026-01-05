const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/menu-items
// @desc    Create menu item
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/menu-items
// @desc    Get all menu items
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/menu-items/:id
// @desc    Update menu item
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/menu-items/:id
// @desc    Delete menu item
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Soft delete
    item.isActive = false;
    await item.save();

    res.json({ success: true, message: 'Item deactivated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
