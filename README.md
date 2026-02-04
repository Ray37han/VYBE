<div align="center">

# 🎨 VYBE

### A Modern E-Commerce Platform for Customizable Posters

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-vybebd.store-purple?style=for-the-badge)](https://vybebd.store)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <strong>A full-stack MERN application featuring product customization, real-time cart updates, admin dashboard, and mobile payment integration (bKash, Nagad, Rocket).</strong>
</p>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Screenshots](#-screenshots) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛍️ Customer Experience
- **Product Browsing** with search & filtering
- **Product Customization** - Upload images, add text, choose frames
- **Shopping Cart** with real-time updates
- **Multiple Payment Options** - bKash, Nagad, Rocket, COD
- **Order Tracking** with email notifications
- **Reviews & Ratings** system
- **Dark/Light Mode** toggle
- **Fully Responsive** design

</td>
<td width="50%">

### 👨‍💼 Admin Dashboard
- **Sales Analytics** & statistics
- **Order Management** with status updates
- **Product CRUD** with multi-image upload
- **User Management** with role control
- **Custom Poster Approval** queue
- **Payment Verification** system
- **Email Notifications** automation
- **Mobile-Optimized** admin panel

</td>
</tr>
</table>

### 🚀 Performance Highlights
- ⚡ **60 FPS** smooth animations on all devices
- 📱 **< 2s TTI** (Time to Interactive) on mobile
- 🍎 **Safari/WebKit** optimized
- 🖼️ **Smart Image Processing** via Cloudinary

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

**Frontend**

![React](https://img.shields.io/badge/-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/-Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

</td>
<td align="center" width="25%">

**Backend**

![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

</td>
<td align="center" width="25%">

**Cloud Services**

![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Resend](https://img.shields.io/badge/-Resend-000000?style=flat-square&logo=resend&logoColor=white)

</td>
<td align="center" width="25%">

**Deployment**

![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

| Homepage | Product Page | Admin Dashboard |
|:---:|:---:|:---:|
| ![Homepage](https://via.placeholder.com/300x200/6366f1/ffffff?text=Homepage) | ![Product](https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Product+Page) | ![Admin](https://via.placeholder.com/300x200/a855f7/ffffff?text=Admin+Panel) |

| Mobile View | Dark Mode | Cart |
|:---:|:---:|:---:|
| ![Mobile](https://via.placeholder.com/300x200/c084fc/ffffff?text=Mobile) | ![Dark](https://via.placeholder.com/300x200/7c3aed/ffffff?text=Dark+Mode) | ![Cart](https://via.placeholder.com/300x200/9333ea/ffffff?text=Shopping+Cart) |

</div>

> 📝 *Replace placeholder images with actual screenshots from [vybebd.store](https://vybebd.store)*

### 🖼️ Product Categories
- **Football Icons** - Ronaldo, Messi, Neymar, Sergio Ramos
- **Cars & Supercars** - Porsche GT3 RS, BMW M4, Bugatti, Ford Mustang, Dodge Challenger, Supra
- **Anime** - One Piece and more
- **F1 Racing** - Singapore Grand Prix
- **Music Artists** - The Weeknd

---

## 🚀 Installation

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Resend account (for emails)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Ray37han/VYBE.git
cd VYBE

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Environment Variables

<details>
<summary><b>Backend (.env)</b></summary>

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
CLIENT_URL=http://localhost:3000
```

</details>

<details>
<summary><b>Frontend (.env)</b></summary>

```env
VITE_API_URL=http://localhost:5001/api
```

</details>

### Run Development Server

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

🌐 **Frontend:** http://localhost:3000  
🔧 **Backend:** http://localhost:5001

---

## 📚 API Reference

<details>
<summary><b>Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/logout` | Logout user |
| `GET` | `/api/auth/me` | Get current user |

</details>

<details>
<summary><b>Products</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get single product |
| `GET` | `/api/products/category/:category` | Get by category |
| `POST` | `/api/products/:id/review` | Add review |

</details>

<details>
<summary><b>Orders</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create order |
| `GET` | `/api/orders/my-orders` | Get user orders |
| `GET` | `/api/orders/:id` | Get single order |

</details>

<details>
<summary><b>Admin</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard stats |
| `POST` | `/api/admin/products` | Create product |
| `PUT` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |
| `GET` | `/api/admin/orders` | Get all orders |
| `PUT` | `/api/admin/orders/:id/status` | Update order status |

</details>

---

## 📁 Project Structure

```
VYBE/
├── 📂 client/                 # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 api/           # API client
│   │   ├── 📂 components/    # Reusable components
│   │   ├── 📂 pages/         # Page components
│   │   ├── 📂 store/         # Zustand state management
│   │   ├── 📂 hooks/         # Custom hooks
│   │   └── 📄 App.jsx
│   └── 📄 package.json
│
├── 📂 server/                 # Express Backend
│   ├── 📂 config/            # Configuration
│   ├── 📂 middleware/        # Custom middleware
│   ├── 📂 models/            # MongoDB models
│   ├── 📂 routes/            # API routes
│   ├── 📂 utils/             # Utilities
│   └── 📄 server.js
│
├── 📂 docs/                   # Documentation
└── 📄 README.md
```

---

## 🔒 Security Features

- 🔐 **JWT Authentication** with HTTP-only cookies
- 🔑 **Password Hashing** with bcrypt
- 🛡️ **CORS Configuration** for API protection
- ✅ **Input Validation** & sanitization
- 👥 **Role-Based Access Control** (Admin/User)
- 📧 **Email Verification** for registration

---

## 🚀 Deployment

| Service | Purpose | Status |
|---------|---------|--------|
| **Vercel** | Frontend hosting | ✅ Active |
| **Render** | Backend hosting | ✅ Active |
| **MongoDB Atlas** | Database | ✅ Active |
| **Cloudinary** | Image storage | ✅ Active |

### 🌐 Live URLs
- **Website:** [vybebd.store](https://vybebd.store)
- **Frontend (Vercel):** [vybe-nu.vercel.app](https://vybe-nu.vercel.app)
- **Backend API:** [vybe-backend-93eu.onrender.com](https://vybe-backend-93eu.onrender.com)

---

## 📊 Project Stats

```
📅 Development Period: Oct 2025 - Present
💻 Total Commits: 167+
📝 Lines of Code: ~30,000
📁 Source Files: 126
🚀 Live at: vybebd.store
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rayhan**

[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github)](https://github.com/Ray37han)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourprofile)

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**[🌐 Visit Live Site](https://vybebd.store)** • **[🐛 Report Bug](https://github.com/Ray37han/VYBE/issues)** • **[✨ Request Feature](https://github.com/Ray37han/VYBE/issues)**

</div>
