# 🎨 Clay Design System for VYBE

A high-performance, accessible Claymorphism design system built with React, Tailwind CSS, and Framer Motion.

## 📋 Table of Contents
- [What is Claymorphism?](#what-is-claymorphism)
- [Installation](#installation)
- [Components](#components)
- [Design Tokens](#design-tokens)
- [Performance Optimizations](#performance-optimizations)
- [Dark Mode](#dark-mode)
- [Best Practices](#best-practices)

---

## 🎭 What is Claymorphism?

Claymorphism is a UI design trend characterized by:
- **High Roundness**: Border radius 24px-32px+
- **Volume & Depth**: Multiple inset box shadows creating a soft, 3D "inflated" look
- **Matte Finish**: Soft and tactile (not glossy like glass)
- **Floating Elements**: 3D space perception

---

## 🚀 Installation

### 1. Tailwind Config (Already Applied)
The `tailwind.config.js` has been extended with:
- Clay color palette (`clay-50` to `clay-900`)
- Shadow utilities (`shadow-clay-sm`, `shadow-clay-md`, `shadow-clay-lg`)
- Dark mode shadow variants (`shadow-clay-dark-*`)
- Recessed & floating shadows

### 2. Base Styles (Already Applied)
The `index.css` includes:
- Clay background gradients for light/dark modes
- `.clay-optimized` class for GPU acceleration
- Proper text color defaults

### 3. Import Components
```javascript
import { ClayCard, ClayButton, ClayInput, ClayModal, ClayWrapper } from './components/clay';
```

---

## 🧩 Components

### ClayCard
The foundational container with 3D clay aesthetic.

```jsx
<ClayCard size="md" hoverable clickable>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</ClayCard>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` - Shadow depth (default: `'md'`)
- `hoverable`: `boolean` - Enable hover lift effect (default: `false`)
- `clickable`: `boolean` - Enable tap scale effect (default: `false`)

---

### ClayButton
Tactile buttons with high contrast.

```jsx
<ClayButton 
  variant="primary" 
  size="md" 
  icon={<FiShoppingCart />}
  onClick={handleClick}
>
  Add to Cart
</ClayButton>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `icon`: ReactNode - Optional icon element
- `disabled`: `boolean`
- `fullWidth`: `boolean`

**Variants:**
- **Primary**: Gradient purple-pink with white text
- **Secondary**: Clay background with border
- **Ghost**: Transparent with hover background

---

### ClayInput
Deeply recessed input fields.

```jsx
<ClayInput
  label="Email"
  placeholder="Enter your email"
  leftIcon={<FiMail />}
  error={errors.email}
/>
```

**Props:**
- `label`: `string` - Input label
- `error`: `string` - Error message
- `leftIcon`: ReactNode - Icon on left side
- `rightIcon`: ReactNode - Icon on right side
- `disabled`: `boolean`

---

### ClayModal
Floating dialog with extreme elevation.

```jsx
const [isOpen, setIsOpen] = useState(false);

<ClayModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to continue?</p>
  <ClayButton onClick={() => setIsOpen(false)}>Confirm</ClayButton>
</ClayModal>
```

**Props:**
- `isOpen`: `boolean` - Visibility state
- `onClose`: `function` - Close handler
- `title`: `string` - Modal title
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `showCloseButton`: `boolean` (default: `true`)

---

### ClayWrapper
HOC for standardized tactile interactions.

```jsx
<ClayWrapper>
  <div className="p-6">
    This div will lift on hover and shrink on tap
  </div>
</ClayWrapper>
```

**Props:**
- `enableHover`: `boolean` (default: `true`)
- `enableTap`: `boolean` (default: `true`)
- `hoverY`: `number` - Custom hover offset (default: `-4`)
- `tapScale`: `number` - Custom tap scale (default: `0.96`)

---

## 🎨 Design Tokens

### Colors
```javascript
// Light Mode Bases
clay-50   // #fafafa - Lightest
clay-100  // #f4f4f5 - Card backgrounds
clay-200  // #e4e4e7 - Hover states
clay-300  // #d4d4d8 - Borders

// Dark Mode Bases  
clay-700  // #3f3f46 - Hover states
clay-800  // #27272a - Card backgrounds
clay-900  // #18181b - Darkest

// Accents (Soft Pastels)
clay-purple // #e9d5ff
clay-pink   // #fbcfe8
clay-blue   // #dbeafe
clay-green  // #d1fae5
```

### Shadows
```javascript
// Light Mode
shadow-clay-sm  // Subtle depth
shadow-clay-md  // Standard cards
shadow-clay-lg  // Elevated elements

// Dark Mode (Rim Lighting)
shadow-clay-dark-sm
shadow-clay-dark-md
shadow-clay-dark-lg

// Special
shadow-clay-recessed       // Inputs (light)
shadow-clay-recessed-dark  // Inputs (dark)
shadow-clay-float          // Modals (light)
shadow-clay-float-dark     // Modals (dark)
```

---

## ⚡ Performance Optimizations

### 1. GPU Acceleration
All Clay components use the `.clay-optimized` class:
```css
.clay-optimized {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

### 2. Backdrop Blur Restrictions
❌ **DON'T** apply `backdrop-blur` to every card
✅ **DO** apply it sparingly (modals, floating buttons only)

### 3. Scrollable Lists
For product grids with many ClayCards:
```jsx
<div className="grid grid-cols-3 gap-6">
  {products.map(product => (
    <ClayProductCard key={product.id} product={product} />
  ))}
</div>
```
Each `ClayWrapper` already has GPU optimization.

---

## 🌓 Dark Mode

### The Challenge
Claymorphism often looks like "black blobs" in dark mode.

### The Solution
**Rim Lighting**: Our dark mode shadows use lighter top-left inset highlights:
```css
shadow-clay-dark-md: `
  inset 3px 3px 8px rgba(255, 255, 255, 0.05),  /* Rim light */
  inset -3px -3px 8px rgba(0, 0, 0, 0.5),       /* Shadow */
  0 8px 16px rgba(0, 0, 0, 0.6)                 /* Drop shadow */
`
```

### Text Contrast
✅ **CORRECT:**
```jsx
<ClayCard>
  <h3 className="text-slate-700 dark:text-slate-200">Readable Title</h3>
</ClayCard>
```

❌ **WRONG:**
```jsx
<ClayCard>
  <h3 className="text-white">Invisible on light clay!</h3>
</ClayCard>
```

---

## 💡 Best Practices

### 1. Component Composition
```jsx
// Good: Compose for complex UIs
<ClayWrapper>
  <ClayCard size="lg" hoverable>
    <img src="..." />
    <h3 className="text-slate-700 dark:text-slate-200">Product</h3>
    <ClayButton variant="primary">Buy Now</ClayButton>
  </ClayCard>
</ClayWrapper>
```

### 2. Avoid Over-Nesting
```jsx
// Bad: Too many shadows conflict
<ClayCard>
  <ClayCard>
    <ClayCard>Content</ClayCard>
  </ClayCard>
</ClayCard>

// Good: Flat structure
<ClayCard>
  <div className="space-y-4">
    <section>...</section>
    <section>...</section>
  </div>
</ClayCard>
```

### 3. Accessibility
```jsx
// Always include aria labels for icon-only buttons
<ClayButton icon={<FiX />} aria-label="Close modal" />

// Use proper semantic HTML
<ClayCard as="article">
  <h2>...</h2>
  <p>...</p>
</ClayCard>
```

### 4. Responsive Design
```jsx
// Use Tailwind responsive variants
<ClayCard className="w-full md:w-1/2 lg:w-1/3">
  Content adapts to screen size
</ClayCard>
```

---

## 📦 File Structure
```
client/src/components/clay/
├── ClayCard.jsx
├── ClayButton.jsx
├── ClayInput.jsx
├── ClayModal.jsx
├── ClayWrapper.jsx
├── ClayProductCard.example.jsx  ← Reference implementation
└── index.js                      ← Barrel exports
```

---

## 🎯 Example: Converting Existing Components

### Before (Old ProductCard)
```jsx
<div className="bg-white rounded-lg shadow-md hover:shadow-xl">
  <img src={product.image} />
  <h3>{product.name}</h3>
  <button className="btn-primary">Add to Cart</button>
</div>
```

### After (Clay ProductCard)
```jsx
<ClayWrapper>
  <ClayCard size="md" hoverable>
    <img src={product.image} />
    <h3 className="text-slate-700 dark:text-slate-200">{product.name}</h3>
    <ClayButton variant="primary">Add to Cart</ClayButton>
  </ClayCard>
</ClayWrapper>
```

---

## 🐛 Troubleshooting

### Issue: Cards look flat
**Solution**: Make sure you're using the correct shadow size:
```jsx
<ClayCard size="md"> // Not "small" or missing
```

### Issue: Text is invisible in dark mode
**Solution**: Use proper text colors:
```jsx
className="text-slate-700 dark:text-slate-200"
```

### Issue: Lag on mobile scroll
**Solution**: Avoid `backdrop-blur` on cards. Use `clay-optimized` class.

### Issue: Shadows don't show in dark mode
**Solution**: The dark mode class is applied to `<html>` or `<body>`:
```javascript
document.documentElement.classList.toggle('dark')
```

---

## 📚 Additional Resources
- See `ClayProductCard.example.jsx` for a complete product card implementation
- All components are documented with JSDoc comments
- Tailwind config includes all design tokens

---

**Built with ❤️ for VYBE E-commerce**
