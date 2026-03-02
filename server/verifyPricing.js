import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function verifyPricing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get first 3 products to verify
    const products = await Product.find({}).limit(3).select('name sizes basePrice originalPrice discount');

    console.log('🔍 Pricing Verification:\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Base Price: ৳${product.basePrice}`);
      console.log(`   Original Price: ৳${product.originalPrice}`);
      console.log(`   Discount: ${product.discount}%`);
      console.log(`   Available Sizes:`);
      
      product.sizes.forEach(size => {
        console.log(`     • ${size.name} (${size.dimensions}): ৳${size.price} (was ৳${size.originalPrice})`);
      });
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════\n');
    
    // Count total products
    const total = await Product.countDocuments();
    console.log(`📊 Total products in database: ${total}\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyPricing();
