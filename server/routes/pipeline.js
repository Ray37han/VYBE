/**
 * Pipeline Order Routes
 * Base: /api/pipeline
 *
 * Public:
 *   POST /api/pipeline/create       – Submit a new quick-checkout order
 *
 * Admin (requires JWT + admin role):
 *   GET  /api/pipeline/orders       – List all pipeline orders
 *   GET  /api/pipeline/orders/:id   – Get single pipeline order
 *   PATCH /api/pipeline/orders/:id/status   – Update order status
 *   POST  /api/pipeline/orders/:id/courier  – Assign courier & dispatch
 *
 * Anti-spam: 5 orders per IP per hour (enforced in this file, not via
 * express-rate-limit middleware so we can use MongoDB-level counts).
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

import PipelineOrder, { nextDailySeq } from '../models/PipelineOrder.js';
import { protect, authorize } from '../middleware/auth.js';
import { appendOrderToSheet, updateOrderInSheet } from '../services/googleSheets.js';
import { sendOrderNotification, sendStatusNotification } from '../services/whatsapp.js';
import { sendTelegramOrderNotification } from '../utils/telegramNotifier.js';
import courierAdapter, { SUPPORTED_COURIERS } from '../services/courier/index.js';

const router = express.Router();

const DELIVERY_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function buildProductsFromPayload(body = {}) {
  if (Array.isArray(body.products) && body.products.length > 0) {
    return body.products
      .map((item) => ({
        name: String(item?.name || '').trim(),
        productId: String(item?.productId || '').trim(),
        quantity: Number(item?.quantity) > 0 ? Number(item.quantity) : 1,
        price: Number(item?.price) >= 0 ? Number(item.price) : 0,
        image_url: String(item?.image_url || '').trim(),
      }))
      .filter((item) => item.name);
  }

  const fallbackName = String(body.productName || '').trim();
  if (!fallbackName) {
    return [];
  }

  return [{
    name: fallbackName,
    productId: String(body.productId || '').trim(),
    quantity: Number(body.quantity) > 0 ? Number(body.quantity) : 1,
    price: Number(body.price) >= 0 ? Number(body.price) : 0,
    image_url: String(body.productImageUrl || body.image_url || '').trim(),
  }];
}

function toDeliveryOrder(orderDoc) {
  const order = orderDoc?.toObject ? orderDoc.toObject() : orderDoc;

  const products = Array.isArray(order.products) && order.products.length > 0
    ? order.products
    : [{
        name: order.productName || 'Unknown Product',
        quantity: order.quantity || 1,
        price: order.price || 0,
        image_url: order.productImageUrl || '',
      }];

  const computedSubtotal = products.reduce(
    (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)),
    0
  );
  const deliveryCharge = Number.isFinite(Number(order.deliveryCharge))
    ? Number(order.deliveryCharge)
    : Math.max(0, Number(order.total || 0) - computedSubtotal);
  const subtotal = Number.isFinite(Number(order.subtotal)) && Number(order.subtotal) > 0
    ? Number(order.subtotal)
    : computedSubtotal;

  return {
    _id: order._id,
    id: order.orderId,
    orderId: order.orderId,
    customer_name: order.customerName,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    district: order.district,
    status: order.status,
    payment_method: order.paymentMethod,
    paymentMethod: order.paymentMethod,
    courier: order.courier || '',
    tracking_id: order.trackingId || '',
    trackingId: order.trackingId || '',
    delivery_agent: order.deliveryAgent || '',
    deliveryAgent: order.deliveryAgent || '',
    subtotal,
    deliveryCharge,
    total: Number(order.total || 0),
    products,
    adminNote: order.adminNote || '',
    statusTimeline: Array.isArray(order.statusTimeline) ? order.statusTimeline : [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/* ─── Rate limiter: 5 orders / IP / hour ─────────────────────────────────── */
const orderRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) =>
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown',
  message: {
    success: false,
    message: '⚠️ Too many orders from this IP. Please try again in an hour.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ─── Validation rules ────────────────────────────────────────────────────── */
const BD_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barisal','Bhola','Bogura','Brahmanbaria',
  'Chandpur','Chapainawabganj','Chattogram','Chuadanga','Cumilla',"Cox's Bazar",
  'Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj',
  'Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat',
  'Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur',
  'Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar',
  'Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi',
  'Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh',
  'Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur',
  'Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet',
  'Tangail','Thakurgaon',
];

