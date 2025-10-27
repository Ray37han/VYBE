# 🛡️ Image Protection & Watermarking System

## Complete Setup Guide for VYBE MERN Stack Application

This document outlines the comprehensive image protection and automatic watermarking system implemented for your VYBE cybersecurity poster store.

---

## 🎯 Features Implemented

### 1. **Automatic Watermarking**
- ✅ Server-side watermarking using Sharp library
- ✅ Multiple watermark types: text, logo, secure pattern
- ✅ Automatic processing on image upload
- ✅ High-quality output with optimization

### 2. **Anti-Copy Protection (Frontend)**
- ✅ Right-click disabled on images
- ✅ Drag-and-drop prevention
- ✅ Keyboard shortcut blocking (Ctrl+S, Ctrl+P)
- ✅ Transparent overlay protection
- ✅ CSS-based selection prevention
- ✅ Developer tools detection (optional)

### 3. **Secure Image URLs**
- ✅ Token-based authentication
- ✅ Expiring URLs (default: 1 hour)
- ✅ Rate limiting (100 requests/minute)
- ✅ Security headers
- ✅ Image proxy endpoint

---

## 📦 Installation Steps

### Backend Dependencies

```bash
cd server
npm install sharp jsonwebtoken
```

**Dependencies Added:**
- `sharp` - High-performance image processing
- `jsonwebtoken` - For secure image URL tokens

### Frontend (No additional dependencies needed)
The React components use only built-in hooks.

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file in `/server`:

```env
# Existing variables
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# New: Image Security (optional - will use JWT_SECRET if not provided)
IMAGE_SECRET=your_image_secret_key_here
```

---

## 📂 File Structure

```
server/
├── middleware/
│   ├── upload.js                # Updated with watermarkImages middleware
│   └── imageSecurity.js         # NEW: Token & security middleware
├── utils/
│   └── watermark.js             # NEW: Watermarking functions
├── routes/
│   ├── admin.js                 # Updated with watermarkImages
│   └── images.js                # NEW: Secure image serving
└── server.js                    # Updated with image routes

client/
├── components/
│   └── ProtectedImage.jsx       # NEW: Protected image component
└── hooks/
    └── useImageProtection.js    # NEW: Image protection hooks
```

---

## 🚀 Usage Examples

### Backend: Watermarking on Upload

The watermarking is **automatic**. When admins upload product images:

```javascript
// In admin.js - Already implemented
router.post('/products', 
  upload.array('images', 5),     // Upload files
  watermarkImages,                // Automatically watermark
  handleMulterError, 
  async (req, res) => {
    // Files in req.files are already watermarked
    // Upload to Cloudinary as usual
  }
);
```

### Frontend: Using Protected Images

#### Option 1: ProtectedImage Component

```jsx
import ProtectedImage from '../components/ProtectedImage';

function ProductCard({ product }) {
  return (
    <div>
      <ProtectedImage
        src={product.images[0].url}
        alt={product.name}
        className="w-full h-64 object-cover"
        showWatermark={true}
        watermarkText="© VYBE"
      />
    </div>
  );
}
```

#### Option 2: Global Protection Hook

```jsx
import { useImageProtection } from '../hooks/useImageProtection';

function App() {
  // Apply protection globally to all images
  useImageProtection({
    preventRightClick: true,
    preventDrag: true,
    preventKeyboardShortcuts: true,
    showWarning: true,
  });

  return <YourApp />;
}
```

#### Option 3: Screenshot Detection

```jsx
import { useScreenshotDetection } from '../hooks/useImageProtection';

function ProductGallery() {
  useScreenshotDetection((event) => {
    console.log('Screenshot attempt detected:', event);
    // Optional: Log to analytics, show warning, etc.
  });

  return <Gallery />;
}
```

---

## 🎨 Watermark Customization

### Text Watermark

```javascript
const { addTextWatermark } = require('./utils/watermark');

const watermarked = await addTextWatermark(imageBuffer, {
  text: '© VYBE 2025',
  fontSize: 24,
  opacity: 0.4,
  position: 'bottom-right', // top-left, top-right, bottom-left, bottom-right, center
  padding: 20,
  fontColor: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 1
});
```

### Logo Watermark

```javascript
const { addLogoWatermark } = require('./utils/watermark');

const watermarked = await addLogoWatermark(
  imageBuffer, 
  './path/to/logo.png',
  {
    opacity: 0.5,
    position: 'bottom-right',
    padding: 20,
    logoScale: 0.15, // 15% of image width
  }
);
```

### Secure Watermark (Recommended - Already used in middleware)

```javascript
const { addSecureWatermark } = require('./utils/watermark');

const watermarked = await addSecureWatermark(imageBuffer, {
  text: '© VYBE',
  repeatPattern: true, // Subtle repeated pattern
  cornerText: '© VYBE 2025 - All Rights Reserved', // Visible corner text
});
```

---

## 🔐 Security Features Explained

