#!/bin/bash

WORKSPACE_FOLDER=${1:-$(pwd)}
MOD_NAME=${2:-""}

# Request mod name from user if not provided
if [ -z "$MOD_NAME" ]; then
    read -p "Enter mod folder name from /mods directory: " modName
else
    modName="$MOD_NAME"
fi

# Remove any leading/trailing spaces from mod name
modName=$(echo "$modName" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
# Remove any invalid filename characters
modName=$(echo "$modName" | sed 's/[<>|?*"]//g')

# Check if mod folder exists
modPath="$WORKSPACE_FOLDER/mods/$modName"
if [ -d "$modPath" ]; then
    echo "Packing mod: $modName"
    
    # Change to mod directory and create ZIP archive with contents only (exactly like manual selection)
    cd "$WORKSPACE_FOLDER/mods/$modName"
    
    if zip -r "../$modName.zip" *; then
        echo "Archive created: $WORKSPACE_FOLDER/mods/$modName.zip"
        
        # Determine user mods directory based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            userModsPath="/Users/alexander/Library/Application Support/Mindustry/mods"
        else
            # Linux
            userModsPath="$HOME/.local/share/Mindustry/mods"
        fi
        
        # Create user mods directory if it doesn't exist
        mkdir -p "$userModsPath"
        
        # Copy archive to user mods directory
        if cp "$modName.zip" "$userModsPath/"; then
            echo "Mod $modName packed and copied to $userModsPath"
        else
            echo "Error: Failed to copy mod to $userModsPath"
        fi
    else
        echo "Error: Failed to create archive"
    fi
else
    echo "Mod folder '$modName' not found in $WORKSPACE_FOLDER/mods/"
    echo "Available mod folders:"
    modsDir="$WORKSPACE_FOLDER/mods"
    if [ -d "$modsDir" ]; then
        ls -1 "$modsDir" | grep -E '^[^.]+$' | while read folder; do
            if [ -d "$modsDir/$folder" ]; then
                echo "  - $folder"
            fi
        done
    fi
fi

# Wait for user to press Enter before closing
echo ""
read -p "Press Enter to continue..." 