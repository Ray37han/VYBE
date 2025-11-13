# 🔗 Navigation Links - Code Snippets

## Add "Customize" Button to Product Detail Page

### File: `client/src/pages/ProductDetail.jsx`

Find the "Add to Cart" button section and add this customize button nearby:

```jsx
{/* Add Customize Button */}
<Link to={`/customize/${product._id}`}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-3 ${
      darkMode
        ? 'bg-moon-midnight border-2 border-moon-gold text-moon-gold hover:bg-moon-gold hover:text-moon-night'
        : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
    }`}
  >
    <FiImage className="inline mr-2" />
    Customize This Poster
  </motion.button>
</Link>
```

**Don't forget to add the import at the top:**
```jsx
import { FiImage } from 'react-icons/fi'; // Add to existing imports
```

---

## Add "Custom Orders" Link to Admin Navigation

### Option 1: Admin Sidebar/Menu (if you have one)

Add this link in your admin navigation:

```jsx
<Link
  to="/admin/custom-orders"
  className={`flex items-center px-4 py-3 rounded-lg transition-all ${
    location.pathname === '/admin/custom-orders'
      ? darkMode
        ? 'bg-moon-gold text-moon-night'
        : 'bg-purple-600 text-white'
      : darkMode
      ? 'text-moon-silver hover:bg-moon-midnight'
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <FiPackage className="mr-3 text-xl" />
  <span className="font-medium">Custom Orders</span>
</Link>
```

**Add import:**
```jsx
import { FiPackage } from 'react-icons/fi';
```

---

### Option 2: Admin Dashboard Cards

If your admin dashboard has cards, add this:

```jsx
<Link to="/admin/custom-orders">
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className={`p-6 rounded-2xl shadow-lg cursor-pointer ${
      darkMode ? 'glass-moon-card-hover' : 'glass-card-hover'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${
        darkMode ? 'bg-moon-gold/20' : 'bg-purple-100'
      }`}>
        <FiPackage className={`text-3xl ${
          darkMode ? 'text-moon-gold' : 'text-purple-600'
        }`} />
      </div>
      <FiArrowRight className={`text-2xl ${
        darkMode ? 'text-moon-silver' : 'text-gray-400'
      }`} />
    </div>
    <h3 className={`text-xl font-bold mb-2 ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>
      Custom Orders
    </h3>
    <p className={`text-sm ${
      darkMode ? 'text-moon-silver' : 'text-gray-600'
    }`}>
      Review and manage custom poster designs
    </p>
  </motion.div>
</Link>
```

**Add imports:**
```jsx
import { FiPackage, FiArrowRight } from 'react-icons/fi';
```

---

## Alternative: Add to Products Page

### File: `client/src/pages/Products.jsx`

Add a "Customize" button to each product card:

```jsx
{/* In product card, after "View Details" button */}
<Link to={`/customize/${product._id}`}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
      darkMode
        ? 'bg-moon-midnight border border-moon-gold text-moon-gold hover:bg-moon-gold hover:text-moon-night'
        : 'bg-white border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
    }`}
  >
    <FiImage className="inline mr-2" />
    Customize
  </motion.button>
</Link>
```

---

## Quick Copy-Paste Locations

### ProductDetail.jsx
Look for this section (around line 300-500):
```jsx
{/* Add to Cart Button */}
<motion.button
  onClick={handleAddToCart}
  ...
>
  Add to Cart
</motion.button>
```

**Add the customize button RIGHT BEFORE the Add to Cart button.**

---

### Admin Dashboard
Look for this section (usually in Dashboard.jsx):
```jsx
{/* Admin Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Existing cards */}
</div>
```

**Add the Custom Orders card inside this grid.**

---

## Testing After Adding Links

1. **Customer Side:**
   - Go to any product detail page
   - You should see "Customize This Poster" button
   - Click it → Should go to `/customize/:id`

2. **Admin Side:**
   - Login as admin
   - Go to admin dashboard
   - You should see "Custom Orders" link/card
   - Click it → Should go to `/admin/custom-orders`

---

## Styling Tips

### Match Your Existing Theme

If your buttons have different styles, adjust the className to match:

**Moon Knight Dark Theme:**
```jsx
className="bg-gradient-to-r from-moon-mystical to-moon-gold text-white"
```

**Light Theme:**
```jsx
className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
```

**Minimal/Outline:**
```jsx
className="border-2 border-moon-gold text-moon-gold hover:bg-moon-gold hover:text-moon-night"
```

---

## Full Example: ProductDetail.jsx Integration

```jsx
{/* Customization and Cart Actions */}
<div className="space-y-3">
  {/* Customize Button */}
  <Link to={`/customize/${product._id}`}>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
        darkMode
          ? 'bg-moon-midnight border-2 border-moon-gold text-moon-gold hover:bg-moon-gold hover:text-moon-night'
          : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
      }`}
    >
      <FiImage className="inline mr-2" />
      Customize This Poster
    </motion.button>
  </Link>

  {/* Add to Cart Button */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleAddToCart}
    disabled={!selectedSize}
    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
      !selectedSize
        ? 'bg-gray-400 cursor-not-allowed'
        : darkMode
        ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white'
        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
    }`}
  >
    <FiShoppingCart className="inline mr-2" />
    Add to Cart - ৳{currentPrice}
  </motion.button>
</div>
```

---

## Done! 🎉

Once you add these navigation links, the entire custom poster feature will be fully accessible to users!
