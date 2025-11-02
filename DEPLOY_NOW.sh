#!/bin/bash
# Quick Railway Deployment Script for VYBE Backend

echo "🚀 VYBE Backend - Railway Deployment Helper"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    git commit -m "Prepare for Railway deployment"
fi

echo ""
echo "✅ Code ready for deployment!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/vybe-mern.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Railway:"
echo "   • Go to: https://railway.app"
echo "   • Click 'Login with GitHub'"
echo "   • Click 'New Project' → 'Deploy from GitHub repo'"
echo "   • Select your 'vybe-mern' repository"
echo "   • Set Root Directory: /server"
echo "   • Click 'Deploy Now'"
echo ""
echo "3. Add Environment Variables in Railway:"
echo "   (Copy from server/.env)"
echo ""
cat server/.env | grep -v "^#" | grep -v "^$"
echo ""
echo "4. Get your Railway URL:"
echo "   Example: https://vybe-backend-production.up.railway.app"
echo ""
echo "5. Update client/.env:"
echo "   VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api"
echo ""
echo "6. Rebuild frontend:"
echo "   cd client && npm run build"
echo ""
echo "🎉 Done! Your backend will be accessible worldwide!"
