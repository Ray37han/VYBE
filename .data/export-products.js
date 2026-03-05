const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

const MONGODB_URI = 'mongodb+srv://2303037_db_user:kALl4kOIAR6mUefP@cluster0.p6xeucy.mongodb.net/vybe-store?retryWrites=true&w=majority';

async function exportProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const products = await Product.find({}).lean();
    console.log(`📦 Found ${products.length} products`);
    
    // Export as JSON
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      platform: 'VYBE',
      source: 'vybebd.store',
      products: products
    };
    
    fs.writeFileSync('vybe-products.json', JSON.stringify(jsonData, null, 2));
    console.log('✅ JSON exported to: vybe-products.json');
    
    // Export as CSV
    const fields = ['_id', 'name', 'description', 'category', 'basePrice', 'stock', 'sold', 'featured', 'customizable', 'isActive', 'images', 'tags'];
    const csvRows = [fields.join(',')];
    
    products.forEach(p => {
      const images = p.images ? p.images.map(img => img.publicId || img.url).join(';') : '';
      const tags = p.tags ? p.tags.join(';') : '';
      
      const row = [
        p._id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        p.category || '',
        p.basePrice || 0,
        p.stock || 0,
        p.sold || 0,
        p.featured || false,
        p.customizable || false,
        p.isActive !== false,
        `"${images}"`,
        `"${tags}"`
      ];
      csvRows.push(row.join(','));
    });
    
    fs.writeFileSync('vybe-products.csv', csvRows.join('\n'));
    console.log('✅ CSV exported to: vybe-products.csv');
    
    console.log('\n🎉 Export complete!');
    console.log('📁 Files are in:', __dirname);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

exportProducts();
