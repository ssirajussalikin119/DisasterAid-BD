@echo off
echo =========================================
echo DisasterAidBD Local Docker Deployment
echo =========================================

echo Building Docker images...
docker compose build
if errorlevel 1 (
    echo Error: Docker build failed!
    exit /b 1
)

echo Starting Docker containers...
docker compose up -d
if errorlevel 1 (
    echo Error: Failed to start containers!
    exit /b 1
)

echo.
echo Containers started successfully!
echo Application running at: http://localhost:8000
echo.
docker compose ps
