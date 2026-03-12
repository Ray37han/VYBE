/**
 * RedX Courier Adapter
 *
 * Docs: https://redx.com.bd/open-api/
 *
 * Set in .env:
 *   REDX_API_KEY,
 *   REDX_BASE_URL  (default: https://openapi.redx.com.bd)
 */

import axios from 'axios';

const BASE_URL = process.env.REDX_BASE_URL || 'https://openapi.redx.com.bd';

function headers() {
  return {
    'ACCESS-TOKEN':  `Bearer ${process.env.REDX_API_KEY || ''}`,
    'Content-Type':  'application/json',
  };
}

/**
 * Create a RedX delivery order.
 * @param {object} order  PipelineOrder document
 * @returns {{ trackingId: string, courierOrderId: string }}
 */
export async function createDeliveryOrder(order) {
  const payload = {
    name:           order.customerName,
    number:         order.phone,
    email:          order.email || '',
    address:        order.address,
    merchant_invoice_id: order.orderId,
    cash_collection_amount: order.paymentMethod === 'Cash On Delivery' ? order.total : 0,
    parcel_details: [
      {
        name:     order.productName,
        quantity: order.quantity,
        unit_price: order.price,
      }
    ],
    delivery_area:   order.district,
    delivery_area_id: 1,    // map district → area_id in production
    package_type_id:  1,    // small parcel default
  };

  const res = await axios.post(
    `${BASE_URL}/v1.0.0/parcel`,
    payload,
    { headers: headers() }
  );

  const data = res.data || {};
  return {
    trackingId:     data.tracking_id || '',
    courierOrderId: String(data.tracking_id || ''),
  };
}

export async function generateTrackingId(order) {
  const result = await createDeliveryOrder(order);
  return result.trackingId;
}

export async function updateOrderStatus(trackingId) {
  try {
    const res = await axios.get(
      `${BASE_URL}/v1.0.0/parcel/info/${trackingId}`,
      { headers: headers() }
    );
    return { success: true, status: res.data?.parcel?.status || 'unknown' };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}
