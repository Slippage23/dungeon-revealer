#!/usr/bin/env pwsh

# Dungeon Revealer Docker Build & Deploy Script
# This script rebuilds the Docker image with the latest fixes and pushes to Docker Hub

Write-Host "🚀 Dungeon Revealer Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Step 1: Verify Docker is installed
Write-Host "📋 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Step 2: Build Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
Write-Host "   Version: 1.17.1-phase2-hotfix`n" -ForegroundColor Gray

$buildStart = Get-Date
docker build -t slippage/dungeon-revealer:latest `
    -t slippage/dungeon-revealer:1.17.1-phase2-hotfix `
    --build-arg VERSION=1.17.1-phase2-hotfix `
    .

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Docker build failed" -ForegroundColor Red
    exit 1
}

$buildEnd = Get-Date
$buildDuration = ($buildEnd - $buildStart).TotalSeconds
Write-Host "`n✅ Docker image built successfully (${buildDuration}s)`n" -ForegroundColor Green

# Step 3: Get image info
Write-Host "📊 Image information:" -ForegroundColor Yellow
docker images | grep dungeon-revealer | Select-Object -First 1 | ForEach-Object {
    Write-Host "   $_`n" -ForegroundColor Gray
}

# Step 4: Push to Docker Hub (automatic)
Write-Host "`n🔐 Pushing to Docker Hub..." -ForegroundColor Yellow
Write-Host "   Note: You must be logged in to Docker with 'docker login'" -ForegroundColor Gray

$pushStart = Get-Date
docker push slippage/dungeon-revealer:latest
docker push slippage/dungeon-revealer:1.17.1-phase2-hotfix

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Docker push failed. Check your Docker Hub login." -ForegroundColor Red
    exit 1
}

$pushEnd = Get-Date
$pushDuration = ($pushEnd - $pushStart).TotalSeconds
Write-Host "`n✅ Images pushed to Docker Hub (${pushDuration}s)`n" -ForegroundColor Green

# Step 5: Summary
Write-Host "📋 NEXT STEPS FOR UNRAID" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan
Write-Host "1. Go to Unraid Docker tab" -ForegroundColor White
Write-Host "2. Stop 'dungeon-revealer' container" -ForegroundColor White
Write-Host "3. Remove old container" -ForegroundColor White
Write-Host "4. Pull latest 'slippage/dungeon-revealer:latest' image" -ForegroundColor White
Write-Host "5. Create new container with same settings" -ForegroundColor White
Write-Host "6. Start the container`n" -ForegroundColor White

Write-Host "🧪 VERIFY AFTER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "===========================`n" -ForegroundColor Cyan
Write-Host "✓ Click Templates button - should show templates panel (not error)" -ForegroundColor White
Write-Host "✓ Look for Initiative Tracker button in toolbar" -ForegroundColor White
Write-Host "✓ Check console (F12) - currentMapId should show map ID (not null)" -ForegroundColor White
Write-Host "✓ Try adding a token and using templates`n" -ForegroundColor White

Write-Host "✨ Deployment helper script completed!" -ForegroundColor Green
