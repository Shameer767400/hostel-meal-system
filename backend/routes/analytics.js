const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const UserSelection = require('../models/UserSelection');
const User = require('../models/user');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/menu/:menuId
// @desc    Get analytics for a specific menu
// @access  Admin only
router.get('/menu/:menuId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId).populate('items');

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Get all selections for this menu
    const selections = await UserSelection.find({ menu: menu._id })
      .populate('selectedItems.item')
      .populate('user', 'name email rollNumber hostelBlock');

    // Calculate total students
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalSelections = selections.length;
    const participationRate = totalStudents > 0 
      ? ((totalSelections / totalStudents) * 100).toFixed(2) 
      : 0;

    // Item-wise aggregation
    const itemStats = {};
    
    menu.items.forEach(item => {
      itemStats[item._id.toString()] = {
        item: {
          id: item._id,
          name: item.name,
          category: item.category
        },
        totalSelections: 0,
        totalQuantity: 0,
        percentage: 0,
        students: []
      };
    });

    selections.forEach(selection => {
      selection.selectedItems.forEach(si => {
        const itemId = si.item._id.toString();
        if (itemStats[itemId]) {
          itemStats[itemId].totalSelections += 1;
          itemStats[itemId].totalQuantity += si.quantity;
          itemStats[itemId].students.push({
            name: selection.user.name,
            rollNumber: selection.user.rollNumber,
            quantity: si.quantity
          });
        }
      });
    });

    // Calculate percentages
    Object.keys(itemStats).forEach(itemId => {
      if (totalSelections > 0) {
        itemStats[itemId].percentage = (
          (itemStats[itemId].totalSelections / totalSelections) * 100
        ).toFixed(2);
      }
    });

    // Convert to array and sort by popularity
    const itemStatsArray = Object.values(itemStats)
      .sort((a, b) => b.totalSelections - a.totalSelections);

    // Hostel-wise breakdown
    const hostelBreakdown = {};
    selections.forEach(selection => {
      const hostel = selection.user.hostelBlock || 'Unknown';
      if (!hostelBreakdown[hostel]) {
        hostelBreakdown[hostel] = 0;
      }
      hostelBreakdown[hostel] += 1;
    });

    res.json({
      success: true,
      data: {
        menu: {
          id: menu._id,
          mealType: menu.mealType,
          date: menu.date,
          status: menu.status
        },
        summary: {
          totalStudents,
          totalSelections,
          participationRate: `${participationRate}%`,
          selectionWindowEnd: menu.selectionWindowEnd
        },
        itemStats: itemStatsArray,
        hostelBreakdown,
        recentSelections: selections.slice(0, 10).map(s => ({
          user: s.user.name,
          rollNumber: s.user.rollNumber,
          items: s.selectedItems.length,
          timestamp: s.selectionDate
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/overview
// @desc    Get overall analytics
// @access  Admin only
router.get('/overview', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const totalMenus = await Menu.countDocuments(dateFilter);
    const activeMenus = await Menu.countDocuments({ ...dateFilter, status: 'active' });
    const closedMenus = await Menu.countDocuments({ ...dateFilter, status: 'closed' });

    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalSelections = await UserSelection.countDocuments();

    const avgParticipation = totalMenus > 0
      ? ((totalSelections / (totalMenus * totalStudents)) * 100).toFixed(2)
      : 0;

    // Most popular items overall
    const itemAggregation = await UserSelection.aggregate([
      {
        $unwind: '$selectedItems'
      },
      {
        $group: {
          _id: '$selectedItems.item',
          totalSelections: { $sum: 1 },
          totalQuantity: { $sum: '$selectedItems.quantity' }
        }
      },
      {
        $sort: { totalSelections: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate item details
    const MenuItem = require('../models/MenuItem');
    const popularItems = await Promise.all(
      itemAggregation.map(async (item) => {
        const itemDetails = await MenuItem.findById(item._id);
        return {
          item: itemDetails,
          totalSelections: item.totalSelections,
          totalQuantity: item.totalQuantity
        };
      })
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalMenus,
          activeMenus,
          closedMenus,
          totalStudents,
          totalSelections,
          averageParticipation: `${avgParticipation}%`
        },
        popularItems
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;