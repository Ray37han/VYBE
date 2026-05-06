/**
 * Product Data Normalization Utility
 * 
 * Handles all text normalization, category mapping, tag cleaning,
 * keyword generation, and group key computation.
 * 
 * NON-DESTRUCTIVE: This utility only generates computed fields.
 * Original product data is NEVER modified.
 */

// ─── Category Mapping System ──────────────────────────────────────────────────
// Maps common variations to canonical category slugs.
// Fallback: normalize the string directly if not in the map.
const CATEGORY_MAP = {
  // Football
  'football': 'football',
  'Football': 'football',
  'FOOTBALL': 'football',
  'soccer': 'football',
  'football-motivational': 'football-motivational',
  'Football Motivational': 'football-motivational',

  // Marvel
  'marvel': 'marvel',
  'Marvel': 'marvel',
  'MARVEL': 'marvel',
  'Marvel Studios': 'marvel',
  'marvel studios': 'marvel',
  'MARVEL STUDIOS': 'marvel',

  // DC
  'dc': 'dc',
  'DC': 'dc',
  'DC Comics': 'dc',
  'dc comics': 'dc',

  // Sports Cars
  'sports-cars': 'sports-cars',
  'sports car': 'sports-cars',
  'Sports Car': 'sports-cars',
  'sports cars': 'sports-cars',
  'Sports Cars': 'sports-cars',

  // Vintage Cars
  'vintage-cars': 'vintage-cars',
  'vintage car': 'vintage-cars',
  'Vintage Cars': 'vintage-cars',

  // Muscle Cars
  'muscle-cars': 'muscle-cars',
  'muscle car': 'muscle-cars',
  'Muscle Cars': 'muscle-cars',

  // Vector Cars
  'vector-cars': 'vector-cars',
  'vector car': 'vector-cars',
  'Vector Cars': 'vector-cars',

  // Cars (general)
  'cars': 'cars',
  'Cars': 'cars',
  'CARS': 'cars',

  // Bikes
  'bikes': 'bikes',
  'Bikes': 'bikes',
  'BIKES': 'bikes',
  'motorcycle': 'bikes',
  'motorcycles': 'bikes',

  // F1
  'f1': 'f1',
  'F1': 'f1',
  'formula 1': 'f1',
  'Formula 1': 'f1',
  'f1-motivational': 'f1-motivational',

  // Cricket
  'cricket': 'cricket',
  'Cricket': 'cricket',
  'CRICKET': 'cricket',

  // UFC
  'ufc': 'ufc',
  'UFC': 'ufc',
  'mma': 'ufc',
  'MMA': 'ufc',

  // NBA
  'nba': 'nba',
  'NBA': 'nba',
  'basketball': 'nba',

  // Movies
  'movies': 'movies',
  'Movies': 'movies',
  'MOVIES': 'movies',
  'movie': 'movies',

  // TV Series
  'tv-series': 'tv-series',
  'TV Series': 'tv-series',
  'tv series': 'tv-series',
  'series': 'tv-series',

  // Music
  'music': 'music',
  'Music': 'music',
  'MUSIC': 'music',

  // Games
  'games': 'games',
  'Games': 'games',
  'GAMES': 'games',
  'gaming': 'games',

  // Motivational
  'motivational': 'motivational',
  'Motivational': 'motivational',
  'MOTIVATIONAL': 'motivational',

  // Best Selling
  'best-selling': 'best-selling',
  'Best Selling': 'best-selling',
  'bestselling': 'best-selling',

  // Sports (general)
  'sports': 'sports',
  'Sports': 'sports',

  // Anime
  'anime': 'anime',
  'Anime': 'anime',
  'ANIME': 'anime',

  // Abstract
  'abstract': 'abstract',
  'Abstract': 'abstract',

  // Minimalist
  'minimalist': 'minimalist',
  'Minimalist': 'minimalist',

  // Nature
  'nature': 'nature',
  'Nature': 'nature',

  // Typography
  'typography': 'typography',
  'Typography': 'typography',

  // Custom
  'custom': 'custom',
  'Custom': 'custom',

  // Vintage
  'vintage': 'vintage',
  'Vintage': 'vintage',

  // Modern
  'modern': 'modern',
  'Modern': 'modern',

  // Other
  'other': 'other',
  'Other': 'other',
};

