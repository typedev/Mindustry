param(
    [string]$WorkspaceFolder = $PWD,
    [string]$ModName = ""
)

# Request mod name from user if not provided
if ([string]::IsNullOrEmpty($ModName)) {
    $ModName = Read-Host "Enter mod folder name from /mods directory"
}

# Check if mod folder exists
$modsDir = Join-Path $WorkspaceFolder "mods"
$modPath = Join-Path $modsDir $ModName

if (Test-Path $modPath) {
    Write-Host "Packing mod: $ModName" -ForegroundColor Yellow
    
    # Create ZIP archive with mod contents
    $zipPath = Join-Path $modsDir "$ModName.zip"
    $modContents = Join-Path $modPath "*"
    
    try {
        Compress-Archive -Path $modContents -DestinationPath $zipPath -Force
        Write-Host "Archive created: $zipPath" -ForegroundColor Green
        
        # Create user mods directory if it doesn't exist
        $userModsPath = Join-Path $env:USERPROFILE "AppData\Roaming\Mindustry\mods"
        if (!(Test-Path $userModsPath)) {
            New-Item -ItemType Directory -Path $userModsPath -Force | Out-Null
            Write-Host "Created directory: $userModsPath" -ForegroundColor Blue
        }
        
        # Copy archive to user mods directory
        Copy-Item $zipPath -Destination $userModsPath -Force
        Write-Host "Mod $ModName packed and copied to $userModsPath" -ForegroundColor Green
        
    } catch {
        Write-Host "Error packing mod: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Mod folder '$ModName' not found in $modsDir" -ForegroundColor Red
    Write-Host "Available mod folders:" -ForegroundColor Yellow
    if (Test-Path $modsDir) {
        Get-ChildItem $modsDir -Directory | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Cyan
        }
    }
}

# Wait for user to press Enter before closing
Write-Host ""
Read-Host "Press Enter to continue" 