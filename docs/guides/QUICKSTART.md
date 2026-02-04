# VYBE - Quick Start Guide

## Immediate Next Steps

### 1. Install Dependencies

```bash
cd "/Users/rayhan/Downloads/My Mac/Web/vybe-mern"
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment Variables

**server/.env** (copy from .env.example):
```env
MONGODB_URI=mongodb://localhost:27017/vybe-store
JWT_SECRET=vybe-secret-key-2024
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
# ... add payment credentials
```

**client/.env**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Or manually
mongod --dbpath=/usr/local/var/mongodb
```

### 4. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

Visit: http://localhost:3000

### 5. Create Admin Account

Connect to MongoDB and run:
```javascript
use vybe-store
db.users.insertOne({
  name: "Admin",
  email: "admin@vybe.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMKfFJx5fWu",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Login: admin@vybe.com / admin123

### 6. Add Products

1. Login as admin
2. Go to `/admin/products`
3. Click "Add New Product"
4. Upload images from your Facebook page
5. Set sizes, prices, categories

## Project Structure

```
vybe-mern/
├── server/          # Express backend
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API endpoints
│   ├── middleware/  # Auth, upload
│   └── config/      # Cloudinary
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/   # Route components
│   │   ├── components/
│   │   ├── api/     # API calls
│   │   └── store/   # State management
└── README.md

## Key Features Implemented

✅ Modern UI with animations (Framer Motion, Swiper)
✅ Product browsing with filters & search
✅ Shopping cart with real-time updates
✅ User authentication (JWT)
✅ Admin dashboard & product management
✅ Payment gateway integration (bKash, Nagad)
✅ Order tracking
✅ Cloudinary image uploads
✅ Responsive design

## API Endpoints

### Public
- GET /api/products - List products
- GET /api/products/:id - Product details

### Protected
- POST /api/cart - Add to cart
- POST /api/orders - Create order
- POST /api/payment/bkash/create - bKash payment

### Admin
- POST /api/admin/products - Create product
- PUT /api/admin/products/:id - Update product
- GET /api/admin/dashboard - Dashboard stats

## Payment Integration

### bKash Setup
1. Register at https://developer.bka sh.com
2. Get sandbox credentials
3. Add to server/.env
4. Test with: 01770618567 / OTP: 123456

### Nagad Setup
1. Apply for merchant account
2. Get API credentials
3. Configure in .env

## Development Tips

- Server runs on http://localhost:5000
- Client runs on http://localhost:3000
- API proxy configured in vite.config.js
- Hot reload enabled for both

## Troubleshooting

**MongoDB not starting:**
```bash
brew services restart mongodb-community
```

**Port 5000 in use:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Cloudinary errors:**
- Verify credentials in .env
- Check image file size (<5MB)

## Next Steps

1. Replace placeholder images with real products
2. Configure payment gateway credentials
3. Customize email templates
4. Add more product categories
5. Implement reviews system
6. Add analytics tracking

## Contact

For support: Create an issue or contact admin

---

Built with ❤️ for VYBE
