# 📱 VYBE Mobile App

> Premium Wall Art & Motivational Posters - Now on Android & iOS!

## 🚀 Quick Start

### Web Development
```bash
npm install
npm run dev
# Visit http://localhost:3001
```

### Mobile Development
```bash
npm run build:mobile    # Build for mobile
npm run android        # Open Android Studio
npm run ios            # Open Xcode (Mac only)
```

## 📖 Documentation

- **[MOBILE_READY.md](MOBILE_READY.md)** - Setup complete overview
- **[QUICK_START_MOBILE.md](QUICK_START_MOBILE.md)** - Quick commands
- **[MOBILE_DEPLOYMENT.md](MOBILE_DEPLOYMENT.md)** - Full deployment guide

## ✨ Features

- 🎨 Aurora Glass UI design
- 🛍️ Full e-commerce functionality
- 📱 Native Android & iOS apps
- 🔐 User authentication
- 💳 Checkout & order tracking
- 👨‍💼 Admin product management

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Aurora Glass
- **Mobile**: Capacitor 7
- **State**: Zustand
- **Backend**: Node.js + Express (production API)

## 📱 Platforms

- ✅ Web (Progressive Web App)
- ✅ Android (7.0+)
- ✅ iOS (13.0+)

## 🎯 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run build:mobile` | Build & sync mobile apps |
| `npm run android` | Open Android Studio |
| `npm run ios` | Open Xcode |
| `npm run sync` | Sync web build with mobile |

## 🌐 Environment Variables

Create `.env` file:
```env
VITE_API_URL=https://vybe-backend-93eu.onrender.com/api
```

## 📦 Project Structure

```
vybe-react-app/
├── android/          # Android native project
├── ios/             # iOS native project
├── src/             # React source code
├── dist/            # Production build
└── capacitor.config.ts  # Mobile configuration
```

## 🚀 Deployment

### Android
```bash
npm run build:mobile
npm run android
# In Android Studio: Build → Build APK
```

### iOS
```bash
npm run build:mobile
npm run ios
# In Xcode: Product → Archive
```

### Web (Vercel)
```bash
vercel --prod
```

## 📄 License

Private - VYBE E-commerce App

## 🆘 Support

See detailed documentation in:
- `MOBILE_DEPLOYMENT.md` for publishing guides
- `QUICK_START_MOBILE.md` for quick reference

---

**Built with ❤️ using React + Capacitor**
