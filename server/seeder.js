// backend/seeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js'; // Adjust path if needed
import User from './models/User.js'; // Needed to get a farmer ID
import connectDB from './config/db.js'; // Your DB connection file

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear previous products
    await Product.deleteMany();

    // Get one farmer user (you can insert one manually first)
    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) throw new Error('No farmer user found. Seed a farmer first.');

    const demoProducts = [
      {
        name: 'Organic Cocoa Potash',
        description: 'Natural potassium-rich potash used in African farming.',
        price: 35.99,
        quantity: 120,
        category: 'Fertilizer',
        images: [
          'https://via.placeholder.com/400x300.png?text=Potash+1',
          'https://via.placeholder.com/400x300.png?text=Potash+2'
        ],
        farmer: farmer._id,
        location: {
          type: 'Point',
          coordinates: [-0.186964, 5.614818] // Accra, Ghana
        }
      },
      {
        name: 'Fresh Tomatoes',
        description: 'Ripe organic tomatoes grown in the savannah region.',
        price: 5.50,
        quantity: 200,
        category: 'Vegetables',
        images: [
          'https://via.placeholder.com/400x300.png?text=Tomato+1'
        ],
        farmer: farmer._id,
        location: {
          type: 'Point',
          coordinates: [1.0232, 7.9465]
        }
      },
      {
        name: 'Maize Seeds',
        description: 'Hybrid maize seeds with high yield for Ghana’s climate.',
        price: 12.00,
        quantity: 500,
        category: 'Seeds',
        images: [
          'https://via.placeholder.com/400x300.png?text=Maize+1'
        ],
        farmer: farmer._id,
        location: {
          type: 'Point',
          coordinates: [-0.1263, 5.6037]
        }
      },
      {
        name: 'African Black Soap',
        description: 'Raw and handmade African black soap ideal for skin care.',
        price: 9.99,
        quantity: 80,
        category: 'Body Care',
        images: [
          'https://via.placeholder.com/400x300.png?text=Soap+1',
          'https://via.placeholder.com/400x300.png?text=Soap+2'
        ],
        farmer: farmer._id,
        location: {
          type: 'Point',
          coordinates: [-0.2035, 5.5600]
        }
      },
      {
        name: 'Sweet Potatoes',
        description: 'Organic sweet potatoes harvested from the Upper West.',
        price: 7.99,
        quantity: 150,
        category: 'Roots',
        images: [
          'https://via.placeholder.com/400x300.png?text=Sweet+Potato+1'
        ],
        farmer: farmer._id,
        location: {
          type: 'Point',
          coordinates: [-2.3265, 10.9634]
        }
      }
    ];

    await Product.insertMany(demoProducts);
    console.log('✅ Demo products seeded successfully');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedProducts();
