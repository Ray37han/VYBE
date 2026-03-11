import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-ecommerce';

// Loose schema so this script works regardless of model changes
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

// Round price to nearest integer
const origPrice = (price) => Math.round(price / 0.75);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const discount = 25;

    // Standard prices confirmed by user: A5=280(orig370), A4=470(orig625), A3=750(orig1000)
    // Premium: A5 = Standard+100, A4 = Standard+150, A3 = Standard+200
    const sizes = [
      // ── Standard ──────────────────────────────────────────
      { name: 'A5', tier: 'Standard', dimensions: '5.8 x 8.3 inches',  price: 280, originalPrice: 370 },
      { name: 'A4', tier: 'Standard', dimensions: '8.3 x 11.7 inches', price: 470, originalPrice: 625 },
      { name: 'A3', tier: 'Standard', dimensions: '11.7 x 16.5 inches',price: 750, originalPrice: 1000 },
      // ── Premium (+100 / +150 / +200 over Standard) ────────
      { name: 'A5', tier: 'Premium',  dimensions: '5.8 x 8.3 inches',  price: 380, originalPrice: origPrice(380) },
      { name: 'A4', tier: 'Premium',  dimensions: '8.3 x 11.7 inches', price: 620, originalPrice: origPrice(620) },
      { name: 'A3', tier: 'Premium',  dimensions: '11.7 x 16.5 inches',price: 950, originalPrice: origPrice(950) },
    ];

    // basePrice = lowest Standard price (A5 Standard)
    const basePrice = 280;
    const baseOriginalPrice = 370;

    console.log('Pricing matrix:');
    sizes.forEach(s => {
      const pct = Math.round(((s.originalPrice - s.price) / s.originalPrice) * 100);
      console.log(`  ${s.tier.padEnd(8)} ${s.name}: ৳${s.price}  (orig ৳${s.originalPrice}, ${pct}% off)`);
    });
    console.log(`\nbasePrice: ৳${basePrice}  originalPrice: ৳${baseOriginalPrice}  discount: ${discount}%\n`);

    const result = await Product.updateMany({}, {
      $set: {
        sizes,
        basePrice,
        originalPrice: baseOriginalPrice,
        discount,
      }
    });

    console.log(`✅ Updated ${result.modifiedCount} / ${result.matchedCount} products`);

    // Verify a sample
    const sample = await Product.find({}).limit(2).lean();
    console.log('\nVerification (first 2 products):');
    sample.forEach(p => {
      console.log(`\n  ${p.name}`);
      console.log(`  basePrice: ৳${p.basePrice}  originalPrice: ৳${p.originalPrice}  discount: ${p.discount}%`);
      (p.sizes || []).forEach(s => {
        console.log(`    ${s.tier || 'Standard'} ${s.name}: ৳${s.price} (orig ৳${s.originalPrice})`);
      });
    });

    await mongoose.connection.close();
    console.log('\n✅ Done — connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
