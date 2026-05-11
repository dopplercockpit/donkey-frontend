const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const ASSETS_DIR = path.resolve(__dirname, "..", "src", "assets");
const FORCE = process.env.FORCE === "1";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function walkPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkPngFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(fullPath);
    }
  }

  return files;
}

function optionsFor(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const basename = path.basename(normalized);

  if (normalized.includes("/src/assets/guides/")) {
    return { width: 320, quality: 82 };
  }

  if (normalized.includes("/src/assets/moods/")) {
    return { width: 420, quality: 82 };
  }

  if (basename.includes("kofi") || basename.includes("coffee") || basename.includes("beer")) {
    return { width: 480, quality: 82 };
  }

  if (basename.includes("logo") || basename.includes("hero") || basename.includes("character_card")) {
    return { width: 640, quality: 85 };
  }

  return { width: 480, quality: 82 };
}

async function shouldSkip(sourcePath, destinationPath) {
  if (FORCE) return false;

  try {
    const [sourceStat, destinationStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(destinationPath),
    ]);
    return destinationStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}

async function convertFile(sourcePath) {
  const destinationPath = sourcePath.replace(/\.png$/i, ".webp");
  const sourceStat = await fs.stat(sourcePath);
  const skipped = await shouldSkip(sourcePath, destinationPath);

  if (skipped) {
    const destinationStat = await fs.stat(destinationPath);
    console.log(`skip ${path.relative(process.cwd(), sourcePath)} -> ${formatBytes(destinationStat.size)}`);
    return {
      sourceSize: sourceStat.size,
      webpSize: destinationStat.size,
      skipped: true,
    };
  }

  const { width, quality } = optionsFor(sourcePath);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });

  await sharp(sourcePath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(destinationPath);

  const destinationStat = await fs.stat(destinationPath);
  console.log(
    `${path.relative(process.cwd(), sourcePath)} ${formatBytes(sourceStat.size)} -> ${formatBytes(destinationStat.size)}`
  );

  return {
    sourceSize: sourceStat.size,
    webpSize: destinationStat.size,
    skipped: false,
  };
}

async function main() {
  const files = await walkPngFiles(ASSETS_DIR);
  let totalSourceSize = 0;
  let totalWebpSize = 0;
  let failures = 0;

  for (const file of files) {
    try {
      const result = await convertFile(file);
      totalSourceSize += result.sourceSize;
      totalWebpSize += result.webpSize;
    } catch (error) {
      failures += 1;
      console.error(`failed ${path.relative(process.cwd(), file)}:`, error);
    }
  }

  console.log("");
  console.log(`PNG source total: ${formatBytes(totalSourceSize)}`);
  console.log(`WebP total:       ${formatBytes(totalWebpSize)}`);
  console.log(`Savings:          ${formatBytes(Math.max(totalSourceSize - totalWebpSize, 0))}`);

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
