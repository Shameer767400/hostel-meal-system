const moment = require('moment-timezone');

// Set your timezone
const TIMEZONE = 'Asia/Kolkata';

const TIME_WINDOWS = {
  breakfast: {
    publish: { start: '20:00', end: '21:30' },
    selection: { start: '20:00', end: '21:30' }
  },
  lunch: {
    publish: { start: '08:00', end: '09:30' },
    selection: { start: '08:00', end: '09:30' }
  },
  dinner: {
    publish: { start: '11:30', end: '14:00' },
    selection: { start: '11:30', end: '14:00' }
  }
};

exports.calculateTimeWindows = (mealType, dateStr) => {
  const window = TIME_WINDOWS[mealType];
  const date = moment.tz(dateStr, TIMEZONE).startOf('day');
  
  const [startHour, startMin] = window.selection.start.split(':');
  const [endHour, endMin] = window.selection.end.split(':');
  
  let start = date.clone().hour(startHour).minute(startMin).second(0);
  let end = date.clone().hour(endHour).minute(endMin).second(0);
  
  // Handle overnight/previous day windows (breakfast)
  // Breakfast selection (8pm-9:30pm) happens on the PREVIOUS day of the meal
  if (mealType === 'breakfast') {
    start.subtract(1, 'day');
    end.subtract(1, 'day');
  }
  
  return {
    start: start.toDate(),
    end: end.toDate()
  };
};

// validatePublishWindow REMOVED - Admins can publish anytime

exports.validateSelectionWindow = async (req, res, next) => {
  try {
    const Menu = require('../models/Menu');
    const menu = await Menu.findById(req.params.menuId || req.body.menuId);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const now = new Date();

    if (menu.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This menu is not available for selection',
        status: menu.status
      });
    }

    if (now > menu.selectionWindowEnd) {
      return res.status(403).json({
        success: false,
        message: 'Selection window has closed for this menu',
        closedAt: menu.selectionWindowEnd
      });
    }

    // NEW: Strict start time check
    // We use publishWindowStart as the effective selection start time
    if (now < menu.publishWindowStart) {
       return res.status(403).json({
        success: false,
        message: 'Selection window has not opened yet',
        opensAt: menu.publishWindowStart
      });
    }

    req.menu = menu;
    next();
  } catch (error) {
    next(error);
  }
};

exports.getTimeWindows = () => TIME_WINDOWS;