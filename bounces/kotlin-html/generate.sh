#!/bin/bash
cd ..
for folder in */; do
    cd "$folder" || continue
    echo ""
    echo "$folder"
    echo ""

    for file in *.mp3; do
        if [ -f "$file" ]; then
            echo "\"$file\","
        fi
    done

    cd ..
done
