# MAKEFARMHUB Automatic Backup Script
# Run this daily to create secure backups

# Configuration
$projectPath = "C:\Users\l\Documents\website\MAKEFARMHUB"
$backupPath = "C:\Users\l\Documents\MAKEFARMHUB_Backups"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupName = "MAKEFARMHUB_backup_$timestamp.zip"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
    Write-Host "✅ Created backup directory: $backupPath" -ForegroundColor Green
}

# Create backup
Write-Host "📦 Creating backup..." -ForegroundColor Cyan
$excludeFiles = @("node_modules", "dist", ".vercel", ".git")

# Compress project (excluding large folders)
$destination = Join-Path $backupPath $backupName
Compress-Archive -Path $projectPath\* -DestinationPath $destination -Force -CompressionLevel Optimal

Write-Host "✅ Backup created successfully!" -ForegroundColor Green
Write-Host "📁 Location: $destination" -ForegroundColor Yellow
Write-Host "📊 Size: $((Get-Item $destination).Length / 1MB) MB" -ForegroundColor Yellow

# Keep only last 30 backups
$backups = Get-ChildItem -Path $backupPath -Filter "MAKEFARMHUB_backup_*.zip" | Sort-Object CreationTime -Descending
if ($backups.Count -gt 30) {
    $toDelete = $backups | Select-Object -Skip 30
    $toDelete | ForEach-Object {
        Remove-Item $_.FullName
        Write-Host "🗑️  Deleted old backup: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Backup complete! Total backups: $($backups.Count)" -ForegroundColor Green
Write-Host "💡 Tip: Upload this backup to Google Drive or OneDrive for extra safety!" -ForegroundColor Cyan

# Optional: Open backup folder
# Start-Process $backupPath
