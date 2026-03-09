#!/bin/bash

# 🗄️ VYBE Database Backup Script
# Creates a mongodump backup of the MongoDB Atlas database

# Load environment variables from server/.env
if [ -f "$(dirname "$0")/../server/.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../server/.env" | xargs)
fi

BACKUP_DIR="$HOME/Desktop/VYBE-Backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="db-backup-$DATE"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🗄️  VYBE Database Backup Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check mongodump availability
if ! command -v mongodump &> /dev/null; then
  echo -e "${RED}❌ mongodump not found. Install via: brew install mongodb-database-tools${NC}"
  exit 1
fi

# Check MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
  echo -e "${RED}❌ MONGODB_URI not set. Check server/.env${NC}"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo -e "${YELLOW}📦 Backing up database...${NC}"
echo -e "   Output: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Run mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME" 2>&1

if [ $? -eq 0 ]; then
  # Show backup size
  BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
  echo ""
  echo -e "${GREEN}✅ Database backup completed!${NC}"
  echo -e "   📁 Location: $BACKUP_DIR/$BACKUP_NAME"
  echo -e "   📊 Size: $BACKUP_SIZE"
  echo ""
  echo -e "${YELLOW}To restore:${NC}"
  echo -e "   mongorestore --uri=\"\$MONGODB_URI\" $BACKUP_DIR/$BACKUP_NAME"
else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi
