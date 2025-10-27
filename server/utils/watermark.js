import sharp from 'sharp';
import path from 'path';

/**
 * Adds a text watermark to an image
 * @param {Buffer} imageBuffer - The image buffer to watermark
 * @param {Object} options - Watermark options
 * @returns {Promise<Buffer>} - Watermarked image buffer
 */
async function addTextWatermark(imageBuffer, options = {}) {
  try {
    const {
      text = '© VYBE 2025',
      fontSize = 24,
      opacity = 0.4,
      position = 'bottom-right',
      padding = 20,
      fontColor = '#FFFFFF',
      strokeColor = '#000000',
      strokeWidth = 1
    } = options;

    // Get image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Calculate font size based on image width (responsive)
    const responsiveFontSize = Math.max(
      Math.floor(width * 0.03),
      fontSize
    );

    // Create SVG text watermark
    const svgText = `
      <svg width="${width}" height="${height}">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
          </style>
        </defs>
        <text
          x="${getXPosition(position, width, padding)}"
          y="${getYPosition(position, height, padding, responsiveFontSize)}"
          font-family="Roboto, Arial, sans-serif"
          font-size="${responsiveFontSize}"
          font-weight="bold"
          fill="${fontColor}"
          fill-opacity="${opacity}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-opacity="${opacity * 0.5}"
          text-anchor="${getTextAnchor(position)}"
        >${text}</text>
      </svg>
    `;

    // Composite the watermark onto the image
    const watermarkedImage = await image
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 90 }) // High quality output
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw new Error('Failed to add watermark to image');
  }
}

/**
 * Adds a logo watermark to an image
 * @param {Buffer} imageBuffer - The image buffer to watermark
 * @param {string} logoPath - Path to the logo file
 * @param {Object} options - Watermark options
 * @returns {Promise<Buffer>} - Watermarked image buffer
 */
async function addLogoWatermark(imageBuffer, logoPath, options = {}) {
  try {
    const {
      opacity = 0.5,
      position = 'bottom-right',
      padding = 20,
      logoScale = 0.15, // Logo will be 15% of image width
    } = options;

    // Get image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Calculate logo size
    const logoWidth = Math.floor(width * logoScale);

    // Resize and adjust logo opacity
    const logo = await sharp(logoPath)
      .resize(logoWidth, null, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .png()
      .toBuffer();

    const logoMetadata = await sharp(logo).metadata();

    // Calculate position
    const { left, top } = getLogoPosition(
      position,
      width,
      height,
      logoMetadata.width,
      logoMetadata.height,
      padding
    );

    // Create semi-transparent logo
    const transparentLogo = await sharp(logo)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${logoMetadata.width}" height="${logoMetadata.height}">
              <rect width="100%" height="100%" fill="white" opacity="${1 - opacity}"/>
            </svg>`
          ),
          blend: 'dest-in',
        },
      ])
      .toBuffer();

    // Composite the logo onto the image
    const watermarkedImage = await image
      .composite([
        {
          input: transparentLogo,
          top,
          left,
          blend: 'over',
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Error adding logo watermark:', error);
    throw new Error('Failed to add logo watermark to image');
  }
}

/**
 * Adds both text and subtle pattern watermark for extra protection
 * @param {Buffer} imageBuffer - The image buffer to watermark
 * @param {Object} options - Watermark options
 * @returns {Promise<Buffer>} - Watermarked image buffer
 */
async function addSecureWatermark(imageBuffer, options = {}) {
  try {
    const {
      text = '© VYBE',
      repeatPattern = true,
      cornerText = '© VYBE 2025 - All Rights Reserved',
    } = options;

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    const compositeInputs = [];

    // Add repeating pattern watermark (subtle)
    if (repeatPattern) {
      const patternSize = 200;
      const rows = Math.ceil(height / patternSize);
      const cols = Math.ceil(width / patternSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const patternSvg = `
            <svg width="${patternSize}" height="${patternSize}">
              <text
                x="50%"
                y="50%"
                font-family="Arial, sans-serif"
                font-size="16"
                font-weight="bold"
                fill="#FFFFFF"
                fill-opacity="0.08"
                text-anchor="middle"
                dominant-baseline="middle"
                transform="rotate(-45 ${patternSize / 2} ${patternSize / 2})"
              >${text}</text>
            </svg>
          `;

          compositeInputs.push({
            input: Buffer.from(patternSvg),
            top: row * patternSize,
            left: col * patternSize,
          });
        }
      }
    }

    // Add corner text watermark (visible)
    const cornerFontSize = Math.max(Math.floor(width * 0.02), 16);
    const cornerSvg = `
      <svg width="${width}" height="${height}">
        <text
          x="${width - 20}"
          y="${height - 20}"
          font-family="Arial, sans-serif"
          font-size="${cornerFontSize}"
          font-weight="bold"
          fill="#FFFFFF"
          fill-opacity="0.5"
          stroke="#000000"
          stroke-width="1"
          stroke-opacity="0.3"
          text-anchor="end"
        >${cornerText}</text>
      </svg>
    `;

    compositeInputs.push({
      input: Buffer.from(cornerSvg),
      top: 0,
      left: 0,
    });

    // Apply all watermarks
    const watermarkedImage = await image
      .composite(compositeInputs)
      .jpeg({ quality: 90 })
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Error adding secure watermark:', error);
    throw new Error('Failed to add secure watermark to image');
  }
}

// Helper functions
function getXPosition(position, width, padding) {
  if (position.includes('left')) return padding;
  if (position.includes('right')) return width - padding;
  return width / 2; // center
}

function getYPosition(position, height, padding, fontSize) {
  if (position.includes('top')) return padding + fontSize;
  if (position.includes('bottom')) return height - padding;
  return height / 2; // center
}

function getTextAnchor(position) {
  if (position.includes('left')) return 'start';
  if (position.includes('right')) return 'end';
  return 'middle';
}

function getLogoPosition(position, imgWidth, imgHeight, logoWidth, logoHeight, padding) {
  let left, top;

  switch (position) {
    case 'top-left':
      left = padding;
      top = padding;
      break;
    case 'top-right':
      left = imgWidth - logoWidth - padding;
      top = padding;
      break;
    case 'bottom-left':
      left = padding;
      top = imgHeight - logoHeight - padding;
      break;
    case 'bottom-right':
    default:
      left = imgWidth - logoWidth - padding;
      top = imgHeight - logoHeight - padding;
      break;
    case 'center':
      left = (imgWidth - logoWidth) / 2;
      top = (imgHeight - logoHeight) / 2;
      break;
  }

  return { left, top };
}

/**
 * Process and optimize image for web
 * @param {Buffer} imageBuffer - The image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} - Processed image buffer
 */
async function optimizeImage(imageBuffer, options = {}) {
  try {
    const {
      maxWidth = 2000,
      maxHeight = 2000,
      quality = 85,
      format = 'jpeg',
    } = options;

    let image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Resize if needed
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert and optimize
    if (format === 'jpeg') {
      return await image
        .jpeg({ quality, progressive: true })
        .toBuffer();
    } else if (format === 'png') {
      return await image
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
    } else if (format === 'webp') {
      return await image
        .webp({ quality })
        .toBuffer();
    }

    return imageBuffer;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image');
  }
}

export {
  addTextWatermark,
  addLogoWatermark,
  addSecureWatermark,
  optimizeImage,
};