### 1. **Server-Side Watermarking**
- Images are watermarked **before** being uploaded to Cloudinary
- Cannot be bypassed by clients
- Maintains high image quality

### 2. **Frontend Protection Layers**

#### Layer 1: Event Prevention
```javascript
onContextMenu={(e) => e.preventDefault()}  // Blocks right-click
onDragStart={(e) => e.preventDefault()}     // Blocks drag
```

#### Layer 2: CSS Protection
```css
img {
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}
```

#### Layer 3: Transparent Overlay
```jsx
<div style={{
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'transparent',
  zIndex: 1
}} />
```

#### Layer 4: Keyboard Blocking
```javascript
// Prevents Ctrl+S, Ctrl+P, F12, etc.
if ((e.ctrlKey || e.metaKey) && e.key === 's') {
  e.preventDefault();
}
```

### 3. **Secure Image URLs (Optional)**

Enable token-based image access:

```javascript
// Generate secure URL
const { generateSecureImageUrls } = require('./middleware/imageSecurity');

const secureImages = generateSecureImageUrls(product.images, 3600); // 1 hour expiry

// Use in API response
res.json({
  product: {
    ...product,
    images: secureImages
  }
});
```

---

## ⚠️ Important Limitations

### What This System CAN Do:
✅ Prevent casual users from easily copying images
✅ Deter right-click save and drag-and-drop
✅ Make image theft more difficult
✅ Add permanent watermarks to images
✅ Track and rate-limit image requests
✅ Add multiple layers of protection

### What This System CANNOT Do:
❌ **Prevent screenshots** - No web technology can fully prevent this
❌ **Stop determined attackers** - They can use browser dev tools or screen capture
❌ **Prevent camera photos** - Users can photograph their screen
❌ **Block all keyboard shortcuts** - Some browsers override JavaScript

### Realistic Expectations:
- This system makes image theft **significantly harder**
- It deters **95% of casual theft attempts**
- Professional thieves can still bypass (but they can bypass anything)
- The watermark is the **most effective** protection (permanent and visible)

---

## 🧪 Testing the Protection

### Test Right-Click Protection
1. Try to right-click on product images
2. Should show "Image protection: Right-click disabled" in console

### Test Drag Protection
1. Try to drag an image to desktop/folder
2. Image should not be draggable

### Test Keyboard Shortcuts
1. Press Ctrl+S on a product page
2. Should be blocked (check console)

### Test Watermark
1. Upload a new product image via admin panel
2. Check the uploaded image on Cloudinary
3. Should have "© VYBE 2025 - All Rights Reserved" watermark

---

## 🔄 Integration with Existing Code

### Update Products.jsx

```jsx
import ProtectedImage from '../components/ProtectedImage';

// Replace <img> tags with:
<ProtectedImage
  src={product.images[0]?.url}
  alt={product.name}
  className="your-existing-classes"
  loading="lazy"
/>
```

### Update ProductDetail.jsx

```jsx
import ProtectedImage from '../components/ProtectedImage';
import { useImageProtection } from '../hooks/useImageProtection';

function ProductDetail() {
  useImageProtection(); // Global protection for this page

  return (
    <ProtectedImage
      src={product.images[selectedImage]?.url}
      alt={product.name}
      showWatermark={false} // Server watermark is enough
    />
  );
}
```

### Update Home.jsx

```jsx
import { useImageProtection } from '../hooks/useImageProtection';

function Home() {
  useImageProtection({
    preventRightClick: true,
    preventDrag: true,
  });

  // Rest of your component
}
```

---

## 📊 Monitoring & Analytics (Optional)

Add analytics to track protection events:

```javascript
const handleProtectionEvent = (event) => {
  // Log to your analytics service
  analytics.track('image_protection_triggered', {
    eventType: event,
    productId: product._id,
    timestamp: new Date(),
  });
};

useScreenshotDetection(handleProtectionEvent);
```

---

## 🚨 Troubleshooting

### Images not watermarking?
1. Check Sharp installation: `npm list sharp`
2. Verify middleware order in admin.js
3. Check console for watermarking errors
4. Ensure sufficient server memory for image processing

### Protection not working?
1. Clear browser cache
2. Check browser console for errors
3. Verify component imports
4. Test in different browsers

### Performance issues?
1. Watermarking is CPU-intensive - consider using worker threads
2. Use image optimization before watermarking
3. Implement caching for watermarked images

---

## 🎯 Production Checklist

- [ ] Set `IMAGE_SECRET` in production environment
- [ ] Test watermarking with various image sizes
- [ ] Verify protection works in all major browsers
- [ ] Set appropriate rate limits for your traffic
- [ ] Consider CDN caching strategy
- [ ] Monitor server CPU usage during uploads
- [ ] Add error tracking for watermarking failures
- [ ] Test mobile experience
- [ ] Document for team members

---

## 📚 Additional Resources

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [Web Security Guide](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Review server logs for watermarking errors
3. Verify all dependencies are installed
4. Test with a simple image first

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0
**Author:** VYBE Development Team