// ─── Stop words to skip when building group keys ──────────────────────────────
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'that', 'this', 'are', 'was',
  'be', 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would',
  'poster', 'posters', 'print', 'prints', 'wall', 'art', 'premium',
  'restored', 'high', 'quality', 'hd', 'official', 'original',
]);

// ─── Poster keyword enrichment ────────────────────────────────────────────────
const POSTER_KEYWORDS = ['poster', 'wall art', 'premium poster', 'print', 'wall decor'];

// ─── Parent category mapping for hierarchy ────────────────────────────────────
export const PARENT_CATEGORY_MAP = {
  'football': 'sports',
  'football-motivational': 'sports',
  'cricket': 'sports',
  'ufc': 'sports',
  'nba': 'sports',
  'f1': 'motorsport',
  'f1-motivational': 'motorsport',
  'sports-cars': 'cars',
  'vintage-cars': 'cars',
  'muscle-cars': 'cars',
  'vector-cars': 'cars',
  'marvel': 'entertainment',
  'dc': 'entertainment',
  'movies': 'entertainment',
  'tv-series': 'entertainment',
  'anime': 'entertainment',
  'games': 'entertainment',
  'music': 'entertainment',
  'motivational': 'lifestyle',
  'abstract': 'art',
  'minimalist': 'art',
  'nature': 'art',
  'typography': 'art',
  'modern': 'art',
  'vintage': 'art',
  'bikes': 'vehicles',
  'best-selling': null,
  'custom': null,
  'other': null,
  'sports': null,
  'cars': 'vehicles',
};


// ═══════════════════════════════════════════════════════════════════════════════
// CORE NORMALIZATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fix common encoding issues in product names.
 * Handles mojibake (UTF-8 decoded as Latin-1), curly quotes, non-breaking spaces, etc.
 */
export function fixEncoding(text) {
  if (!text) return '';

  let fixed = text;

  // Fix common mojibake patterns
  const mojibakeMap = {
    'â€™': "'",    // Right single quote
    'â€œ': '"',    // Left double quote
    'â€\u009d': '"',    // Right double quote
    'â€"': '–',    // En dash
    'â€"': '—',    // Em dash
    'â€¢': '•',    // Bullet
    'â€¦': '…',    // Ellipsis
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã¼': 'ü',
    'Ã¶': 'ö',
    'Ã¤': 'ä',
    'Ã±': 'ñ',
    'Ã ': 'à',
    'Â®': '®',
    'â„¢': '™',
    'Â©': '©',
    'Ã‰': 'É',
    'ï¼': ':',      // Fullwidth colon
    'ï¼ˆ': '(',    // Fullwidth left paren
    'ï¼‰': ')',    // Fullwidth right paren
  };

  for (const [bad, good] of Object.entries(mojibakeMap)) {
    fixed = fixed.replaceAll(bad, good);
  }

  // Replace curly/smart quotes with straight quotes
  fixed = fixed.replace(/[\u2018\u2019]/g, "'");
  fixed = fixed.replace(/[\u201C\u201D]/g, '"');

  // Replace non-breaking space with regular space
  fixed = fixed.replace(/\u00A0/g, ' ');

  // Remove zero-width characters
  fixed = fixed.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

  return fixed;
}

/**
 * Normalize a text string:
 * 1. Fix encoding issues
 * 2. Convert to lowercase
 * 3. Remove special characters (keep alphanumeric, spaces, hyphens)
 * 4. Collapse multiple spaces
 * 5. Trim
 */
export function normalizeText(text) {
  if (!text) return '';

  let normalized = fixEncoding(text);
  normalized = normalized.toLowerCase();
  // Keep alphanumeric, spaces, hyphens
  normalized = normalized.replace(/[^a-z0-9\s\-]/g, '');
  // Collapse multiple spaces/hyphens
  normalized = normalized.replace(/\s+/g, ' ');
  normalized = normalized.replace(/-+/g, '-');
  return normalized.trim();
}

/**
 * Normalize a category string using the mapping system.
 * Falls back to direct normalization if not in the map.
 */
