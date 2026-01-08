import sharp from "sharp";

const inputFile =
  "/home/nicotordev/tailwindwizard/apps/frontend/public/tailwindwizard.png";
const outputDir = "/home/nicotordev/tailwindwizard/apps/frontend/public/icons";

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

async function generateIcons() {
  try {
    // Ensure output directory exists
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log("🚀 Starting icon generation...");

    for (const { name, size } of sizes) {
      await sharp(inputFile).resize(size, size).toFile(`${outputDir}/${name}`);
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log("✨ All icons generated successfully in /public/icons");
  } catch (error) {
    console.error("❌ Error generating icons:", error);
  }
}

generateIcons();
