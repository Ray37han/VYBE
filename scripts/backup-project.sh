#!/bin/bash

# 🗂️ VYBE Project Backup Script
# This creates a complete backup of your VYBE project

# Configuration
PROJECT_DIR="/Users/rayhan/Documents/My Mac/Web/vybe-mern"
BACKUP_DIR="$HOME/Desktop/VYBE-Backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="vybe-backup-$DATE"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🗂️  VYBE Project Backup Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo -e "${YELLOW}📦 Creating backup...${NC}"
echo ""

# 1. Backup source code
echo "1. Backing up source code..."
cp -r "$PROJECT_DIR/client" "$BACKUP_DIR/$BACKUP_NAME/client"
cp -r "$PROJECT_DIR/server" "$BACKUP_DIR/$BACKUP_NAME/server"

# 2. Backup configuration files
echo "2. Backing up configuration files..."
cp "$PROJECT_DIR"/*.md "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp "$PROJECT_DIR"/*.json "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp "$PROJECT_DIR"/*.toml "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp "$PROJECT_DIR"/*.sh "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp "$PROJECT_DIR"/.gitignore "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp "$PROJECT_DIR"/Dockerfile "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null

# 3. Backup environment files
echo "3. Backing up environment variables..."
cp "$PROJECT_DIR/client/.env" "$BACKUP_DIR/$BACKUP_NAME/client/.env" 2>/dev/null
cp "$PROJECT_DIR/server/.env" "$BACKUP_DIR/$BACKUP_NAME/server/.env" 2>/dev/null

# 4. Create info file
echo "4. Creating backup info..."
cat > "$BACKUP_DIR/$BACKUP_NAME/BACKUP_INFO.txt" << EOF
VYBE Project Backup
===================

Backup Date: $(date)
Backup Location: $BACKUP_DIR/$BACKUP_NAME

Contents:
- Frontend (React/Vite)
- Backend (Node.js/Express)
- Configuration files
- Environment variables
- Documentation

Deployment Info:
- Frontend: Vercel (https://vercel.com/ray37hans-projects/client)
- Backend: Render (https://dashboard.render.com/web/vybe-backend-93eu)
- Domain: vybebd.store (Spaceship)
- Database: MongoDB Atlas

Git Repository: https://github.com/Ray37han/VYBE
Branch: main

To restore:
1. Extract this backup
2. Run: npm install in both client and server folders
3. Update .env files with your credentials
4. Deploy to Vercel/Render or run locally

EOF

# 5. Remove node_modules to save space
echo "5. Excluding node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/client/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/server/node_modules"

# 6. Create compressed archive
echo "6. Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"

# 7. Get file size
BACKUP_SIZE=$(du -sh "$BACKUP_NAME.tar.gz" | cut -f1)

# Clean up uncompressed folder
rm -rf "$BACKUP_NAME"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Backup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📦 Backup File: ${GREEN}$BACKUP_NAME.tar.gz${NC}"
echo -e "📍 Location: ${GREEN}$BACKUP_DIR/${NC}"
echo -e "💾 Size: ${GREEN}$BACKUP_SIZE${NC}"
echo ""
echo -e "${YELLOW}To extract:${NC}"
echo -e "  cd ~/Desktop/VYBE-Backups"
echo -e "  tar -xzf $BACKUP_NAME.tar.gz"
echo ""
echo -e "${YELLOW}To restore:${NC}"
echo -e "  1. Extract the backup"
echo -e "  2. cd $BACKUP_NAME/client && npm install"
echo -e "  3. cd $BACKUP_NAME/server && npm install"
echo -e "  4. Update .env files"
echo -e "  5. Deploy or run locally"
echo ""

# Open backup folder
open "$BACKUP_DIR"

echo -e "${GREEN}🎉 Done! Backup folder opened in Finder${NC}"
echo ""
