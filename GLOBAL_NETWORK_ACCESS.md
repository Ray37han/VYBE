# 🌍 Global Network Access Guide

## Overview
Your VYBE application is now configured to run globally on your local network, allowing access from any device connected to the same WiFi/LAN.

---

## 🚀 Current Status

### ✅ Backend Server
**Running on**: `http://192.168.0.209:5001`
- Local access: `http://localhost:5001`
- Network access: `http://192.168.0.209:5001`
- Alternative: `http://172.16.0.2:5001`

### ✅ Frontend Application
**Running on**: `http://192.168.0.209:3000`
- Local access: `http://localhost:3000`
- Network access: `http://192.168.0.209:3000`
- Alternative: `http://172.16.0.2:3000`

---

## 📱 How to Access from Other Devices

### From Mobile Phone (iPhone/Android):
1. **Connect to Same WiFi** as your Mac
2. **Open browser** and go to:
   ```
   http://192.168.0.209:3000
   ```
3. You'll see the VYBE application running!

### From Another Computer on Same Network:
1. **Connect to Same WiFi/LAN**
2. **Open browser** and use:
   ```
   http://192.168.0.209:3000
   ```

### From Tablet:
Same as mobile - just use the network IP address.

---

## 🔧 Configuration Details

### What Changed:

#### **Backend (`server/server.js`)**:
```javascript
// Binds to all network interfaces (0.0.0.0)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // Shows all available network IPs
});
```

**CORS Configuration**:
- ✅ Allows `localhost` with any port
- ✅ Allows local network IPs: `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`
- ✅ Allows Vercel deployments
- ✅ Credential support enabled

#### **Frontend (`client/vite.config.js`)**:
```javascript
server: {
  host: '0.0.0.0', // Listen on all network interfaces
  port: 3000,
}
```

---

## 🛠️ Starting the Servers

### Method 1: Start Both Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### Method 2: Use Scripts (if available)
```bash
# From project root
npm run dev
```

---

## 📊 Network IP Addresses Explained

Your Mac has multiple network interfaces:

| Interface | IP Address | Use Case |
|-----------|------------|----------|
| **WiFi** | `192.168.0.209` | **Primary** - Use this for mobile/other devices |
| **VPN/Virtual** | `172.16.0.2` | Virtual network (if VPN active) |
| **Loopback** | `127.0.0.1` | Local only (doesn't work from other devices) |

**Recommended**: Always use `192.168.0.209` for network access.

---

## 🔒 Security Considerations

### Current Setup (Development):
- ✅ CORS allows local network access
- ✅ MongoDB connected securely
- ✅ JWT authentication active
- ✅ Rate limiting enabled
- ⚠️  No HTTPS (fine for local network)

### For Production Deployment:
You'll need:
- ✅ HTTPS certificates
- ✅ Domain name
- ✅ Firewall configuration
- ✅ Tighter CORS restrictions
- ✅ Environment-specific configs

---

## 🧪 Testing from Mobile

### Step-by-Step:

1. **Find Your Network IP**:
   - Look at server startup logs
   - Or check Mac network settings
   - Should be `192.168.0.209`

2. **On Your Phone**:
   - Connect to **same WiFi** as Mac
   - Open Safari/Chrome
   - Go to: `http://192.168.0.209:3000`

3. **Test Features**:
   - ✅ Browse products
   - ✅ Add to cart
   - ✅ Login/Register
   - ✅ Place orders
   - ✅ Admin panel (if admin)

---

## 🐛 Troubleshooting

### Problem: "Can't connect from phone"

**Solution 1**: Check WiFi
```bash
# Make sure phone is on SAME WiFi as Mac
# Check WiFi name on both devices
```

**Solution 2**: Check Firewall
```bash
# macOS Firewall might block connections
# Go to: System Preferences → Security & Privacy → Firewall
# Either disable firewall OR add Node.js to allowed apps
```

**Solution 3**: Verify IP Address
```bash
# On Mac terminal:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Should show: 192.168.0.209
```

**Solution 4**: Check if Server is Running
```bash
# Test locally first
curl http://localhost:5001/api/hero-items

# Then test with network IP
curl http://192.168.0.209:5001/api/hero-items
```

### Problem: "CORS error"

**Solution**: Already handled! Our CORS config allows local network IPs.

### Problem: "Slow loading on mobile"

**Possible causes**:
- Weak WiFi signal
- Server processing large images
- Network congestion

**Solution**:
- Move closer to WiFi router
- Optimize images (use Cloudinary)
- Check server logs for slow endpoints

---

## 📡 Port Forwarding (Advanced)

### To Access from Internet (Not Recommended for Development):

1. **Router Setup**:
   - Login to router admin panel
   - Find "Port Forwarding" settings
   - Forward port `3000` → Mac IP `192.168.0.209`
   - Forward port `5001` → Mac IP `192.168.0.209`

2. **Get Public IP**:
   ```bash
   curl ifconfig.me
   ```

3. **Access**:
   ```
   http://YOUR_PUBLIC_IP:3000
   ```

**⚠️ WARNING**: This exposes your dev server to the internet. Only do this:
- If you know what you're doing
- With proper security measures
- For temporary testing only

**Better Alternative**: Deploy to Vercel/Railway instead!

---

## 🚀 Production Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)
**Best for**: Quick deployment, auto-scaling
- Frontend: Deploy to Vercel (free)
- Backend: Deploy to Railway (free tier available)
- See: `DEPLOY_LIVE_WEBSITE.md` for full guide

### Option 2: DigitalOcean/AWS/Google Cloud
**Best for**: Full control, custom configurations
- Deploy both frontend and backend
- Use NGINX as reverse proxy
- Setup SSL certificates (Let's Encrypt)

### Option 3: Heroku
**Best for**: Simple all-in-one deployment
- Deploy backend to Heroku
- Deploy frontend to Vercel or Heroku
- Easy database integration

---

## 📋 Quick Reference Commands

### Start Servers:
```bash
# Backend
cd server && npm start

# Frontend (new terminal)
cd client && npm run dev
```

### Stop Servers:
```bash
# Kill processes on ports
lsof -ti:5001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### Check Running Servers:
```bash
lsof -i :5001  # Check backend
lsof -i :3000  # Check frontend
```

### Get Network IPs:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 🎯 Access URLs Summary

### Local Machine:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- Admin: `http://localhost:3000/admin`

### From Other Devices on Network:
- Frontend: `http://192.168.0.209:3000`
- Backend API: `http://192.168.0.209:5001`
- Admin: `http://192.168.0.209:3000/admin`

### Production (When Deployed):
- Frontend: `https://vybe-sigma.vercel.app`
- Backend: `https://vybe-backend-93eu.onrender.com`

---

## 💡 Tips

1. **Bookmark on Phone**: Save `http://192.168.0.209:3000` to home screen
2. **QR Code**: Use a QR generator to create a QR code for easy mobile access
3. **Static IP**: Consider setting a static IP for your Mac in router settings
4. **Keep Mac Awake**: Prevent Mac from sleeping during testing (System Prefs)
5. **Battery**: Connect Mac to power for extended testing sessions

---

## 🔗 Related Documentation

- `EMAIL_VERIFICATION_GUIDE.md` - OTP authentication setup
- `DEPLOY_LIVE_WEBSITE.md` - Production deployment guide
- `QUICK_DEPLOY.md` - Quick deployment commands
- `QUICKSTART.md` - Getting started guide

---

**Status**: ✅ **Running Globally on Local Network**
**Last Updated**: October 30, 2025
**Your Network IP**: `192.168.0.209`
