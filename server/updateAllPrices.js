import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-ecommerce';

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function updateAllPrices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    const basePrice = 650;
    const discountPercent = 33;
    const originalPrice = Math.round(basePrice / (1 - discountPercent / 100)); // Calculate original price

    console.log(`\nPrice Details:`);
    console.log(`Original Price: ৳${originalPrice}`);
    console.log(`Discount: ${discountPercent}%`);
    console.log(`Base Price (After Discount): ৳${basePrice}`);
    console.log(`\nUpdating all products...`);

    // Update all products
    const result = await Product.updateMany(
      {},
      {
        $set: {
          basePrice: basePrice,
          originalPrice: originalPrice,
          discount: discountPercent,
          // Update sizes array if exists
          'sizes.$[].price': basePrice
        }
      }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} products`);
    console.log(`Total products in database: ${result.matchedCount}`);

    // Verify the update
    const sampleProduct = await Product.findOne();
    if (sampleProduct) {
      console.log('\nSample product after update:');
      console.log(`Name: ${sampleProduct.name}`);
      console.log(`Base Price: ৳${sampleProduct.basePrice}`);
      console.log(`Original Price: ৳${sampleProduct.originalPrice}`);
      console.log(`Discount: ${sampleProduct.discount}%`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
}

updateAllPrices();
