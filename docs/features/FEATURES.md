# 🎨 VYBE E-Commerce Platform - Complete Features Documentation

> **Complete feature list for the VYBE customizable poster e-commerce platform**  
> Last Updated: January 23, 2026

---

## 📋 Table of Contents

1. [Customer-Facing Features](#-customer-facing-features)
2. [Admin Panel Features](#-admin-panel-features)
3. [Authentication & Security](#-authentication--security)
4. [Payment Integration](#-payment-integration)
5. [Image Management & Protection](#-image-management--protection)
6. [Notification System](#-notification-system)
7. [Technical Features](#-technical-features)
8. [Performance Optimizations](#-performance-optimizations)
9. [API Endpoints](#-api-endpoints)

---

## 🛍️ Customer-Facing Features

### 1. Homepage
- **Hero Section**
  - Dynamic hero slides with images and CTAs
  - Auto-playing carousel
  - Smooth transitions and animations
  - Admin-configurable content
  
- **Featured Products Carousel**
  - Swiper-powered product slider
  - Auto-scroll with pause on hover
  - Navigation arrows and pagination dots
  - Responsive breakpoints (mobile/tablet/desktop)
  
- **Category Showcase**
  - Quick category browsing
  - Visual category cards
  - Direct navigation to filtered products
  
- **Call-to-Action Sections**
  - Premium animations (Framer Motion)
  - Magnetic button effects
  - Gradient backgrounds
  - Scroll reveal animations

### 2. Product Browsing (`/products`)
- **Product Grid Display**
  - 20 products per page (optimized pagination)
  - Responsive grid layout (1-4 columns)
  - Product card animations on hover
  - Quick view on click
  
- **Search & Filtering**
  - Real-time search by product name/description
  - Filter by category (Nature, Abstract, Minimalist, etc.)
  - Price range filtering
  - Sort by: Price (low-high, high-low), Newest, Rating
  - Clear all filters option
  
- **Product Information Display**
  - Product name and category
  - Base price with size variants
  - Star rating system
  - "Add to Cart" quick action
  - Featured/New badges
  
- **Pagination**
  - Server-side pagination for performance
  - Page numbers with prev/next navigation
  - Maintains filter/search state across pages

### 3. Product Detail Page (`/products/:id`)
- **Image Gallery**
  - Multiple product images carousel
  - Image zoom on hover (2x magnification)
  - Full-screen image viewer
  - Thumbnail navigation
  - Lazy loading for performance
  - Watermarked images for protection
  
- **Product Information**
  - Detailed product description
  - Category and tags
  - Stock availability status
  - Average rating with star display
  - Number of reviews
  
- **Size Selection**
  - Available sizes: A5, A4, A3, A2, A1
  - Real-time price updates based on size
  - Clear size dimension display
  - Visual size selector
  
- **Quantity Management**
  - Increment/decrement quantity
  - Stock validation
  - Maximum quantity limits
  
- **Actions**
  - Add to Cart with selected options
  - Add to Wishlist (heart icon)
  - Share product (social media integration)
  
- **Reviews & Ratings**
  - Customer reviews with ratings
  - Review submission form (authenticated users)
  - Average rating calculation
  - Review sorting and filtering
  - Helpful/Not Helpful voting
  
- **Related Products**
  - Same category product suggestions
  - "You may also like" section
  - Quick add to cart from suggestions

### 4. Product Customization (`/customize`) 
*(Feature available but can be toggled)*
- **Custom Image Upload**
  - Drag-and-drop interface
  - Support for images up to 50MB
  - Image format support: JPG, PNG, WEBP, AVIF
  - Real-time preview
  - Image dimension validation (minimum 300x300px)
  - DPI checking for print quality
  
- **Text Overlay**
  - Add custom text to design
  - Font selection
  - Color picker
  - Size and positioning controls
  - Text opacity adjustment
  
- **Frame & Border Options**
  - Multiple frame styles
  - Color customization
  - Border width adjustment
  - Preview with frame
  
- **Customization Preview**
  - Real-time rendering
  - Zoom in/out functionality
  - Reset to original
  - Save customization for later
  
- **Custom Order Workflow**
  - Approval queue system
  - Admin review before production
  - Quality control checks
  - Customer notification on approval/rejection
  
- **No Watermark on Custom Images**
  - User-uploaded images stored without watermark
  - Original quality preservation
  - Customer owns their uploaded content

### 5. Shopping Cart (`/cart`)
- **Cart Management**
  - View all cart items
  - Product thumbnails and names
  - Selected size and tier display
  - Individual item pricing
  - Quantity adjustment (+ / -)
  - Remove item functionality
  - Clear entire cart option
  
- **Cart Calculations**
  - Subtotal per item
  - Cart subtotal
  - Shipping cost calculation (district-based)
  - Total amount display
  - Tax/VAT display (if applicable)
  
- **Persistent Cart**
  - Cart stored in backend (database)
  - Synced across devices
  - Automatic cart recovery
  - Guest cart support
  
- **Cart Icon Badge**
  - Persistent cart count in navbar
  - Real-time updates
  - Visual notification of additions
  - Click to view cart

### 6. Checkout Process (`/checkout`)
- **Billing & Shipping Information**
  - First name, Last name
  - Street address
  - District/City selection (affects shipping)
  - Phone number (validated format)
  - Email address
  - Optional order notes
  
- **Shipping Cost Calculation**
  - Dhaka & Rajshahi: 100 BDT
  - Other districts: 130 BDT
  - Dynamic calculation on district selection
  
- **Payment Method Selection**
  - Cash on Delivery (COD)
  - bKash Mobile Wallet
  - Nagad Mobile Wallet
  - Payment method icons and descriptions
  
- **bKash Payment Integration**
  - Transaction ID input
  - Payment verification
  - Secure payment processing
  - Order confirmation after payment
  
- **Nagad Payment Integration**
  - Mobile number input
  - OTP verification
  - Payment execution
  - Success/failure handling
  
- **Order Summary**
  - Cart items review
  - Subtotal display
  - Shipping cost breakdown
  - Total amount
  - Terms and conditions checkbox
  
- **Order Placement**
  - Form validation
  - Order creation with transaction
  - Cart clearance on success
  - Redirect to success page
  - Email/SMS confirmation

### 7. Order Tracking (`/my-orders`)
- **Order History**
  - List of all user orders
  - Order number and date
  - Order status badge
  - Total amount
  - Payment status
  
- **Order Details View**
  - Complete order information
  - Items ordered with quantities
  - Shipping address
  - Payment method
  - Transaction ID (if applicable)
  
- **Order Status Tracking**
  - Pending (just placed)
  - Processing (being prepared)
  - Shipped (in transit)
  - Delivered (completed)
  - Cancelled (if cancelled)
  - Color-coded status badges
  
- **Payment Status**
  - Pending payment
  - Paid/Verified
  - Failed
  - Refunded
  
- **Actions**
  - View detailed invoice
  - Cancel order (if pending)
  - Contact support
  - Reorder same items
  - Track shipment (tracking number)

### 8. User Profile & Account
- **Profile Management**
  - View/edit name
  - Update email address
  - Change phone number
  - Update profile picture
  
- **Address Management**
  - Multiple saved addresses
  - Default address selection
  - Add/edit/delete addresses
  - Complete address with street, city, state, zip
  
- **Security Settings**
  - Change password
  - Two-factor authentication (2FA) toggle
  - Trusted devices management
  - Login history view
  - Security notifications
  
- **Email Verification**
  - OTP-based verification
  - Resend verification code
  - Email verification badge
  
- **Backup Codes**
  - Emergency access codes
  - Generate new codes
  - View used/unused codes
  - Download backup codes
  
- **Wishlist** *(Coming Soon)*
  - Save favorite products
  - Quick add to cart from wishlist
  - Share wishlist
  - Price drop notifications

### 9. User Authentication
- **Registration**
  - Name, email, password
  - Phone number (optional)
  - Address (optional)
  - Email verification
  - Strong password requirements
  - Password strength indicator
  
- **Login**
  - Email and password
  - Remember me option (30-day token)
  - Trusted device tracking
  - Login history logging
  - Suspicious login detection
  
- **Forgot Password**
  - Email-based password reset
  - Secure reset token
  - Time-limited reset link
  
- **Logout**
  - Clear session
  - Token invalidation
  - Redirect to home

### 10. UI/UX Features
- **Theme Toggle**
  - Dark mode (default)
  - Light mode
  - System preference detection
  - Smooth transition animations
  - Persistent preference
  
- **Responsive Design**
  - Mobile-first approach
  - Tablet optimization
  - Desktop layouts
  - Touch-friendly interfaces
  - Breakpoints: 640px, 768px, 1024px, 1280px
  
- **Animations**
  - Framer Motion page transitions
  - Scroll reveal effects
  - Hover animations
  - Loading skeletons
  - Micro-interactions
  - Magnetic buttons
  - Staggered list animations
  
- **Loading States**
  - Skeleton screens
  - Spinner animations
  - Progress indicators
  - Optimistic UI updates
  
- **Toast Notifications**
  - Success messages
  - Error alerts
  - Info notifications
  - Warning messages
  - Custom styled toasts (react-hot-toast)
  
- **Navigation**
  - Sticky header
  - Mobile hamburger menu
  - Smooth scroll
  - Active link highlighting
  - Breadcrumb navigation

---

## 👨‍💼 Admin Panel Features

### 1. Admin Dashboard (`/admin/dashboard`)
- **Statistics Overview**
  - Total products count
  - Total orders count
  - Total users count
  - Total revenue (BDT)
  - Revenue trend charts
  
- **Recent Orders**
  - Latest 10 orders
  - Quick status view
  - Quick actions (view, update)
  - Payment status indicators
  
- **Top Selling Products**
  - Best-performing products
  - Sales count
  - Revenue by product
  
- **Quick Actions**
  - Add new product
  - View pending orders
  - Manage users
  - View analytics
  
- **Charts & Graphs** *(Optional Feature)*
  - Sales over time (daily/weekly/monthly)
  - Revenue trends
  - Category distribution
  - Order status breakdown

### 2. Product Management (`/admin/products`)
- **Product Listing**
  - All products table view
  - Search products by name
  - Filter by category
  - Sort by various fields
  - Pagination
  
- **Create New Product**
  - Product name and description
  - Category selection
  - Base price setting
  - Size variants with prices (A5, A4, A3, A2, A1)
  - Stock quantity
  - Multiple image upload (up to 5 images)
  - Featured product toggle
  - Image watermarking (automatic)
  
- **Edit Product**
  - Update all product fields
  - Add/remove images
  - Update pricing
  - Adjust stock levels
  - Toggle featured status
  
- **Delete Product**
  - Soft delete with confirmation
  - Image cleanup from Cloudinary
  - Cascade delete related data
  
- **Bulk Operations**
  - Select multiple products
  - Bulk delete
  - Bulk price update
  - Bulk category change
  - Export to CSV
  
- **Image Management**
  - Drag-and-drop upload
  - Image preview before upload
  - Reorder product images
  - Set primary image
  - Automatic watermark application
  - Cloudinary integration
  - Image optimization

### 3. Order Management (`/admin/orders`)
- **Orders Dashboard**
  - All orders table
  - Filter by status (pending, processing, shipped, delivered, cancelled)
  - Search by order number, customer name
  - Date range filtering
  - Payment status filtering
  - Export orders to Excel/CSV
  
- **Order Details Modal**
  - Complete order information
  - Customer details (name, email, phone, address)
  - Items ordered with images
  - Quantities and sizes
  - Price breakdown
  - Payment method and status
  - Order notes from customer
  
- **Update Order Status**
  - Change status dropdown
  - Status change history/log
  - Automatic customer notification
  - Status-specific actions
  
- **Payment Verification**
  - Update payment status
  - Verify bKash/Nagad transactions
  - Manual payment confirmation
  - Refund processing
  
- **Add Tracking Information**
  - Courier service selection
  - Tracking number input
  - Estimated delivery date
  - Customer notification with tracking
  
- **Order Actions**
  - Print invoice
  - Print packing slip
  - Send status email
  - Cancel order
  - Refund order
  
- **Color-Coded Status System**
  - 🟡 Pending - Yellow
  - 🔵 Processing - Blue
  - 🟣 Shipped - Purple
  - 🟢 Delivered - Green
  - 🔴 Cancelled - Red

### 4. User Management (`/admin/users`)
- **User Listing**
  - All users table
  - Search by name or email
  - Filter by role (admin/user)
  - Sort by join date, name
  - Pagination
  
- **User Details View**
  - User profile information
  - Contact details (email, phone)
  - Address information
  - Account creation date
  - Last login date
  - Order count
  - Total spent
  
- **User Actions**
  - View user orders
  - Update user role (user ↔ admin)
  - View cart items
  - View wishlist
  - Delete user (with confirmation)
  - Send email to user
  
- **Security Information**
  - Login history
  - 2FA status
  - Trusted devices
  - Email verification status
  - Account status (active/suspended)
  
- **User Statistics**
  - Total orders placed
  - Total amount spent
  - Average order value
  - Last order date

### 5. Featured Posters Management (`/admin/featured-posters`)
- **Featured Gallery Management**
  - Add new featured posters
  - Upload featured images
  - Set poster titles and descriptions
  - Link to product or custom URL
  
- **Reorder Featured Items**
  - Drag-and-drop reordering
  - Set display priority
  - Featured/unfeatured toggle
  
- **Featured Poster Settings**
  - Image upload to Cloudinary
  - Automatic watermarking
  - Responsive image variants
  - Alt text for SEO
  
- **Visibility Controls**
  - Show/hide individual items
  - Schedule featured periods
  - Set expiration dates

### 6. Hero Items Management (`/admin/hero-items`)
- **Hero Slide Management**
  - Add new hero slides
  - Upload hero images (large format)
  - Set hero heading text
  - Set hero subheading text
  - Call-to-action button text
  - CTA link/URL
  
- **Slide Ordering**
  - Drag-and-drop slide reorder
  - Set active/inactive slides
  - Slide display duration settings
  
- **Hero Image Settings**
  - Large image upload (optimized)
  - Background image positioning
  - Overlay color and opacity
  - Text color customization
  
- **Animation Settings**
  - Slide transition effects
  - Auto-play settings
  - Pause on hover
  - Navigation controls

### 7. Custom Order Approvals (`/admin/custom-orders`)
- **Approval Queue**
  - List of pending custom orders
  - Customer uploaded images preview
  - Customization details view
  - Order information
  
- **Review Custom Orders**
  - View customer uploaded image
  - Check image quality
  - Verify print specifications
  - Check DPI and dimensions
  
- **Approve Custom Order**
  - Mark as approved
  - Move to production
  - Customer email notification
  - Add to regular order queue
  
- **Reject Custom Order**
  - Select rejection reason
  - Quality issues
  - Copyright concerns
  - Technical problems
  - Custom rejection message
  - Refund processing
  - Customer notification

### 8. Admin Access Control
- **Role-Based Access**
  - Admin role required for admin routes
  - Protected API endpoints
  - Middleware authorization checks
  
- **Admin Permissions**
  - Full product CRUD
  - Full order management
  - User management
  - Content management
  - System settings access
  
- **Audit Logging**
  - Track admin actions
  - Log product changes
  - Log order updates
  - Log user modifications

---

## 🔐 Authentication & Security

### 1. JWT Authentication
- **Token-Based Auth**
  - JSON Web Tokens (JWT)
  - Access token (short-lived)
  - Refresh token (long-lived)
  - Secure token storage
  - HTTP-only cookies option
  
- **Token Features**
  - User ID embedded
  - Role embedded (user/admin)
  - Expiration time
  - Signature verification
  - Remember me (30-day expiry)

### 2. Two-Factor Authentication (2FA)
- **OTP System**
  - Email-based OTP
  - 6-digit verification code
  - 10-minute expiration
  - Rate limiting (max 3 attempts)
  - Resend functionality
  
- **2FA Setup**
  - Enable/disable 2FA
  - Trusted device management
  - Bypass on trusted devices (30 days)
  - Device fingerprinting

### 3. Email Verification
- **Account Verification**
  - Email OTP on registration
  - Verification required for orders
  - Resend verification email
  - Verification badge display
  
- **Email Security**
  - Secure OTP generation
  - Time-limited codes
  - One-time use codes
  - Email change verification

### 4. Backup Codes
- **Emergency Access**
  - Generate 10 backup codes
  - One-time use codes
  - Download as text file
  - View used/unused status
  - Regenerate codes option
  
- **Backup Code Features**
  - 12-character alphanumeric
  - Case-insensitive
  - Encrypted storage
  - Usage tracking

### 5. Login Security
- **Login Protection**
  - Rate limiting (5 attempts per 15 min)
  - Account lockout after failed attempts
  - CAPTCHA after 3 failed attempts
  - IP-based blocking
  
- **Login History**
  - Track all login attempts
  - Record IP addresses
  - Device information
  - Browser and OS details
  - Success/failure status
  - Timestamp logging
  
- **Suspicious Login Detection**
  - New device alerts
  - New location alerts
  - Unusual time alerts
  - Email notification on suspicious activity

### 6. Trusted Devices
- **Device Management**
  - Add device as trusted
  - 30-day trust period
  - Device fingerprinting
  - Browser and OS tracking
  
- **Device Actions**
  - View all trusted devices
  - Remove trusted devices
  - Trust period extension
  - Revoke all devices

### 7. Password Security
- **Password Requirements**
  - Minimum 6 characters
  - bcrypt hashing (10 rounds)
  - Salt generation
  - Never stored as plaintext
  
- **Password Reset**
  - Email-based reset link
  - Secure token generation
  - 1-hour expiration
  - Token single-use
  - Password confirmation

### 8. API Security
- **Request Protection**
  - CORS configuration
  - Rate limiting
  - Request size limits
  - SQL injection prevention
  - XSS protection
  
- **Authentication Middleware**
  - `protect` - Requires authentication
  - `authorize` - Requires specific role
  - Token validation
  - User attachment to request

---

## 💳 Payment Integration

### 1. Cash on Delivery (COD)
- **COD Feature**
  - No upfront payment required
  - Payment on product delivery
  - Verification by delivery person
  - Manual order processing
  - COD charges (if any)

### 2. bKash Integration
- **bKash Payment Flow**
  - Create payment intent
  - Redirect to bKash
  - Customer authentication
  - Payment execution
  - Success callback
  
- **bKash Features**
  - Merchant API integration
  - Transaction ID generation
  - Payment verification
  - Refund support
  - Webhook for status updates
  
- **bKash Security**
  - Secure API credentials
  - HTTPS communication
  - Transaction verification
  - Signature validation

### 3. Nagad Integration
- **Nagad Payment Flow**
  - Initialize payment
  - Customer mobile number
  - OTP verification
  - PIN entry
  - Payment completion
  
- **Nagad Features**
  - Merchant integration
  - Real-time verification
  - Transaction history
  - Instant confirmation
  
- **Nagad Security**
  - Encrypted transactions
  - OTP verification
  - Secure API keys
  - Transaction logging

### 4. Payment Verification
- **Transaction Verification**
  - Manual verification by admin
  - bKash transaction check
  - Nagad transaction check
  - Payment screenshot upload
  
- **Payment Status Updates**
  - Pending verification
  - Verified (payment confirmed)
  - Failed (payment issue)
  - Refunded
  
- **Payment Webhook**
  - Real-time payment updates
  - Automatic order status change
  - Customer notification
  - Admin notification

### 5. Refund System
- **Refund Processing**
  - Admin-initiated refunds
  - Refund to original payment method
  - Partial refunds
  - Full refunds
  - Refund reason logging
  
- **Refund Tracking**
  - Refund status tracking
  - Refund transaction ID
  - Refund amount
  - Refund date
  - Customer notification

---

## 🖼️ Image Management & Protection

### 1. Cloudinary Integration
- **Image Upload System**
  - Direct upload to Cloudinary CDN
  - Multiple image upload support
  - Drag-and-drop interface
  - Progress indicators
  - Error handling
  
- **Image Storage**
  - Raw image storage (no upload-time processing)
  - Organized folder structure:
    - `vybe/products/` - Product images
    - `vybe/custom/` - Custom uploads
    - `vybe/hero/` - Hero section images
    - `vybe/featured/` - Featured posters
  
- **Storage Optimization**
  - Automatic format selection (WebP, AVIF)
  - Lazy transformation (on-demand)
  - CDN edge caching
  - Geographically distributed delivery

### 2. Image Watermarking System
- **Automatic Watermarking**
  - Text watermark: "© VYBE"
  - Corner placement (bottom-right)
  - 40% opacity for visibility
  - 30px font size
  - Repeating subtle pattern (8% opacity, diagonal)
  
- **Watermark Application**
  - Applied via URL transformation
  - No server-side processing
  - Cloudinary overlay feature
  - Dynamic watermark text
  - Customizable opacity and size
  
- **Watermark Variants**
  - Product images: Standard watermark
  - Hero images: Prominent watermark (© VYBE 2025, 50% opacity)
  - Custom images: **NO watermark** (user content)
  - Featured images: Branded watermark
  
- **Watermark Customization**
  - Configurable text
  - Adjustable opacity (0-100%)
  - Font size control
  - Position adjustment (corners, center)
  - Multiple watermark layers

### 3. Image Transformations
- **On-Demand Transformation**
  - Resize images via URL parameters
  - Crop and fit options
  - Quality adjustment
  - Format conversion
  - Filter application
  
- **Responsive Images**
  - Multiple size variants:
    - Thumbnail: 400x400px
    - Medium: 800x800px
    - Large: 1200x1200px
    - Full: 2000x2000px
  - Srcset generation for responsive loading
  - Automatic DPR (device pixel ratio) support
  - Retina display optimization
  
- **Image Optimization**
  - Automatic quality selection (`q_auto:good`)
  - Format auto-selection (`f_auto`)
  - Progressive loading
  - Lazy loading support
  - Blur placeholder generation

### 4. Image Protection
- **Private Image Storage** *(Optional Feature)*
  - Images can be stored as private type
  - Requires signed URLs for access
  - Direct URL access returns 403 Forbidden
  - Time-limited access tokens
  
- **Signed URLs**
  - Signature required for private images
  - Cryptographic signature verification
  - Expiration time control
  - Prevents URL tampering
  
- **URL Structure**
  ```
  Public: /upload/vybe/products/image.jpg
  Private: /private/s--signature--/vybe/products/image.jpg
  ```

### 5. Image Validation
- **Upload Validation**
  - File type checking (images only)
  - File size limits (50MB max)
  - Dimension validation (min 300x300px)
  - DPI checking for print quality
  - Aspect ratio validation
  
- **Quality Control**
  - Minimum resolution requirements
  - Color space validation
  - Compression quality checks
  - Format compatibility

### 6. Image Metadata
- **Stored Metadata**
  - Public ID (unique identifier)
  - Image format (jpg, png, webp)
  - Dimensions (width, height)
  - File size
  - Upload timestamp
  - Image type (product, custom, hero)
  
- **Database Schema**
  ```javascript
  images: [{
    publicId: "vybe/products/abc123",
    format: "jpg",
    urls: {
      thumbnail: "...",
      medium: "...",
      large: "...",
      full: "...",
      responsive: {
        srcset: "...",
        sizes: "..."
      }
    }
  }]
  ```

### 7. Image Delivery
- **CDN Delivery**
  - Global CDN network
  - Edge caching
  - Fast delivery worldwide
  - Auto-scaling
  
- **Performance Features**
  - Browser caching headers
  - ETag support
  - Conditional requests
  - Gzip/Brotli compression

---

## 📧 Notification System

### 1. Email Notifications
- **Email Service Provider**
  - Resend API integration
  - Professional email templates
  - HTML email support
  - Responsive email design
  - 3,000 emails/month (free tier)
  
- **Email Templates**
  - VYBE branding (purple gradient header)
  - Professional footer
  - Security tips
  - Clear call-to-action buttons
  - Mobile-responsive design
  
- **Automated Emails**
  - Order confirmation email
  - Order status update emails
  - Payment confirmation
  - Shipping notification with tracking
  - Delivery confirmation
  - Custom order rejection
  - Login notification (new device)
  - Suspicious login alert
  - Password reset email
  - Email verification OTP
  
- **Email Content**
  - Order details (items, quantities, prices)
  - Customer information
  - Payment method and status
  - Tracking information
  - VYBE contact information
  - Security alerts and tips

### 2. SMS Notifications *(Optional Feature)*
- **SMS Integration** (Twilio/SSLCommerz)
  - SMS gateway integration
  - International SMS support
  - Delivery status tracking
  
- **SMS Triggers**
  - Order confirmation SMS
  - OTP for verification
  - Payment confirmation
  - Shipping notification
  - Delivery notification
  
- **SMS Templates**
  - Short, concise messages
  - Order number included
  - Link to tracking page
  - Contact number for support

### 3. In-App Notifications
- **Toast Notifications**
  - Success messages (green)
  - Error alerts (red)
  - Info notifications (blue)
  - Warning messages (yellow)
  - Custom styled toasts (react-hot-toast)
  
- **Notification Triggers**
  - Product added to cart
  - Product removed from cart
  - Login success/failure
  - Order placed successfully
  - Payment processed
  - Form submission success/error
  - API errors

### 4. Admin Notifications
- **New Order Alerts**
  - Email to admin on new order
  - Order details included
  - Quick action links
  
- **Low Stock Alerts**
  - Email when stock below threshold
  - Product details
  - Restock recommendations
  
- **Custom Order Notifications**
  - New custom order pending approval
  - Customer uploaded images
  - Priority handling alerts

---

## ⚙️ Technical Features

### 1. Technology Stack

#### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer (memory storage)
- **Image Processing:** Sharp (validation), Cloudinary (transformation)
- **Email:** Resend API
- **Payment:** bKash & Nagad APIs
- **Security:** bcryptjs, cors, helmet

#### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Zustand with persist middleware
- **HTTP Client:** Axios
- **UI Components:** Custom components
- **Animations:** Framer Motion
- **Carousel:** Swiper
- **Icons:** React Icons (Fi icons)
- **Toast:** react-hot-toast
- **Styling:** Tailwind CSS
- **Forms:** Controlled components

### 2. Database Architecture

#### Collections & Schemas
- **Users**
  - Authentication fields
  - Profile information
  - Address
  - Cart (embedded array)
  - Wishlist (embedded array)
  - Orders (references)
  - Security settings (2FA, trusted devices)
  
- **Products**
  - Basic information (name, description, category)
  - Pricing (base price + size variants)
  - Images (Cloudinary public IDs)
  - Stock management
  - Reviews and ratings (embedded)
  - Featured status
  - Timestamps
  
- **Orders**
  - User reference
  - Order items (products, quantities, sizes)
  - Shipping information
  - Payment details
  - Status tracking
  - Transaction ID
  - Timestamps

#### Database Features
- **Indexing** (19 indexes for performance)
  - User email (unique)
  - Product category
  - Product name (text search)
  - Order user reference
  - Order status
  - Order date
  
- **Relationships**
  - One-to-Many: User → Orders
  - Many-to-Many: Products → Categories (via array)
  - Embedded: Cart items in User
  - Referenced: Products in Orders
  
- **Transactions**
  - MongoDB transactions for order creation
  - Atomic operations
  - Stock validation in transaction
  - Rollback on failure
  - Prevents overselling

### 3. API Architecture

#### RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON request/response
- Consistent response structure
- HTTP status codes

#### Response Format
```javascript
{
  success: true/false,
  data: {...},
  message: "...",
  error: "..." // on failure
}
```

#### Error Handling
- Global error handler middleware
- Custom error classes
- Detailed error messages
- Stack traces (development only)
- Error logging

#### API Versioning
- Version in URL path (future: `/api/v2/...`)
- Backward compatibility
- Deprecation notices

### 4. State Management

#### Zustand Stores
- **Auth Store**
  - User data
  - Authentication status
  - Login/logout actions
  - Token management
  - Persisted to localStorage
  
- **Cart Store**
  - Cart items array
  - Add/remove/update actions
  - Total calculation
  - Item count
  - Persisted to localStorage

#### State Persistence
- Automatic sync with localStorage
- Rehydration on app load
- Cross-tab synchronization
- Selective persistence

### 5. Middleware Architecture

#### Authentication Middleware
- `protect` - Requires valid JWT token
- `authorize(roles)` - Requires specific role
- Token extraction from headers
- Token verification and decoding
- User attachment to request object

#### Upload Middleware
- Multer configuration
- Memory storage (no disk writes)
- File type validation
- File size limits (50MB)
- Error handling

#### Error Middleware
- Global error catcher
- Error response formatting
- Stack trace sanitization
- Error logging

### 6. Code Organization

#### Server Structure
```
server/
├── config/          # Cloudinary, DB connection
├── middleware/      # Auth, upload, error handling
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── utils/           # Helper functions, email, watermark
└── server.js        # App entry point
```

#### Client Structure
```
client/src/
├── api/             # API service functions
├── components/      # Reusable UI components
├── pages/           # Route pages
├── store/           # Zustand stores
├── assets/          # Images, fonts
└── App.jsx          # Main app component
```

---

## 🚀 Performance Optimizations

### 1. Database Optimizations
- **Indexing**
  - 19 database indexes
  - Text search indexes
  - Compound indexes for filtering
  - Unique indexes for constraints
  
- **Query Optimization**
  - `.lean()` for read-only queries (40% faster)
  - `.select()` for field projection (reduce payload)
  - Pagination with `skip()` and `limit()`
  - Aggregation pipelines for complex queries
  
- **Caching** *(Optional Feature)*
  - Redis caching for frequently accessed data
  - Cache invalidation strategies
  - TTL-based expiration

### 2. Frontend Performance
- **Code Splitting**
  - Route-based code splitting
  - Lazy loading of pages
  - Dynamic imports
  - Reduced initial bundle size
  
- **Image Optimization**
  - Lazy loading images
  - Responsive images with srcset
  - WebP/AVIF format (modern browsers)
  - Blur placeholders
  - CDN delivery
  
- **Animation Performance**
  - Framer Motion for 60fps animations
  - GPU-accelerated transforms
  - RequestAnimationFrame for smooth animations
  - Will-change CSS property
  - Reduced motion for accessibility
  
- **Component Optimization**
  - React.memo for expensive components
  - useMemo for expensive calculations
  - useCallback for function memoization
  - Virtualization for long lists (future)

### 3. Mobile Performance
- **Zero Lag Implementation**
  - Instant page transitions
  - Staggered loading strategy
  - Priority content loading
  - Background image preloading
  
- **Staggered Loading**
  - Hero loads first (visible content)
  - Featured products load second
  - Below-fold content loads last
  - Progressive enhancement
  
- **Mobile Optimizations**
  - Touch-friendly interfaces (44px minimum)
  - Optimized images for mobile (smaller sizes)
  - Reduced animations for slower devices
  - Smaller bundle for mobile
  
- **Safari Optimizations**
  - Webkit-specific fixes
  - Touch action optimization
  - Scroll performance fixes
  - iOS viewport fixes

### 4. Network Optimizations
- **API Optimization**
  - Response compression (gzip)
  - Payload size reduction
  - Selective field responses
  - Batch requests where possible
  
- **Caching Strategy**
  - Browser caching headers
  - CDN caching for images
  - Service worker caching (future)
  - ETag support
  
- **Prefetching & Preloading**
  - Link prefetching for navigation
  - Image preloading
  - DNS prefetch for external resources
  - Preconnect to CDN

### 5. Build Optimizations
- **Vite Build**
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Tree shaking (remove unused code)
  - Minification (Terser)
  - Asset optimization
  
- **Bundle Optimization**
  - Code splitting by route
  - Vendor chunk separation
  - Dynamic imports
  - Asset hashing for cache busting

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register                    # Register new user
POST   /login                       # Login user
POST   /logout                      # Logout user
GET    /me                          # Get current user
POST   /verify-email                # Verify email with OTP
POST   /resend-verification         # Resend verification email
POST   /forgot-password             # Request password reset
POST   /reset-password/:token       # Reset password with token
PUT    /update-profile              # Update user profile
PUT    /change-password             # Change password
GET    /trusted-devices             # Get trusted devices
POST   /trust-device                # Add trusted device
DELETE /trusted-devices/:id         # Remove trusted device
POST   /enable-2fa                  # Enable 2FA
POST   /disable-2fa                 # Disable 2FA
POST   /verify-2fa                  # Verify 2FA code
POST   /generate-backup-codes       # Generate backup codes
GET    /backup-codes                # Get backup codes
GET    /login-history               # Get login history
PUT    /security-settings           # Update security settings
```

### Product Routes (`/api/products`)
```
GET    /                            # Get all products (pagination, filter, search)
GET    /:id                         # Get single product
GET    /category/:category          # Get products by category
POST   /:id/review                  # Add product review (auth required)
```

### Cart Routes (`/api/cart`)
```
GET    /                            # Get user cart (auth required)
POST   /                            # Add item to cart (auth required)
PUT    /:itemId                     # Update cart item quantity (auth required)
DELETE /:itemId                     # Remove item from cart (auth required)
DELETE /                            # Clear cart (auth required)
```

### Order Routes (`/api/orders`)
```
POST   /                            # Create new order (auth required)
GET    /my-orders                   # Get user's orders (auth required)
GET    /:id                         # Get single order (auth required)
PUT    /:id/cancel                  # Cancel order (auth required)
```

### Payment Routes (`/api/payment`)
```
POST   /bkash/create                # Create bKash payment (auth required)
POST   /bkash/execute               # Execute bKash payment (auth required)
POST   /nagad/create                # Create Nagad payment (auth required)
POST   /nagad/execute               # Execute Nagad payment (auth required)
POST   /verify                      # Verify payment (auth required)
POST   /webhook/bkash               # bKash webhook callback
POST   /webhook/nagad               # Nagad webhook callback
```

### Admin Product Routes (`/api/admin/products`)
```
POST   /                            # Create product (admin only)
PUT    /:id                         # Update product (admin only)
DELETE /:id                         # Delete product (admin only)
POST   /:id/images                  # Upload product images (admin only)
DELETE /:id/images/:imageId         # Delete product image (admin only)
```

### Admin Order Routes (`/api/admin/orders`)
```
GET    /                            # Get all orders (admin only)
PUT    /:id/status                  # Update order status (admin only)
PUT    /:id/payment                 # Update payment status (admin only)
PUT    /:id/tracking                # Add tracking info (admin only)
DELETE /:id                         # Delete order (admin only)
```

### Admin User Routes (`/api/admin/users`)
```
GET    /                            # Get all users (admin only)
GET    /:id                         # Get single user (admin only)
PUT    /:id                         # Update user details (admin only)
DELETE /:id                         # Delete user (admin only)
PUT    /:id/role                    # Update user role (admin only)
```

### Featured Posters Routes (`/api/featured-posters`)
```
GET    /                            # Get all featured posters (public)
POST   /                            # Create featured poster (admin only)
PUT    /:id                         # Update featured poster (admin only)
DELETE /:id                         # Delete featured poster (admin only)
POST   /reorder                     # Reorder featured posters (admin only)
```

### Hero Items Routes (`/api/hero-items`)
```
GET    /                            # Get all hero items (public)
POST   /                            # Create hero item (admin only)
PUT    /:id                         # Update hero item (admin only)
DELETE /:id                         # Delete hero item (admin only)
POST   /reorder                     # Reorder hero items (admin only)
```

### Custom Approvals Routes (`/api/custom-approvals`)
```
GET    /pending                     # Get pending custom orders (admin only)
PUT    /:id/approve                 # Approve custom order (admin only)
PUT    /:id/reject                  # Reject custom order (admin only)
```

### Customization Routes (`/api/customizations`)
```
POST   /upload-image                # Upload custom image (public)
POST   /validate                    # Validate customization (public)
```

### Image Routes (`/api/images`)
```
POST   /upload                      # Upload image to Cloudinary (admin only)
DELETE /:publicId                   # Delete image from Cloudinary (admin only)
```

---

## 📊 Additional Features

### 1. Analytics & Reporting *(Future Enhancement)*
- Sales reports
- Revenue analytics
- Customer analytics
- Product performance metrics
- Geographic sales data
- Traffic analytics

### 2. Marketing Features *(Future Enhancement)*
- Discount codes and coupons
- Flash sales
- Bundle deals
- Referral program
- Loyalty points
- Email campaigns
- Push notifications

### 3. SEO Optimization
- Meta tags for products
- Open Graph tags
- Sitemap generation
- Robots.txt
- Structured data (JSON-LD)
- Canonical URLs
- Alt text for images

### 4. Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast (WCAG AA)
- Focus indicators
- Reduced motion support

### 5. Internationalization *(Future)*
- Multi-language support
- Currency conversion
- Regional pricing
- Localized content
- RTL language support

---

## 🎯 Summary

VYBE is a **complete, production-ready e-commerce platform** with:

✅ **150+ Features** implemented  
✅ **Full customer shopping experience** from browsing to checkout  
✅ **Comprehensive admin panel** for complete store management  
✅ **Advanced security** with 2FA, login tracking, backup codes  
✅ **Multiple payment gateways** (COD, bKash, Nagad)  
✅ **Professional image management** with Cloudinary & watermarking  
✅ **Email notification system** with beautiful templates  
✅ **Optimized performance** for 60fps animations and fast loading  
✅ **Mobile-responsive** design with zero-lag implementation  
✅ **RESTful API** with 40+ endpoints  
✅ **MongoDB transactions** for data integrity  
✅ **Modern tech stack** with React, Node.js, Express, MongoDB  

---

## 📞 Support

For questions, issues, or feature requests, please refer to:
- [README.md](README.md) - Setup instructions
- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Technical details
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide

---

**Built with ❤️ for VYBE**  
*Your modern, customizable poster e-commerce platform* 🎨

**Last Updated:** January 23, 2026  
**Version:** 1.0.0
