import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const logoPath = 'public/logo.png';
const outputDir = 'public/icons';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    console.log('Reading logo.png...');
    const logo = await Jimp.read(logoPath);

    // 1. Generate standard icons (192x192 and 512x512)
    const sizes = [192, 512];
    for (const size of sizes) {
      console.log(`Generating standard icon: ${size}x${size}...`);
      const icon = logo.clone();
      icon.resize({ w: size, h: size });
      await icon.write(path.join(outputDir, `icon-${size}x${size}.png`));
    }

    // 2. Generate maskable icons (192x192 and 512x512)
    // Maskable icons require padding so the logo fits in the 80% safe zone circle.
    // We create a solid gold background (#B8902A) and center the logo scaled to 65% size.
    for (const size of sizes) {
      console.log(`Generating maskable icon: ${size}x${size}...`);
      
      // Scale logo to 65% of target size
      const logoSize = Math.round(size * 0.65);
      const scaledLogo = logo.clone();
      scaledLogo.resize({ w: logoSize, h: logoSize });

      // Create gold background
      // In Jimp 1.x, we construct a blank image using options
      const background = new Jimp({
        width: size,
        height: size,
        color: 0xB8902AFF // #B8902A with full opacity (FF)
      });

      // Composite scaled logo onto the center of the gold background
      const x = Math.round((size - logoSize) / 2);
      const y = Math.round((size - logoSize) / 2);
      background.composite(scaledLogo, x, y);

      await background.write(path.join(outputDir, `maskable-icon-${size}x${size}.png`));
    }

    console.log('Successfully generated all PWA icons!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
