import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-ecommerce';

async function updateNewPricing() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // New standardized pricing (20% discount)
    const newSizes = [
      {
        name: 'A5',
        dimensions: '6 x 8 inches',
        originalPrice: 440,
        price: 350,
        tier: 'Standard'
      },
      {
        name: 'A4',
        dimensions: '8.3 x 11.7 inches',
        originalPrice: 650,
        price: 520,
        tier: 'Standard'
      },
      {
        name: 'A3',
        dimensions: '11.7 x 16.5 inches',
        originalPrice: 1000,
        price: 800,
        tier: 'Standard'
      }
    ];

    console.log('📋 New Pricing Structure:');
    console.log('═══════════════════════════════════════════════════');
    newSizes.forEach(size => {
      const discount = Math.round(((size.originalPrice - size.price) / size.originalPrice) * 100);
      console.log(`${size.name} (${size.dimensions})`);
      console.log(`  Original Price: ৳${size.originalPrice}`);
      console.log(`  Discounted Price: ৳${size.price}`);
      console.log(`  Discount: ${discount}%`);
      console.log('');
    });
    console.log('═══════════════════════════════════════════════════\n');

    // Get all products
    const allProducts = await Product.find({});
    console.log(`📦 Found ${allProducts.length} products to update\n`);

    let updatedCount = 0;
    let errors = [];

    // Update each product
    for (const product of allProducts) {
      try {
        // Update the product with new sizes
        const updateResult = await Product.updateOne(
          { _id: product._id },
          { 
            $set: { 
              sizes: newSizes,
              basePrice: 520, // Base price set to A4 price
              originalPrice: 650,
              discount: 20
            } 
          }
        );

        if (updateResult.modifiedCount > 0) {
          updatedCount++;
          console.log(`✅ Updated: ${product.name}`);
        } else {
          console.log(`⚪ No change needed: ${product.name}`);
        }
      } catch (err) {
        errors.push({ product: product.name, error: err.message });
        console.log(`❌ Error updating ${product.name}: ${err.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✅ Successfully updated ${updatedCount} products`);
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
      errors.forEach(e => {
        console.log(`   - ${e.product}: ${e.error}`);
      });
    }
    console.log('═══════════════════════════════════════════════════\n');

    // Verify updates by checking a few products
    const verifyProducts = await Product.find({}).limit(5).select('name sizes basePrice originalPrice discount');
    
    console.log('🔍 Verification (First 5 products):');
    console.log('═══════════════════════════════════════════════════');
    verifyProducts.forEach(product => {
      console.log(`\n${product.name}`);
      console.log(`  Base Price: ৳${product.basePrice}`);
      console.log(`  Original Price: ৳${product.originalPrice}`);
      console.log(`  Discount: ${product.discount}%`);
      console.log(`  Sizes:`);
      product.sizes.forEach(size => {
        console.log(`    - ${size.name} (${size.dimensions}): ৳${size.price} (was ৳${size.originalPrice})`);
      });
    });
    console.log('\n═══════════════════════════════════════════════════');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Pricing update complete!\n');
    
  } catch (error) {
    console.error('❌ Error updating pricing:', error);
    process.exit(1);
  }
}

updateNewPricing();
