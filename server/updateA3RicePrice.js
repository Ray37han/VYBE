import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function updateA3RicePrice() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // New pricing for A3 Rice Paper
    const basePrice = 850; // Price after 33% discount
    const discountPercent = 33;
    const originalPrice = Math.round(basePrice / (1 - discountPercent / 100)); // Calculate original price

    console.log(`\nA3 Rice Paper New Price Details:`);
    console.log(`Original Price: ৳${originalPrice}`);
    console.log(`Discount: ${discountPercent}%`);
    console.log(`Base Price (After Discount): ৳${basePrice}`);

    // Find and update A3 rice paper product
    const result = await Product.updateMany(
      { 
        $or: [
          { name: /a3.*rice/i },
          { name: /rice.*a3/i },
          { category: /rice/i, name: /a3/i }
        ]
      },
      {
        $set: {
          basePrice: basePrice,
          originalPrice: originalPrice,
          discount: discountPercent,
          // Also update all size prices if sizes exist
          'sizes.$[].price': basePrice
        }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} A3 rice paper product(s)`);

    // Verify the update
    const updatedProducts = await Product.find({
      $or: [
        { name: /a3.*rice/i },
        { name: /rice.*a3/i },
        { category: /rice/i, name: /a3/i }
      ]
    });

    console.log('\n📦 Updated Products:');
    updatedProducts.forEach(product => {
      console.log(`\nProduct: ${product.name}`);
      console.log(`Category: ${product.category}`);
      console.log(`Base Price: ৳${product.basePrice}`);
      console.log(`Original Price: ৳${product.originalPrice}`);
      console.log(`Discount: ${product.discount}%`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error updating A3 rice price:', error);
    process.exit(1);
  }
}

updateA3RicePrice();