const PAYMENT_METHODS = ['Cash On Delivery', 'bKash', 'Nagad'];

const createOrderValidators = [
  body('customerName').trim().notEmpty().withMessage('Full name is required'),
  body('phone')
    .trim()
    .matches(/^01[3-9]\d{8}$/)
    .withMessage('Enter a valid Bangladesh mobile number (01XXXXXXXXX)'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('district').trim().isIn(BD_DISTRICTS).withMessage('Select a valid district'),
  body('address').trim().notEmpty().withMessage('Delivery address is required'),
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage('Select a valid payment method'),
  body('productImageUrl').optional({ checkFalsy: true }).isURL().withMessage('Product image must be a valid URL'),
  body('products').optional().isArray({ min: 1 }).withMessage('Products must be a non-empty array'),
  body('products.*.name').optional().trim().notEmpty().withMessage('Each product name is required'),
  body('products.*.quantity').optional().isInt({ min: 1 }).withMessage('Each product quantity must be at least 1'),
  body('products.*.price').optional().isFloat({ min: 0 }).withMessage('Each product price must be valid'),
  body('products.*.image_url').optional({ checkFalsy: true }).isURL().withMessage('Each product image_url must be a valid URL'),
  body('transactionId').optional().trim(),
];

/* ─── Helper: build OrderID ───────────────────────────────────────────────── */
async function generateOrderId() {
  const now     = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const seq     = await nextDailySeq(dateStr);
  const padded  = String(seq).padStart(4, '0');
  return `VYBE-${dateStr}-${padded}`;
}

/* ─── Helper: get client IP ───────────────────────────────────────────────── */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC ROUTE: Create pipeline order
   POST /api/pipeline/create
═══════════════════════════════════════════════════════════════════════════ */
router.post('/create', orderRateLimiter, createOrderValidators, async (req, res) => {
  /* 1. Validate */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      customerName, phone, email = '',
      district, address, orderNotes = '',
      productId = '', productName,
      productImageUrl = '',
      quantity, price,
      paymentMethod,
      transactionId = '',
      pageUrl = '',
      products: productsInput = [],
      deliveryCharge: deliveryChargeInput,
    } = req.body;

    const qty = parseInt(quantity, 10);
    const prc = parseFloat(price);
    const normalizedProducts = buildProductsFromPayload({
      products: productsInput,
      productName,
      productId,
      quantity,
      price,
      productImageUrl,
    });
    const subtotal = +normalizedProducts
      .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
      .toFixed(2);
    const fallbackSubtotal = +(qty * prc).toFixed(2);
    const selectedSubtotal = subtotal > 0 ? subtotal : fallbackSubtotal;
    const deliveryCharge = Number.isFinite(Number(deliveryChargeInput))
      ? Number(deliveryChargeInput)
      : 0;
    const total = +(selectedSubtotal + deliveryCharge).toFixed(2);

    /* 2. Check per-IP hourly limit in DB (secondary check) */
    const ip        = getClientIP(req);
    const oneHrAgo  = new Date(Date.now() - 60 * 60 * 1000);
    const ipCount   = await PipelineOrder.countDocuments({
      ipAddress: ip,
      createdAt: { $gte: oneHrAgo },
    });
    if (ipCount >= 5) {
      return res.status(429).json({
        success: false,
        message: '⚠️ Too many orders from your network. Please try again in an hour.',
      });
    }

    /* 3. Generate Order ID */
    const orderId = await generateOrderId();

    /* 4. Persist to MongoDB */
    const newOrder = await PipelineOrder.create({
      orderId,
      customerName, phone, email,
      district, address, orderNotes,
      productId, productName,
      productImageUrl,
      quantity: qty, price: prc, total,
      subtotal: selectedSubtotal,
      deliveryCharge,
      products: normalizedProducts,
      paymentMethod,
      transactionId,
      status: 'Pending',
      statusTimeline: [{ status: 'Pending', changedBy: 'System', note: 'Order created' }],
      ipAddress: ip,
      userAgent: req.headers['user-agent'] || '',
      pageUrl,
    });

    /* 5. Sync to Google Sheets (non-blocking) */
    appendOrderToSheet(newOrder.toObject()).then(result => {
      if (result.success) {
        PipelineOrder.findByIdAndUpdate(newOrder._id, { syncedToSheets: true }).exec();
      }
    });

    /* 6. WhatsApp notification (non-blocking) */
    sendOrderNotification(newOrder.toObject()).then(result => {
      if (result.success) {
        PipelineOrder.findByIdAndUpdate(newOrder._id, { whatsappSent: true }).exec();
      }
    });

    /* 7. Telegram notification (non-blocking) */
    sendTelegramOrderNotification(newOrder.toObject()).catch(err => {
      console.error('[Telegram] Notification failed:', err);
    });

    /* 8. Respond immediately */
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      order: {
        orderId,
        customerName,
        productName,
        quantity: qty,
        products: normalizedProducts,
        productImageUrl,
        subtotal: selectedSubtotal,
        deliveryCharge,
        total,
        paymentMethod,
        transactionId,
        status: 'Pending',
      },
    });
  } catch (err) {
    console.error('[Pipeline] Create order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN ROUTES  — all protected
═══════════════════════════════════════════════════════════════════════════ */
router.use(protect, authorize('admin'));

/* GET /api/pipeline/orders  – List with filters + search + pagination */
router.get('/orders', async (req, res) => {
  try {
    const {
      status, courier, phone, orderId: orderIdSearch,
      district,
      page = 1, limit = 50,
    } = req.query;

    const filter = {};
    if (status) {
      if (status === 'All') {
        delete filter.status;
      } else {
        filter.status = status;
      }
    }
    if (courier) filter.courier = courier;
    if (district) filter.district = district;
    if (phone) filter.phone = { $regex: phone, $options: 'i' };
    if (orderIdSearch) filter.orderId = { $regex: orderIdSearch, $options: 'i' };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await PipelineOrder.countDocuments(filter);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayTotal, pendingCount, processingCount, shippedCount, deliveredCount] = await Promise.all([
      PipelineOrder.countDocuments({ createdAt: { $gte: todayStart } }),
      PipelineOrder.countDocuments({ status: 'Pending' }),
      PipelineOrder.countDocuments({ status: 'Processing' }),
      PipelineOrder.countDocuments({ status: 'Shipped' }),
      PipelineOrder.countDocuments({ status: 'Delivered' }),
    ]);

    const statusCountsAgg = await PipelineOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = statusCountsAgg.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const orders = await PipelineOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.json({
      success: true,
      orders: orders.map(toDeliveryOrder),
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      summary: {
        todayTotal,
        pending: pendingCount,
        processing: processingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
      },
      statusCounts,
    });
  } catch (err) {
    console.error('[Pipeline] List orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

/* GET /api/pipeline/orders/:id */
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await PipelineOrder.findOne({ orderId: req.params.id }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, order: toDeliveryOrder(order) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* PATCH /api/pipeline/orders/:id/status  – Update status */
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, adminNote, changedBy = 'Admin' } = req.body;
    if (!DELIVERY_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await PipelineOrder.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    if (adminNote) {
      order.adminNote = adminNote;
    }
    order.statusTimeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
    order.statusTimeline.push({
      status,
      note: adminNote || '',
      changedBy,
      changedAt: new Date(),
    });
    await order.save();

    // Sync to Google Sheets
    updateOrderInSheet(order.orderId, { status, adminNote });

    // WhatsApp status notification
    sendStatusNotification(order.toObject(), status);

    return res.json({ success: true, order: toDeliveryOrder(order) });
  } catch (err) {
    console.error('[Pipeline] Status update error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/pipeline/orders/:id/courier  – Assign courier & dispatch */
router.post('/orders/:id/courier', async (req, res) => {
  try {
    const { courier, trackingId: manualTrackingId = '', deliveryAgent = '' } = req.body;
    if (!SUPPORTED_COURIERS.includes(courier)) {
      return res.status(400).json({
        success: false,
        message: `Invalid courier. Supported: ${SUPPORTED_COURIERS.join(', ')}`,
      });
    }

    const order = await PipelineOrder.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Call courier API
    let trackingId = '';
    let courierOrderId = '';
    try {
      const result    = await courierAdapter.createDeliveryOrder(courier, order.toObject());
      trackingId      = result.trackingId;
      courierOrderId  = result.courierOrderId;
    } catch (courierErr) {
      console.error('[Pipeline] Courier API error:', courierErr.message);
      // Allow saving courier assignment even if API fails (manual fallback)
    }

    order.courier       = courier;
    order.trackingId    = trackingId || String(manualTrackingId || '').trim();
    order.deliveryAgent = String(deliveryAgent || '').trim();
    order.courierOrderId = courierOrderId;
    order.status        = 'Shipped';
    order.statusTimeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
    order.statusTimeline.push({
      status: 'Shipped',
      note: `Assigned to ${courier}`,
      changedBy: 'Admin',
      changedAt: new Date(),
    });
    await order.save();

    updateOrderInSheet(order.orderId, {
      courier, trackingId: order.trackingId, status: 'Shipped',
    });
    sendStatusNotification(order.toObject(), 'Shipped');

    return res.json({
      success: true,
      order: toDeliveryOrder(order),
      trackingId: order.trackingId,
      courierOrderId,
    });
  } catch (err) {
    console.error('[Pipeline] Assign courier error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Compatibility API requested by delivery operations spec
router.post('/orders/update-status', async (req, res) => {
  try {
    const { id, orderId, status, adminNote = '', changedBy = 'Admin' } = req.body;
    const targetId = orderId || id;
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Order id is required.' });
    }
    if (!DELIVERY_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await PipelineOrder.findOne({ orderId: targetId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    if (adminNote) {
      order.adminNote = adminNote;
    }
    order.statusTimeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
    order.statusTimeline.push({ status, note: adminNote, changedBy, changedAt: new Date() });
    await order.save();

    updateOrderInSheet(order.orderId, { status, adminNote });
    sendStatusNotification(order.toObject(), status);

    return res.json({ success: true, order: toDeliveryOrder(order) });
  } catch (err) {
    console.error('[Pipeline] Compatibility update-status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Compatibility API requested by delivery operations spec
router.post('/orders/assign-courier', async (req, res) => {
  try {
    const {
      id,
      orderId,
      courier,
      tracking_id: trackingIdInput = '',
      delivery_agent: deliveryAgent = '',
    } = req.body;
    const targetId = orderId || id;
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Order id is required.' });
    }
    if (!SUPPORTED_COURIERS.includes(courier)) {
      return res.status(400).json({
        success: false,
        message: `Invalid courier. Supported: ${SUPPORTED_COURIERS.join(', ')}`,
      });
    }

    const order = await PipelineOrder.findOne({ orderId: targetId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    let trackingId = String(trackingIdInput || '').trim();
    let courierOrderId = '';

    if (!trackingId) {
      try {
        const result = await courierAdapter.createDeliveryOrder(courier, order.toObject());
        trackingId = result.trackingId || '';
        courierOrderId = result.courierOrderId || '';
      } catch (courierErr) {
        console.error('[Pipeline] Compatibility courier API error:', courierErr.message);
      }
    }

    order.courier = courier;
    order.trackingId = trackingId;
    order.courierOrderId = courierOrderId;
    order.deliveryAgent = String(deliveryAgent || '').trim();
    order.status = 'Shipped';
    order.statusTimeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
    order.statusTimeline.push({
      status: 'Shipped',
      note: `Assigned to ${courier}`,
      changedBy: 'Admin',
      changedAt: new Date(),
    });
    await order.save();

    updateOrderInSheet(order.orderId, { courier, trackingId, status: 'Shipped' });
    sendStatusNotification(order.toObject(), 'Shipped');

    return res.json({
      success: true,
      order: toDeliveryOrder(order),
      trackingId,
      courierOrderId,
    });
  } catch (err) {
    console.error('[Pipeline] Compatibility assign-courier error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
