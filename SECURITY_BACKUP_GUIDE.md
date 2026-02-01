# MAKEFARMHUB - Security & Backup Strategy

## Overview
Complete guide to secure your application, maintain backups, and ensure you have full control over your codebase and deployment.

---

## 1. Version Control & Code Protection

### GitHub Setup (Recommended)
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - MAKEFARMHUB"

# Create GitHub repository
# Go to https://github.com/new
# Create repo: makefarmhub-backup

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/makefarmhub-backup.git
git branch -M main
git push -u origin main
```

### GitHub Security Settings
1. **Enable Two-Factor Authentication**
   - Settings → Security → Two-factor authentication
   - Use authenticator app (Google Authenticator, Authy)

2. **Create Personal Access Token**
   - Settings → Developer settings → Personal access tokens
   - Generate token with `repo` scope
   - Store securely (use password manager)

3. **Branch Protection**
   - Settings → Branches → Add rule
   - Require pull request reviews
   - Require status checks to pass
   - Protect main branch

4. **Enable Dependabot**
   - Settings → Code security and analysis
   - Enable Dependabot alerts and updates
   - Auto-update dependencies

### Local Git Configuration
```bash
# Configure git with your details
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Set up SSH key for passwordless authentication
ssh-keygen -t ed25519 -C "your@email.com"
# Add public key to GitHub Settings → SSH and GPG keys

