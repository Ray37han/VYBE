import express from 'express';
import Product from '../models/Product.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { paginate, parsePaginationParams } from '../utils/pagination.js';
import { transformProductsImages, transformProductImages } from '../utils/cloudinaryTransform.js';

const router = express.Router();

// Cache TTL from env or default 60s
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 60;
const CACHE_TTL_SINGLE = parseInt(process.env.CACHE_TTL_SINGLE) || 120;

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
      page,
      limit,
      sortBy,
      order,
      sort: sortParam
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    // Handle comma-separated categories (e.g., "football,football-motivational")
    if (category) {
      if (category.includes(',')) {
        const categories = category.split(',').map(cat => cat.trim());
        query.category = { $in: categories };
      } else {
        query.category = category;
      }
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

    // Use pagination helper with optimizations
    const result = await paginate(Product, query, {
      page: pageNum,
      limit: limitNum,
      sort,
      select: '-reviews', // Exclude reviews for list view
      lean: true // Convert to plain JS object for better performance
    });

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

// @route   GET /api/products/category/:category
// @desc    Get products by category with pagination
// @access  Public
router.get('/category/:category', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const query = { 
      category: req.params.category,
      isActive: true 
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

// @route   GET /api/products/search/query
// @desc    Search products with text search + regex fallback
// @access  Public
router.get('/search/query', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const { q, page, limit, sort: sortParam, category } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchTerm = q.trim();
    const query = { isActive: true };

    if (category) {
      if (category.includes(',')) {
        query.category = { $in: category.split(',').map(c => c.trim()) };
      } else {
        query.category = category;
      }
    }

    // Try text search first (uses indexes, faster)
    query.$text = { $search: searchTerm };

    const { page: pageNum, limit: limitNum, sort } = parsePaginationParams(req.query);

    let result = await paginate(Product, query, {
      page: pageNum,
      limit: limitNum,
      sort,
      select: '-reviews',
      lean: true
    });

    // If text search returns no results, fall back to regex (partial match)
    if (result.data.length === 0) {
      delete query.$text;
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedTerm, $options: 'i' } },
        { category: { $regex: escapedTerm, $options: 'i' } },
        { tags: { $regex: escapedTerm, $options: 'i' } }
      ];

      result = await paginate(Product, query, {
        page: pageNum,
        limit: limitNum,
        sort,
        select: '-reviews',
        lean: true
      });
    }

    const transformedData = transformProductsImages(result.data);

    res.json({
      ...result,
      data: transformedData,
      products: transformedData,
      page: result.pagination.currentPage,
      pages: result.pagination.totalPages,
      totalProducts: result.pagination.totalItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/search/suggestions
// @desc    Lightweight search suggestions (name + category only)
// @access  Public
router.get('/search/suggestions', cacheMiddleware(CACHE_TTL), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const escapedTerm = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const suggestions = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: escapedTerm, $options: 'i' } },
        { category: { $regex: escapedTerm, $options: 'i' } },
        { tags: { $regex: escapedTerm, $options: 'i' } }
      ]
    })
    .select('name category images')
    .limit(8)
    .lean();

    // Return minimal data for autocomplete
    const data = suggestions.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      thumbnail: p.images?.[0]?.urls?.thumbnail || p.images?.[0]?.url || null
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
