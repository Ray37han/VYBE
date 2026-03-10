import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  url: { type: String, required: true },
  path: { type: String, required: true, index: true },
  title: String,
  referrer: String,
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop', index: true },
  country: { type: String, default: 'Unknown' },
  duration: { type: Number, default: 0 }, // time spent on page in seconds
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  timestamps: false,
});

pageViewSchema.index({ timestamp: -1, path: 1 });
pageViewSchema.index({ sessionId: 1, timestamp: -1 });

export default mongoose.model('PageView', pageViewSchema);
