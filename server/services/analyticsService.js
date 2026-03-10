/**
 * Analytics Service
 * Handles session management, device detection, geolocation, and Socket.IO broadcasting.
 * All analytics writes are non-blocking fire-and-forget to avoid slowing down main traffic.
 */

import { UAParser } from 'ua-parser-js';
import VisitorSession from '../models/VisitorSession.js';
import PageView from '../models/PageView.js';

// In-memory set of active socket session IDs (for real-time count)
// This is intentionally kept in-memory to avoid DB round trips on every heartbeat
export const activeSessions = new Set();

// Reference to Socket.IO instance (set from server.js)
let ioInstance = null;

export function setSocketIO(io) {
  ioInstance = io;
}

/**
 * Parse User-Agent string into structured device info
 */
export function parseUserAgent(uaString) {
  const parser = new UAParser(uaString || '');
  const result = parser.getResult();

  let deviceType = 'desktop';
  const deviceKind = result.device?.type;
  if (deviceKind === 'mobile') deviceType = 'mobile';
  else if (deviceKind === 'tablet') deviceType = 'tablet';

  return {
    deviceType,
    browser: result.browser?.name || 'Unknown',
    browserVersion: result.browser?.version || '',
    os: result.os?.name || 'Unknown',
    osVersion: result.os?.version || '',
  };
}

/**
 * Extract real client IP, respecting proxies
 */
export function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.connection?.remoteAddress || req.ip || '0.0.0.0';
}

/**
 * Lightweight IP geolocation using ip-api.com (free, no API key needed, 1000 req/min)
 * Falls back gracefully on error or localhost IPs.
 */
const geoCache = new Map(); // ephemeral in-memory cache for this process lifecycle

export async function getGeoInfo(ip) {
  // Skip private/localhost IPs
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') ||
      ip.startsWith('10.') || ip.startsWith('172.') || ip === '0.0.0.0') {
    return { country: 'Local', city: 'Local' };
  }

  if (geoCache.has(ip)) return geoCache.get(ip);

  try {
    const { default: https } = await import('https');
    const geo = await new Promise((resolve, reject) => {
      const req = https.get(`https://ip-api.com/json/${ip}?fields=status,country,city`, { timeout: 3000 }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch {
            reject(new Error('Parse error'));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });

    const result = geo.status === 'success'
      ? { country: geo.country || 'Unknown', city: geo.city || 'Unknown' }
      : { country: 'Unknown', city: 'Unknown' };

    // Cache for 1 hour per IP
    geoCache.set(ip, result);
    setTimeout(() => geoCache.delete(ip), 3600_000);
    return result;
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

/**
 * Upsert a visitor session (non-blocking)
 * Called when a visitor connects/navigates. No await on callers.
 */
export async function upsertSession(sessionId, req, extra = {}) {
  try {
    const ip = getClientIP(req);
    const uaInfo = parseUserAgent(req.headers['user-agent']);
    const geoInfo = await getGeoInfo(ip); // async but called inside our own async fn

    const isNew = !(await VisitorSession.exists({ sessionId }));

    // Check if returning visitor (same IP seen before)
    let isReturning = false;
    if (isNew && ip && !['Local', '0.0.0.0'].includes(geoInfo.country)) {
      isReturning = !!(await VisitorSession.exists({ ipAddress: ip, sessionId: { $ne: sessionId } }));
    }

    await VisitorSession.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          ipAddress: ip,
          ...uaInfo,
          ...geoInfo,
          lastActivity: new Date(),
          isActive: true,
          ...(extra.userId && { userId: extra.userId }),
        },
        $setOnInsert: {
          sessionId,
          startTime: new Date(),
          isReturning,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error('[Analytics] upsertSession error:', err.message);
  }
}

/**
 * Record a page view (non-blocking helper)
 */
export async function recordPageView(sessionId, data, req) {
  try {
    const ip = getClientIP(req);
    const uaInfo = parseUserAgent(req.headers['user-agent']);

    const pv = new PageView({
      sessionId,
      userId: data.userId || null,
      url: data.url,
      path: data.path || new URL(data.url, 'http://x').pathname,
      title: data.title || '',
      referrer: data.referrer || req.headers.referer || '',
      deviceType: uaInfo.deviceType,
      country: data.country || 'Unknown',
      duration: data.duration || 0,
    });
    await pv.save();

    // Update session page count & visited pages
    await VisitorSession.findOneAndUpdate(
      { sessionId },
      {
        $inc: { pageCount: 1 },
        $push: {
          visitedPages: {
            $each: [{ url: data.path || data.url, title: data.title || '', timestamp: new Date() }],
            $slice: -50, // keep last 50 pages per session
          },
        },
        $set: { lastActivity: new Date() },
      }
    );
  } catch (err) {
    console.error('[Analytics] recordPageView error:', err.message);
  }
}

/**
 * Mark a session as inactive (called on socket disconnect or TTL)
 */
export async function deactivateSession(sessionId) {
  try {
    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      const endTime = new Date();
      const duration = Math.round((endTime - session.startTime) / 1000);
      await VisitorSession.findOneAndUpdate(
        { sessionId },
        { $set: { isActive: false, endTime, duration, lastActivity: endTime } }
      );
    }
  } catch (err) {
    console.error('[Analytics] deactivateSession error:', err.message);
  }
}

/**
 * Broadcast active visitor count to all connected admin sockets
 */
export function broadcastActiveCount() {
  if (!ioInstance) return;
  const count = activeSessions.size;
  ioInstance.to('admin-room').emit('active-visitors', { count, timestamp: Date.now() });
}

/**
 * Sanitize session ID to prevent injection
 */
export function sanitizeSessionId(id) {
  if (!id || typeof id !== 'string') return null;
  // Allow only alphanumeric, hyphens, underscores up to 64 chars
  const cleaned = id.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 64);
  return cleaned.length >= 8 ? cleaned : null;
}
