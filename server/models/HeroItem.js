import mongoose from 'mongoose';

const heroItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  position: {
    type: String,
    enum: ['center', 'left', 'right', 'bottom'],
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  gradient: {
    type: String,
    default: 'from-purple-600/90 via-transparent to-transparent'
  }
}, {
  timestamps: true
});

// Ensure unique position for active items
heroItemSchema.index({ position: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const HeroItem = mongoose.model('HeroItem', heroItemSchema);

export default HeroItem;
