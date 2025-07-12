@echo off
echo ========================================
echo    StackIt API Testing Seeder
echo ========================================
echo.
echo Starting comprehensive API testing...
echo.

REM Check if server is running
echo Checking if server is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is not running on http://localhost:5000
    echo Please start the server first with: npm run dev
    echo.
    pause
    exit /b 1
)

echo ✅ Server is running
echo.
echo Running API tests...
echo.

node api-seeder.js

echo.
echo ========================================
echo    Testing completed!
echo ========================================
pause 