export function normalizeCategory(category) {
  if (!category) return 'other';

  // Check direct mapping first
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }

  // Check case-insensitive mapping
  const trimmed = category.trim();
  if (CATEGORY_MAP[trimmed]) {
    return CATEGORY_MAP[trimmed];
  }

  // Fallback: normalize the string directly into a slug
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Normalize tags:
 * 1. Split by comma or semicolon
 * 2. Clean each tag
 * 3. Remove duplicates
 * 4. Remove empty strings
 */
export function normalizeTags(tags) {
  if (!tags || !Array.isArray(tags)) return [];

  const cleaned = new Set();

  for (const tag of tags) {
    if (!tag || typeof tag !== 'string') continue;

    // Split by comma or semicolon (in case multiple tags are stuffed into one)
    const parts = tag.split(/[,;]+/);

    for (const part of parts) {
      const normalized = normalizeText(part);
      if (normalized && normalized.length > 1) {
        cleaned.add(normalized);
      }
    }
  }

  return [...cleaned];
}

/**
 * Build search keywords by combining:
 * - normalizedName words
 * - normalizedCategory
 * - normalizedTags
 * - Poster-specific enrichment keywords
 * 
 * Returns a deduplicated, sorted array of keywords.
 */
export function buildSearchKeywords(normalizedName, normalizedCategory, normalizedTags) {
  const keywords = new Set();

  // Add all words from the normalized name
  if (normalizedName) {
    for (const word of normalizedName.split(/\s+/)) {
      if (word.length > 1) keywords.add(word);
    }
  }

  // Add category
  if (normalizedCategory) {
    keywords.add(normalizedCategory);
    // Also add without hyphens (e.g., "sports-cars" → "sports", "cars")
    for (const part of normalizedCategory.split('-')) {
      if (part.length > 1) keywords.add(part);
    }
  }

  // Add all tags
  if (normalizedTags && Array.isArray(normalizedTags)) {
    for (const tag of normalizedTags) {
      keywords.add(tag);
      // Also add individual words from multi-word tags
      for (const word of tag.split(/\s+/)) {
        if (word.length > 1) keywords.add(word);
      }
    }
  }

  // Add poster-related keywords for discoverability
  for (const kw of POSTER_KEYWORDS) {
    keywords.add(kw);
  }

  // Add parent category if available
  if (normalizedCategory && PARENT_CATEGORY_MAP[normalizedCategory]) {
    keywords.add(PARENT_CATEGORY_MAP[normalizedCategory]);
  }

  return [...keywords].sort();
}

/**
 * Create a group key for grouping similar products.
 * Extracts first 2-3 meaningful words from the normalized name,
 * skipping stop words.
 * 
 * Examples:
 * "porsche 911 gt1 racing poster" → "porsche-911"
 * "lionel messi barcelona celebration" → "lionel-messi"
 * "the dark knight returns" → "dark-knight"
 */
export function createGroupKey(normalizedName) {
  if (!normalizedName) return 'unknown';

  const words = normalizedName.split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 1);

  if (words.length === 0) return 'unknown';
  if (words.length === 1) return words[0];

  // Take first 2-3 meaningful words
  const keyWords = words.slice(0, Math.min(3, words.length));
  return keyWords.join('-');
}

/**
 * Compute all normalized fields for a single product document.
 * Returns an object with the new fields only — does NOT modify original data.
 * 
 * @param {Object} product - Raw product document from MongoDB
 * @returns {Object} Computed normalized fields
 */
export function computeNormalizedFields(product) {
  const normalizedName = normalizeText(product.name);
  const normalizedCategory = normalizeCategory(product.category);
  const normalizedTags = normalizeTags(product.tags || []);
  const searchKeywords = buildSearchKeywords(normalizedName, normalizedCategory, normalizedTags);
  const groupKey = createGroupKey(normalizedName);

  return {
    normalizedName,
    normalizedCategory,
    normalizedTags,
    searchKeywords,
    groupKey,
  };
}

export default {
  fixEncoding,
  normalizeText,
  normalizeCategory,
  normalizeTags,
  buildSearchKeywords,
  createGroupKey,
  computeNormalizedFields,
  PARENT_CATEGORY_MAP,
};
