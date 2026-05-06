import express from 'express';
import Product from '../models/Product.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { paginate, parsePaginationParams } from '../utils/pagination.js';
import { transformProductsImages, transformProductImages } from '../utils/cloudinaryTransform.js';

const router = express.Router();

// Cache TTL from env or default 60s
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 60;
const CACHE_TTL_SINGLE = parseInt(process.env.CACHE_TTL_SINGLE) || 120;

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCED PRODUCT LISTING WITH NORMALIZED FILTERS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      featured,
      tag,
      inStock,
      page,
      limit,
      sortBy,
      order,
      sort: sortParam
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    // ── Category filter (use normalizedCategory if available, fallback to original) ──
    if (category) {
      if (category.includes(',')) {
        const categories = category.split(',').map(cat => cat.trim().toLowerCase());
        query.$or = [
          { normalizedCategory: { $in: categories } },
          { category: { $in: category.split(',').map(c => c.trim()) } },
        ];
      } else {
        query.$or = [
          { normalizedCategory: category.toLowerCase() },
          { category: category },
        ];
      }
    }

    // ── Tag filter (uses normalizedTags) ──
    if (tag) {
      const tags = tag.split(',').map(t => t.trim().toLowerCase());
      query.normalizedTags = { $in: tags };
    }

    // ── Stock filter ──
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      // Use text search for exact/stem matching
      query.$text = { $search: search };
    }

    // Parse pagination params (supports both legacy sortBy/order and new sort=price_asc)
    const { page: pageNum, limit: limitNum, sort } = parsePaginationParams(req.query);

    let result;
    if (sort === 'mixed') {
      const skip = (pageNum - 1) * limitNum;
      
      const [aggResult, countResult] = await Promise.all([
        Product.aggregate([
          { $match: query },
          // Add a deterministic pseudo-random key based on timestamp
          { $addFields: { shuffleKey: { $mod: [{ $toLong: '$createdAt' }, 37] } } },
          { $setWindowFields: {
              // Partition by groupKey to interleave different subjects (Messi, Ronaldo, etc.)
              partitionBy: '$groupKey',
              sortBy: { shuffleKey: 1 },
              output: { groupIndex: { $documentNumber: {} } }
          }},
          // Sort by groupIndex first to get 1st of each subject, then 2nd of each, etc.
          // Then sort by shuffleKey to randomize the order of subjects
          { $sort: { groupIndex: 1, shuffleKey: 1 } },
          { $skip: skip },
          { $limit: limitNum },
          { $project: { reviews: 0, groupIndex: 0, shuffleKey: 0 } }
        ]),
        Product.countDocuments(query)
      ]);

      const totalPages = Math.ceil(countResult / limitNum);
      
      result = {
        success: true,
        data: aggResult,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: countResult,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } else {
      // Use standard pagination helper
      result = await paginate(Product, query, {
        page: pageNum,
        limit: limitNum,
        sort,
        select: '-reviews',
        lean: true
      });
    }

    // Transform all product images to include watermarked URLs
    const transformedData = transformProductsImages(result.data);

    // Return both legacy format and requested format for compatibility
    res.json({
      ...result,
      data: transformedData,
      // Additional requested format fields
      products: transformedData,
      page: result.pagination.currentPage,
      pages: result.pagination.totalPages,
      totalProducts: result.pagination.totalItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SMART SEARCH WITH RELEVANCE RANKING
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/products/search/query
// @desc    Smart search with multi-field matching and relevance ranking
// @access  Public
router.get('/search/query', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const { q, page, limit, sort: sortParam, category, tag, minPrice, maxPrice } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchTerm = q.trim();
    const { page: pageNum, limit: limitNum, sort } = parsePaginationParams(req.query);

    // ── Strategy 1: Aggregation pipeline with relevance scoring ──
    const matchStage = { isActive: true };
    
    if (category) {
      if (category.includes(',')) {
        matchStage.normalizedCategory = { $in: category.split(',').map(c => c.trim().toLowerCase()) };
      } else {
        matchStage.normalizedCategory = category.toLowerCase();
      }
    }

    if (tag) {
      matchStage.normalizedTags = { $in: tag.split(',').map(t => t.trim().toLowerCase()) };
    }

    if (minPrice || maxPrice) {
      matchStage.basePrice = {};
      if (minPrice) matchStage.basePrice.$gte = Number(minPrice);
      if (maxPrice) matchStage.basePrice.$lte = Number(maxPrice);
    }

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedTerm, 'i');

    // Multi-field regex search with scoring
    const pipeline = [
      {
        $match: {
          ...matchStage,
          $or: [
            { normalizedName: { $regex: searchRegex } },
            { name: { $regex: searchRegex } },
            { normalizedCategory: { $regex: searchRegex } },
            { normalizedTags: { $regex: searchRegex } },
            { searchKeywords: { $regex: searchRegex } },
            { category: { $regex: searchRegex } },
            { tags: { $regex: searchRegex } },
            { description: { $regex: searchRegex } },
          ],
        },
      },
      // Relevance scoring
      {
        $addFields: {
          relevanceScore: {
            $sum: [
              // Exact name match = highest priority (10 points)
              { $cond: [{ $regexMatch: { input: { $ifNull: ['$normalizedName', ''] }, regex: searchRegex } }, 10, 0] },
              // Name starts with search term (8 points)
              { $cond: [{ $regexMatch: { input: { $ifNull: ['$normalizedName', ''] }, regex: new RegExp(`^${escapedTerm}`, 'i') } }, 8, 0] },
              // Original name match (6 points)
              { $cond: [{ $regexMatch: { input: { $ifNull: ['$name', ''] }, regex: searchRegex } }, 6, 0] },
              // Category match (5 points)
              { $cond: [{ $regexMatch: { input: { $ifNull: ['$normalizedCategory', ''] }, regex: searchRegex } }, 5, 0] },
              // Tag match (3 points)
              { $cond: [{ $gt: [{ $size: { $filter: { input: { $ifNull: ['$normalizedTags', []] }, as: 't', cond: { $regexMatch: { input: '$$t', regex: searchRegex } } } } }, 0] }, 3, 0] },
              // Keyword match (1 point)
              { $cond: [{ $gt: [{ $size: { $filter: { input: { $ifNull: ['$searchKeywords', []] }, as: 'k', cond: { $regexMatch: { input: '$$k', regex: searchRegex } } } } }, 0] }, 1, 0] },
              // Boost for popular products
              { $cond: [{ $gt: ['$sold', 10] }, 2, 0] },
              { $cond: [{ $gt: ['$rating.average', 4] }, 1, 0] },
            ],
          },
        },
      },
      // Sort by relevance first, then by user-selected sort
      { $sort: { relevanceScore: -1, ...sort } },
      // Project out the score field and reviews
      {
        $facet: {
          data: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            { $project: { reviews: 0, relevanceScore: 0 } },
          ],
          totalCount: [
            { $count: 'count' },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);
    
    const products = result.data || [];
    const totalItems = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Transform images
    const transformedData = transformProductsImages(products);

    res.json({
      success: true,
      data: transformedData,
      products: transformedData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      page: pageNum,
      pages: totalPages,
      totalProducts: totalItems,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH SUGGESTIONS (AUTOCOMPLETE)
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/products/search/suggestions
// @desc    Lightweight search suggestions with prefix matching
// @access  Public
router.get('/search/suggestions', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const escapedTerm = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRegex = new RegExp(`^${escapedTerm}`, 'i');
    const containsRegex = new RegExp(escapedTerm, 'i');

    // Two-tier search: prefix matches first, then contains matches
    const [prefixResults, containsResults] = await Promise.all([
      // Prefix matches (higher priority)
      Product.find({
        isActive: true,
        $or: [
          { normalizedName: { $regex: prefixRegex } },
          { name: { $regex: prefixRegex } },
        ],
      })
      .select('name category normalizedName normalizedCategory images basePrice')
      .limit(5)
      .lean(),

      // Contains matches (lower priority)
      Product.find({
        isActive: true,
        $or: [
          { normalizedName: { $regex: containsRegex } },
          { name: { $regex: containsRegex } },
          { normalizedCategory: { $regex: containsRegex } },
          { category: { $regex: containsRegex } },
          { normalizedTags: { $regex: containsRegex } },
          { tags: { $regex: containsRegex } },
        ],
      })
      .select('name category normalizedName normalizedCategory images basePrice')
      .limit(10)
      .lean(),
    ]);

    // Merge and deduplicate, prefix results first
    const seen = new Set();
    const merged = [];

    for (const p of [...prefixResults, ...containsResults]) {
      const id = p._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(p);
      }
    }

    // Return minimal data for autocomplete
    const data = merged.slice(0, 8).map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      normalizedCategory: p.normalizedCategory,
      basePrice: p.basePrice,
      thumbnail: p.images?.[0]?.urls?.thumbnail || p.images?.[0]?.url || null,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE PRODUCT + RELATED PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', cacheMiddleware(CACHE_TTL_SINGLE), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name')
      .lean(); // Use lean for better performance

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Transform product images to include watermarked URLs
    const transformedProduct = transformProductImages(product);

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id/related
// @desc    Get related products using normalizedCategory + normalizedTags
// @access  Public
router.get('/:id/related', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('normalizedCategory normalizedTags groupKey')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 8, 20);

    // Find related products: same category or overlapping tags, exclude self
    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { normalizedCategory: product.normalizedCategory },
        { normalizedTags: { $in: product.normalizedTags || [] } },
        { groupKey: product.groupKey },
      ],
    })
    .select('-reviews')
    .sort({ sold: -1, 'rating.average': -1 })
    .limit(limit)
    .lean();

    const transformedData = transformProductsImages(related);

    res.json({ success: true, data: transformedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/group/:groupKey
// @desc    Get products grouped by groupKey (for variation display)
// @access  Public
router.get('/group/:groupKey', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      groupKey: req.params.groupKey,
    })
    .select('-reviews')
    .sort({ basePrice: 1 })
    .lean();

    const transformedData = transformProductsImages(products);

    res.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category with pagination (uses normalizedCategory)
// @access  Public
router.get('/category/:category', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const categorySlug = req.params.category.toLowerCase();
    
    const query = { 
      isActive: true,
      $or: [
        { normalizedCategory: categorySlug },
        { category: req.params.category },
      ],
    };

    const { page: pageNum, limit: limitNum, sort } = parsePaginationParams(req.query);

    const result = await paginate(Product, query, {
      page: pageNum,
      limit: limitNum,
      sort: Object.keys(sort).length ? sort : { featured: -1, createdAt: -1 },
      select: '-reviews',
      lean: true
    });

    const transformedData = transformProductsImages(result.data);

    res.json({
      ...result,
      data: transformedData,
      products: transformedData,
      page: result.pagination.currentPage,
      pages: result.pagination.totalPages,
      totalProducts: result.pagination.totalItems,
      count: result.pagination.totalItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   POST /api/products/:id/review
// @desc    Add product review
// @access  Private
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed'
      });
    }

    // Add review
    product.reviews.push({
      user: req.user._id,
      rating: Number(rating),
      comment
    });

    // Update rating
    product.rating.count = product.reviews.length;
    product.rating.average = 
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / 
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
