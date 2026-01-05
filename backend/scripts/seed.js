const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Menu = require("../models/Menu");

dotenv.config();

const sampleMenuItems = [
  // Main Course
  { name: 'Paneer Butter Masala', description: 'Rich and creamy paneer curry', category: 'main', isVegetarian: true, calories: 320 },
  { name: 'Dal Tadka', description: 'Yellow lentils tempered with spices', category: 'main', isVegetarian: true, isVegan: true, calories: 180 },
  { name: 'Chicken Curry', description: 'Spicy chicken curry', category: 'main', isVegetarian: false, calories: 280 },
  { name: 'Vegetable Biryani', description: 'Aromatic rice with mixed vegetables', category: 'main', isVegetarian: true, calories: 350 },
  { name: 'Rajma Masala', description: 'Kidney beans in tomato gravy', category: 'main', isVegetarian: true, isVegan: true, calories: 240 },
  
  // Side Dishes
  { name: 'Jeera Rice', description: 'Cumin flavored basmati rice', category: 'side', isVegetarian: true, isVegan: true, calories: 200 },
  { name: 'Plain Rice', description: 'Steamed white rice', category: 'side', isVegetarian: true, isVegan: true, calories: 180 },
  { name: 'Roti (2 pcs)', description: 'Whole wheat flatbread', category: 'side', isVegetarian: true, isVegan: true, calories: 140 },
  { name: 'Mixed Vegetable Salad', description: 'Fresh seasonal vegetables', category: 'side', isVegetarian: true, isVegan: true, calories: 60 },
  { name: 'Raita', description: 'Yogurt with cucumber and spices', category: 'side', isVegetarian: true, calories: 80 },
  
  // Beverages
  { name: 'Masala Chai', description: 'Indian spiced tea', category: 'beverage', isVegetarian: true, calories: 80 },
  { name: 'Coffee', description: 'Hot brewed coffee', category: 'beverage', isVegetarian: true, calories: 20 },
  { name: 'Buttermilk', description: 'Spiced yogurt drink', category: 'beverage', isVegetarian: true, calories: 60 },
  { name: 'Fresh Lime Water', description: 'Refreshing lime juice', category: 'beverage', isVegetarian: true, isVegan: true, calories: 40 },
  
  // Desserts
  { name: 'Gulab Jamun (2 pcs)', description: 'Sweet milk dumplings', category: 'dessert', isVegetarian: true, calories: 280 },
  { name: 'Rice Kheer', description: 'Sweet rice pudding', category: 'dessert', isVegetarian: true, calories: 220 },
  { name: 'Fresh Fruit', description: 'Seasonal fresh fruit', category: 'dessert', isVegetarian: true, isVegan: true, calories: 80 }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Menu.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      email: 'admin@hostel.com',
      password: 'admin123', 
      name: 'Admin User',
      role: 'admin',
      isActive: true
    });
    console.log('Admin user created:', admin.email);

    // Create sample students
    for (let i = 1; i <= 5; i++) {
        await User.create({
          email: `student${i}@hostel.com`,
          password: 'student123',
          name: `Student ${i}`,
          rollNumber: `2024CS00${i}`,
          hostelBlock: ['A', 'B', 'C', 'D', 'E'][i - 1],
          role: 'student',
          isActive: true
        });
    }
    console.log('Sample students created');

    // Create menu items
    const items = await MenuItem.insertMany(sampleMenuItems);
    console.log(`Created ${items.length} menu items`);

    // Create Menus for Today and Tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dates = [today, tomorrow];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    // Helper to get random items
    const getRandomItems = (category, count) => {
        const categoryItems = items.filter(i => i.category === category);
        const shuffled = categoryItems.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(i => i._id);
    };

    for (const date of dates) {
        for (const type of mealTypes) {
            let selectedItemIds = [];
            // Basic logic for meal composition
            if (type === 'breakfast') {
               // Usually beverages + maybe main? Seed only refers to lunch/dinner like items mostly but let's mix
               selectedItemIds = [
                   ...getRandomItems('beverage', 1),
                   ...getRandomItems('main', 1), // e.g. aloo paratha if it existed
                   ...getRandomItems('side', 1)
               ];
            } else {
               // Lunch/Dinner
               selectedItemIds = [
                   ...getRandomItems('main', 2),
                   ...getRandomItems('side', 2),
                   ...getRandomItems('dessert', 1),
                   ...getRandomItems('beverage', 1)
               ];
            }
            
            // Allow selection until 10 AM same day for breakfast, previous day 10 PM for lunch? 
            // Simplified: Selection open until meal start time or arbitrarily in future
            const selectionEnd = new Date(date);
            if (type === 'breakfast') selectionEnd.setHours(8, 0, 0, 0);
            if (type === 'lunch') selectionEnd.setHours(11, 0, 0, 0);
            if (type === 'dinner') selectionEnd.setHours(17, 0, 0, 0);
            
            // Ensure selection end is in future for "Active" menus if we want them to be selectable now
            // For testing purposes, set selection window end to 2 days from now so everything is open
            const testSelectionEnd = new Date();
            testSelectionEnd.setDate(testSelectionEnd.getDate() + 2);

            await Menu.create({
                mealType: type,
                date: date,
                publishedBy: admin._id,
                items: selectedItemIds,
                publishWindowStart: new Date(Date.now() - 24*60*60*1000), // Published yesterday
                publishWindowEnd: testSelectionEnd,
                selectionWindowEnd: testSelectionEnd,
                isPublished: true,
                status: 'active'
            });
        }
    }
    console.log('Sample menus created for Today and Tomorrow');

    console.log('\n=== Seeding Complete ===');
    console.log('Admin credentials:');
    console.log('Email: admin@hostel.com');
    console.log('Password: admin123');
    console.log('\nStudent credentials (1-5):');
    console.log('Email: student1@hostel.com to student5@hostel.com');
    console.log('Password: student123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
