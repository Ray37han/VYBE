// Rate Limiting Middleware for OTP Requests
// Prevents abuse by limiting OTP requests per email address

const otpAttempts = new Map(); // Format: { email: { count, resetTime } }
const loginAttempts = new Map(); // Format: { ip: { count, resetTime, blockedUntil } }

// Configuration
const OTP_RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000, // 1 hour block after exceeding limit
};

const LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block
};

/**
 * Clean up expired entries to prevent memory leaks
 */
const cleanupExpiredEntries = (map) => {
  const now = Date.now();
  for (const [key, value] of map.entries()) {
    if (value.resetTime < now && (!value.blockedUntil || value.blockedUntil < now)) {
      map.delete(key);
    }
  }
};

// Run cleanup every 10 minutes
setInterval(() => {
  cleanupExpiredEntries(otpAttempts);
  cleanupExpiredEntries(loginAttempts);
}, 10 * 60 * 1000);

/**
 * Rate limit OTP requests by email address
 */
export const otpRateLimiter = (req, res, next) => {
  const email = req.body.email?.toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const now = Date.now();
  const userAttempts = otpAttempts.get(email);

  // Check if user is currently blocked
  if (userAttempts?.blockedUntil && userAttempts.blockedUntil > now) {
    const remainingMinutes = Math.ceil((userAttempts.blockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
      blockedUntil: userAttempts.blockedUntil,
      remainingMs: userAttempts.blockedUntil - now,
    });
  }

  // Reset window if expired
  if (!userAttempts || userAttempts.resetTime < now) {
    otpAttempts.set(email, {
      count: 1,
      resetTime: now + OTP_RATE_LIMIT.windowMs,
      blockedUntil: null,
    });
    return next();
  }

  // Increment attempts
  userAttempts.count++;

  // Check if limit exceeded
  if (userAttempts.count > OTP_RATE_LIMIT.maxAttempts) {
    userAttempts.blockedUntil = now + OTP_RATE_LIMIT.blockDurationMs;
    otpAttempts.set(email, userAttempts);

    const blockMinutes = Math.ceil(OTP_RATE_LIMIT.blockDurationMs / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Account temporarily blocked for ${blockMinutes} minutes.`,
      blockedUntil: userAttempts.blockedUntil,
      remainingMs: OTP_RATE_LIMIT.blockDurationMs,
    });
  }

  // Update attempts
  otpAttempts.set(email, userAttempts);

  // Add rate limit info to response headers
  res.set({
    'X-RateLimit-Limit': OTP_RATE_LIMIT.maxAttempts,
    'X-RateLimit-Remaining': OTP_RATE_LIMIT.maxAttempts - userAttempts.count,
    'X-RateLimit-Reset': new Date(userAttempts.resetTime).toISOString(),
  });

  next();
};

/**
 * Rate limit login attempts by IP address
 */
export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const ipAttempts = loginAttempts.get(ip);

  // Check if IP is currently blocked
  if (ipAttempts?.blockedUntil && ipAttempts.blockedUntil > now) {
    const remainingMinutes = Math.ceil((ipAttempts.blockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
      blockedUntil: ipAttempts.blockedUntil,
      remainingMs: ipAttempts.blockedUntil - now,
    });
  }

  // Reset window if expired
  if (!ipAttempts || ipAttempts.resetTime < now) {
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + LOGIN_RATE_LIMIT.windowMs,
      blockedUntil: null,
    });
    return next();
  }

  // Increment attempts
  ipAttempts.count++;

  // Check if limit exceeded
  if (ipAttempts.count > LOGIN_RATE_LIMIT.maxAttempts) {
    ipAttempts.blockedUntil = now + LOGIN_RATE_LIMIT.blockDurationMs;
    loginAttempts.set(ip, ipAttempts);

    const blockMinutes = Math.ceil(LOGIN_RATE_LIMIT.blockDurationMs / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. IP temporarily blocked for ${blockMinutes} minutes.`,
      blockedUntil: ipAttempts.blockedUntil,
      remainingMs: LOGIN_RATE_LIMIT.blockDurationMs,
    });
  }

  // Update attempts
  loginAttempts.set(ip, ipAttempts);

  // Add rate limit info to response headers
  res.set({
    'X-RateLimit-Limit': LOGIN_RATE_LIMIT.maxAttempts,
    'X-RateLimit-Remaining': LOGIN_RATE_LIMIT.maxAttempts - ipAttempts.count,
    'X-RateLimit-Reset': new Date(ipAttempts.resetTime).toISOString(),
  });

  next();
};

/**
 * Reset rate limit for an email (used after successful verification)
 */
export const resetOtpRateLimit = (email) => {
  if (email) {
    otpAttempts.delete(email.toLowerCase());
  }
};

/**
 * Reset login rate limit for an IP (used after successful login)
 */
export const resetLoginRateLimit = (ip) => {
  if (ip) {
    loginAttempts.delete(ip);
  }
};

/**
 * Get current rate limit status for monitoring/debugging
 */
export const getRateLimitStatus = () => {
  return {
    otpAttempts: Array.from(otpAttempts.entries()).map(([email, data]) => ({
      email: email.replace(/(.{3}).*(@.*)/, '$1***$2'), // Partially hide email
      count: data.count,
      resetTime: new Date(data.resetTime).toISOString(),
      blockedUntil: data.blockedUntil ? new Date(data.blockedUntil).toISOString() : null,
    })),
    loginAttempts: Array.from(loginAttempts.entries()).map(([ip, data]) => ({
      ip: ip.replace(/\.\d+$/, '.***'), // Partially hide IP
      count: data.count,
      resetTime: new Date(data.resetTime).toISOString(),
      blockedUntil: data.blockedUntil ? new Date(data.blockedUntil).toISOString() : null,
    })),
  };
};

export default {
  otpRateLimiter,
  loginRateLimiter,
  resetOtpRateLimit,
  resetLoginRateLimit,
  getRateLimitStatus,
};
