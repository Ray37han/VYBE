# 🚀 Quick Setup Guide - Custom Poster Feature

## Step 1: Install Dependencies

```bash
cd server
npm install sharp
# Multer should already be installed
```

## Step 2: Update server/server.js

Add this import at the top:
```javascript
import customizationRoutes from './routes/customizations.js';
```

Add this route registration (after other routes):
```javascript
app.use('/api/customizations', customizationRoutes);
```

## Step 3: Update client/src/App.jsx

Add imports:
```javascript
import Customize from './pages/Customize';
import AdminCustomOrders from './pages/admin/AdminCustomOrders';
```

Add routes:
```javascript
{/* Customer customization route */}
<Route path="/customize/:id" element={<Customize />} />

{/* Admin route (inside admin routes section) */}
<Route path="/admin/custom-orders" element={<AdminCustomOrders />} />
```

## Step 4: Add Navigation Links

### In ProductDetail.jsx (add customize button):
```javascript
<Link to={`/customize/${product._id}`}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="btn-moon w-full py-3 rounded-xl font-bold"
  >
    <FiImage className="inline mr-2" />
    Customize This Poster
  </motion.button>
</Link>
```

### In Admin Navigation (add menu item):
```javascript
<Link to="/admin/custom-orders">
  <FiPackage className="inline mr-2" />
  Custom Orders
</Link>
```

## Step 5: Verify Environment Variables

Check `server/.env` has:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Step 6: Restart Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Step 7: Test

1. Go to any product page
2. Click "Customize This Poster"
3. Read instructions
4. Upload an image
5. Customize it
6. Add to cart
7. Login as admin
8. Go to `/admin/custom-orders`
9. Review and approve/reject

## ✅ Done!

The feature is now live and ready to use!
