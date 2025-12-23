# ⚡ 60FPS Quick Reference Card

## 🎯 GPU-Only Animation Properties

```jsx
✅ ALLOWED               ❌ FORBIDDEN
opacity                 height / width
transform: translateX   top / left / right / bottom
transform: translateY   margin / padding
transform: scale        font-size
transform: rotate       border-width
```

## 🔧 Required Code Pattern

```jsx
// ALWAYS use this pattern for animations
<motion.div
  initial={{ opacity: 0 }}  // ❌ NO: y: 30, scale: 0.8
  whileInView={{ opacity: 1 }}
  transition={{ 
    duration: 0.4,          // ❌ NO: type: "spring"
    ease: "easeOut" 
  }}
  viewport={{ 
    once: true,             // Never re-animate
    margin: "-10%"          // Early trigger
  }}
  style={{
    transform: 'translateZ(0)',  // Force GPU layer
    willChange: 'transform',     // GPU preparation hint
  }}
>
```

## 📱 Buttons (No whileTap)

```jsx
// BEFORE
<motion.button whileTap={{ scale: 0.9 }}>

// AFTER
<button 
  className="active:scale-90"
  style={{
    transform: 'translateZ(0)',
    willChange: 'transform',
  }}
>
```

## 🎨 CSS Keyframes (Limit Stagger)

```jsx
// BEFORE (N scroll listeners)
{array.map((item, index) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    whileInView={{ opacity: 1 }}
    transition={{ delay: index * 0.1 }}
  />
))}

// AFTER (First 4 only)
{array.map((item, index) => (
  <div
    style={{
      opacity: index < 4 ? 0 : 1,
      animation: index < 4 
        ? `fadeInCard 0.4s ease-out ${index * 0.08}s forwards` 
        : 'none',
      transform: 'translateZ(0)',
      willChange: 'transform',
    }}
  />
))}
```

## 🚫 Mobile Rules

```jsx
❌ whileHover (mobile has no hover)
❌ backdrop-filter: blur() (40ms per frame)
❌ Infinite animations (continuous GPU)
❌ Spring physics (CPU-heavy)
❌ Per-item stagger (N×scroll events)
```

## 🎯 The Golden Rule

> `will-change: transform` + `translateZ(0)` = GPU layer BEFORE animation starts

## 📏 Testing Thresholds

- **Target Device**: 3GB RAM Android (Galaxy A12)
- **TTI Goal**: < 2 seconds on 4G
- **FPS Goal**: Locked 60 FPS
- **Chrome DevTools**: 4× CPU throttling

## 🔍 Quick Audit Commands

```bash
# Search for forbidden patterns
grep -r "whileHover\|whileTap\|type: \"spring\"\|initial.*y:\|initial.*scale:" client/src/components/mobile/

# Find missing GPU hints
grep -L "translateZ(0)" client/src/components/mobile/*.jsx
```

## ✅ Checklist Before Push

- [ ] Only opacity animations?
- [ ] GPU hints added (translateZ + willChange)?
- [ ] viewport={{ once: true }}?
- [ ] No spring physics?
- [ ] Stagger limited to first 4?
- [ ] No whileHover/whileTap on mobile?
- [ ] Tested with 4× CPU throttling?

---

**Created**: Jan 2025  
**Status**: Production-Ready  
**Lighthouse**: 91/100 Mobile
