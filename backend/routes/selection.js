const express = require('express');
const router = express.Router();
const UserSelection = require('../models/UserSelection');
const Menu = require('../models/Menu');
const { protect, authorize } = require('../middleware/auth');
const { validateSelectionWindow } = require('../middleware/timeWindow');

// @route   POST /api/selections
// @desc    Create or update user selection
// @access  Student only
router.post('/', protect, authorize('student'), async (req, res, next) => {
  try {
    const { menuId, selectedItems } = req.body;

    if (!menuId || !selectedItems || selectedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide menu ID and selected items'
      });
    }

    // Validate selection window
    req.params.menuId = menuId;
    await new Promise((resolve, reject) => {
      validateSelectionWindow(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if selection already exists
    let selection = await UserSelection.findOne({
      user: req.user._id,
      menu: menuId
    });

    if (selection && selection.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Selection is locked and cannot be modified'
      });
    }

    // Validate selected items are in the menu
    const menu = await Menu.findById(menuId).populate('items');
    const menuItemIds = menu.items.map(item => item._id.toString());
    
    const invalidItems = selectedItems.filter(
      si => !menuItemIds.includes(si.item.toString())
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some selected items are not in this menu'
      });
    }

    if (selection) {
      // Update existing selection
      selection.selectedItems = selectedItems;
      selection.selectionDate = new Date();
      await selection.save();
    } else {
      // Create new selection
      selection = await UserSelection.create({
        user: req.user._id,
        menu: menuId,
        selectedItems
      });
    }

    await selection.populate('selectedItems.item');

    res.status(selection.isNew ? 201 : 200).json({
      success: true,
      data: selection
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/selections/my-selections
// @desc    Get current user's selections
// @access  Student only
router.get('/my-selections', protect, authorize('student'), async (req, res, next) => {
  try {
    const selections = await UserSelection.find({ user: req.user._id })
      .populate({
        path: 'menu',
        populate: { path: 'items' }
      })
      .populate('selectedItems.item')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: selections.length,
      data: selections
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/selections/menu/:menuId
// @desc    Get user's selection for specific menu
// @access  Student only
router.get('/menu/:menuId', protect, authorize('student'), async (req, res, next) => {
  try {
    const selection = await UserSelection.findOne({
      user: req.user._id,
      menu: req.params.menuId
    })
    .populate('selectedItems.item')
    .populate('menu');

    if (!selection) {
      return res.status(404).json({
        success: false,
        message: 'No selection found for this menu'
      });
    }

    res.json({
      success: true,
      data: selection
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;