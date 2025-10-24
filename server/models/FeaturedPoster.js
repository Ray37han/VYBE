import mongoose from 'mongoose';

const featuredPosterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  colorGradient: {
    type: String,
    required: [true, 'Color gradient is required'],
    default: 'from-purple-600 to-pink-600'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient sorting
featuredPosterSchema.index({ order: 1, isActive: 1 });

const FeaturedPoster = mongoose.model('FeaturedPoster', featuredPosterSchema);

export default FeaturedPoster;
