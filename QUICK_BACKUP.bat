@echo off
echo ========================================
echo   MAKEFARMHUB - Quick Backup Tool
echo ========================================
echo.

REM Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%%datetime:~12,2%

REM Set paths
set SOURCE=C:\Users\l\Documents\website\MAKEFARMHUB
set BACKUP_DIR=C:\Users\l\Documents\MAKEFARMHUB_Backups
set BACKUP_FILE=%BACKUP_DIR%\MAKEFARMHUB_backup_%TIMESTAMP%.zip

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo Created backup directory: %BACKUP_DIR%
    echo.
)

echo Creating backup...
echo Source: %SOURCE%
echo Destination: %BACKUP_FILE%
echo.

REM Use PowerShell to create zip (Windows 10+)
powershell -command "Compress-Archive -Path '%SOURCE%\*' -DestinationPath '%BACKUP_FILE%' -Force -CompressionLevel Optimal"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   BACKUP SUCCESSFUL!
    echo ========================================
    echo Backup saved to:
    echo %BACKUP_FILE%
    echo.
    echo Opening backup folder...
    start "" "%BACKUP_DIR%"
) else (
    echo.
    echo ========================================
    echo   BACKUP FAILED!
    echo ========================================
    echo Please check the paths and try again.
)

echo.
echo Press any key to exit...
pause >nul
