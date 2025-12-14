@echo off
REM Publish to Docker Hub Script (Windows)
REM Usage: publish.bat <dockerhub-username> [version]

setlocal enabledelayedexpansion

REM Colors don't work well in Windows CMD, so we'll use plain text

REM Check if username provided
if "%~1"=="" (
    echo Error: Docker Hub username required
    echo Usage: publish.bat ^<dockerhub-username^> [version]
    echo Example: publish.bat johndoe 2.0.0
    exit /b 1
)

set DOCKERHUB_USERNAME=%1
if "%~2"=="" (
    set VERSION=latest
) else (
    set VERSION=%2
)
set IMAGE_NAME=dungeon-revealer-manager
set FULL_IMAGE=%DOCKERHUB_USERNAME%/%IMAGE_NAME%

echo ================================================
echo   Dungeon Revealer Manager - Publish Script
echo ================================================
echo.
echo Docker Hub Username: %DOCKERHUB_USERNAME%
echo Image Name: %IMAGE_NAME%
echo Version: %VERSION%
echo Full Tag: %FULL_IMAGE%:%VERSION%
echo.

REM Confirm
set /p CONFIRM="Continue with publish? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled
    exit /b 0
)

REM Step 1: Build
echo.
echo Step 1/5: Building Docker image...
docker build -t %FULL_IMAGE%:%VERSION% .

if errorlevel 1 (
    echo [X] Build failed
    exit /b 1
)
echo [OK] Build successful
echo.

REM Step 2: Tag as latest if not already latest
if not "%VERSION%"=="latest" (
    echo Step 2/5: Tagging as latest...
    docker tag %FULL_IMAGE%:%VERSION% %FULL_IMAGE%:latest
    echo [OK] Tagged as latest
    echo.
) else (
    echo Step 2/5: Skipping (already latest)
    echo.
)

REM Step 3: Test the image
echo Step 3/5: Running quick test...
echo Starting test container...

REM Create test data directory
if not exist test-data mkdir test-data

docker run -d --name test-dr-manager -p 3099:3001 -v "%CD%\test-data:/data" %FULL_IMAGE%:%VERSION% >nul 2>&1

REM Wait for container to start
timeout /t 3 /nobreak >nul

REM Test if it's responding (using curl if available, otherwise skip)
where curl >nul 2>&1
if errorlevel 1 (
    echo [WARNING] curl not found, skipping health check
    echo Assuming container is healthy...
) else (
    curl -s http://localhost:3099/api/config >nul 2>&1
    if errorlevel 1 (
        echo [X] Container test failed
        docker logs test-dr-manager
        docker stop test-dr-manager >nul 2>&1
        docker rm test-dr-manager >nul 2>&1
        rmdir /s /q test-data
        exit /b 1
    )
    echo [OK] Container is responding
)

docker stop test-dr-manager >nul 2>&1
docker rm test-dr-manager >nul 2>&1
rmdir /s /q test-data
echo.

REM Step 4: Login to Docker Hub
echo Step 4/5: Logging into Docker Hub...
docker login

if errorlevel 1 (
    echo [X] Login failed
    exit /b 1
)
echo [OK] Login successful
echo.

REM Step 5: Push to Docker Hub
echo Step 5/5: Pushing to Docker Hub...

REM Push version tag
echo Pushing %FULL_IMAGE%:%VERSION%...
docker push %FULL_IMAGE%:%VERSION%

if errorlevel 1 (
    echo [X] Push failed
    exit /b 1
)
echo [OK] Pushed %VERSION%

REM Push latest tag if we created it
if not "%VERSION%"=="latest" (
    echo Pushing %FULL_IMAGE%:latest...
    docker push %FULL_IMAGE%:latest
    
    if errorlevel 1 (
        echo [X] Push latest failed
        exit /b 1
    )
    echo [OK] Pushed latest
)

REM Success!
echo.
echo ================================================
echo          [SUCCESS] Publish Successful!
echo ================================================
echo.
echo Your image is now available at:
echo https://hub.docker.com/r/%DOCKERHUB_USERNAME%/%IMAGE_NAME%
echo.
echo Unraid users can now use:
echo %FULL_IMAGE%:%VERSION%
echo.
echo To update the image:
echo   docker pull %FULL_IMAGE%:%VERSION%
echo.
echo To run locally:
echo   docker run -d -p 3001:3001 -v ./data:/data %FULL_IMAGE%:%VERSION%
echo.
echo Next steps:
echo   1. Update your Docker Hub repository description
echo   2. Create a GitHub repo (optional but recommended)
echo   3. Share with your Unraid community!
echo.

endlocal
