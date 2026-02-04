#!/bin/bash

echo "🚀 Setting up VYBE E-Commerce Platform..."
echo ""

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the vybe-mern directory"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Copy .env.example to .env if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating server .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your credentials"
fi

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Create client .env if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating client .env file..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your MongoDB, Cloudinary, and payment gateway credentials"
echo "2. Make sure MongoDB is running: brew services start mongodb-community"
echo "3. Start the server: cd server && npm run dev"
echo "4. Start the client (in new terminal): cd client && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "🔐 Create an admin user in MongoDB:"
echo "   db.users.insertOne({"
echo "     name: 'Admin',"
echo "     email: 'admin@vybe.com',"
echo "     password: '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMKfFJx5fWu',"
echo "     role: 'admin'"
echo "   })"
echo ""
echo "Happy coding! 🎨"
