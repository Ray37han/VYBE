import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'bikes', 'sports-cars', 'vintage-cars', 'muscle-cars', 'vector-cars',
      'football', 'football-motivational', 'cricket', 'ufc', 'nba', 'f1', 'f1-motivational',
      'marvel', 'dc', 'movies', 'tv-series', 'music', 'games',
      'motivational', 'best-selling', 'sports', 'cars',
      'abstract', 'minimalist', 'nature', 'typography', 'custom', 'anime', 'vintage', 'modern', 'other'
    ]
  },
  images: [{
    url: String, // Optional - for backward compatibility
    publicId: {
      type: String,
      required: true
    },
    format: String, // Image format (jpg, png, webp)
    urls: {
      type: mongoose.Schema.Types.Mixed, // Object with thumbnail, medium, large, full URLs
      required: false
    }
  }],
  sizes: [{
    name: {
      type: String,
      required: true,
      enum: ['A5', 'A4', 'A3', 'A2', 'A1', '12x18', '16x20', '18x24', '24x36']
    },
    dimensions: {
      type: String  // Changed to String to accept "8.3 x 11.7 inches" format
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  customizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    allowImageUpload: { type: Boolean, default: false },
    allowTextCustomization: { type: Boolean, default: false },
    frameColors: [String]
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  bestSelling: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, featured: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ sold: -1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
