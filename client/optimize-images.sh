#!/bin/bash

# Image Optimization Script for VYBE
# Compresses large images while maintaining quality

SOURCE_DIR="src/components/images"
OUTPUT_DIR="src/components/images-optimized"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🖼️  Starting image optimization..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to optimize PNG images
optimize_png() {
  local input="$1"
  local filename=$(basename "$input")
  local output="$OUTPUT_DIR/$filename"
  
  echo "📦 Optimizing: $filename"
  
  # Get original size
  original_size=$(du -h "$input" | cut -f1)
  
  # Resize to max 1920px width and convert to JPEG with 85% quality
  # This maintains high quality while significantly reducing file size
  sips -s format jpeg \
       -s formatOptions 85 \
       -Z 1920 \
       "$input" \
       --out "${output%.png}.jpg" >/dev/null 2>&1
  
  # Get new size
  new_size=$(du -h "${output%.png}.jpg" | cut -f1)
  
  echo "   ✓ $filename: $original_size → $new_size"
}

# Function to optimize JPG images
optimize_jpg() {
  local input="$1"
  local filename=$(basename "$input")
  local output="$OUTPUT_DIR/$filename"
  
  echo "📦 Optimizing: $filename"
  
  # Get original size
  original_size=$(du -h "$input" | cut -f1)
  
  # Resize to max 1920px width with 85% quality
  sips -s formatOptions 85 \
       -Z 1920 \
       "$input" \
       --out "$output" >/dev/null 2>&1
  
  # Get new size
  new_size=$(du -h "$output" | cut -f1)
  
  echo "   ✓ $filename: $original_size → $new_size"
}

# Process all PNG files
for img in "$SOURCE_DIR"/*.png "$SOURCE_DIR"/*.PNG; do
  if [ -f "$img" ]; then
    optimize_png "$img"
  fi
done

# Process all JPG files
for img in "$SOURCE_DIR"/*.jpg "$SOURCE_DIR"/*.JPG "$SOURCE_DIR"/*.jpeg; do
  if [ -f "$img" ]; then
    optimize_jpg "$img"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Optimization complete!"
echo ""
echo "Original images: $SOURCE_DIR"
echo "Optimized images: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Review optimized images in $OUTPUT_DIR"
echo "2. Replace original images with optimized ones"
echo "3. Rebuild: npm run build"
