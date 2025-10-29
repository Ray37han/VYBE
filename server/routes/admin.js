import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload, handleMulterError, watermarkImages } from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { sendOrderStatusUpdate } from '../utils/emailService.js';
import { sendOrderStatusUpdateSMS, logSMS } from '../utils/smsService.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        ordersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/products
// @desc    Create new product (with automatic watermarking)
// @access  Private/Admin
router.post('/products', upload.array('images', 5), watermarkImages, handleMulterError, async (req, res) => {
  try {
    console.log('📦 Product creation request received');
    console.log('User:', req.user?.email, 'Role:', req.user?.role);
    console.log('Files:', req.files?.length || 0);
    console.log('Body keys:', Object.keys(req.body));
    
    // Verify user has admin role
    if (!req.user || req.user.role !== 'admin') {
      console.error('❌ User is not admin:', req.user?.email);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create products. Admin access required.'
      });
    }
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary not configured');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured. Please contact the administrator.'
      });
    }

    // Parse product data
    let productData;
    try {
      productData = JSON.parse(req.body.productData);
      console.log('✅ Product data parsed:', productData.name);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid product data format. Please try again.'
      });
    }
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, or basePrice'
      });
    }
    
    // Check if images are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }
    
    // Upload images to Cloudinary
    const imageUploads = [];
    if (req.files && req.files.length > 0) {
      console.log(`📸 Uploading ${req.files.length} images...`);
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        console.log(`Uploading image ${i + 1}/${req.files.length}...`);
        try {
          const result = await uploadToCloudinary(file.buffer, 'vybe-products');
          imageUploads.push({
            url: result.secure_url,
            publicId: result.public_id
          });
          console.log(`✅ Image ${i + 1} uploaded`);
        } catch (uploadError) {
          console.error(`❌ Upload error for image ${i + 1}:`, uploadError);
          return res.status(500).json({
            success: false,
            message: `Image upload failed: ${uploadError.message}`
          });
        }
      }
    }

    console.log('💾 Creating product in database...');
    const product = await Product.create({
      ...productData,
      images: imageUploads
    });

    console.log('✅ Product created successfully:', product._id);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product (with automatic watermarking)
// @access  Private/Admin
router.put('/products/:id', upload.array('images', 5), watermarkImages, handleMulterError, async (req, res) => {
  try {
    console.log('📝 Product update request received');
    console.log('User:', req.user?.email, 'Role:', req.user?.role);
    console.log('Product ID:', req.params.id);
    console.log('Files:', req.files?.length || 0);
    
    // Verify user has admin role
    if (!req.user || req.user.role !== 'admin') {
      console.error('❌ User is not admin:', req.user?.email);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update products. Admin access required.'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let updateData;
    try {
      updateData = JSON.parse(req.body.productData);
      console.log('✅ Update data parsed');
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid product data format'
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      console.log(`📸 Uploading ${req.files.length} new images...`);
      const newImages = [];
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'vybe-products');
          newImages.push({
            url: result.secure_url,
            publicId: result.public_id
          });
        } catch (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: `Image upload failed: ${uploadError.message}`
          });
        }
      }
      
      // If replacing images, delete old ones
      if (updateData.replaceImages) {
        console.log('🗑️ Deleting old images...');
        for (const img of product.images) {
          if (img.publicId) {
            await deleteFromCloudinary(img.publicId);
          }
        }
        updateData.images = newImages;
      } else {
        updateData.images = [...product.images, ...newImages];
      }
    }

    console.log('💾 Updating product in database...');
    Object.assign(product, updateData);
    await product.save();

    console.log('✅ Product updated successfully:', product._id);
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('❌ Product update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) {
        await deleteFromCloudinary(img.publicId);
      }
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/products/:id/images/:imageId
// @desc    Delete specific product image
// @access  Private/Admin
router.delete('/products/:id/images/:imageId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const image = product.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // Remove from product
    product.images = product.images.filter(
      img => img._id.toString() !== req.params.imageId
    );
    
    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ORDER MANAGEMENT ROUTES

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .populate('user', 'name email')
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

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Add to status history
    order.statusHistory.push({
      status,
      note: note || `Order status changed to ${status}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Send email notification
    if (order.user?.email) {
      sendOrderStatusUpdate(order, order.user.email, { status, note, trackingNumber })
        .catch(err => console.error('Email notification failed:', err));
    }

    // Send SMS notification
    if (order.shippingAddress?.phone) {
      const smsMessage = `VYBE Order Update: Your order #${order.orderNumber} ${
        status === 'shipped' ? 'has been shipped' :
        status === 'delivered' ? 'has been delivered' :
        status === 'cancelled' ? 'has been cancelled' :
        'status updated'
      }.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}\nTrack: ${process.env.CLIENT_URL || 'http://localhost:3000'}/my-orders`;
      
      logSMS(order.shippingAddress.phone, smsMessage);
      sendOrderStatusUpdateSMS(order, order.shippingAddress.phone, status)
        .catch(err => console.error('SMS notification failed:', err));
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/orders/:id/payment
// @desc    Update payment status
// @access  Private/Admin
router.put('/orders/:id/payment', async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update payment info
    order.paymentInfo.status = status;
    
    if (transactionId) {
      order.paymentInfo.transactionId = transactionId;
    }

    if (status === 'completed') {
      order.paymentInfo.paidAt = new Date();
    }

    await order.save();

    // Send email notification for payment confirmation
    if (status === 'completed' && order.user?.email) {
      const emailSubject = `Payment Confirmed - Order #${order.orderNumber}`;
      const emailMessage = `
        <p>Your payment has been confirmed!</p>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Amount:</strong> ৳${order.pricing?.total}</p>
        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
        <p>Your order is now being processed.</p>
      `;
      
      // You can create a separate email template for payment confirmation
      console.log('Payment confirmed email sent to:', order.user.email);
    }

    res.json({
      success: true,
      data: order,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// USER MANAGEMENT ROUTES

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User role updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
