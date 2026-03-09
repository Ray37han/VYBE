import Product from '../models/Product.js';

/**
 * Import Service - Bulk Image Upload → Auto Product Generation
 *
 * Handles filename parsing, category detection, pricing rules,
 * slug generation, and duplicate detection.
 */

// ─── Category Detection Keywords ────────────────────────────────
const CATEGORY_KEYWORDS = {
  // Vehicles
  'bikes':          ['bike', 'motorcycle', 'ducati', 'yamaha', 'kawasaki', 'harley', 'honda-bike', 'superbike', 'motorbike'],
  'sports-cars':    ['sports-car', 'sportscar', 'lamborghini', 'ferrari', 'mclaren', 'porsche', 'bugatti', 'koenigsegg', 'pagani'],
  'vintage-cars':   ['vintage-car', 'classic-car', 'retro-car', 'oldtimer', 'mustang-classic'],
  'muscle-cars':    ['muscle-car', 'mustang', 'camaro', 'charger', 'challenger', 'corvette', 'gto', 'firebird'],
  'vector-cars':    ['vector-car', 'vector-art-car', 'neon-car', 'synthwave-car'],
  'cars':           ['car', 'automobile', 'vehicle', 'sedan', 'suv', 'truck', 'jdm', 'nissan', 'toyota', 'bmw', 'mercedes', 'audi'],

  // Sports
  'football':              ['football', 'soccer', 'messi', 'ronaldo', 'neymar', 'mbappe', 'haaland', 'premier-league', 'fifa', 'la-liga', 'ucl'],
  'football-motivational': ['football-motivational', 'football-motivation', 'soccer-motivation'],
  'cricket':               ['cricket', 'ipl', 'virat', 'kohli', 'dhoni', 'sachin', 'babar', 'shakib', 'tamim', 'mushfiq', 'bangladesh-cricket'],
  'ufc':                   ['ufc', 'mma', 'conor', 'mcgregor', 'khabib', 'fighter', 'boxing', 'muay-thai'],
  'nba':                   ['nba', 'basketball', 'lebron', 'jordan', 'kobe', 'curry', 'lakers', 'bulls'],
  'f1':                    ['f1', 'formula-1', 'formula1', 'hamilton', 'verstappen', 'leclerc', 'racing'],
  'f1-motivational':       ['f1-motivational', 'f1-motivation', 'racing-motivation'],
  'sports':                ['sports', 'athletic', 'athlete', 'fitness', 'gym', 'sport'],

  // Entertainment
  'marvel':     ['marvel', 'avengers', 'spider-man', 'spiderman', 'iron-man', 'ironman', 'thor', 'hulk', 'captain-america', 'wolverine', 'deadpool', 'black-panther', 'doctor-strange', 'mcu'],
  'dc':         ['dc', 'batman', 'superman', 'joker', 'wonder-woman', 'flash', 'aquaman', 'justice-league', 'dark-knight', 'harley-quinn'],
  'anime':      ['anime', 'manga', 'naruto', 'one-piece', 'onepiece', 'dragon-ball', 'dragonball', 'goku', 'attack-on-titan', 'aot', 'demon-slayer', 'jujutsu', 'death-note', 'hunter-x-hunter', 'my-hero', 'bleach', 'chainsaw-man', 'spy-x-family', 'tokyo-ghoul', 'fullmetal', 'cowboy-bebop', 'evangelion', 'one-punch', 'mob-psycho', 'vinland', 'berserk', 'jojo'],
  'movies':     ['movie', 'film', 'cinema', 'hollywood', 'bollywood', 'star-wars', 'starwars', 'lord-of-the-rings', 'lotr', 'harry-potter', 'matrix', 'inception', 'interstellar', 'godfather', 'pulp-fiction', 'fight-club', 'john-wick'],
  'tv-series':  ['tv-series', 'series', 'breaking-bad', 'game-of-thrones', 'got', 'stranger-things', 'peaky-blinders', 'money-heist', 'squid-game', 'wednesday', 'the-witcher', 'mandalorian'],
  'music':      ['music', 'musician', 'singer', 'rapper', 'band', 'rock', 'hip-hop', 'hiphop', 'travis-scott', 'kanye', 'eminem', 'weeknd', 'drake', 'beatles', 'pink-floyd', 'nirvana', 'metallica', 'bts', 'blackpink'],
  'games':      ['game', 'gaming', 'gamer', 'ps5', 'xbox', 'nintendo', 'valorant', 'fortnite', 'minecraft', 'gta', 'elden-ring', 'cyberpunk', 'zelda', 'god-of-war', 'last-of-us', 'resident-evil', 'call-of-duty', 'cod', 'overwatch', 'league', 'dota'],

  // Styles
  'motivational': ['motivational', 'motivation', 'inspire', 'inspirational', 'hustle', 'grind', 'success', 'mindset', 'never-give-up', 'believe', 'dream'],
  'abstract':     ['abstract', 'geometric', 'surreal', 'psychedelic', 'fractal', 'trippy'],
  'minimalist':   ['minimalist', 'minimal', 'simple', 'clean', 'line-art', 'lineart'],
  'nature':       ['nature', 'landscape', 'mountain', 'ocean', 'forest', 'sunset', 'sunrise', 'beach', 'sky', 'aurora', 'waterfall'],
  'typography':   ['typography', 'quote', 'lettering', 'text-art', 'calligraphy', 'word-art'],
  'vintage':      ['vintage', 'retro', 'classic', 'old-school', 'nostalgia', '80s', '90s', 'vaporwave'],
  'modern':       ['modern', 'contemporary', 'futuristic', 'sci-fi', 'scifi', 'cyber', 'neon'],
};

