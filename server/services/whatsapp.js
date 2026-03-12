/**
 * WhatsApp Notification Service (CallMeBot)
 *
 * Sends an instant WhatsApp message using the CallMeBot free API.
 *
 * Setup (one-time):
 *   1. Save +34 644 59 78 10 in your contacts as "CallMeBot"
 *   2. Send "I allow callmebot to send me messages" via WhatsApp
 *   3. You will receive your apikey in a reply
 *   4. Set CALLMEBOT_PHONE and CALLMEBOT_API_KEY in .env
 *
 * API endpoint:
 *   GET https://api.callmebot.com/whatsapp.php?phone=PHONE&text=MSG&apikey=KEY
 */

import axios from 'axios';

const CALLMEBOT_BASE = 'https://api.callmebot.com/whatsapp.php';

/**
 * Format the WhatsApp notification message for a new pipeline order.
 * @param {object} order
 */
function buildMessage(order) {
  const taka = '\u09F3'; // ৳
  return [
    '🚨 NEW ORDER – VYBE',
    '',
    `Order ID: ${order.orderId}`,
    '',
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    '',
    `Product: ${order.productName}`,
    `Qty: ${order.quantity}`,
    `Total: ${taka}${order.total}`,
    '',
    `District: ${order.district}`,
    '',
    `Payment: ${order.paymentMethod}`,
    '',
    'Address:',
    order.address,
    order.orderNotes ? `\nNotes: ${order.orderNotes}` : '',
  ]
    .join('\n')
    .trim();
}

/**
 * Send a WhatsApp notification for a new order.
 * Failures are swallowed – order creation must not depend on this.
 *
 * @param {object} order  PipelineOrder document
 * @returns {Promise<{success: boolean}>}
 */
export async function sendOrderNotification(order) {
  const phone  = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    console.warn('[WhatsApp] CALLMEBOT_PHONE or CALLMEBOT_API_KEY not set – skipping');
    return { success: false, reason: 'not_configured' };
  }

  const message = buildMessage(order);
  const params  = new URLSearchParams({
    phone,
    text:   message,
    apikey: apiKey,
  });

  try {
    const response = await axios.get(`${CALLMEBOT_BASE}?${params.toString()}`, {
      timeout: 12_000,
    });
    console.log('[WhatsApp] Notification sent. Status:', response.status);
    return { success: true };
  } catch (err) {
    console.error('[WhatsApp] Notification failed:', err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Send a status-change WhatsApp notification (e.g. Shipped).
 */
export async function sendStatusNotification(order, newStatus) {
  const phone  = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!phone || !apiKey) return { success: false };

  const taka = '\u09F3';
  const icon = {
    Confirmed:  '✅',
    Processing: '⚙️',
    Shipped:    '🚚',
    Delivered:  '🎉',
    Cancelled:  '❌',
  }[newStatus] || '📦';

  const message = [
    `${icon} ORDER ${newStatus.toUpperCase()} – VYBE`,
    '',
    `Order ID: ${order.orderId}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Product: ${order.productName}`,
    `Total: ${taka}${order.total}`,
    order.trackingId ? `Tracking: ${order.trackingId}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({ phone, text: message, apikey: apiKey });

  try {
    await axios.get(`${CALLMEBOT_BASE}?${params.toString()}`, { timeout: 12_000 });
    return { success: true };
  } catch (err) {
    console.error('[WhatsApp] Status notification failed:', err.message);
    return { success: false };
  }
}
