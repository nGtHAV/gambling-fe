#!/bin/bash
# Generate PWA icons from SVG
# Requires ImageMagick: sudo apt install imagemagick

ICON_DIR="public/icons"
SVG_FILE="$ICON_DIR/icon.svg"

# Create icon directory if it doesn't exist
mkdir -p $ICON_DIR

# Generate PNG icons at various sizes
for size in 72 96 128 144 152 192 384 512; do
  echo "Generating ${size}x${size} icon..."
  convert -background none -resize ${size}x${size} $SVG_FILE $ICON_DIR/icon-${size}x${size}.png
done

echo "Icons generated successfully!"
