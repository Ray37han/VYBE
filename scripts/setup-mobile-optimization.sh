#!/bin/bash

# Mobile Performance Optimization - Auto Setup Script
# This script will set up all the optimizations automatically

set -e  # Exit on error

echo "🚀 VYBE Mobile Performance Optimization Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CLIENT_DIR="$SCRIPT_DIR/client/src"

echo -e "${BLUE}Step 1:${NC} Backing up original files..."
if [ -f "$CLIENT_DIR/pages/MobileHome.jsx" ]; then
    cp "$CLIENT_DIR/pages/MobileHome.jsx" "$CLIENT_DIR/pages/MobileHome.jsx.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓${NC} Backed up MobileHome.jsx"
fi

if [ -f "$CLIENT_DIR/components/mobile/MobileHero.jsx" ]; then
    cp "$CLIENT_DIR/components/mobile/MobileHero.jsx" "$CLIENT_DIR/components/mobile/MobileHero.jsx.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓${NC} Backed up MobileHero.jsx"
fi

echo ""
echo -e "${BLUE}Step 2:${NC} Checking if optimized files exist..."

if [ ! -f "$CLIENT_DIR/pages/MobileHome.optimized.jsx" ]; then
    echo -e "${YELLOW}⚠${NC} MobileHome.optimized.jsx not found!"
    echo "Please make sure all optimized files are created first."
    exit 1
fi

if [ ! -f "$CLIENT_DIR/components/mobile/MobileHero.optimized.jsx" ]; then
    echo -e "${YELLOW}⚠${NC} MobileHero.optimized.jsx not found!"
    echo "Please make sure all optimized files are created first."
    exit 1
fi

echo -e "${GREEN}✓${NC} All optimized files found"

echo ""
echo -e "${BLUE}Step 3:${NC} Adding CSS import to main.jsx..."

# Check if import already exists
if grep -q "mobile-performance.css" "$CLIENT_DIR/main.jsx"; then
    echo -e "${GREEN}✓${NC} CSS already imported"
else
    # Add import after index.css
    sed -i.bak "/import '\.\/index\.css'/a\\
import './styles/mobile-performance.css';" "$CLIENT_DIR/main.jsx"
    echo -e "${GREEN}✓${NC} Added CSS import to main.jsx"
fi

echo ""
echo -e "${YELLOW}Would you like to replace the original files with optimized versions?${NC}"
echo "This will:"
echo "  • Replace MobileHome.jsx with MobileHome.optimized.jsx"
echo "  • Replace MobileHero.jsx with MobileHero.optimized.jsx"
echo "  • Backups are already created"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Step 4:${NC} Replacing original files..."
    
    cp "$CLIENT_DIR/pages/MobileHome.optimized.jsx" "$CLIENT_DIR/pages/MobileHome.jsx"
    echo -e "${GREEN}✓${NC} Replaced MobileHome.jsx"
    
    cp "$CLIENT_DIR/components/mobile/MobileHero.optimized.jsx" "$CLIENT_DIR/components/mobile/MobileHero.jsx"
    echo -e "${GREEN}✓${NC} Replaced MobileHero.jsx"
    
    echo ""
    echo -e "${GREEN}✅ Setup Complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Restart your dev server: npm run dev"
    echo "  2. Test on mobile device or Chrome DevTools"
    echo "  3. Run Lighthouse: npx lighthouse http://localhost:3000"
    echo ""
    echo "To revert:"
    echo "  Your backups are in:"
    echo "    • client/src/pages/MobileHome.jsx.backup.*"
    echo "    • client/src/components/mobile/MobileHero.jsx.backup.*"
else
    echo ""
    echo -e "${YELLOW}ℹ${NC} Setup cancelled. To test without replacing:"
    echo ""
    echo "  In your App.jsx or router file, import:"
    echo "  import MobileHome from './pages/MobileHome.optimized';"
    echo ""
fi

echo ""
echo -e "${BLUE}📊 Performance Testing:${NC}"
echo ""
echo "Chrome DevTools:"
echo "  1. F12 → Performance tab"
echo "  2. Gear icon → CPU: 4x slowdown, Network: Fast 3G"
echo "  3. Record → Reload page"
echo "  4. Check TTI < 2 seconds"
echo ""
echo "Lighthouse:"
echo "  npx lighthouse http://localhost:3000 --preset=mobile --view"
echo ""
echo "Target Metrics:"
echo "  • TTI: < 2 seconds"
echo "  • FCP: < 0.8 seconds"
echo "  • LCP: < 2.5 seconds"
echo "  • Performance Score: > 85"
echo ""
echo -e "${GREEN}Happy optimizing! 🚀${NC}"
