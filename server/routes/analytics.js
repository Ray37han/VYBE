/**
 * Analytics Routes
 * All write endpoints use non-blocking fire-and-forget pattern.
 * Read endpoints (dashboard) use aggregation pipelines optimized with indexes.
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import VisitorSession from '../models/VisitorSession.js';
import PageView from '../models/PageView.js';
import ProductEvent from '../models/ProductEvent.js';
import Order from '../models/Order.js';
import {
  upsertSession,
  recordPageView,
  sanitizeSessionId,
  activeSessions,
} from '../services/analyticsService.js';

const router = express.Router();

// ─── WRITE ENDPOINTS (public, lightweight) ────────────────────────────────────

/**
 * POST /api/analytics/session
 * Called by the frontend on page load to register/refresh a session.
 */
router.post('/session', async (req, res) => {
  const { sessionId, userId } = req.body;
  const sid = sanitizeSessionId(sessionId);
  if (!sid) return res.status(400).json({ success: false, message: 'Invalid sessionId' });

  // Fire and forget — don't block HTTP response
  upsertSession(sid, req, { userId }).catch(() => {});

  res.json({ success: true });
});

/**
 * POST /api/analytics/pageview
 * Track a page view. Frontend calls this on every route change.
 */
router.post('/pageview', async (req, res) => {
  const { sessionId, userId, url, path, title, referrer, duration } = req.body;
  const sid = sanitizeSessionId(sessionId);
  if (!sid || !url) return res.status(400).json({ success: false, message: 'sessionId and url required' });

  // Fire and forget
  recordPageView(sid, { userId, url, path, title, referrer, duration }, req).catch(() => {});

  res.json({ success: true });
});

/**
 * POST /api/analytics/event
 * Track product interaction events.
 */
router.post('/event', async (req, res) => {
  const { sessionId, userId, eventType, productId, productName, productCategory, quantity, price, orderId, revenue } = req.body;
  const sid = sanitizeSessionId(sessionId);

  const allowedEvents = ['product_view', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'purchase_completed', 'wishlist_add'];
  if (!sid || !allowedEvents.includes(eventType)) {
    return res.status(400).json({ success: false, message: 'Invalid event' });
  }

  // Non-blocking write
  ProductEvent.create({
    eventType,
    sessionId: sid,
    userId: userId || null,
    productId: productId || null,
    productName: productName || null,
    productCategory: productCategory || null,
    quantity: quantity || null,
    price: price || null,
    orderId: orderId || null,
    revenue: revenue || null,
  }).catch(() => {});

  res.json({ success: true });
});

// ─── READ ENDPOINTS (admin only) ──────────────────────────────────────────────

// All admin analytics routes require auth
router.use(protect, authorize('admin'));

/**
 * GET /api/analytics/active-users
 * Returns real-time active visitor count (from in-memory set).
 */
