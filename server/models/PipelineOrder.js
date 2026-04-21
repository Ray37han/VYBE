/**
 * PipelineOrder Model
 *
 * Represents a quick-checkout (no-auth) order submitted via the
 * Vybe order pipeline: Checkout → Google Sheets + WhatsApp → Delivery Dashboard.
 *
 * Separate from the authenticated Order model so the ops team can
 * manage both flows independently.
 */

import mongoose from 'mongoose';

const pipelineProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    image_url: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const statusTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true, trim: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: '' },
    changedBy: { type: String, trim: true, default: 'System' },
  },
  { _id: false }
);

/* ─── Counter helper ──────────────────────────────────────────────────────── */
// A tiny sub-document stored in a "counters" collection keeps the daily
// sequence number used in VYBE-YYYYMMDD-XXXX order IDs atomic.

const counterSchema = new mongoose.Schema({
  _id: String,        // key  e.g. "pipeline-2026-03-12"
  seq: { type: Number, default: 0 }
});
export const PipelineCounter = mongoose.model('PipelineCounter', counterSchema);

/**
 * Atomically increment and return the next daily sequence number.
 * @param {string} dateStr  YYYYMMDD
 */
export async function nextDailySeq(dateStr) {
  const key = `pipeline-${dateStr}`;
  const doc = await PipelineCounter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

/* ─── Main schema ─────────────────────────────────────────────────────────── */

const pipelineOrderSchema = new mongoose.Schema(
  {
    // ── Identifiers ──────────────────────────────────────────────
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // Format: VYBE-YYYYMMDD-XXXX
    },

    // ── Customer ─────────────────────────────────────────────────
    customerName: { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    email:        { type: String, trim: true, lowercase: true, default: '' },
    district:     { type: String, required: true, trim: true },
    address:      { type: String, required: true, trim: true },
    orderNotes:   { type: String, trim: true, default: '' },

    // ── Product ──────────────────────────────────────────────────
    productId:    { type: String, trim: true, default: '' },
    productName:  { type: String, required: true, trim: true },
    productImageUrl: { type: String, trim: true, default: '' },
    quantity:     { type: Number, required: true, min: 1, default: 1 },
    price:        { type: Number, required: true, min: 0 },
    subtotal:     { type: Number, min: 0, default: 0 },
    deliveryCharge: { type: Number, min: 0, default: 0 },
    total:        { type: Number, required: true, min: 0 },
    products: {
      type: [pipelineProductSchema],
      default: [],
    },

    // ── Payment ──────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash On Delivery', 'bKash', 'Nagad', 'Rocket'],
    },

    // ── Status workflow ─────────────────────────────────────────
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },

    // ── Courier ──────────────────────────────────────────────────
    courier:    { type: String, trim: true, default: '' },   // Pathao | Steadfast | RedX
    trackingId: { type: String, trim: true, default: '' },
    deliveryAgent: { type: String, trim: true, default: '' },

    // ── Metadata ─────────────────────────────────────────────────
    ipAddress: { type: String, trim: true, default: '' },
    userAgent: { type: String, trim: true, default: '' },
    pageUrl:   { type: String, trim: true, default: '' },

    // ── Sync flags ───────────────────────────────────────────────
    syncedToSheets:   { type: Boolean, default: false },
    whatsappSent:     { type: Boolean, default: false },
    courierOrderId:   { type: String, trim: true, default: '' },

    // ── Admin notes ──────────────────────────────────────────────
    adminNote: { type: String, default: '' },
    statusTimeline: {
      type: [statusTimelineSchema],
      default: [],
    },
  },
  {
    timestamps: true,  // createdAt, updatedAt
    versionKey: false,
  }
);

// Compound index for IP-based rate-limiting queries (count per IP per hour)
pipelineOrderSchema.index({ ipAddress: 1, createdAt: -1 });

// Text index for search
pipelineOrderSchema.index({ orderId: 'text', phone: 'text', customerName: 'text' });
pipelineOrderSchema.index({ status: 1, district: 1, createdAt: -1 });

const PipelineOrder = mongoose.model('PipelineOrder', pipelineOrderSchema);
export default PipelineOrder;
