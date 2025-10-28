# Hero Items Management Feature

## Overview
Admin-controlled hero section on the home page with interactive click animations. Admins can select which products appear in the floating card positions and customize their appearance.

## Features Implemented

### 1. Backend Infrastructure ✅
- **Model**: `server/models/HeroItem.js`
  - Product reference (ObjectId)
  - Custom title override
  - Position (center, left, right, bottom)
  - Display order
  - Active/Inactive toggle
  - Gradient customization
  - Unique constraint: one active item per position

- **Routes**: `server/routes/heroItems.js`
  - `GET /api/hero-items` - Public endpoint for active items
  - `GET /api/hero-items/admin` - All items (admin only)
  - `POST /api/hero-items` - Create new hero item (admin only)
  - `PUT /api/hero-items/:id` - Update hero item (admin only)
  - `DELETE /api/hero-items/:id` - Delete hero item (admin only)

### 2. Admin Management UI ✅
- **Component**: `client/src/pages/admin/HeroItems.jsx`
  - Grid view showing all 4 positions (center, left, right, bottom)
  - Product selector dropdown
  - Custom title input
  - Position assignment
  - Gradient color picker (5 color options)
  - Display order control
  - Activate/deactivate toggle
  - Edit and delete functionality
  - Real-time preview of images
  - Shows inactive items per position

- **Access**: Navigate to `/admin/hero-items` or from Admin Dashboard → "Hero Items" button

### 3. Dynamic Hero Section ✅
- **Component**: `client/src/pages/Home.jsx`
  - Fetches hero items from API on page load
  - Maps items to floating card positions
  - Maintains original animations (floating, rotation)
  - Fallback to default cards if no hero items configured

### 4. Click-to-Pop-Forward Animation ✅
- **Interaction**: Click any floating card to bring it forward
  - Scales up by 1.2x
  - Increases z-index to 50
  - Resets rotation to 0
  - Pauses floating animation
  - Shows "View Product" button overlay
  - Click again to deactivate
  - Smooth spring physics transition

## Usage Guide

### For Admins:

1. **Navigate to Hero Items Manager**
   - Go to `/admin/hero-items` or click "Hero Items" from dashboard

2. **Add a New Hero Item**
   - Click "Add Hero Item" button
   - Select a product from dropdown
   - Customize the display title (auto-fills from product name)
   - Choose position (center, left, right, or bottom)
   - Select gradient color
   - Set display order (optional)
   - Click "Create Item"

3. **Edit Existing Hero Item**
   - Click "Edit" on any active item card
   - Modify fields as needed
   - Click "Update Item"

4. **Manage Active/Inactive Items**
   - Only one item per position can be active
   - Inactive items are shown below each position
   - Click "Activate" to swap active items
   - Delete items completely with "Remove" button

5. **Position Guide**
   - **Center**: Main focal point (largest, with glow effect)
   - **Left**: Upper-left side card
   - **Right**: Upper-right side card
   - **Bottom**: Lower position

### For Users:

1. **Viewing Hero Items**
   - Visit home page to see floating cards
   - Cards animate automatically (float, rotate)
   - Hover for subtle scale-up effect

2. **Interactive Click**
   - Click any floating card to zoom it forward
   - Card scales up and pauses animation
   - "View Product" button appears
   - Click button to go to product page
   - Click card again to reset

## Technical Details

### Position Styles
```javascript
center: { width: '18rem', height: '24rem', zIndex: 30 }
left: { width: '14rem', height: '20rem', zIndex: 20 }
right: { width: '16rem', height: '22rem', zIndex: 20 }
bottom: { width: '13rem', height: '18rem', zIndex: 10 }
```

### Available Gradients
- Purple: `from-purple-600/90 via-transparent to-transparent`
- Yellow: `from-yellow-600/90 via-transparent to-transparent`
- Blue: `from-blue-600/90 via-transparent to-transparent`
- Red: `from-red-600/90 via-transparent to-transparent`
- Green: `from-green-600/90 via-transparent to-transparent`

### Animation Timings
- Center: 4s cycle
- Left: 5s cycle
- Right: 4.5s cycle
- Bottom: 6s cycle
- Click interaction: Spring physics (stiffness: 300, damping: 20)

## API Endpoints

### Public
```
GET /api/hero-items
Response: { success: true, data: [heroItems] }
```

### Admin Only
```
GET /api/hero-items/admin
POST /api/hero-items
PUT /api/hero-items/:id
DELETE /api/hero-items/:id

Headers: { Authorization: 'Bearer <admin_token>' }
```

## Database Schema

```javascript
{
  product: ObjectId (ref: 'Product'),
  title: String,
  position: Enum['center', 'left', 'right', 'bottom'],
  order: Number,
  isActive: Boolean,
  gradient: String,
  timestamps: true
}
```

## Files Modified/Created

### Created:
- `server/models/HeroItem.js`
- `server/routes/heroItems.js`
- `client/src/pages/admin/HeroItems.jsx`
- `HERO_ITEMS_FEATURE.md` (this file)

### Modified:
- `server/server.js` - Added hero items routes
- `client/src/App.jsx` - Added admin route
- `client/src/pages/Home.jsx` - Dynamic hero section with click animation
- `client/src/pages/admin/Dashboard.jsx` - Added Hero Items link

## Testing Checklist

- [ ] Admin can create hero items
- [ ] Admin can edit hero items
- [ ] Admin can delete hero items
- [ ] Only one active item per position works
- [ ] Home page fetches and displays hero items
- [ ] Click animation works smoothly
- [ ] "View Product" button navigates correctly
- [ ] Fallback cards show when no items configured
- [ ] Gradients display correctly
- [ ] Product images load properly
- [ ] Responsive behavior maintained
- [ ] Dark/light mode compatibility

## Notes

- Hero items use product references, so if a product is deleted, the hero item should be updated or removed
- The system maintains the original hero section design as fallback
- Animation performance is optimized using framer-motion
- All admin operations require authentication and admin role
- Position conflicts are prevented at database level with unique index

---

**Status**: ✅ Fully Implemented
**Version**: 1.0
**Date**: 2024
