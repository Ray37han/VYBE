import mongoose from 'mongoose';

const visitedPageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const visitorSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  ipAddress: { type: String, index: true },
  // Device info
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop', index: true },
  browser: { type: String, default: 'Unknown' },
  browserVersion: String,
  os: { type: String, default: 'Unknown' },
  osVersion: String,
  // Geo
  country: { type: String, default: 'Unknown', index: true },
  city: { type: String, default: 'Unknown' },
  // Session metadata
  startTime: { type: Date, default: Date.now, index: true },
  lastActivity: { type: Date, default: Date.now, index: true },
  endTime: Date,
  duration: { type: Number, default: 0 }, // seconds
  pageCount: { type: Number, default: 0 },
  visitedPages: [visitedPageSchema],
  isActive: { type: Boolean, default: true, index: true },
  isReturning: { type: Boolean, default: false, index: true },
}, {
  timestamps: true,
});

// Compound indexes for dashboard queries
visitorSessionSchema.index({ startTime: -1, deviceType: 1 });
visitorSessionSchema.index({ startTime: -1, country: 1 });
visitorSessionSchema.index({ isActive: 1, lastActivity: -1 });
visitorSessionSchema.index({ createdAt: -1 });

// Auto-calculate duration before saving
visitorSessionSchema.pre('save', function (next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  }
  next();
});

export default mongoose.model('VisitorSession', visitorSessionSchema);
