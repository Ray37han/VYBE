import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-ecommerce';

// Use a loose schema so this script can update existing documents regardless of model changes.
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

function calcOriginalPrice(price, discountPercent) {
  return Math.round(price / (1 - discountPercent / 100));
}

async function updateStandardPremiumPrices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    const discountPercent = 33;

    const variants = [
      {
        name: 'A4',
        tier: 'Standard',
        dimensions: '8.3 x 11.7 inches',
        price: 450,
        originalPrice: calcOriginalPrice(450, discountPercent),
      },
      {
        name: 'A3',
        tier: 'Standard',
        dimensions: '11.7 x 16.5 inches',
        price: 650,
        originalPrice: calcOriginalPrice(650, discountPercent),
      },
      {
        name: 'A4',
        tier: 'Premium',
        dimensions: '8.3 x 11.7 inches',
        price: 550,
        originalPrice: calcOriginalPrice(550, discountPercent),
      },
      {
        name: 'A3',
        tier: 'Premium',
        dimensions: '11.7 x 16.5 inches',
        price: 850,
        originalPrice: calcOriginalPrice(850, discountPercent),
      },
    ];

    const basePrice = 450;
    const originalPrice = calcOriginalPrice(basePrice, discountPercent);

    console.log('\nNew pricing matrix:');
    for (const v of variants) {
      console.log(`- ${v.tier} ${v.name}: ৳${v.price} (Original: ৳${v.originalPrice})`);
    }
    console.log(`\nBase price (starting): ৳${basePrice}`);
    console.log(`Original base price: ৳${originalPrice}`);
    console.log(`Discount: ${discountPercent}%`);

    console.log('\nUpdating all products...');
    const result = await Product.updateMany(
      {},
      {
        $set: {
          basePrice,
          originalPrice,
          discount: discountPercent,
          sizes: variants,
        },
      }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} products`);
    console.log(`Total products matched: ${result.matchedCount}`);

    const sampleProduct = await Product.findOne();
    if (sampleProduct) {
      console.log('\nSample product after update:');
      console.log(`Name: ${sampleProduct.name}`);
      console.log(`Base Price: ৳${sampleProduct.basePrice}`);
      console.log(`Original Price: ৳${sampleProduct.originalPrice}`);
      console.log(`Discount: ${sampleProduct.discount}%`);
      console.log('Sizes:');
      for (const s of sampleProduct.sizes || []) {
        console.log(`  - ${s.tier || 'Standard'} ${s.name}: ৳${s.price} (Original: ৳${s.originalPrice || 'N/A'})`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
}

updateStandardPremiumPrices();
