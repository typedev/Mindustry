@echo off
setlocal enabledelayedexpansion

:: Get workspace folder (default to current directory)
set "WORKSPACE_FOLDER=%~1"
if "%WORKSPACE_FOLDER%"=="" set "WORKSPACE_FOLDER=%CD%"

:: Get mod name from parameter or user input
set "MOD_NAME=%~2"
if "%MOD_NAME%"=="" (
    set /p "MOD_NAME=Enter mod folder name from /mods directory: "
)
:: Remove any leading/trailing spaces and newlines from mod name
set "MOD_NAME=%MOD_NAME: =%"
for /f "tokens=* delims= " %%a in ("%MOD_NAME%") do set "MOD_NAME=%%a"
set "MOD_NAME=%MOD_NAME: =%"

:: Check if mod folder exists
set "MOD_PATH=%WORKSPACE_FOLDER%\mods\%MOD_NAME%"
if not exist "%MOD_PATH%" (
    echo.
    echo [ERROR] Mod folder '%MOD_NAME%' not found in %WORKSPACE_FOLDER%\mods\
    echo.
    echo Available mod folders:
    for /d %%i in ("%WORKSPACE_FOLDER%\mods\*") do (
        echo   - %%~nxi
    )
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Packing mod: %MOD_NAME%

:: Set paths
set "ZIP_PATH=%WORKSPACE_FOLDER%\mods\%MOD_NAME%.zip"
set "USER_MODS_PATH=%USERPROFILE%\AppData\Roaming\Mindustry\mods"

:: Remove existing archive
if exist "%ZIP_PATH%" del /f /q "%ZIP_PATH%"

:: Change to mod directory
pushd "%MOD_PATH%"

:: Create ZIP archive using tar (exactly like manual selection)
echo [INFO] Creating archive...
tar -a -cf "%ZIP_PATH%" *

:: Return to original directory
popd

:: Check if archive was created
if not exist "%ZIP_PATH%" (
    echo [ERROR] Failed to create archive
    pause
    exit /b 1
)

echo [SUCCESS] Archive created: %ZIP_PATH%

:: Create user mods directory if it doesn't exist
if not exist "%USER_MODS_PATH%" (
    mkdir "%USER_MODS_PATH%"
    echo [INFO] Created directory: %USER_MODS_PATH%
)

:: Copy archive to user mods directory
copy /y "%ZIP_PATH%" "%USER_MODS_PATH%\" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Mod %MOD_NAME% packed and copied to %USER_MODS_PATH%
) else (
    echo [ERROR] Failed to copy mod to %USER_MODS_PATH%
)

echo. 