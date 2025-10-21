# 🎨 VYBE - Customizable Poster E-Commerce Platform

A full-stack MERN e-commerce application for selling customizable posters with admin management, payment integration, and automated notifications.

![VYBE Logo](https://img.shields.io/badge/VYBE-Posters-purple?style=for-the-badge)

## 🚀 Features

### Customer Features
- 🛍️ Browse customizable poster products
- 🛒 Shopping cart with real-time updates
- 💳 Multiple payment options (bKash & Cash on Delivery)
- 📦 Order tracking with status updates
- 🔍 Product search and filtering
- 📱 Fully responsive design
- 🖼️ Image zoom for product details

### Admin Features
- 📊 Dashboard with sales statistics
- 📦 Complete order management system
- 👥 User management with role control
- 💰 Payment verification system
- 📝 Product CRUD operations
- 🖼️ Image upload via Cloudinary
- 📧 Automated email notifications
- 📱 SMS notification support

### Notifications
- ✉️ Order confirmation emails
- 📧 Order status update emails
- 💳 Payment confirmation notifications
- 📱 SMS notifications (configurable)

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI library
- **Vite** 5.1.4 - Build tool
- **Tailwind CSS** 3.4.1 - Styling
- **Framer Motion** 11.0.5 - Animations
- **Zustand** 4.5.0 - State management
- **React Router** 6.22.0 - Routing
- **Swiper** 11.0.7 - Carousel
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** 4.18.2 - Web framework
- **MongoDB** with Mongoose 8.5.1 - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** 2.0.0 - Image storage
- **Nodemailer** - Email service

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email notifications)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/vybe.git
cd vybe
```

### 2. Install dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Configure Environment Variables

#### Backend (.env in server/)
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000

# Optional: SMS Configuration
SMS_API_URL=your_sms_api_url
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=VYBE
```

#### Frontend (.env in client/)
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Create Admin User
```bash
cd server
node createAdmin.js
```

Default admin credentials:
- Email: `admin@vybe.com`
- Password: `admin123`

### 5. Run the application

#### Start Backend (from server/)
```bash
npm run dev
```

#### Start Frontend (from client/)
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## 📧 Email Setup

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Create an app password for "VYBE Store"
3. Add credentials to `server/.env`
4. Restart the backend server

See `EMAIL_SMS_SETUP.md` for detailed instructions.

## 📱 bKash Payment Setup

Current setup uses manual payment verification:
1. Customer selects bKash payment
2. Customer sends money to: **01747809138**
3. Customer enters transaction ID
4. Admin verifies payment in admin panel

For automated bKash integration, you'll need merchant credentials.

## 🎯 Usage

### Customer Flow
1. Browse products
2. Add items to cart
3. Proceed to checkout
4. Fill shipping information
5. Select payment method (bKash or COD)
6. Place order
7. Receive order confirmation email
8. Track order status

### Admin Flow
1. Login to admin dashboard
2. View sales statistics
3. Manage orders:
   - Update order status
   - Add tracking numbers
   - Verify payments
4. Manage users:
   - Edit user details
   - Change user roles
   - Delete users
5. Manage products:
   - Add/edit/delete products
   - Upload images

## 📁 Project Structure

```
vybe-mern/
├── client/                # Frontend React app
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   └── App.jsx
│   └── package.json
├── server/               # Backend Express app
│   ├── config/          # Configuration files
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js
├── EMAIL_SMS_SETUP.md   # Email/SMS setup guide
└── README.md
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT authentication
- HTTP-only cookies
- CORS configuration
- Environment variables for sensitive data
- Input validation
- Role-based access control

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get by category
- `POST /api/products/:id/review` - Add review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `PUT /api/admin/orders/:id/payment` - Update payment status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Update `CLIENT_URL` to production URL
3. Deploy backend
4. Note the backend URL

### Frontend (Vercel/Netlify)
1. Set `VITE_API_URL` to backend URL
2. Deploy frontend

### Database
- MongoDB Atlas (already cloud-based)
- Update IP whitelist for production server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**VYBE Team**

## 🙏 Acknowledgments

- Cloudinary for image hosting
- MongoDB Atlas for database hosting
- All open-source packages used in this project

---

**Built with ❤️ for customizable poster enthusiasts**
