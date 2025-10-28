# Upload files to server
# Run this from PowerShell

$SERVER = "root@72.60.29.80"
$LOCAL_PATH = "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"
$REMOTE_PATH = "~/easybots-store"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Uploading files to server..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Change to project directory
Set-Location $LOCAL_PATH

# Transfer files using scp
Write-Host "Transferring files..." -ForegroundColor Yellow
scp -r * .env.production.local .gitignore $SERVER`:$REMOTE_PATH/

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Files uploaded successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. SSH into server: ssh root@72.60.29.80" -ForegroundColor White
    Write-Host "2. Run: cd ~/easybots-store" -ForegroundColor White
    Write-Host "3. Run: chmod +x deploy.sh" -ForegroundColor White
    Write-Host "4. Run: ./deploy.sh" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Upload failed. Please check your SSH connection." -ForegroundColor Red
}
