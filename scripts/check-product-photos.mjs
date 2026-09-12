import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || "sharp");
const compile = (source) => ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 });
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const photoModuleUrl = moduleUrl(compile(await fs.readFile("src/data/productPhotography.ts", "utf8")));
const { PRODUCT_STUDIO_IMAGES, resolveCatalogImage } = await import(photoModuleUrl);
const catalogSource = compile(await fs.readFile("src/data/catalogo.ts", "utf8")).replace('"./productPhotography"', JSON.stringify(photoModuleUrl));
const { PRODUCTOS } = await import(moduleUrl(catalogSource));

assert.equal(Object.keys(PRODUCT_STUDIO_IMAGES).length, PRODUCTOS.length, "Every product needs one studio image");
const first = PRODUCTOS[0];
assert.equal(resolveCatalogImage({ slug: first.slug }), first.imagen, "Cached products without photos must get the current catalog image");
assert.equal(resolveCatalogImage({ slug: first.slug, imagen: "https://example.test/customer-photo.jpg" }), "https://example.test/customer-photo.jpg", "Custom administrator photos must remain intact");
const legacy = PRODUCTOS.find((product) => product.nombre === "0G 324");
assert.equal(resolveCatalogImage({ slug: legacy.slug, imagen: "/products/og-324.jpg" }), legacy.imagen, "Old default artwork must upgrade");
assert.equal(resolveCatalogImage({ slug: "new-product" }), undefined, "New products must not receive fabricated file paths");

const hashes = new Set();
let fullBytes = 0;
let thumbnailBytes = 0;
for (const product of PRODUCTOS) {
  assert.ok(product.imagen, `Missing image assignment: ${product.slug}`);
  const fullPath = `public${product.imagen}`;
  const smallPath = fullPath.replace(/\.webp$/, "-480.webp");
  const [full, small, metaFull, metaSmall] = await Promise.all([
    fs.readFile(fullPath), fs.readFile(smallPath), sharp(fullPath).metadata(), sharp(smallPath).metadata(),
  ]);
  assert.equal(metaFull.width, 1200, `Detail width: ${product.slug}`);
  assert.equal(metaFull.height, 1200, `Detail height: ${product.slug}`);
  assert.equal(metaSmall.width, 480, `Thumbnail width: ${product.slug}`);
  assert.equal(metaSmall.height, 480, `Thumbnail height: ${product.slug}`);
  const hash = createHash("sha256").update(full).digest("hex");
  assert.ok(!hashes.has(hash), `Duplicate photograph: ${product.slug}`);
  hashes.add(hash);
  fullBytes += full.length;
  thumbnailBytes += small.length;
}
console.log(JSON.stringify({ products: PRODUCTOS.length, uniquePhotos: hashes.size, fullBytes, thumbnailBytes, averageThumbnailKB: Math.round(thumbnailBytes / PRODUCTOS.length / 1024), migrationChecks: "passed" }, null, 2));
