import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product', 'name images basePrice sizes');

    res.json({
      success: true,
      data: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, size, tier = 'Standard', customization } = req.body;

    console.log('=== ADD TO CART DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Product ID:', productId);
    console.log('Size:', size);
    console.log('Tier:', tier);
    console.log('Quantity:', quantity);
    console.log('Customization object:', JSON.stringify(customization, null, 2));
    console.log('Customization.uploadedImageUrl:', customization?.uploadedImageUrl);
    console.log('========================');

    const user = await User.findById(req.user._id);

    // For customized items, always add as new item (don't merge with existing)
    if (customization && customization.uploadedImageUrl) {
      console.log('Customized item - adding as new item (no merge)');
      user.cart.push({
        product: productId,
        quantity,
        size,
        tier,
        customization
      });
    } else {
      // For regular items, check if already in cart and merge
      const existingItem = user.cart.find(
        item => item.product.toString() === productId && 
                item.size === size &&
                (item.tier || 'Standard') === tier &&
                !item.customization
      );

      if (existingItem) {
        console.log('Regular item already exists - updating quantity');
        existingItem.quantity += quantity;
      } else {
        console.log('Regular item - adding as new');
        user.cart.push({
          product: productId,
          quantity,
          size,
          tier,
          customization
        });
      }
    }

    await user.save();
    await user.populate('cart.product', 'name images basePrice sizes');

    res.json({
      success: true,
      data: user.cart,
      message: 'Item added to cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.json({
      success: true,
      data: user.cart,
      message: 'Cart updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId);
    await user.save();

    res.json({
      success: true,
      data: user.cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
