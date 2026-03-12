/**
 * Pathao Courier Adapter
 *
 * Docs: https://hermes.pathao.com/api/v1 (sandbox: https://hermes.pathao.com)
 *
 * Flow:
 *   1. POST /aladdin/api/v1/issue-token  → get access_token
 *   2. POST /aladdin/api/v1/orders       → create delivery order
 *
 * Set in .env:
 *   PATHAO_CLIENT_ID, PATHAO_CLIENT_SECRET,
 *   PATHAO_USERNAME, PATHAO_PASSWORD,
 *   PATHAO_BASE_URL  (default: https://hermes.pathao.com)
 */

import axios from 'axios';

const BASE_URL = process.env.PATHAO_BASE_URL || 'https://hermes.pathao.com';

let _cachedToken   = null;
let _tokenExpiry   = 0;

async function getAccessToken() {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const res = await axios.post(`${BASE_URL}/aladdin/api/v1/issue-token`, {
    client_id:     process.env.PATHAO_CLIENT_ID,
    client_secret: process.env.PATHAO_CLIENT_SECRET,
    username:      process.env.PATHAO_USERNAME,
    password:      process.env.PATHAO_PASSWORD,
    grant_type:    'password',
  });

  _cachedToken = res.data.access_token;
  // Pathao tokens expire in 3600 s – refresh 60 s early
  _tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return _cachedToken;
}

/**
 * Create a Pathao delivery order.
 * @param {object} order  PipelineOrder document
 * @returns {{ trackingId: string, courierOrderId: string }}
 */
export async function createDeliveryOrder(order) {
  const token = await getAccessToken();

  const payload = {
    store_id:              process.env.PATHAO_STORE_ID || '',
    merchant_order_id:     order.orderId,
    recipient_name:        order.customerName,
    recipient_phone:       order.phone,
    recipient_address:     order.address,
    recipient_city:        1,   // Dhaka – map district → city_id in production
    recipient_zone:        1,
    delivery_type:         48,  // 48h normal delivery
    item_type:             2,   // parcel
    special_instruction:   order.orderNotes || '',
    item_quantity:         order.quantity,
    item_weight:           0.5, // kg (default)
    amount_to_collect:     order.paymentMethod === 'Cash On Delivery' ? order.total : 0,
    item_description:      order.productName,
  };

  const res = await axios.post(
    `${BASE_URL}/aladdin/api/v1/orders`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const data = res.data?.data || {};
  return {
    trackingId:     data.consignment_id || '',
    courierOrderId: String(data.order_id || ''),
  };
}

export async function generateTrackingId(order) {
  const result = await createDeliveryOrder(order);
  return result.trackingId;
}

export async function updateOrderStatus(trackingId, status) {
  // Pathao does not expose a status-push endpoint at this time; use webhook.
  console.log('[Pathao] Status update not available via API push:', trackingId, status);
  return { success: false, reason: 'not_supported' };
}
