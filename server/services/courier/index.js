/**
 * Courier Adapter Index
 *
 * Unified interface for all courier integrations.
 * Dispatches to the appropriate courier module based on the `courier` name.
 *
 * Usage:
 *   import courierAdapter from './courier/index.js';
 *   const result = await courierAdapter.createDeliveryOrder('Steadfast', order);
 */

import * as pathao     from './pathao.js';
import * as steadfast  from './steadfast.js';
import * as redx       from './redx.js';

const adapters = {
  Pathao:    pathao,
  Steadfast: steadfast,
  RedX:      redx,
};

/**
 * Get adapter or throw a descriptive error.
 */
function getAdapter(courierName) {
  const adapter = adapters[courierName];
  if (!adapter) {
    const valid = Object.keys(adapters).join(', ');
    throw new Error(`Unknown courier "${courierName}". Valid options: ${valid}`);
  }
  return adapter;
}

/**
 * Create a delivery order with the specified courier.
 *
 * @param {string} courierName  'Pathao' | 'Steadfast' | 'RedX'
 * @param {object} order        PipelineOrder document
 * @returns {Promise<{ trackingId: string, courierOrderId: string }>}
 */
export async function createDeliveryOrder(courierName, order) {
  return getAdapter(courierName).createDeliveryOrder(order);
}

/**
 * Fetch the latest delivery status from the courier.
 *
 * @param {string} courierName
 * @param {string} trackingId
 */
export async function updateOrderStatus(courierName, trackingId, status) {
  return getAdapter(courierName).updateOrderStatus(trackingId, status);
}

export const SUPPORTED_COURIERS = Object.keys(adapters);

export default { createDeliveryOrder, updateOrderStatus, SUPPORTED_COURIERS };
