import mongoose from 'mongoose';

/**
 * Category Collection
 * 
 * Provides a structured hierarchy for product categories.
 * Products are mapped to categories via normalizedCategory field.
 * The original product.category field is NEVER modified.
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  parent: {
    type: String,
    default: null,
    trim: true,
  },
  icon: {
    type: String,
    default: '📦',
  },
  description: {
    type: String,
    default: '',
  },
  productCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes (slug unique index is auto-created via unique: true on field)
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model('Category', categorySchema);
