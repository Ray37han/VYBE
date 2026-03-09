import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-ecommerce';

async function updateNewPricing() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Fixed pricing — A5/A4/A3
    // A5: base 375, after discount 280
    // A4: base 625, after discount 470
    // A3: base 1000, after discount 750
    const newSizes = [
      {
        name: 'A5',
        dimensions: '5.8 x 8.3 inches',
        originalPrice: 375,
        price: 280,
        tier: 'Standard'
      },
      {
        name: 'A4',
        dimensions: '8.3 x 11.7 inches',
        originalPrice: 625,
        price: 470,
        tier: 'Standard'
      },
      {
        name: 'A3',
        dimensions: '11.7 x 16.5 inches',
        originalPrice: 1000,
        price: 750,
        tier: 'Standard'
      }
    ];

    console.log('New Pricing Structure:');
    console.log('================================================');
    newSizes.forEach(size => {
      const discount = Math.round(((size.originalPrice - size.price) / size.originalPrice) * 100);
      console.log(`${size.name}: ${size.price} (base ${size.originalPrice}) — ${discount}% off`);
    });
    console.log('================================================\n');

    const totalProducts = await Product.countDocuments({});
    console.log(`Found ${totalProducts} products to update\n`);

    const result = await Product.updateMany({}, {
      $set: {
        sizes: newSizes,
        basePrice: 470,
        originalPrice: 625,
        discount: 25,
      }
    });

    console.log(`Updated ${result.modifiedCount} products\n`);

    // Verify a sample
    const sample = await Product.find({}).limit(3).select('name sizes basePrice originalPrice discount');
    console.log('Verification (first 3 products):');
    console.log('================================================');
    sample.forEach(product => {
      console.log(`\n${product.name}`);
      console.log(`  basePrice: ${product.basePrice}  originalPrice: ${product.originalPrice}  discount: ${product.discount}%`);
      product.sizes.forEach(s => {
        console.log(`  ${s.name}: ${s.price} (base ${s.originalPrice})`);
      });
    });

    await mongoose.connection.close();
    console.log('\nDone. Database connection closed.');

  } catch (error) {
    console.error('Error updating pricing:', error);
    process.exit(1);
  }
}

updateNewPricing();
