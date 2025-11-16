const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { sendCustomOrderRejectionEmail } = require('../utils/emailService');

// @route   GET /api/admin/custom-approvals
// @desc    Get all orders pending admin review
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending_admin_review' } = req.query;

    const query = status === 'all' 
      ? { hasCustomItems: true }
      : { orderStatus: status, hasCustomItems: true };

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    });
  } catch (error) {
    console.error('Error fetching custom approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom approvals'
    });
  }
});

// @route   GET /api/admin/custom-approvals/:orderId
// @desc    Get single order details
// @access  Private/Admin
router.get('/:orderId', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
});

// @route   PUT /api/admin/custom-approvals/:orderId/approve
// @desc    Approve a custom order
// @access  Private/Admin
router.put('/:orderId/approve', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'pending_admin_review') {
      return res.status(400).json({
        success: false,
        message: 'Order is not pending admin review'
      });
    }

    // Update order status to processing
    order.orderStatus = 'processing';
    
    // Mark all custom items as approved
    order.items.forEach(item => {
      if (item.customization && item.customization.status === 'pending') {
        item.customization.status = 'approved';
      }
    });

    order.statusHistory.push({
      status: 'processing',
      timestamp: Date.now(),
      updatedBy: req.user.name,
      notes: 'Custom order approved by admin'
    });

    await order.save();

    // TODO: Send approval email to customer
    console.log(`✅ Custom order ${order._id} approved by ${req.user.name}`);

    res.json({
      success: true,
      message: 'Custom order approved successfully',
      order
    });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve order'
    });
  }
});

// @route   PUT /api/admin/custom-approvals/:orderId/reject
// @desc    Reject a custom order with reason
// @access  Private/Admin
router.put('/:orderId/reject', protect, admin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const order = await Order.findById(req.params.orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'pending_admin_review') {
      return res.status(400).json({
        success: false,
        message: 'Order is not pending admin review'
      });
    }

    // Update order status to rejected
    order.orderStatus = 'rejected';
    
    // Mark all custom items as rejected with reason
    order.items.forEach(item => {
      if (item.customization) {
        item.customization.status = 'rejected';
        item.customization.rejectionReason = rejectionReason;
      }
    });

    order.statusHistory.push({
      status: 'rejected',
      timestamp: Date.now(),
      updatedBy: req.user.name,
      notes: `Rejected: ${rejectionReason}`
    });

    await order.save();

    // Send rejection email to customer
    try {
      await sendCustomOrderRejectionEmail(order.user, order, rejectionReason);
      console.log(`📧 Rejection email sent to ${order.user.email}`);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    console.log(`❌ Custom order ${order._id} rejected by ${req.user.name}`);

    res.json({
      success: true,
      message: 'Custom order rejected successfully',
      order
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order'
    });
  }
});

// @route   GET /api/admin/custom-approvals/stats
// @desc    Get statistics for custom orders
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const pendingCount = await Order.countDocuments({
      orderStatus: 'pending_admin_review',
      hasCustomItems: true
    });

    const approvedCount = await Order.countDocuments({
      orderStatus: { $in: ['processing', 'printing', 'shipped', 'delivered'] },
      hasCustomItems: true
    });

    const rejectedCount = await Order.countDocuments({
      orderStatus: 'rejected',
      hasCustomItems: true
    });

    const totalCustomOrders = await Order.countDocuments({
      hasCustomItems: true
    });

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCustomOrders
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
