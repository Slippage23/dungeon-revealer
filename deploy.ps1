# 0. Setup: Stop on errors immediately and start a timer
$ErrorActionPreference = "Stop"
$StopWatch = [System.Diagnostics.Stopwatch]::StartNew()

# 1. Ask for the version bump type (with validation)
do {
    $ReleaseType = Read-Host -Prompt "Select release type (patch|minor|major)"
} until ($ReleaseType -match "^(patch|minor|major)$")

# 2. Run the Build
Write-Host "🔨 Running Build..." -ForegroundColor Cyan
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
} catch {
    Write-Error "Build failed! Aborting release."
    exit 1
}

# 3. Bump version
Write-Host "📈 Bumping version..." -ForegroundColor Cyan
$NewVersion = npm version $ReleaseType --no-git-tag-version
$CleanVersion = $NewVersion -replace 'v',''

Write-Host "   New version is: $CleanVersion" -ForegroundColor Green

# 4. Generate commit message
$CommitDesc = Read-Host -Prompt "Enter commit description (e.g., Refactor FlatContextProvider...)"
# FIX: Added {} around CleanVersion to separate it from the colon
$CommitMsg = "v${CleanVersion}: $CommitDesc"

# 5. Git Operations
Write-Host "💾 Committing and Pushing to Git..." -ForegroundColor Cyan
git add -A
git commit -m "$CommitMsg"
git push

# 6. Docker Operations
Write-Host "🐳 Building and Pushing Docker images..." -ForegroundColor Cyan
docker build -t slippage/dungeon-revealer:latest -t slippage/dungeon-revealer:$CleanVersion .
docker push slippage/dungeon-revealer:latest
docker push slippage/dungeon-revealer:$CleanVersion

# 7. Finish
$StopWatch.Stop()
Write-Host "🚀 Deployment of v$CleanVersion complete!" -ForegroundColor Green
Write-Host "⏱️  Time taken: $($StopWatch.Elapsed.ToString('mm\:ss'))" -ForegroundColor DarkGray

# Open Docker Hub
Start-Process "https://hub.docker.com/r/slippage/dungeon-revealer"