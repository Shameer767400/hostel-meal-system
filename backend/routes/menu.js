const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const UserSelection = require('../models/UserSelection');
const { protect, authorize } = require('../middleware/auth');
const { validateSelectionWindow } = require('../middleware/timeWindow');
const moment = require('moment-timezone');

const TIMEZONE = 'Asia/Kolkata';

// @route   POST /api/menus
// @desc    Create a new menu
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { mealType, date, itemIds } = req.body;

    if (!mealType || !date || !itemIds || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType, date, and items'
      });
    }

    // Validate meal type
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    // Check time window dynamically
    // Calculate selection window strictly based on meal date
    const { calculateTimeWindows } = require('../middleware/timeWindow');
    const { start, end } = calculateTimeWindows(mealType, date); // date is string "YYYY-MM-DD" or Date object
    
    const windowStart = start;
    const windowEnd = end;

    // Verify all items exist
    const items = await MenuItem.find({ _id: { $in: itemIds }, isActive: true });
    if (items.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some menu items are invalid or inactive'
      });
    }

    // Check if menu already exists for this meal and date
    const menuDate = moment.tz(date, TIMEZONE).startOf('day');
    const existingMenu = await Menu.findOne({
      mealType,
      date: {
        $gte: menuDate.toDate(),
        $lt: menuDate.clone().add(1, 'day').toDate()
      }
    });

    if (existingMenu) {
      return res.status(400).json({
        success: false,
        message: `Menu for ${mealType} on ${menuDate.format('YYYY-MM-DD')} already exists`
      });
    }

    // Calculate selection window end
    // selectionWindowEnd calculation moved up

    const menu = await Menu.create({
      mealType,
      date: menuDate.toDate(),
      publishedBy: req.user._id,
      items: itemIds,
      items: itemIds,
      publishWindowStart: windowStart, // Effective selection start
      publishWindowEnd: windowEnd,    // Effective selection end
      selectionWindowEnd: windowEnd,  // Redundant but keeping schema consistent
      isPublished: true,
      status: 'active'
    });

    await menu.populate('items publishedBy', 'name email');

    res.status(201).json({
      success: true,
      data: menu
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/menus/active
// @desc    Get all active menus for students
// @access  Private
router.get('/active', protect, async (req, res, next) => {
  try {
    const now = new Date();

    const menus = await Menu.find({
      status: 'active',
      selectionWindowEnd: { $gt: now }
    })
    .populate('items')
    .populate('publishedBy', 'name')
    .sort({ date: 1, mealType: 1 });

    res.json({
      success: true,
      count: menus.length,
      data: menus
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/menus
// @desc    Get all menus (admin)
// @access  Admin only
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, mealType, startDate, endDate } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (mealType) query.mealType = mealType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const menus = await Menu.find(query)
      .populate('items')
      .populate('publishedBy', 'name email')
      .sort({ date: -1, mealType: 1 });

    res.json({
      success: true,
      count: menus.length,
      data: menus
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/menus/:id
// @desc    Get single menu
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id)
      .populate('items')
      .populate('publishedBy', 'name email');

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/menus/:id
// @desc    Update menu
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    if (menu.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update closed menu'
      });
    }

    const { itemIds } = req.body;

    if (itemIds) {
      const items = await MenuItem.find({ _id: { $in: itemIds }, isActive: true });
      if (items.length !== itemIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some menu items are invalid'
        });
      }
      menu.items = itemIds;
    }

    await menu.save();
    await menu.populate('items publishedBy', 'name email');

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/menus/:id
// @desc    Delete menu
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Check if there are selections
    const selectionsCount = await UserSelection.countDocuments({ menu: menu._id });
    
    if (selectionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete menu with existing selections'
      });
    }

    await menu.deleteOne();

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
