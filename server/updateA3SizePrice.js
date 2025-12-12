import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function updateA3SizePrice() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // New pricing for A3 size
    const basePrice = 850; // Price after 33% discount
    const discountPercent = 33;
    const originalPrice = Math.round(basePrice / (1 - discountPercent / 100)); // Calculate original price

    console.log(`\nA3 Size New Price Details:`);
    console.log(`Original Price: ৳${originalPrice}`);
    console.log(`Discount: ${discountPercent}%`);
    console.log(`Base Price (After Discount): ৳${basePrice}`);

    // Find all products with A3 size
    const productsWithA3 = await Product.find({
      'sizes.name': /a3/i
    });

    console.log(`\n📦 Found ${productsWithA3.length} products with A3 size`);

    let updatedCount = 0;

    // Update each product's A3 size price
    for (const product of productsWithA3) {
      const updated = await Product.updateOne(
        { _id: product._id, 'sizes.name': /a3/i },
        {
          $set: {
            'sizes.$[a3size].price': basePrice,
            'sizes.$[a3size].originalPrice': originalPrice
          }
        },
        {
          arrayFilters: [{ 'a3size.name': /a3/i }]
        }
      );

      if (updated.modifiedCount > 0) {
        updatedCount++;
        console.log(`✅ Updated: ${product.name}`);
      }
    }

    console.log(`\n✅ Total updated: ${updatedCount} products`);

    // Verify the updates
    const verifyProducts = await Product.find({
      'sizes.name': /a3/i
    }).limit(5);

    console.log('\n📋 Sample verification (first 5):');
    verifyProducts.forEach(product => {
      const a3Size = product.sizes.find(s => /a3/i.test(s.name));
      console.log(`\n${product.name}:`);
      console.log(`  A3 Size: ${a3Size.name}`);
      console.log(`  Price: ৳${a3Size.price}`);
      console.log(`  Original Price: ৳${a3Size.originalPrice || 'Not set'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error updating A3 size price:', error);
    process.exit(1);
  }
}

updateA3SizePrice();
