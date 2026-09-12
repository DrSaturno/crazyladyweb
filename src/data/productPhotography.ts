// Generated botanical studio illustrations. The explicit list prevents broken URLs for new products.
const STUDIO_SLUGS = [
  "mix-x10-crazy-lady-seeds",
  "amnesia-x4-crazy-lady-seeds",
  "mango-kush-x4-crazy-lady-seeds",
  "colombian-gold-1-x4-crazy-lady-seeds",
  "klementine-kush-x4-crazy-lady-seeds",
  "mendocino-1-x4-crazy-lady-seeds",
  "manga-rosa-x4-crazy-lady-seeds",
  "purple-lemon-x4-crazy-lady-seeds",
  "purple-punch-fem-x4-crazy-lady-seeds",
  "ak47-auto-x4-crazy-lady-seeds",
  "amnesia-haze-auto-x4-crazy-lady-seeds",
  "auto-critical-1-x4-crazy-lady-seeds",
  "auto-zkittlez-x4-crazy-lady-seeds",
  "gorila-glue-auto-x4-crazy-lady-seeds",
  "lemonade-auto-x4-crazy-lady-seeds",
  "zkywalker-haze-auto-x4-crazy-lady-seeds",
  "purple-punch-auto-crazy-lady-seeds",
  "sky-light-cbd-x4-crazy-lady-seeds",
  "cherry-wine-cbd-crazy-lady-seeds",
  "kushie-eyes-cbd-crazy-lady-seeds",
  "smelly-haze-cbd-crazy-lady-seeds",
  "0g-324-silver-river-seeds",
  "river-haze-silver-river-seeds",
  "lemon-ram-silver-river-seeds",
  "gorilash-silver-river-seeds",
  "malvina-conicet-x4-cannabis-conicet",
  "seda-cbd-x3-chita-seeds",
  "bengala-xl-x3-chita-seeds",
  "dinamo-x3-chita-seeds",
  "la-estrella-x3-chita-seeds",
  "la-resinosa-chita-seeds",
  "choco-og-x3-a-confirmar",
  "onora-x5-a-confirmar",
  "santanesia-x5-a-confirmar",
  "durban-sensi-seeds",
  "girl-scout-cookies-x3-sensi-seeds",
  "sweet-cherry-kush-sensi-seeds",
  "mandarin-punch-sensi-seeds",
  "amnesia-sensi-seeds",
  "critical-runtz-sensi-seeds",
  "sensi-skunk-x3-sensi-seeds",
  "northern-lights-x3-sensi-seeds",
  "jack-herer-x3-sensi-seeds",
  "hindu-kush-x3-sensi-seeds",
  "auto-sensi-skunk-sensi-seeds",
  "auto-skunk-1-sensi-seeds",
  "super-skunk-auto-x3-sensi-seeds",
  "auto-big-bud-sensi-seeds",
  "mandarin-punch-auto-sensi-seeds",
  "skunk-1-auto-x3-sensi-seeds",
  "white-widow-auto-x3-sensi-seeds",
  "alpine-delight-cbd-auto-sensi-seeds",
  "white-widow-x3-buddha-seeds",
  "buddha-critical-buddha-seeds",
  "amnesia-x3-buddha-seeds",
  "skunk-x3-buddha-seeds",
  "buddha-skunk-x3-buddha-seeds",
  "wedding-cheese-cake-x3-buddha-seeds",
  "buddha-diesel-x3-buddha-seeds",
  "zkittles-auto-x3-buddha-seeds",
  "white-dwarf-auto-x3-buddha-seeds",
  "buddha-syrup-auto-x3-buddha-seeds",
  "buddha-auto-diesel-buddha-seeds",
  "buddha-red-dwarf-auto-buddha-seeds",
  "medikit-auto-cbd-x3-buddha-seeds",
  "medikit-cbd-x3-buddha-seeds",
  "morpheus-cbd-1-1-x3-buddha-seeds",
  "gorila-auto-x3-buddha-seeds",
  "royal-highness-cbd-x3-royal-queen-seeds",
  "royal-medic-cbd-x3-royal-queen-seeds",
  "medical-mass-cbd-x3-royal-queen-seeds",
  "sour-diesel-x3-royal-queen-seeds",
  "easy-bud-auto-x3-royal-queen-seeds",
  "northern-lights-x3-royal-queen-seeds",
  "royal-cookies-x3-royal-queen-seeds",
  "critical-jack-herer-delicious-seeds",
  "golosa-delicious-seeds",
  "deep-mandarine-cbd-delicious-seeds",
  "esqueje-jet-puft-compound-genetics"
] as const;

export const PRODUCT_STUDIO_IMAGES: Readonly<Record<string, string>> = Object.fromEntries(
  STUDIO_SLUGS.map((slug) => [slug, `/products/studio/${slug}.webp`]),
);

const LEGACY_CATALOG_IMAGES = new Set([
  "/products/og-324.jpg",
  "/products/choco-og.png",
  "/products/onora.png",
  "/products/santanesia.png",
]);

/** Upgrade default artwork while preserving images entered by the store administrator. */
export function resolveCatalogImage(product: { slug: string; imagen?: string }): string | undefined {
  if (product.imagen && !LEGACY_CATALOG_IMAGES.has(product.imagen)) return product.imagen;
  return PRODUCT_STUDIO_IMAGES[product.slug] ?? product.imagen;
}

export function isStudioImage(image?: string): boolean {
  return Boolean(image?.startsWith("/products/studio/"));
}

