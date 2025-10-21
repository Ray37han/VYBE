import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/emailService.js';
import { sendOrderConfirmationSMS, sendOrderStatusUpdateSMS, logSMS } from '../utils/smsService.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentInfo, pricing, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `VYBE${Date.now()}${count + 1}`;

    // Format shipping address to match schema
    const formattedAddress = {
      name: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.address,
      city: shippingAddress.city,
      zipCode: shippingAddress.postalCode,
      country: 'Bangladesh'
    };

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items,
      shippingAddress: formattedAddress,
      paymentMethod,
      paymentInfo: paymentInfo || { status: 'pending' },
      pricing: {
        subtotal: pricing.subtotal,
        shippingCost: pricing.shipping,
        total: pricing.total
      },
      notes
    });

    // Update product stock and sold count
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Clear user cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    // Add order to user's orders
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id }
    });

    // Populate order items for email
    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');

    // Send email notification
    if (req.user.email) {
      sendOrderConfirmation(populatedOrder, req.user.email).catch(err => 
        console.error('Email notification failed:', err)
      );
    }

    // Send SMS notification
    if (formattedAddress.phone) {
      // Log SMS to console in development
      const smsMessage = `VYBE Order Confirmed! Order #${orderNumber}\nTotal: ৳${pricing.total}\n${paymentMethod === 'bkash' ? 'Payment: bKash to 01747809138' : 'Payment: COD'}\nTrack: ${process.env.CLIENT_URL || 'http://localhost:3000'}/my-orders`;
      logSMS(formattedAddress.phone, smsMessage);
      
      // Send actual SMS (will skip if not configured)
      sendOrderConfirmationSMS(populatedOrder, formattedAddress.phone).catch(err =>
        console.error('SMS notification failed:', err)
      );
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user is order owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { orderStatus: status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    order.statusHistory.push({
      status,
      note,
      timestamp: Date.now()
    });

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order status updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private/Admin
router.put('/:id/payment', protect, authorize('admin'), async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentInfo.transactionId = transactionId;
    order.paymentInfo.status = status;
    if (status === 'completed') {
      order.paymentInfo.paidAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Payment status updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
