/**
 * Migration Script: Convert private Cloudinary images to public
 * This script updates the image type in Cloudinary from 'private' to 'upload' (public)
 * so they can be accessed without signed URLs
 */

import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateImages() {
  try {
    console.log('🚀 Starting image migration...\n');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      console.log(`\n📝 Processing: ${product.name}`);
      
      if (!product.images || product.images.length === 0) {
        console.log('  ⚠️  No images found, skipping');
        continue;
      }

      for (const image of product.images) {
        if (!image.publicId) {
          console.log(`  ⚠️  No publicId for image, skipping`);
          continue;
        }

        try {
          // Try to access the private image first
          const privateId = image.publicId;
          
          console.log(`  🔄 Migrating: ${privateId}`);

          // Option 1: Make the existing private image public by updating metadata
          // This changes the delivery type without re-uploading
          await cloudinary.api.update(privateId, {
            type: 'private',
            access_mode: 'public', // Make it publicly accessible
          });

          console.log(`  ✅ Successfully made public: ${privateId}`);
          successCount++;

        } catch (error) {
          // If image doesn't exist as private, it might already be public
          if (error.error && error.error.http_code === 404) {
            console.log(`  ℹ️  Image not found as private (might already be public)`);
          } else {
            console.log(`  ❌ Error: ${error.message}`);
            errorCount++;
          }
        }
      }
    }

    console.log(`\n\n========================================`);
    console.log(`✅ Migration complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateImages();
