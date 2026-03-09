import mongoose from 'mongoose';
import Product from './models/Product.js';

// Production MongoDB URI
const PRODUCTION_MONGODB_URI = 'mongodb+srv://2303037_db_user:kALl4kOIAR6mUefP@cluster0.p6xeucy.mongodb.net/vybe-store';

// New standardized pricing structure
// A5: base 375, after discount 280
// A4: base 625, after discount 470
// A3: base 1000, after discount 750
const newPricing = {
  sizes: [
    {
      name: 'A5',
      tier: 'Standard',
      dimensions: '5.8 x 8.3 inches',
      price: 280,
      originalPrice: 375
    },
    {
      name: 'A4',
      tier: 'Standard',
      dimensions: '8.3 x 11.7 inches',
      price: 470,
      originalPrice: 625
    },
    {
      name: 'A3',
      tier: 'Standard',
      dimensions: '11.7 x 16.5 inches',
      price: 750,
      originalPrice: 1000
    }
  ],
  basePrice: 470,
  originalPrice: 625,
  discount: 25
};

async function updateProductionPricing() {
  try {
    console.log('🔌 Connecting to PRODUCTION database...');
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connected to PRODUCTION database\n');

    console.log('📦 Fetching all products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    console.log('🔄 Updating pricing for all products...\n');
    
    let updated = 0;
    for (const product of products) {
      await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            sizes: newPricing.sizes,
            basePrice: newPricing.basePrice,
            originalPrice: newPricing.originalPrice,
            discount: newPricing.discount
          }
        }
      );
      
      updated++;
      if (updated % 20 === 0) {
        console.log(`✓ Updated ${updated}/${products.length} products...`);
      }
    }

    console.log(`\n✅ Successfully updated all ${updated} products!\n`);

    // Verify a few products
    console.log('🔍 Verifying updates...\n');
    const verifiedProducts = await Product.find({}).limit(3);
    
    verifiedProducts.forEach((p, index) => {
      console.log(`Product ${index + 1}: ${p.name}`);
      console.log(`  Base Price: ৳${p.basePrice}`);
      console.log(`  Discount: ${p.discount}%`);
      console.log(`  Sizes:`);
      p.sizes.forEach(s => {
        console.log(`    - ${s.name}: ৳${s.price} (was ৳${s.originalPrice})`);
      });
      console.log('');
    });

    console.log('✅ PRODUCTION DATABASE UPDATE COMPLETE!\n');
    console.log('🌐 Your website at vybebd.store will now show:');
    console.log('   - A5: ৳280 (base ৳375)');
    console.log('   - A4: ৳470 (base ৳625)');
    console.log('   - A3: ৳750 (base ৳1000)');
    console.log('   - Discount: 25%\n');

  } catch (error) {
    console.error('❌ Error updating production database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the update
updateProductionPricing();
