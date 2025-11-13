import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { protect, authorize } from '../middleware/auth.js';
import Order from '../models/Order.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

/**
 * @route   POST /api/customizations/upload-image
 * @desc    Upload custom image to Cloudinary (original, unwatermarked)
 * @access  Public (any customer can upload)
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get image metadata
    const metadata = await sharp(req.file.buffer).metadata();
    
    // Validate image dimensions (optional - adjust as needed)
    const minWidth = 300;
    const minHeight = 300;
    
    if (metadata.width < minWidth || metadata.height < minHeight) {
      return res.status(400).json({ 
        message: `Image must be at least ${minWidth}x${minHeight} pixels` 
      });
    }

    // Upload to Cloudinary in a secure folder
    // The image will be stored WITHOUT watermark (original version)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vybe-custom-uploads', // Separate folder for custom uploads
          resource_type: 'image',
          quality: 'auto:best',
          format: 'jpg', // Convert to JPG for consistency
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/customizations/orders
 * @desc    Get all orders with custom items (Admin only)
 * @access  Private/Admin
 */
router.get('/orders', protect, authorize('admin'), async (req, res) => {
  try {
    // Find all orders that have at least one item with customization
    const orders = await Order.find({
      'items.customization': { $exists: true, $ne: null }
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

    // Filter and format the response
    const customOrders = orders.map(order => {
      const customItems = order.items.filter(item => 
        item.customization && 
        (item.customization.uploadedImageUrl || 
         item.customization.textOverlay || 
         item.customization.frameColor)
      );

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user?.name || order.shippingAddress?.name,
          email: order.user?.email,
        },
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        customItems: customItems.map(item => ({
          _id: item._id,
          productName: item.name,
          productImage: item.image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization,
        })),
      };
    });

    res.json({
      success: true,
      orders: customOrders.filter(order => order.customItems.length > 0),
    });

  } catch (error) {
    console.error('Fetch custom orders error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch custom orders', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/customizations/orders/:orderId/item/:itemId
 * @desc    Get specific custom order item details
 * @access  Private/Admin
 */
router.get('/orders/:orderId/item/:itemId', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const item = order.items.id(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    res.json({
      success: true,
      orderInfo: {
        orderNumber: order.orderNumber,
        customer: order.user,
        shippingAddress: order.shippingAddress,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
      item: {
        _id: item._id,
        productName: item.name,
        productImage: item.image,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
      },
    });

  } catch (error) {
    console.error('Fetch custom item error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch custom item', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/customizations/orders/:orderId/item/:itemId/status
 * @desc    Approve or reject a custom order item
 * @access  Private/Admin
 */
router.put('/orders/:orderId/item/:itemId/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be "approved" or "rejected"' 
      });
    }

    const order = await Order.findById(req.params.orderId).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const item = order.items.id(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    if (!item.customization) {
      return res.status(400).json({ message: 'This item is not customizable' });
    }

    // Update the customization status
    item.customization.status = status;
    if (status === 'rejected' && rejectionReason) {
      item.customization.rejectionReason = rejectionReason;
    }

    // Add to order status history
    order.statusHistory.push({
      status: `custom_item_${status}`,
      note: `Custom item "${item.name}" ${status}${rejectionReason ? ': ' + rejectionReason : ''}`,
    });

    await order.save();

    // Send email notification to customer
    if (order.user && order.user.email) {
      const emailSubject = status === 'approved' 
        ? '✅ Your Custom Poster Design Approved!' 
        : '❌ Custom Poster Design Rejected';

      const emailHtml = status === 'approved'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Good News! Your Custom Design is Approved ✅</h2>
            <p>Hi ${order.user.name},</p>
            <p>Your custom poster design for <strong>${item.name}</strong> (Order #${order.orderNumber}) has been approved!</p>
            <p><strong>Design Details:</strong></p>
            <ul>
              <li>Size: ${item.size}</li>
              <li>Quantity: ${item.quantity}</li>
              ${item.customization.textOverlay ? `<li>Text: ${item.customization.textOverlay}</li>` : ''}
              ${item.customization.frameColor ? `<li>Frame: ${item.customization.frameColor}</li>` : ''}
            </ul>
            <p>We're now processing your order for printing. You'll receive another update once it's shipped.</p>
            <p style="margin-top: 30px;">Thank you for choosing VYBE!</p>
            <p style="color: #6b7280; font-size: 14px;">VYBE - Visualize Your Best Essence</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Custom Design Rejected ❌</h2>
            <p>Hi ${order.user.name},</p>
            <p>Unfortunately, we cannot proceed with your custom poster design for <strong>${item.name}</strong> (Order #${order.orderNumber}).</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>This item will be removed from your order</li>
              <li>You will receive a full refund for this item</li>
              <li>Other items in your order will continue processing normally</li>
            </ul>
            <p>If you have questions or would like to submit a new design, please contact our support team.</p>
            <p style="margin-top: 30px;">We apologize for any inconvenience.</p>
            <p style="color: #6b7280; font-size: 14px;">VYBE - Visualize Your Best Essence</p>
          </div>
        `;

      await sendEmail({
        to: order.user.email,
        subject: emailSubject,
        html: emailHtml,
      });
    }

    res.json({
      success: true,
      message: `Custom item ${status} successfully`,
      item: {
        _id: item._id,
        customization: item.customization,
      },
    });

  } catch (error) {
    console.error('Update custom item status error:', error);
    res.status(500).json({ 
      message: 'Failed to update custom item status', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/customizations/download/:publicId
 * @desc    Generate download URL for original uploaded image
 * @access  Private/Admin
 */
router.get('/download/:publicId(*)', protect, authorize('admin'), async (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Generate a temporary download URL (valid for 1 hour)
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: 'image',
      type: 'upload',
      flags: 'attachment', // Forces download instead of display
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });

    res.json({
      success: true,
      downloadUrl,
    });

  } catch (error) {
    console.error('Generate download URL error:', error);
    res.status(500).json({ 
      message: 'Failed to generate download URL', 
      error: error.message 
    });
  }
});

export default router;
