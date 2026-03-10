import mongoose from 'mongoose';

const productEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['product_view', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'purchase_completed', 'wishlist_add'],
    index: true,
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  productName: String,
  productCategory: String,
  sessionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  quantity: Number,
  price: Number,
  // For purchase events
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  revenue: Number,
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  timestamps: false,
});

productEventSchema.index({ timestamp: -1, eventType: 1 });
productEventSchema.index({ productId: 1, eventType: 1, timestamp: -1 });

export default mongoose.model('ProductEvent', productEventSchema);
