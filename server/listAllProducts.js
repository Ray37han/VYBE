import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function listAllProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({})
      .select('name category basePrice originalPrice discount')
      .sort({ name: 1 })
      .limit(50);

    console.log(`\n📦 First 50 products in database:\n`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" (${product.category}) - ৳${product.basePrice}`);
    });

    const total = await Product.countDocuments();
    console.log(`\n📊 Total products: ${total}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listAllProducts();
