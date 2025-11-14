import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Bangladesh' }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    size: String,
    customization: {
      uploadedImageUrl: String,
      uploadedImagePublicId: String,
      textOverlay: String,
      frameColor: String,
      adminInstructions: String
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  // Email verification OTP fields
  verificationCode: {
    type: String,
    default: null
  },
  codeExpires: {
    type: Date,
    default: null
  },
  // Trusted devices for "Remember Me" feature
  trustedDevices: [{
    deviceId: {
      type: String,
      required: true
    },
    deviceName: String, // e.g., "Chrome on MacOS"
    fingerprint: String,
    ipAddress: String,
    userAgent: String,
    lastUsed: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  }],
  // Backup codes for emergency access
  backupCodes: [{
    code: {
      type: String,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  // Login history and security
  loginHistory: [{
    ipAddress: String,
    userAgent: String,
    location: String,
    deviceInfo: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    success: Boolean,
    method: {
      type: String,
      enum: ['otp', 'backup-code', 'trusted-device'],
      default: 'otp'
    }
  }],
  // Security settings
  securitySettings: {
    twoFactorEnabled: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    loginAlerts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'trustedDevices.deviceId': 1 });
userSchema.index({ 'trustedDevices.expiresAt': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
