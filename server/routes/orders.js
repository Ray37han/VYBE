import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/emailService.js';
import { sendOrderConfirmationSMS, sendOrderStatusUpdateSMS, logSMS } from '../utils/smsService.js';

// Import security middleware
import {
  orderCreationLimiter,
  validateOrderCreation,
  handleValidationErrors,
  preventDuplicateOrders,
  sanitizePhoneNumber,
  logOrderAttempt
} from '../middleware/security.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (simple, no Firebase OTP)
// @access  Private (JWT required)
router.post('/',
  protect,
  orderCreationLimiter,
  logOrderAttempt,
  sanitizePhoneNumber,
  validateOrderCreation,
  handleValidationErrors,
  preventDuplicateOrders,
  async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, shippingAddress, paymentMethod, paymentInfo, orderNotes } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Validate stock for all items
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Generate order number
    const count = await Order.countDocuments().session(session);
    const orderNumber = `VYBE${Date.now()}${count + 1}`;

    const hasCustomItems = items.some(item =>
      item.customization && Object.keys(item.customization).length > 0
    );

    // Map frontend shipping address fields → Order schema fields
    const formattedAddress = {
      name:    shippingAddress.name    || shippingAddress.fullName || '',
      phone:   shippingAddress.phone   || '',
      street:  shippingAddress.street  || shippingAddress.address  || '',
      city:    shippingAddress.city    || '',
      zipCode: shippingAddress.zipCode || shippingAddress.postalCode || '',
      country: 'Bangladesh',
    };

    const orderData = {
      user: req.user._id,
      orderNumber,
      items,
      shippingAddress: formattedAddress,
      paymentMethod,
      paymentInfo: paymentInfo || { status: 'pending' },
      notes: orderNotes || '',
      hasCustomItems,
      orderStatus: hasCustomItems ? 'pending_admin_review' : 'pending',
    };

    const [order] = await Order.create([orderData], { session });

    // Deduct stock
    for (const item of items) {
      const updateResult = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity, sold: item.quantity } },
        { session, new: true, runValidators: true }
      );
      if (updateResult.stock < 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Stock validation failed for ${updateResult.name}` });
      }
    }

    // Clear user cart and record order
    await User.findByIdAndUpdate(req.user._id, { cart: [] }, { session });
    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } }, { session });

    await session.commitTransaction();
    session.endSession();

    console.log(`✅ Order ${orderNumber} created`);

    // Send notifications (non-blocking)
    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');
    if (req.user.email) {
      sendOrderConfirmation(populatedOrder, req.user.email).catch(err =>
        console.error('Email notification failed:', err)
      );
    }
    if (formattedAddress.phone) {
      sendOrderConfirmationSMS(populatedOrder, formattedAddress.phone).catch(err =>
        console.error('SMS notification failed:', err)
      );
    }

    res.status(201).json({ success: true, data: order, message: 'Order created successfully' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Order creation failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Order creation failed' });
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
// @desc    Update order status (Admin) - with stock rollback for cancellations
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { status, note, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    order.statusHistory.push({
      status,
      note,
      timestamp: Date.now()
    });

    // If order is being cancelled or rejected, restore stock
    if ((status === 'cancelled' || status === 'rejected') && 
        !['cancelled', 'rejected', 'delivered'].includes(previousStatus)) {
      
      console.log(`🔄 Restoring stock for ${status} order ${order.orderNumber}`);
      
      for (const item of order.items) {
        const updateResult = await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
              sold: -item.quantity
            }
          },
          { 
            session,
            new: true,
            runValidators: true
          }
        );
        
        if (!updateResult) {
          console.warn(`⚠️ Product ${item.product} not found during stock restoration`);
        }
      }
      
      console.log(`✅ Stock restored for ${status} order ${order.orderNumber}`);
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      data: order,
      message: 'Order status updated'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('❌ Order status update failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order by user (with stock restoration)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const order = await Order.findById(req.params.id).session(session);
    
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Only allow cancellation of pending orders
    if (!['pending', 'pending_admin_review'].includes(order.orderStatus)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      note: 'Cancelled by user',
      timestamp: Date.now()
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity
          }
        },
        { session }
      );
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log(`✅ Order ${order.orderNumber} cancelled and stock restored`);

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('❌ Order cancellation failed:', error);
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
