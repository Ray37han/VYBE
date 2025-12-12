import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function findA3Products() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Search for products that might be A3 rice
    const products = await Product.find({
      $or: [
        { name: /a3/i },
        { name: /rice/i },
        { category: /rice/i }
      ]
    }).select('name category basePrice originalPrice discount');

    console.log(`\n📦 Found ${products.length} potential products:\n`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. Name: "${product.name}"`);
      console.log(`   Category: "${product.category}"`);
      console.log(`   Current Price: ৳${product.basePrice}`);
      console.log(`   Original: ৳${product.originalPrice}`);
      console.log(`   ID: ${product._id}\n`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findA3Products();