router.get('/active-users', async (req, res) => {
  try {
    // Cross-reference with DB for sessions active in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const dbActive = await VisitorSession.countDocuments({
      isActive: true,
      lastActivity: { $gte: fiveMinutesAgo },
    });

    res.json({
      success: true,
      data: {
        socketCount: activeSessions.size,
        dbCount: dbActive,
        // Use socket count as primary (most accurate), DB as fallback
        count: activeSessions.size || dbActive,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/visitors
 * Summary of visitor traffic: today, this week, this month, total.
 */
router.get('/visitors', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, thisWeek, thisMonth, total, newVisitors, returningVisitors] = await Promise.all([
      VisitorSession.countDocuments({ startTime: { $gte: startOfDay } }),
      VisitorSession.countDocuments({ startTime: { $gte: startOfWeek } }),
      VisitorSession.countDocuments({ startTime: { $gte: startOfMonth } }),
      VisitorSession.countDocuments({}),
      VisitorSession.countDocuments({ isReturning: false }),
      VisitorSession.countDocuments({ isReturning: true }),
    ]);

    // Average session duration (in seconds) and pages per session
    const sessionStats = await VisitorSession.aggregate([
      { $match: { duration: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          avgPages: { $avg: '$pageCount' },
        },
      },
    ]);

    // Daily visitor trend for last 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const dailyTrend = await VisitorSession.aggregate([
      { $match: { startTime: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        today,
        thisWeek,
        thisMonth,
        total,
        newVisitors,
        returningVisitors,
        avgSessionDuration: Math.round(sessionStats[0]?.avgDuration || 0),
        avgPagesPerSession: Math.round((sessionStats[0]?.avgPages || 0) * 10) / 10,
        dailyTrend: dailyTrend.map(d => ({
          date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
          visitors: d.count,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/devices
 * Device, browser, OS distribution.
 */
router.get('/devices', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [deviceDist, browserDist, osDist] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const total = deviceDist.reduce((sum, d) => sum + d.count, 0);

    res.json({
      success: true,
      data: {
        devices: deviceDist.map(d => ({
          type: d._id || 'unknown',
          count: d.count,
          percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
        })),
        browsers: browserDist.map(b => ({ name: b._id || 'Unknown', count: b.count })),
        os: osDist.map(o => ({ name: o._id || 'Unknown', count: o.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/geo
 * Top countries visiting the website.
 */
router.get('/geo', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [countries, cities] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: thirtyDaysAgo }, country: { $nin: ['Unknown', 'Local'] } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: thirtyDaysAgo }, city: { $nin: ['Unknown', 'Local'] } } },
        { $group: { _id: '$city', country: { $first: '$country' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        countries: countries.map(c => ({ country: c._id, count: c.count })),
        cities: cities.map(c => ({ city: c._id, country: c.country, count: c.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/pages
 * Top visited pages, with view counts.
 */
router.get('/pages', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const topPages = await PageView.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$path', views: { $sum: 1 }, uniqueSessions: { $addToSet: '$sessionId' } } },
      { $project: { _id: 1, views: 1, uniqueVisitors: { $size: '$uniqueSessions' } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: topPages.map(p => ({ path: p._id, views: p.views, uniqueVisitors: p.uniqueVisitors })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/products
 * Product analytics: most viewed, most carted, best selling.
 */
router.get('/products', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [mostViewed, mostCarted, topEvents] = await Promise.all([
      ProductEvent.aggregate([
        { $match: { eventType: 'product_view', timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$productId', name: { $first: '$productName' }, category: { $first: '$productCategory' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ProductEvent.aggregate([
        { $match: { eventType: 'add_to_cart', timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$productId', name: { $first: '$productName' }, category: { $first: '$productCategory' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ProductEvent.aggregate([
        { $match: { eventType: 'purchase_completed', timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$productId', name: { $first: '$productName' }, category: { $first: '$productCategory' }, count: { $sum: 1 }, revenue: { $sum: '$revenue' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        mostViewed: mostViewed.map(p => ({ productId: p._id, name: p.name, category: p.category, views: p.count })),
        mostCarted: mostCarted.map(p => ({ productId: p._id, name: p.name, category: p.category, cartAdds: p.count })),
        bestSelling: topEvents.map(p => ({ productId: p._id, name: p.name, category: p.category, orders: p.count, revenue: p.revenue || 0 })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/sales
 * Revenue analytics: daily, weekly, monthly totals and trends.
 */
router.get('/sales', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);

    const revenueMatch = { 'paymentInfo.status': 'completed' };

    const [daily, weekly, monthly, total, dailyTrend] = await Promise.all([
      Order.aggregate([
        { $match: { ...revenueMatch, createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...revenueMatch, createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...revenueMatch, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...revenueMatch, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        daily: { revenue: daily[0]?.revenue || 0, orders: daily[0]?.orders || 0 },
        weekly: { revenue: weekly[0]?.revenue || 0, orders: weekly[0]?.orders || 0 },
        monthly: { revenue: monthly[0]?.revenue || 0, orders: monthly[0]?.orders || 0 },
        total: { revenue: total[0]?.revenue || 0, orders: total[0]?.orders || 0 },
        dailyTrend: dailyTrend.map(d => ({
          date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
          revenue: d.revenue,
          orders: d.orders,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
