import express from 'express';
import HeroItem from '../models/HeroItem.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/hero-items/admin
// @desc    Get all hero items (including inactive)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const heroItems = await HeroItem.find()
      .populate('product', 'name images category basePrice')
      .sort('order');
    
    res.json({
      success: true,
      data: heroItems
    });
  } catch (error) {
    console.error('Error fetching hero items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero items'
    });
  }
});

// @route   GET /api/hero-items
// @desc    Get all active hero items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const heroItems = await HeroItem.find({ isActive: true })
      .populate('product', 'name images category basePrice')
      .sort('order');
    
    res.json({
      success: true,
      data: heroItems
    });
  } catch (error) {
    console.error('Error fetching hero items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero items'
    });
  }
});

// @route   POST /api/hero-items
// @desc    Create new hero item
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { productId, title, position, order, gradient } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if position is already taken
    const existingItem = await HeroItem.findOne({ position, isActive: true });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: `Position "${position}" is already occupied`
      });
    }

    const heroItem = await HeroItem.create({
      product: productId,
      title: title || product.name,
      position,
      order: order || 0,
      gradient: gradient || 'from-purple-600/90 via-transparent to-transparent'
    });

    const populatedItem = await HeroItem.findById(heroItem._id)
      .populate('product', 'name images category basePrice');

    res.status(201).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    console.error('Error creating hero item:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create hero item'
    });
  }
});

// @route   PUT /api/hero-items/:id
// @desc    Update hero item
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, position, order, isActive, gradient } = req.body;

    const heroItem = await HeroItem.findById(req.params.id);
    if (!heroItem) {
      return res.status(404).json({
        success: false,
        message: 'Hero item not found'
      });
    }

    // Check if new position is already taken (if position is being changed)
    if (position && position !== heroItem.position) {
      const existingItem = await HeroItem.findOne({ 
        position, 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: `Position "${position}" is already occupied`
        });
      }
    }

    // Update fields
    if (title) heroItem.title = title;
    if (position) heroItem.position = position;
    if (order !== undefined) heroItem.order = order;
    if (isActive !== undefined) heroItem.isActive = isActive;
    if (gradient) heroItem.gradient = gradient;

    await heroItem.save();

    const updatedItem = await HeroItem.findById(heroItem._id)
      .populate('product', 'name images category basePrice');

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating hero item:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update hero item'
    });
  }
});

// @route   DELETE /api/hero-items/:id
// @desc    Delete hero item
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const heroItem = await HeroItem.findById(req.params.id);
    
    if (!heroItem) {
      return res.status(404).json({
        success: false,
        message: 'Hero item not found'
      });
    }

    await heroItem.deleteOne();

    res.json({
      success: true,
      message: 'Hero item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero item'
    });
  }
});

export default router;