# Configure git to sign commits
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY
```

---

## 2. Backup Strategy

### Automated Daily Backups

#### Option A: GitHub Actions (Automatic)
Create `.github/workflows/backup.yml`:
```yaml
name: Daily Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create backup archive
        run: |
          tar -czf makefarmhub-backup-$(date +%Y%m%d).tar.gz .
      - name: Upload to releases
        uses: softprops/action-gh-release@v1
        with:
          files: makefarmhub-backup-*.tar.gz
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Option B: Local Backup Script
Create `backup.sh`:
```bash
#!/bin/bash

# Create backup directory
BACKUP_DIR="$HOME/makefarmhub-backups"
mkdir -p "$BACKUP_DIR"

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/makefarmhub_backup_$TIMESTAMP.tar.gz"

# Exclude node_modules and build artifacts
tar --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.vercel' \
    --exclude='.git' \
    -czf "$BACKUP_FILE" \
    /path/to/makefarmhub

# Keep only last 30 backups
find "$BACKUP_DIR" -name "makefarmhub_backup_*.tar.gz" -mtime +30 -delete

echo "Backup created: $BACKUP_FILE"
```

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add line (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

#### Option C: Cloud Backup (Google Drive, Dropbox, AWS)
```bash
# Using rclone for cloud sync
# Install: https://rclone.org/install/

# Configure remote
rclone config

# Create backup script with cloud sync
#!/bin/bash
BACKUP_FILE="makefarmhub_backup_$(date +%Y%m%d).tar.gz"
tar --exclude='node_modules' --exclude='dist' -czf "$BACKUP_FILE" .
rclone copy "$BACKUP_FILE" gdrive:/makefarmhub-backups/
rm "$BACKUP_FILE"
```

---

## 3. Environment Variables & Secrets Protection

### Secure .env Management
```bash
# Create .env.local (NEVER commit this)
echo ".env.local" >> .gitignore

# Create .env.example (commit this as template)
VITE_API_URL=https://api.example.com
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
VITE_VAPID_PUBLIC_KEY=your_vapid_key
```

### GitHub Secrets (for CI/CD)
1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `VERCEL_TOKEN` - Vercel deployment token
   - `GITHUB_TOKEN` - Auto-generated
   - `STRIPE_SECRET_KEY` - Payment gateway
   - `DATABASE_URL` - Database connection
   - `API_KEY` - Backend API key

### Local Secrets Storage
```bash
# Using 1Password CLI
op signin

# Store secrets
op item create --category password \
  --title "MAKEFARMHUB Secrets" \
  --vault "Personal"

# Retrieve in scripts
export STRIPE_KEY=$(op read "op://Personal/MAKEFARMHUB Secrets/password")
```

---

## 4. Deployment Security

### Vercel Deployment Protection
1. **Enable Deployment Protection**
   - Project Settings → Deployment Protection
   - Set to "Only Preview Deployments" for production
   - Add password protection if needed

2. **Environment Variables in Vercel**
   - Settings → Environment Variables
   - Add all sensitive variables
   - Set scope (Production, Preview, Development)

3. **Domain Security**
   - Settings → Domains
   - Add custom domain (makefarmhub.com)
   - Enable SSL/TLS (automatic with Vercel)

4. **Access Control**
   - Team Settings → Members
   - Limit deployment permissions
   - Enable 2FA for all team members

### Backup Vercel Configuration
```bash
# Export Vercel project config
vercel env pull

# This creates .env.local with all variables
# Store this securely (encrypted backup)
```

---

## 5. Database & Data Protection

### If Using Backend Database
```bash
# Regular database backups
# For PostgreSQL
pg_dump -U username -h localhost dbname > backup_$(date +%Y%m%d).sql

# For MongoDB
mongodump --uri "mongodb://..." --out ./backup_$(date +%Y%m%d)

# Encrypt backup
gpg --symmetric backup_$(date +%Y%m%d).sql

# Upload to secure storage
aws s3 cp backup_$(date +%Y%m%d).sql.gpg s3://your-backup-bucket/
```

---

## 6. Code Security Best Practices

### Dependency Management
```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies safely
npm update

# Check for outdated packages
npm outdated
```

### Secrets Scanning
```bash
# Install git-secrets
brew install git-secrets

# Configure for your repo
git secrets --install
git secrets --register-aws

# Scan for secrets
git secrets --scan
```

### Code Quality
```bash
# ESLint for code quality
npm run lint

# TypeScript type checking
npm run type-check

# Security linting
npm install --save-dev eslint-plugin-security
```

---

## 7. Access Control & Permissions

### GitHub Repository Access
```
Owner: You (full control)
Collaborators: Team members (limited permissions)
- Developers: Read + Write
- Designers: Read only
- Admins: Full access
```

### Vercel Project Access
1. Project Settings → Members
2. Invite team members with specific roles:
   - Admin: Full control
   - Developer: Deploy and manage
   - Viewer: Read-only access

### Domain & DNS Control
- Register domain with reputable registrar (Namecheap, GoDaddy)
- Enable domain lock
- Use 2FA on registrar account
- Keep registrar contact info updated

---

## 8. Disaster Recovery Plan

### Recovery Checklist
```
[ ] GitHub repository backed up
[ ] Local backups verified
[ ] Cloud backups tested
[ ] Environment variables documented (securely)
[ ] Vercel project settings exported
[ ] Domain registrar access verified
[ ] 2FA recovery codes saved
[ ] Team members informed of procedures
```

### Recovery Procedure
1. **Code Recovery**
   ```bash
   git clone https://github.com/YOUR_USERNAME/makefarmhub-backup.git
   cd makefarmhub-backup
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Restore .env.local from secure backup
   # Verify all variables are correct
   npm run dev
   ```

3. **Deployment Recovery**
   ```bash
   # Redeploy to Vercel
   vercel --prod
   
   # Or use GitHub Actions for automatic deployment
   ```

---

## 9. Monitoring & Alerts

### GitHub Notifications
- Settings → Notifications
- Enable email alerts for:
  - Security alerts
  - Dependabot alerts
  - Repository activity

### Vercel Monitoring
- Project Settings → Integrations
- Enable Slack notifications
- Monitor deployment status
- Set up error tracking (Sentry)

### Uptime Monitoring
```bash
# Use free services like:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom
# - StatusCake

# Add monitoring to your domain
# Receive alerts if site goes down
```

---

## 10. Regular Maintenance Schedule

### Daily
- Monitor GitHub notifications
- Check Vercel deployment status
- Review error logs

### Weekly
- Run `npm audit`
- Check for security updates
- Verify backups completed

### Monthly
- Update dependencies
- Review access logs
- Test disaster recovery procedure
- Update documentation

### Quarterly
- Security audit
- Performance review
- Backup verification
- Team access review

---

## 11. Quick Reference Commands

### Backup & Restore
```bash
# Create backup
tar --exclude='node_modules' --exclude='dist' -czf makefarmhub_backup.tar.gz .

# Restore from backup
tar -xzf makefarmhub_backup.tar.gz

# Verify backup integrity
tar -tzf makefarmhub_backup.tar.gz | head -20
```

### Git Operations
```bash
# Push changes
git add .
git commit -m "Your message"
git push origin main

# Create backup branch
git branch backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)

# View commit history
git log --oneline -10

# Restore specific file
git checkout HEAD -- path/to/file
```

### Vercel Operations
```bash
# Deploy
vercel --prod

# View logs
vercel logs

# Rollback to previous deployment
vercel rollback

# List deployments
vercel list
```

---

## 12. Security Checklist

### Before Going Live
- [ ] GitHub repository created and backed up
- [ ] 2FA enabled on GitHub
- [ ] Vercel project secured
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL/TLS enabled
- [ ] Backup system tested
- [ ] Team access configured
- [ ] Monitoring enabled
- [ ] Disaster recovery plan documented

### Ongoing
- [ ] Weekly security audits
- [ ] Monthly dependency updates
- [ ] Quarterly backup verification
- [ ] Annual security review

---

## 13. Important Accounts & Credentials

### Store Securely (Password Manager)
```
GitHub Account
- Username: your_username
- Email: your@email.com
- 2FA Recovery Codes: [STORE SAFELY]

Vercel Account
- Email: your@email.com
- Team ID: [if applicable]

Domain Registrar
- Provider: [Namecheap/GoDaddy/etc]
- Username: [your_username]
- 2FA Recovery Codes: [STORE SAFELY]

Payment Methods
- Vercel billing card
- Domain renewal payment method
```

---

## 14. Emergency Contacts & Support

### If Something Goes Wrong
1. **GitHub Issues**: Create private security advisory
2. **Vercel Support**: https://vercel.com/support
3. **Domain Registrar**: Contact support immediately
4. **Payment Issues**: Check billing dashboard

---

## Conclusion

By following this guide, you will:
✅ Have full control over your codebase
✅ Maintain secure backups
✅ Protect sensitive information
✅ Enable quick disaster recovery
✅ Monitor your application
✅ Follow security best practices

**Remember**: Security is an ongoing process, not a one-time setup. Review and update this plan regularly.
