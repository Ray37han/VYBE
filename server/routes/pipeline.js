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
import courierAdapter, { SUPPORTED_COURIERS } from '../services/courier/index.js';

const router = express.Router();

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

const PAYMENT_METHODS = ['Cash On Delivery', 'bKash', 'Nagad', 'Rocket'];

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
      quantity, price,
      paymentMethod,
      pageUrl = '',
    } = req.body;

    const qty   = parseInt(quantity, 10);
    const prc   = parseFloat(price);
    const total = +(qty * prc).toFixed(2);

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
      quantity: qty, price: prc, total,
      paymentMethod,
      status: 'Pending',
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

    /* 7. Respond immediately */
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      order: {
        orderId,
        customerName,
        productName,
        quantity: qty,
        total,
        paymentMethod,
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
      page = 1, limit = 50,
    } = req.query;

    const filter = {};
    if (status)          filter.status   = status;
    if (courier)         filter.courier  = courier;
    if (phone)           filter.phone    = { $regex: phone, $options: 'i' };
    if (orderIdSearch)   filter.orderId  = { $regex: orderIdSearch, $options: 'i' };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await PipelineOrder.countDocuments(filter);
    const orders = await PipelineOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.json({
      success: true,
      orders,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
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
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* PATCH /api/pipeline/orders/:id/status  – Update status */
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const VALID = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await PipelineOrder.findOneAndUpdate(
      { orderId: req.params.id },
      { status, ...(adminNote ? { adminNote } : {}) },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Sync to Google Sheets
    updateOrderInSheet(order.orderId, { status, adminNote });

    // WhatsApp status notification
    sendStatusNotification(order.toObject(), status);

    return res.json({ success: true, order });
  } catch (err) {
    console.error('[Pipeline] Status update error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/pipeline/orders/:id/courier  – Assign courier & dispatch */
router.post('/orders/:id/courier', async (req, res) => {
  try {
    const { courier } = req.body;
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
    order.trackingId    = trackingId;
    order.courierOrderId = courierOrderId;
    order.status        = 'Shipped';
    await order.save();

    updateOrderInSheet(order.orderId, {
      courier, trackingId, status: 'Shipped',
    });
    sendStatusNotification(order.toObject(), 'Shipped');

    return res.json({ success: true, order, trackingId, courierOrderId });
  } catch (err) {
    console.error('[Pipeline] Assign courier error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