// ─── Price Rules by Category ────────────────────────────────────
const PRICE_RULES = {
  // Premium categories
  'sports-cars':    { basePrice: 299, originalPrice: 499 },
  'vintage-cars':   { basePrice: 299, originalPrice: 499 },
  'muscle-cars':    { basePrice: 279, originalPrice: 449 },
  'vector-cars':    { basePrice: 249, originalPrice: 399 },
  'bikes':          { basePrice: 249, originalPrice: 399 },
  'cars':           { basePrice: 249, originalPrice: 399 },

  // Entertainment - Popular
  'marvel':         { basePrice: 249, originalPrice: 399 },
  'dc':             { basePrice: 249, originalPrice: 399 },
  'anime':          { basePrice: 229, originalPrice: 379 },
  'games':          { basePrice: 229, originalPrice: 379 },

  // Sports
  'football':              { basePrice: 229, originalPrice: 379 },
  'football-motivational': { basePrice: 199, originalPrice: 349 },
  'cricket':               { basePrice: 229, originalPrice: 379 },
  'ufc':                   { basePrice: 229, originalPrice: 379 },
  'nba':                   { basePrice: 229, originalPrice: 379 },
  'f1':                    { basePrice: 249, originalPrice: 399 },
  'f1-motivational':       { basePrice: 199, originalPrice: 349 },
  'sports':                { basePrice: 199, originalPrice: 349 },

  // Entertainment - Other
  'movies':         { basePrice: 199, originalPrice: 349 },
  'tv-series':      { basePrice: 199, originalPrice: 349 },
  'music':          { basePrice: 199, originalPrice: 349 },

  // Styles
  'motivational':   { basePrice: 179, originalPrice: 299 },
  'abstract':       { basePrice: 199, originalPrice: 349 },
  'minimalist':     { basePrice: 179, originalPrice: 299 },
  'nature':         { basePrice: 199, originalPrice: 349 },
  'typography':     { basePrice: 179, originalPrice: 299 },
  'vintage':        { basePrice: 199, originalPrice: 349 },
  'modern':         { basePrice: 199, originalPrice: 349 },

  // Default
  'other':          { basePrice: 199, originalPrice: 349 },
};

// Standard poster sizes with fixed pricing
// A5: 280 (orig 375), A4: 470 (orig 625), A3: 750 (orig 1000)
const DEFAULT_SIZES = [
  { name: 'A5', tier: 'Standard', dimensions: '5.8 x 8.3 inches', price: 280, originalPrice: 375 },
  { name: 'A4', tier: 'Standard', dimensions: '8.3 x 11.7 inches', price: 470, originalPrice: 625 },
  { name: 'A3', tier: 'Standard', dimensions: '11.7 x 16.5 inches', price: 750, originalPrice: 1000 },
];

function getSizesWithPricing(basePrice, originalPrice) {
  // Fixed prices for all products — A5/A4/A3
  return [
    { name: 'A5', tier: 'Standard', dimensions: '5.8 x 8.3 inches', price: 280, originalPrice: 375 },
    { name: 'A4', tier: 'Standard', dimensions: '8.3 x 11.7 inches', price: 470, originalPrice: 625 },
    { name: 'A3', tier: 'Standard', dimensions: '11.7 x 16.5 inches', price: 750, originalPrice: 1000 },
  ];
}

// ─── Filename Parser ────────────────────────────────────────────

/**
 * Parse a filename into a product title
 * "naruto-shippuden-poster_v2.jpg" → "Naruto Shippuden Poster V2"
 */
