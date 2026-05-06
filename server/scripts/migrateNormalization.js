/**
 * Migration Script: Normalize All Products
 * 
 * This script iterates over every product in the database and computes
 * the normalized fields (normalizedName, normalizedCategory, normalizedTags,
 * searchKeywords, groupKey) WITHOUT modifying original data.
 * 
 * Also seeds the Category collection from all unique normalizedCategory values.
 * 
 * Usage:
 *   node scripts/migrateNormalization.js
 * 
 * Options:
 *   --dry-run    Preview changes without writing to database
 *   --batch=N    Process N products at a time (default: 100)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { computeNormalizedFields, PARENT_CATEGORY_MAP } from '../utils/normalizer.js';

// ── Parse CLI args ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const BATCH_SIZE = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1]) || 100;

// ── Category display names and icons ──────────────────────────────────────
const CATEGORY_META = {
  'football': { displayName: 'Football', icon: '⚽', order: 1 },
  'football-motivational': { displayName: 'Football Motivational', icon: '⚽', order: 2 },
  'cricket': { displayName: 'Cricket', icon: '🏏', order: 3 },
  'ufc': { displayName: 'UFC & MMA', icon: '🥊', order: 4 },
  'nba': { displayName: 'NBA Basketball', icon: '🏀', order: 5 },
  'f1': { displayName: 'Formula 1', icon: '🏁', order: 6 },
  'f1-motivational': { displayName: 'F1 Motivational', icon: '🏎️', order: 7 },
  'sports-cars': { displayName: 'Sports Cars', icon: '🏎️', order: 8 },
  'vintage-cars': { displayName: 'Vintage Cars', icon: '🚗', order: 9 },
  'muscle-cars': { displayName: 'Muscle Cars', icon: '💨', order: 10 },
  'vector-cars': { displayName: 'Vector Cars', icon: '🎨', order: 11 },
  'cars': { displayName: 'All Cars', icon: '🚗', order: 12 },
  'bikes': { displayName: 'Bikes & Motorcycles', icon: '🏍️', order: 13 },
  'marvel': { displayName: 'Marvel', icon: '🦸', order: 14 },
  'dc': { displayName: 'DC Comics', icon: '🦇', order: 15 },
  'movies': { displayName: 'Movies', icon: '🎬', order: 16 },
  'tv-series': { displayName: 'TV Series', icon: '📺', order: 17 },
  'anime': { displayName: 'Anime', icon: '⚡', order: 18 },
  'games': { displayName: 'Games', icon: '🎮', order: 19 },
  'music': { displayName: 'Music', icon: '🎵', order: 20 },
  'motivational': { displayName: 'Motivational', icon: '💪', order: 21 },
  'best-selling': { displayName: 'Best Selling', icon: '🔥', order: 22 },
  'abstract': { displayName: 'Abstract Art', icon: '🎨', order: 23 },
  'minimalist': { displayName: 'Minimalist', icon: '⚪', order: 24 },
  'nature': { displayName: 'Nature', icon: '🌿', order: 25 },
  'typography': { displayName: 'Typography', icon: '✏️', order: 26 },
  'vintage': { displayName: 'Vintage', icon: '📻', order: 27 },
  'modern': { displayName: 'Modern Art', icon: '🔮', order: 28 },
  'sports': { displayName: 'Sports', icon: '🏆', order: 29 },
  'custom': { displayName: 'Custom', icon: '🎯', order: 30 },
  'other': { displayName: 'Other', icon: '📦', order: 31 },
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  VYBE Product Normalization Migration');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mode:       ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '✏️  LIVE (writing to DB)'}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log('');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store', {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('✅ Connected to MongoDB\n');

  // ── Step 1: Count products ──────────────────────────────────────────────
  const totalProducts = await Product.countDocuments();
  console.log(`📦 Total products: ${totalProducts}\n`);

  if (totalProducts === 0) {
    console.log('⚠️  No products found. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // ── Step 2: Process products in batches ─────────────────────────────────
  let processed = 0;
  let updated = 0;
  let errors = 0;
  const categoryCounts = {};

  const cursor = Product.find({}).cursor({ batchSize: BATCH_SIZE });

  console.log('🔄 Processing products...\n');

  const bulkOps = [];

  for await (const product of cursor) {
    try {
      const normalized = computeNormalizedFields(product);

      // Track category counts
      categoryCounts[normalized.normalizedCategory] = 
        (categoryCounts[normalized.normalizedCategory] || 0) + 1;

      if (!DRY_RUN) {
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                normalizedName: normalized.normalizedName,
                normalizedCategory: normalized.normalizedCategory,
                normalizedTags: normalized.normalizedTags,
                searchKeywords: normalized.searchKeywords,
                groupKey: normalized.groupKey,
              },
            },
          },
        });

        // Execute bulk when batch is full
        if (bulkOps.length >= BATCH_SIZE) {
          const result = await Product.bulkWrite(bulkOps);
          updated += result.modifiedCount;
          bulkOps.length = 0;
        }
      }

      processed++;

      // Progress indicator
      if (processed % 50 === 0 || processed === totalProducts) {
        const pct = Math.round((processed / totalProducts) * 100);
        process.stdout.write(`\r  [${'█'.repeat(Math.floor(pct / 2))}${'░'.repeat(50 - Math.floor(pct / 2))}] ${pct}% (${processed}/${totalProducts})`);
      }
    } catch (err) {
      errors++;
      console.error(`\n❌ Error processing product ${product._id}: ${err.message}`);
    }
  }

  // Execute remaining bulk ops
  if (!DRY_RUN && bulkOps.length > 0) {
    const result = await Product.bulkWrite(bulkOps);
    updated += result.modifiedCount;
  }

  console.log('\n\n');

  // ── Step 3: Print summary ───────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Processed:  ${processed}`);
  console.log(`  Updated:    ${DRY_RUN ? '(dry run)' : updated}`);
  console.log(`  Errors:     ${errors}`);
  console.log('');

  // ── Step 4: Print category distribution ─────────────────────────────────
  console.log('  Category Distribution:');
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCategories) {
    const bar = '█'.repeat(Math.ceil(count / Math.max(...Object.values(categoryCounts)) * 20));
    console.log(`    ${cat.padEnd(25)} ${String(count).padStart(4)} ${bar}`);
  }
  console.log('');

  // ── Step 5: Seed Category collection ────────────────────────────────────
  if (!DRY_RUN) {
    console.log('📂 Seeding Category collection...');
    
    for (const [slug, count] of sortedCategories) {
      const meta = CATEGORY_META[slug] || {
        displayName: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icon: '📦',
        order: 99,
      };

      await Category.findOneAndUpdate(
        { slug },
        {
          $set: {
            name: meta.displayName,
            slug,
            displayName: meta.displayName,
            parent: PARENT_CATEGORY_MAP[slug] || null,
            icon: meta.icon,
            productCount: count,
            isActive: true,
            sortOrder: meta.order,
          },
        },
        { upsert: true, new: true }
      );
    }
    
    const categoryCount = await Category.countDocuments();
    console.log(`✅ ${categoryCount} categories seeded\n`);
  }

  // ── Step 6: Handle text index migration ─────────────────────────────────
  if (!DRY_RUN) {
    console.log('🔍 Rebuilding text indexes...');
    try {
      // Drop old text index if it exists (the one named after fields)
      const indexes = await Product.collection.indexes();
      for (const idx of indexes) {
        // Find old text indexes that aren't our new one
        if (idx.textIndexVersion && idx.name !== 'normalized_text_search') {
          console.log(`  Dropping old text index: ${idx.name}`);
          await Product.collection.dropIndex(idx.name);
        }
      }
      // Ensure the new indexes are built
      await Product.syncIndexes();
      console.log('✅ Indexes rebuilt\n');
    } catch (err) {
      console.log(`⚠️  Index rebuild note: ${err.message}`);
      console.log('   You may need to manually drop the old text index via MongoDB shell:\n');
      console.log('   db.products.dropIndex("name_text_description_text_tags_text")');
      console.log('   Then restart the server to auto-create the new index.\n');
    }
  }

  // ── Done ────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log(DRY_RUN
    ? '  ✅ Dry run complete. No changes were written.'
    : '  ✅ Migration complete! All products normalized.'
  );
  console.log('═══════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
