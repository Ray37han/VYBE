#!/bin/bash

# VYBE Remote Upload Setup Script
# This script helps you set up remote access for uploading from any device

echo "🚀 VYBE Remote Upload Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the VYBE project root directory"
    exit 1
fi

echo "Select setup method:"
echo "1) Production Access (Use deployed site - Recommended)"
echo "2) Local Network Access (Mobile on same WiFi)"
echo "3) Remote Access with Ngrok (Access from anywhere)"
echo "4) Check System Status"
echo "5) View Setup Guide"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        print_info "Production Access Setup"
        echo "================================"
        echo ""
        print_success "Your site is already deployed!"
        echo ""
        echo "Frontend: https://vybe-nu.vercel.app"
        echo "Backend:  https://vybe-backend-production-2ab6.up.railway.app"
        echo ""
        print_info "Steps to upload from any device:"
        echo "1. Open browser (mobile or computer)"
        echo "2. Visit: https://vybe-nu.vercel.app"
        echo "3. Login with admin credentials"
        echo "4. Go to Admin → Products"
        echo "5. Upload products from anywhere! 🎉"
        echo ""
        print_success "Works on: Phone, Tablet, Laptop, Desktop"
        print_success "Works from: Home, Office, Travel, Anywhere with internet!"
        ;;
        
    2)
        echo ""
        print_info "Local Network Access Setup"
        echo "================================"
        echo ""
        
        # Get local IP
        print_info "Finding your local IP address..."
        LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
        
        if [ -z "$LOCAL_IP" ]; then
            print_warning "Could not auto-detect IP. Getting all network interfaces:"
            ifconfig | grep "inet " | grep -v 127.0.0.1
            echo ""
            read -p "Enter your local IP address (e.g., 192.168.1.100): " LOCAL_IP
        fi
        
        print_success "Your local IP: $LOCAL_IP"
        echo ""
        
        print_info "Starting servers..."
        
        # Check if servers are already running
        BACKEND_PID=$(lsof -ti :5001 2>/dev/null)
        FRONTEND_PID=$(lsof -ti :3000 2>/dev/null)
        
        if [ -n "$BACKEND_PID" ]; then
            print_warning "Backend already running on port 5001 (PID: $BACKEND_PID)"
        else
            print_info "Starting backend server..."
            cd server
            npm run dev > /dev/null 2>&1 &
            cd ..
            sleep 3
            print_success "Backend started on port 5001"
        fi
        
        if [ -n "$FRONTEND_PID" ]; then
            print_warning "Frontend already running on port 3000 (PID: $FRONTEND_PID)"
        else
            print_info "Starting frontend server..."
            cd client
            npm run dev > /dev/null 2>&1 &
            cd ..
            sleep 3
            print_success "Frontend started on port 3000"
        fi
        
        echo ""
        print_success "Setup Complete!"
        echo ""
        echo "================================"
        echo "📱 MOBILE DEVICE INSTRUCTIONS:"
        echo "================================"
        echo ""
        echo "1. Connect your mobile to the SAME WiFi network as this computer"
        echo "2. Open browser on your mobile device"
        echo "3. Visit: http://$LOCAL_IP:3000"
        echo "4. Login with admin credentials"
        echo "5. Upload products from mobile! 🎉"
        echo ""
        print_warning "Important:"
        echo "- Both devices must be on the SAME WiFi network"
        echo "- Keep this terminal window open (servers running)"
        echo "- Press Ctrl+C to stop servers when done"
        ;;
        
    3)
        echo ""
        print_info "Remote Access with Ngrok Setup"
        echo "================================"
        echo ""
        
        # Check if ngrok is installed
        if ! command -v ngrok &> /dev/null; then
            print_error "Ngrok is not installed"
            echo ""
            print_info "Installing ngrok..."
            brew install ngrok
            
            if [ $? -ne 0 ]; then
                print_error "Failed to install ngrok"
                echo "Please install manually: https://ngrok.com/download"
                exit 1
            fi
            
            print_success "Ngrok installed!"
        else
            print_success "Ngrok is already installed"
        fi
        
        echo ""
        print_info "Starting servers..."
        
        # Start backend
        BACKEND_PID=$(lsof -ti :5001 2>/dev/null)
        if [ -z "$BACKEND_PID" ]; then
            cd server
            npm run dev > /dev/null 2>&1 &
            cd ..
            sleep 3
            print_success "Backend started on port 5001"
        else
            print_warning "Backend already running"
        fi
        
        # Start frontend
        FRONTEND_PID=$(lsof -ti :3000 2>/dev/null)
        if [ -z "$FRONTEND_PID" ]; then
            cd client
            npm run dev > /dev/null 2>&1 &
            cd ..
            sleep 3
            print_success "Frontend started on port 3000"
        else
            print_warning "Frontend already running"
        fi
        
        echo ""
        print_info "Starting ngrok tunnels..."
        echo ""
        
        print_warning "IMPORTANT: You need to run these commands in SEPARATE terminal windows:"
        echo ""
        echo "Terminal 1 (Backend Tunnel):"
        echo "  ngrok http 5001"
        echo ""
        echo "Terminal 2 (Frontend Tunnel):"
        echo "  ngrok http 3000"
        echo ""
        print_info "After starting ngrok tunnels:"
        echo "1. Copy the HTTPS URL from backend ngrok (e.g., https://abc123.ngrok-free.app)"
        echo "2. Create client/.env.local with: VITE_API_URL=https://abc123.ngrok-free.app/api"
        echo "3. Restart frontend (Ctrl+C in frontend terminal, then npm run dev)"
        echo "4. Use the frontend ngrok URL to access from ANY device, ANYWHERE!"
        echo ""
        print_success "You can now upload from anywhere with internet! 🌍"
        ;;
        
    4)
        echo ""
        print_info "Checking System Status..."
        echo "================================"
        echo ""
        
        # Check backend
        print_info "Checking backend..."
        BACKEND_STATUS=$(curl -s https://vybe-backend-production-2ab6.up.railway.app/api/health)
        if [ $? -eq 0 ]; then
            print_success "Backend is online!"
            echo "Response: $BACKEND_STATUS"
        else
            print_error "Backend is not responding"
        fi
        
        echo ""
        
        # Check frontend
        print_info "Checking frontend..."
        FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vybe-nu.vercel.app)
        if [ "$FRONTEND_STATUS" = "200" ]; then
            print_success "Frontend is online!"
        else
            print_error "Frontend is not responding (Status: $FRONTEND_STATUS)"
        fi
        
        echo ""
        
        # Check local servers
        print_info "Checking local servers..."
        
        BACKEND_LOCAL=$(lsof -ti :5001 2>/dev/null)
        if [ -n "$BACKEND_LOCAL" ]; then
            print_success "Local backend running (Port 5001, PID: $BACKEND_LOCAL)"
        else
            print_warning "Local backend not running"
        fi
        
        FRONTEND_LOCAL=$(lsof -ti :3000 2>/dev/null)
        if [ -n "$FRONTEND_LOCAL" ]; then
            print_success "Local frontend running (Port 3000, PID: $FRONTEND_LOCAL)"
        else
            print_warning "Local frontend not running"
        fi
        
        echo ""
        
        # Get local IP
        LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
        if [ -n "$LOCAL_IP" ]; then
            print_info "Your local IP: $LOCAL_IP"
            echo "Access from mobile: http://$LOCAL_IP:3000"
        fi
        ;;
        
    5)
        echo ""
        print_info "Opening Setup Guide..."
        
        if [ -f "REMOTE_UPLOAD_GUIDE.md" ]; then
            cat REMOTE_UPLOAD_GUIDE.md
        else
            print_error "Guide not found. Please check REMOTE_UPLOAD_GUIDE.md"
        fi
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Setup complete! 🎉"
echo ""
echo "For detailed instructions, see: REMOTE_UPLOAD_GUIDE.md"
echo ""
