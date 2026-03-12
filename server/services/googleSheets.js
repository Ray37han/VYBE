/**
 * Google Sheets Integration Service
 *
 * Sends order data to a Google Apps Script Web App which appends a row
 * to the VYBE_ORDERS_DATABASE spreadsheet.
 *
 * The Apps Script endpoint (GOOGLE_APPS_SCRIPT_URL) must be deployed as
 * "Execute as: Me" and "Who has access: Anyone" (anonymous POST).
 *
 * Sheet columns (order matters):
 *   OrderID | Timestamp | CustomerName | Phone | Email | District | Address |
 *   ProductName | ProductID | Quantity | Price | Total | PaymentMethod |
 *   OrderNotes | Status | Courier | TrackingID | IP | UserAgent
 */

import axios from 'axios';

/**
 * Append one pipeline order row to Google Sheets.
 * Failures are logged but never thrown – the order must succeed even if
 * Sheets is unreachable.
 *
 * @param {object} order  PipelineOrder document (plain object)
 */
export async function appendOrderToSheet(order) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.warn('[GoogleSheets] GOOGLE_APPS_SCRIPT_URL not set – skipping sync');
    return { success: false, reason: 'not_configured' };
  }

  const payload = {
    orderId:       order.orderId,
    timestamp:     order.createdAt
                     ? new Date(order.createdAt).toISOString()
                     : new Date().toISOString(),
    customerName:  order.customerName,
    phone:         order.phone,
    email:         order.email || '',
    district:      order.district,
    address:       order.address,
    productName:   order.productName,
    productId:     order.productId || '',
    quantity:      order.quantity,
    price:         order.price,
    total:         order.total,
    paymentMethod: order.paymentMethod,
    orderNotes:    order.orderNotes || '',
    status:        order.status || 'Pending',
    courier:       order.courier || '',
    trackingId:    order.trackingId || '',
    ip:            order.ipAddress || '',
    userAgent:     order.userAgent || '',
  };

  try {
    const response = await axios.post(scriptUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15_000,
    });
    console.log('[GoogleSheets] Row appended successfully:', response.data);
    return { success: true, data: response.data };
  } catch (err) {
    // Network timeout, quota, etc. – silently degrade
    console.error('[GoogleSheets] Failed to append row:', err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Update an existing row in Google Sheets (status / courier / trackingId).
 * Requires the Apps Script to support action:"update".
 */
export async function updateOrderInSheet(orderId, fields) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl) return { success: false, reason: 'not_configured' };

  try {
    const response = await axios.post(
      scriptUrl,
      { action: 'update', orderId, ...fields },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 }
    );
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[GoogleSheets] Update failed:', err.message);
    return { success: false, reason: err.message };
  }
}
