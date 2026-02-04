#!/bin/bash

# VYBE Network Connection Test Script
# This script helps verify that your backend is accessible from the network

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                    VYBE Network Connection Test                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Get Mac's IP addresses
echo "📍 Your Mac's IP Addresses:"
echo "   WiFi (en0):     $(ipconfig getifaddr en0 2>/dev/null || echo 'Not connected')"
echo "   Ethernet (en1): $(ipconfig getifaddr en1 2>/dev/null || echo 'Not connected')"
echo ""

# Test localhost
echo "🔍 Testing Backend Server..."
echo ""
echo "   1. Testing localhost:5001..."
LOCALHOST_TEST=$(curl -s http://localhost:5001 2>&1)
if [[ $LOCALHOST_TEST == *"success"* ]]; then
    echo "      ✅ localhost:5001 is responding"
else
    echo "      ❌ localhost:5001 is NOT responding"
    echo "         Make sure backend is running: cd server && npm run dev"
fi
echo ""

# Get the WiFi IP
WIFI_IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ ! -z "$WIFI_IP" ]; then
    echo "   2. Testing network IP ($WIFI_IP:5001)..."
    NETWORK_TEST=$(curl -s http://$WIFI_IP:5001 2>&1)
    if [[ $NETWORK_TEST == *"success"* ]]; then
        echo "      ✅ $WIFI_IP:5001 is responding"
        echo "      🎉 Backend is accessible from the network!"
    else
        echo "      ❌ $WIFI_IP:5001 is NOT responding"
        echo "         Check firewall settings or use localhost testing only"
    fi
fi
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📱 To access from Windows/Android devices:"
echo ""
echo "   1. Make sure all devices are on the SAME WiFi network"
echo ""
echo "   2. Update client/.env with your network IP:"
if [ ! -z "$WIFI_IP" ]; then
    echo "      VITE_API_URL=http://$WIFI_IP:5001/api"
else
    echo "      VITE_API_URL=http://YOUR_MAC_IP:5001/api"
fi
echo ""
echo "   3. Restart frontend:"
echo "      cd client && npm run dev"
echo ""
echo "   4. From Windows/Android, open browser and go to:"
if [ ! -z "$WIFI_IP" ]; then
    echo "      http://$WIFI_IP:3000"
else
    echo "      http://YOUR_MAC_IP:3000"
fi
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Current Frontend Configuration:"
if [ -f "client/.env" ]; then
    echo ""
    cat client/.env | grep VITE_API_URL
    echo ""
    
    CURRENT_API=$(cat client/.env | grep VITE_API_URL | cut -d'=' -f2)
    if [[ $CURRENT_API == *"localhost"* ]]; then
        echo "   ⚠️  WARNING: Frontend is configured for localhost only!"
        echo "      This won't work from Windows/Android devices."
        echo ""
        if [ ! -z "$WIFI_IP" ]; then
            echo "      To fix, update client/.env to:"
            echo "      VITE_API_URL=http://$WIFI_IP:5001/api"
        fi
    else
        echo "   ✅ Frontend is configured for network access"
    fi
else
    echo "   ❌ client/.env file not found!"
fi
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Admin Users with Upload Permission:"
echo ""
cd server && node verifyAdmins.js 2>/dev/null | grep -A 1 "Email:" | head -20
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
