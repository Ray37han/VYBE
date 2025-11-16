import express from 'express';
import Product from '../models/Product.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { paginate, parsePaginationParams } from '../utils/pagination.js';
import { transformProductsImages, transformProductImages } from '../utils/cloudinaryTransform.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', cacheMiddleware(300), async (req, res) => {
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
      order
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Parse pagination params
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

    res.json({
      ...result,
      data: transformedData
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
router.get('/:id', cacheMiddleware(600), async (req, res) => {
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
// @desc    Get products by category
// @access  Public
router.get('/category/:category', cacheMiddleware(300), async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category,
      isActive: true 
    })
    .select('-reviews')
    .lean()
    .sort({ featured: -1, createdAt: -1 });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
