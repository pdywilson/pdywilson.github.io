#!/bin/bash

# Loop through each .mp3 file in the current directory
for file in *.mp3; do
    if [ -f "$file" ]; then
        # Wrap the file name into HTML <div>
        echo "  <div>$file</div>"
        
        # Wrap the audio player into HTML <div>
        echo "  <div><audio controls>"
        echo "    <source src=\"$file\" type=\"audio/mpeg\">"
        echo "  </audio></div>"
    fi
done

