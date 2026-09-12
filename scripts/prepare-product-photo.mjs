import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

// Only resample and encode approved generated artwork; no compositing or retouching.
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || "sharp");
const job = JSON.parse(await fs.readFile(process.argv[2], "utf8"));
if (!/^[a-z0-9-]+$/.test(job.slug)) throw new Error("Invalid product slug");
const originals = path.resolve("output/product-photography/originals");
const destination = path.resolve("public/products/studio");
await fs.mkdir(originals, { recursive: true });
await fs.mkdir(destination, { recursive: true });
const original = path.join(originals, `${job.slug}.png`);
await fs.copyFile(job.source, original);
const metadata = await sharp(original).metadata();
if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
  throw new Error(`Expected square artwork: ${job.slug}`);
}
await Promise.all([
  sharp(original).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 88, effort: 5 }).toFile(path.join(destination, `${job.slug}.webp`)),
  sharp(original).resize(480, 480, { fit: "inside", withoutEnlargement: true }).webp({ quality: 83, effort: 5 }).toFile(path.join(destination, `${job.slug}-480.webp`)),
]);
console.log(JSON.stringify({ slug: job.slug, originalWidth: metadata.width, originalHeight: metadata.height }));
