import mongoose from 'mongoose';
import Product from './models/Product.js';

mongoose.connect('mongodb://localhost:27017/vybe-ecommerce')
  .then(async () => {
    console.log('Connected to database');
    
    const products = await Product.find().limit(5);
    
    products.forEach(p => {
      console.log('\n==============================================');
      console.log('Product:', p.name);
      console.log('Base Price:', p.basePrice);
      console.log('Original Price:', p.originalPrice);
      console.log('Sizes:');
      p.sizes.forEach(s => {
        console.log(`  - ${s.name} (${s.tier || 'Standard'}): ৳${s.price} (was ৳${s.originalPrice})`);
      });
    });
    
    console.log('\n==============================================');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