export function parseFilename(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Replace separators with spaces
  let cleaned = nameWithoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove trailing version/number patterns like "v2", "copy", "(1)"
  cleaned = cleaned
    .replace(/\s+v\d+$/i, '')
    .replace(/\s+copy$/i, '')
    .replace(/\s*\(?\d+\)?$/g, '')
    .trim();

  // Title case
  const title = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return title || 'Untitled Poster';
}

// ─── Category Detector ──────────────────────────────────────────

/**
 * Detect category from filename keywords
 * Returns the best matching category or 'other'
 */
export function detectCategory(filename) {
  const normalized = filename
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')  // remove extension
    .replace(/[-_]+/g, '-')     // normalize separators
    .replace(/\s+/g, '-');

  let bestMatch = { category: 'other', score: 0 };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        // Longer keyword matches get higher priority
        const score = keyword.length;
        if (score > bestMatch.score) {
          bestMatch = { category, score };
        }
      }
    }
  }

  return bestMatch.category;
}

// ─── Slug Generator ─────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a title
 * "Naruto Shippuden Poster" → "naruto-shippuden-poster"
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // remove special chars
    .replace(/\s+/g, '-')      // spaces to hyphens
    .replace(/-+/g, '-')       // collapse multiple hyphens
    .replace(/^-|-$/g, '');    // trim hyphens
}

/**
 * Ensure slug uniqueness by checking DB and appending counter if needed
 */
export async function ensureUniqueSlug(baseSlug) {
  // Check if any product with this slug (stored in name) exists
  const existing = await Product.find({
    name: { $regex: new RegExp(`^${baseSlug.replace(/-/g, '[ -]')}(\\s*\\|\\|\\s*#\\d+)?$`, 'i') }
  }).select('name').lean();

  if (existing.length === 0) return baseSlug;

  // Find next available number
  let counter = 2;
  while (true) {
    const candidate = `${baseSlug}-${counter}`;
    const namePattern = candidate.replace(/-/g, '[ -]');
    const found = await Product.findOne({
      name: { $regex: new RegExp(`^${namePattern}(\\s*\\|\\|\\s*#\\d+)?$`, 'i') }
    }).select('_id').lean();

    if (!found) return candidate;
    counter++;
    if (counter > 1000) return `${baseSlug}-${Date.now()}`; // safety valve
  }
}

// ─── Price Rule Engine ──────────────────────────────────────────

/**
 * Get pricing for a category. Supports custom overrides.
 */
export function getPricing(category, overrides = {}) {
  const rules = PRICE_RULES[category] || PRICE_RULES['other'];
  return {
    basePrice: overrides.basePrice || rules.basePrice,
    originalPrice: overrides.originalPrice || rules.originalPrice,
  };
}

// ─── Full Pipeline ──────────────────────────────────────────────

/**
 * Process a single filename into product data (without image upload)
 * Returns preview data for admin review before import
 */
export function previewProduct(filename) {
  const title = parseFilename(filename);
  const category = detectCategory(filename);
  const slug = generateSlug(title);
  const { basePrice, originalPrice } = getPricing(category);

  return {
    filename,
    title,
    slug,
    category,
    basePrice,
    originalPrice,
    sizes: getSizesWithPricing(basePrice, originalPrice),
    description: `High-quality ${category.replace(/-/g, ' ')} poster - ${title}`,
    tags: generateTags(title, category),
  };
}

/**
 * Generate tags from title and category
 */
function generateTags(title, category) {
  const tags = new Set();

  // Add category as tag
  tags.add(category.replace(/-/g, ' '));

  // Add individual words from title (skip short words)
  title.split(' ').forEach(word => {
    if (word.length > 2) {
      tags.add(word.toLowerCase());
    }
  });

  // Add 'poster' tag
  tags.add('poster');
  tags.add('wall art');

  return [...tags].slice(0, 10); // max 10 tags
}

/**
 * Build final product data ready for DB insertion
 */
export function buildProductData(preview, imageData, overrides = {}) {
  const finalCategory = overrides.category || preview.category;

  return {
    name: overrides.title || preview.title,
    description: overrides.description || preview.description,
    category: finalCategory,
    images: [imageData],
    sizes: getSizesWithPricing(),
    basePrice: 470,         // A4 selling price
    originalPrice: 625,     // A4 original price
    discount: 25,
    stock: overrides.stock ?? 100,
    tags: preview.tags,
    isActive: true,
    newArrival: true,
    featured: false,
  };
}

export { CATEGORY_KEYWORDS, PRICE_RULES, DEFAULT_SIZES, getSizesWithPricing };
