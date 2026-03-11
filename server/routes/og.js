import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();
const SITE_URL = 'https://vybebd.store';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * GET /api/og/product/:id
 * Returns a minimal HTML page with full OG/Twitter meta tags for social media crawlers.
 * Vercel Edge Middleware rewrites product page requests from bots to this endpoint.
 */
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('name description category basePrice stock images rating tags')
      .lean();

    if (!product) {
      return res.status(404).send('Not found');
    }

    const title = escapeHtml(`${product.name} | Buy Poster Online Bangladesh | VYBE`);
    const desc = escapeHtml((product.description || `Premium ${product.category || ''} poster from VYBE Bangladesh`).slice(0, 200));
    const url = `${SITE_URL}/products/${product._id}`;
    const imageUrl = product.images?.[0]?.urls?.large
      || product.images?.[0]?.urls?.medium
      || product.images?.[0]?.url
      || `${SITE_URL}/og-image.jpg`;
    const price = product.basePrice || 0;
    const inStock = (product.stock || 0) > 0;

    // JSON-LD Product schema
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images?.map(img => img.urls?.large || img.urls?.medium || img.url).filter(Boolean),
      sku: String(product._id),
      brand: { '@type': 'Brand', name: 'VYBE' },
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'BDT',
        price,
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'VYBE' },
      },
      ...(product.rating?.count > 0 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating.average,
          reviewCount: product.rating.count,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="description" content="${desc}"/>
  <link rel="canonical" href="${escapeHtml(url)}"/>

  <meta property="og:type" content="product"/>
  <meta property="og:site_name" content="VYBE"/>
  <meta property="og:url" content="${escapeHtml(url)}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:image" content="${escapeHtml(imageUrl)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="product:price:amount" content="${price}"/>
  <meta property="product:price:currency" content="BDT"/>

  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}"/>

  <script type="application/ld+json">${jsonLd}</script>

  <!-- Redirect browsers (non-bots) to the SPA -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}"/>
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <img src="${escapeHtml(imageUrl)}" alt="${title}" width="600"/>
  <p>Price: ৳${price}</p>
  <a href="${escapeHtml(url)}">View on VYBE</a>
</body>
</html>`;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    console.error('OG render error:', error);
    res.status(500).send('Error');
  }
});

export default router;
