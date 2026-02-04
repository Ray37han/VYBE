# 📦 cPanel Backup Guide

## 🚀 Quick Access to cPanel

### Login URLs (Try these):
- `https://vybebd.store/cpanel`
- `https://vybebd.store:2083`
- Through Spaceship Control Panel → Hosting section
- Check your Spaceship welcome email for cPanel URL

---

## Method 1: Full Account Backup (Complete)

### Step-by-Step:

1. **Login to cPanel**
   - Use credentials from hosting provider

2. **Find Backup Section:**
   - Scroll to "Files" section
   - Click **"Backup"**

3. **Download Full Backup:**
   - Click **"Download a Full Account Backup"**
   - Select **"Home Directory"**
   - Destination: **"Home Directory"** (default)
   - Email: Your email address
   - Click **"Generate Backup"**

4. **Wait for Email:**
   - Usually takes 5-30 minutes
   - You'll get notification when ready

5. **Download:**
   - Return to cPanel → Backup
   - See available backups listed
   - Click download link
   - File: `backup-YYYY-MM-DD_username.tar.gz`

---

## Method 2: Download Specific Components

### A. Website Files

```
1. cPanel → File Manager
2. Navigate to public_html (or www)
3. Select all files
4. Click "Compress"
5. Create archive: website-files.zip
6. Download the ZIP file
```

### B. MySQL Database

```
1. cPanel → phpMyAdmin
2. Select your database
3. Click "Export" tab
4. Method: Quick
5. Format: SQL
6. Click "Go"
7. Save the .sql file
```

### C. Email Accounts

```
1. cPanel → Email Accounts
2. Click "Manage" for each account
3. Click "Download Email"
4. Save email backups
```

### D. SSL Certificates

```
1. cPanel → SSL/TLS
2. Click "Manage SSL Sites"
3. Copy certificate and private key
4. Save to text files
```

---

## Method 3: FTP/SFTP Download

### Using FileZilla (Free FTP Client)

**Install FileZilla:**
```bash
# Mac
brew install --cask filezilla

# Or download from: https://filezilla-project.org/
```

**Connect:**
```
Host: ftp.vybebd.store (or your domain)
Username: Your cPanel username
Password: Your cPanel password
Port: 21 (FTP) or 22 (SFTP)
```

**Download:**
1. Connect to server
2. Navigate to `/public_html`
3. Select all files
4. Right-click → Download
5. Save to local folder

---

## Method 4: Command Line (SSH)

**If SSH access is enabled:**

```bash
# Login via SSH
ssh username@vybebd.store

# Create backup
tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/public_html ~/mail

# Download via SCP from your Mac
scp username@vybebd.store:~/backup-*.tar.gz ~/Downloads/
```

---

## Method 5: Automated Backup Script

### cPanel Backup Script

```bash
#!/bin/bash
# Save as: backup-cpanel.sh

# Configuration
CPANEL_USER="your_username"
DOMAIN="vybebd.store"
BACKUP_DIR="$HOME/cpanel-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Download via FTP
wget -r -np -nH --cut-dirs=1 \
  --user="$CPANEL_USER" \
  --password="$CPANEL_PASS" \
  ftp://$DOMAIN/public_html/ \
  -P "$BACKUP_DIR/files-$DATE"

echo "✅ Backup completed: $BACKUP_DIR/files-$DATE"
```

---

## 🗂️ What Each Backup Contains

### Full Account Backup (.tar.gz)
- ✅ All website files (public_html, www, etc.)
- ✅ All databases (MySQL, PostgreSQL)
- ✅ Email accounts and data
- ✅ FTP accounts
- ✅ Subdomains
- ✅ DNS zone files
- ✅ SSL certificates
- ✅ Cron jobs
- ✅ .htaccess files

### Home Directory Backup
- ✅ public_html (website files)
- ✅ mail (email data)
- ✅ etc (configurations)
- ✅ logs
- ✅ tmp files

---

## 📊 Backup File Sizes (Estimate)

| Item | Typical Size |
|------|--------------|
| Small website | 50-500 MB |
| Medium website | 500 MB - 2 GB |
| Large website | 2-10 GB |
| With databases | +100-500 MB |
| With emails | +varies greatly |

---

## 🔍 How to Find Your cPanel Login

### Check These Locations:

1. **Spaceship Control Panel:**
   - Login to Spaceship.com
   - Go to "My Products" or "Hosting"
   - Look for cPanel access link

2. **Welcome Email:**
   - Search email for "cPanel" or "hosting"
   - Subject might be: "Your Hosting Account Details"
   - Contains username, password, cPanel URL

3. **Common cPanel URLs:**
   ```
   https://vybebd.store/cpanel
   https://vybebd.store:2083
   https://cpanel.vybebd.store
   https://server.spaceship.com:2083
   ```

4. **Contact Support:**
   - If you can't find it, contact Spaceship support
   - They'll provide cPanel URL and credentials

---

## 🚨 If You Don't Have cPanel

**Spaceship might offer:**
- **Web hosting** with cPanel
- **Domain only** (no hosting)

**Check your Spaceship account:**
1. Login to Spaceship
2. Go to "My Products"
3. Look for "Hosting" or "Web Hosting"
4. If you only see "Domain" - you don't have hosting yet

**If no hosting:**
- You can add hosting through Spaceship
- Or use Vercel + Render (FREE) like we're doing

---

## 💾 Restore Backup to New Location

### If Moving from cPanel to Vercel/Render:

**Frontend (Vercel):**
```bash
# Extract backup
tar -xzf backup-*.tar.gz

# Copy website files
cp -r public_html/* /path/to/vybe-mern/client/public/

# Deploy
cd /path/to/vybe-mern/client
vercel --prod
```

**Backend Database (MongoDB):**
```bash
# If you have MySQL backup, convert to MongoDB
# Or use MongoDB Atlas import

# Import MySQL dump
mysql -u user -p database < backup.sql

# Export to MongoDB JSON
mysqldump --json database > data.json

# Import to MongoDB
mongoimport --uri "mongodb+srv://..." --collection products --file data.json
```

---

## 🔄 Schedule Automatic Backups

### cPanel Backup Schedule:

```
1. cPanel → Backup Wizard
2. Click "Backup" tab
3. Enable "Automatic Backups"
4. Choose frequency (daily/weekly)
5. Set retention period
6. Add email notification
```

---

## 📞 Need Help?

**Spaceship Support:**
- Email: support@spaceship.com
- Live Chat: Available in dashboard
- Help Center: https://www.spaceship.com/help

**What to ask:**
- "How do I access my cPanel?"
- "I need my hosting login credentials"
- "How do I download a full backup?"

---

## ✅ Checklist

Before backing up, confirm:
- [ ] I have cPanel hosting (not just domain)
- [ ] I know my cPanel URL
- [ ] I have cPanel username/password
- [ ] I have enough local disk space
- [ ] I have stable internet connection

---

## 🎯 Quick Command Summary

```bash
# Check if you have hosting
curl -I https://vybebd.store/cpanel

# Download via wget (if FTP enabled)
wget -r ftp://vybebd.store/public_html/

# Download via SCP (if SSH enabled)
scp -r username@vybebd.store:~/public_html ./backup/

# Extract backup
tar -xzf backup-*.tar.gz
```

---

**Note:** If Spaceship only provided domain registration (not hosting), you don't have a cPanel backup. Your site is currently only deployed to Vercel (frontend) and Render (backend), which don't use cPanel.

Check your Spaceship account to confirm if you have hosting or just a domain! 🚀
