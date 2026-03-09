import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * MongoDB Index Migration Script
 * Ensures all performance-critical indexes exist on the products collection.
 * Safe to run multiple times — createIndex is idempotent.
 * 
 * Usage: node server/scripts/migrate-indexes.js
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store';

const indexes = [
  // Text search on name, description, tags
  { spec: { name: 'text', description: 'text', tags: 'text' }, name: 'text_search' },
  
  // Existing single-field indexes
  { spec: { createdAt: -1 }, name: 'createdAt_desc' },
  { spec: { basePrice: 1 }, name: 'basePrice_asc' },
  { spec: { sold: -1 }, name: 'sold_desc' },
  { spec: { 'rating.average': -1 }, name: 'rating_avg_desc' },
  
  // Existing compound indexes
  { spec: { category: 1, featured: -1 }, name: 'category_featured' },
  { spec: { category: 1, isActive: 1 }, name: 'category_active' },
  { spec: { featured: -1, createdAt: -1 }, name: 'featured_newest' },
  
  // NEW compound indexes for common query patterns
  { spec: { category: 1, basePrice: 1 }, name: 'category_price_asc' },
  { spec: { category: 1, basePrice: -1 }, name: 'category_price_desc' },
  { spec: { category: 1, createdAt: -1 }, name: 'category_newest' },
  { spec: { category: 1, sold: -1 }, name: 'category_trending' },
  { spec: { isActive: 1, createdAt: -1 }, name: 'active_newest' },
  { spec: { isActive: 1, basePrice: 1 }, name: 'active_price_asc' },
  { spec: { isActive: 1, sold: -1 }, name: 'active_trending' },
  { spec: { isActive: 1, 'rating.average': -1 }, name: 'active_rated' },
  { spec: { bestSelling: 1, sold: -1 }, name: 'bestselling_sold' },
  { spec: { newArrival: 1, createdAt: -1 }, name: 'newarrival_newest' },
];

async function migrateIndexes() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');

  const db = mongoose.connection.db;
  const collection = db.collection('products');

  // List existing indexes
  const existingIndexes = await collection.indexes();
  console.log(`📋 Existing indexes: ${existingIndexes.length}`);
  existingIndexes.forEach(idx => {
    console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });
  console.log('');

  // Create new indexes
  let created = 0;
  let skipped = 0;

  for (const idx of indexes) {
    try {
      // Text indexes need special handling — only one allowed per collection
      if (idx.name === 'text_search') {
        const hasTextIndex = existingIndexes.some(e => 
          Object.values(e.key).includes('text')
        );
        if (hasTextIndex) {
          console.log(`⏭️  Text index already exists, skipping`);
          skipped++;
          continue;
        }
      }

      await collection.createIndex(idx.spec, { name: idx.name, background: true });
      console.log(`✅ Created index: ${idx.name} → ${JSON.stringify(idx.spec)}`);
      created++;
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        // Index already exists with same spec or different name
        console.log(`⏭️  Index ${idx.name} already exists, skipping`);
        skipped++;
      } else {
        console.error(`❌ Failed to create ${idx.name}:`, error.message);
      }
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);

  // Show final index list
  const finalIndexes = await collection.indexes();
  console.log(`\n📋 Final indexes: ${finalIndexes.length}`);
  finalIndexes.forEach(idx => {
    console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  await mongoose.connection.close();
  console.log('\n👋 Done');
}

migrateIndexes().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
