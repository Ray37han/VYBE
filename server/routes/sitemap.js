import express from 'express';
import Product from '../models/Product.js';
import { getProductImageUrls } from '../utils/cloudinaryTransform.js';

const router = express.Router();

const SITE_URL = 'https://vybebd.store';

const CATEGORIES = [
  'anime', 'marvel', 'dc', 'football', 'football-motivational',
  'cricket', 'ufc', 'nba', 'f1', 'f1-motivational',
  'cars', 'sports-cars', 'vintage-cars', 'muscle-cars', 'vector-cars',
  'bikes', 'music', 'tv-series', 'movies', 'games',
  'motivational', 'abstract', 'minimalist', 'nature',
  'typography', 'vintage', 'modern', 'best-selling',
];

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

// GET /api/sitemap — dynamic XML sitemap
router.get('/sitemap', async (req, res) => {
  try {
    // Fetch all active products (only fields needed for sitemap)
    const products = await Product.find(
      { isActive: true },
      '_id name updatedAt category images'
    ).lean();

    const today = formatDate(new Date());

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/products</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/customize</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Category Pages -->
${CATEGORIES.map(cat => `  <url>
    <loc>${SITE_URL}/products?category=${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Product Pages -->
${products.map(product => {
  const lastmod = formatDate(product.updatedAt || new Date());
  const loc = `${SITE_URL}/products/${product._id}`;

  // Get thumbnail URL from first image
  let imageUrl = '';
  if (product.images && product.images.length > 0) {
    const firstImg = product.images[0];
    imageUrl = firstImg.urls?.medium || firstImg.urls?.thumbnail || firstImg.url || '';
    // If we only have publicId, generate the URL
    if (!imageUrl && firstImg.publicId) {
      try {
        const urls = getProductImageUrls(firstImg.publicId);
        imageUrl = urls.medium || urls.thumbnail || '';
      } catch {
        // skip
      }
    }
  }

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageUrl ? `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>` : ''}
  </url>`;
}).join('\n')}

</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600'); // cache 1 hour
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
