/**
 * Steadfast Courier Adapter
 *
 * Docs: https://steadfast.com.bd/user/api
 *
 * Set in .env:
 *   STEADFAST_API_KEY, STEADFAST_API_SECRET,
 *   STEADFAST_BASE_URL  (default: https://portal.steadfast.com.bd)
 */

import axios from 'axios';

const BASE_URL = process.env.STEADFAST_BASE_URL || 'https://portal.steadfast.com.bd';

function headers() {
  return {
    'Api-Key':    process.env.STEADFAST_API_KEY    || '',
    'Secret-Key': process.env.STEADFAST_API_SECRET || '',
    'Content-Type': 'application/json',
  };
}

/**
 * Create a Steadfast delivery order.
 * @param {object} order  PipelineOrder document
 * @returns {{ trackingId: string, courierOrderId: string }}
 */
export async function createDeliveryOrder(order) {
  const payload = {
    invoice:             order.orderId,
    recipient_name:      order.customerName,
    recipient_phone:     order.phone,
    recipient_address:   order.address,
    cod_amount:          order.paymentMethod === 'Cash On Delivery' ? order.total : 0,
    note:                order.orderNotes || '',
  };

  const res = await axios.post(
    `${BASE_URL}/api/v1/create_order`,
    payload,
    { headers: headers() }
  );

  const data = res.data || {};
  return {
    trackingId:     data.tracking_code || '',
    courierOrderId: String(data.consignment?.id || ''),
  };
}

export async function generateTrackingId(order) {
  const result = await createDeliveryOrder(order);
  return result.trackingId;
}

/**
 * Fetch status from Steadfast for a given tracking code.
 */
export async function updateOrderStatus(trackingId) {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/v1/status_by_trackingcode/${trackingId}`,
      { headers: headers() }
    );
    return { success: true, status: res.data?.delivery_status || 'unknown' };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}
