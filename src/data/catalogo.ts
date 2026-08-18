// ── Catálogo de Crazy Lady Seeds ────────────────────────────────────────────
// Datos reales del sheet "Stock actual Crazylady 18/08" (Drive).
// En producción esto se reemplaza por una lectura de `products` en Supabase.
//
// OJO — dos campos NO vienen del sheet y están derivados:
//   · `origen` y `tipo` salen de la ruta de categoría del sheet
//     (`SEMILLAS > NACIONALES > ... > AUTOMÁTICAS`), así que son confiables.
//   · `genetica` (índica/sativa/híbrida) NO está en ninguna fuente del cliente —
//     está puesta por conocimiento general de cada genética y **hay que hacérsela
//     validar a Eliana antes de publicar**. Ver D-12 en SPEC.md.
//   · `banco` para los cuatro productos que el sheet lista como `SEMILLAS > NACIONALES`
//     a secas (Choco OG, Malvina, Onora, Santanesia) quedó como "A confirmar" —
//     es justamente el dato que falta para poder marcar `inase`.

export type Origen = "nacional" | "importada";
export type TipoSemilla = "feminizada" | "automatica" | "cbd";
export type Genetica = "indica" | "sativa" | "hibrida";
export type Categoria = "semilla" | "esqueje";

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  banco: string;
  categoria: Categoria;
  origen: Origen;
  tipo: TipoSemilla;
  genetica: Genetica;
  precio: number;
  stock: number;
  presentacion: string;
  /**
   * Si aparece o no en la vidriera pública. Hoy arranca en `true` para todo lo
   * que tiene stock — el criterio final es la decisión D-04 del SPEC, que Eliana
   * todavía no cerró. Se togglea desde el panel (/admin/productos).
   */
  visible_web?: boolean;
  destacado?: boolean;
}

// Bancos que Eliana declaró como registrados INASE (cuestionario 17/08).
export const BANCOS_INASE = [
  "Silver River Seeds",
  "La Maga",
  "1439",
  "Sweed Labs",
  "Cannabis Conicet",
  "Kame Seeds",
  "Billy Seeds",
];

export function esInase(banco: string) {
  return BANCOS_INASE.includes(banco);
}

export interface Banco {
  slug: string;
  nombre: string;
  origen: Origen;
  inase: boolean;
  /** Iniciales que se usan como logo hasta que lleguen los archivos reales. */
  sigla: string;
}

export const BANCOS: Banco[] = [
  { slug: "crazy-lady-seeds", nombre: "Crazy Lady Seeds", origen: "nacional", inase: false, sigla: "CLS" },
  { slug: "silver-river-seeds", nombre: "Silver River Seeds", origen: "nacional", inase: true, sigla: "SR" },
  { slug: "cannabis-conicet", nombre: "Cannabis Conicet", origen: "nacional", inase: true, sigla: "CC" },
  { slug: "chita-seeds", nombre: "Chita Seeds", origen: "nacional", inase: false, sigla: "CH" },
  { slug: "sensi-seeds", nombre: "Sensi Seeds", origen: "importada", inase: false, sigla: "SS" },
  { slug: "buddha-seeds", nombre: "Buddha Seeds", origen: "importada", inase: false, sigla: "BS" },
  { slug: "royal-queen-seeds", nombre: "Royal Queen Seeds", origen: "importada", inase: false, sigla: "RQ" },
  { slug: "delicious-seeds", nombre: "Delicious Seeds", origen: "importada", inase: false, sigla: "DS" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Fila = [nombre: string, banco: string, origen: Origen, tipo: TipoSemilla, genetica: Genetica, precio: number, stock: number, presentacion: string];

const FILAS: Fila[] = [
  // ── NACIONALES · Crazy Lady Seeds — producción propia, el stock más profundo ──
  ["Mix x10", "Crazy Lady Seeds", "nacional", "feminizada", "hibrida", 53000, 85, "x10"],
  ["Amnesia x4", "Crazy Lady Seeds", "nacional", "feminizada", "sativa", 21000, 85, "x4"],
  ["Mango Kush x4", "Crazy Lady Seeds", "nacional", "feminizada", "indica", 21000, 85, "x4"],
  ["Colombian Gold #1 x4", "Crazy Lady Seeds", "nacional", "feminizada", "sativa", 21000, 52, "x4"],
  ["Klementine Kush x4", "Crazy Lady Seeds", "nacional", "feminizada", "hibrida", 21000, 52, "x4"],
  ["Mendocino #1 x4", "Crazy Lady Seeds", "nacional", "feminizada", "hibrida", 21000, 52, "x4"],
  ["Manga Rosa x4", "Crazy Lady Seeds", "nacional", "feminizada", "sativa", 21000, 52, "x4"],
  ["Purple Lemon x4", "Crazy Lady Seeds", "nacional", "feminizada", "hibrida", 21000, 52, "x4"],
  ["Purple Punch Fem x4", "Crazy Lady Seeds", "nacional", "feminizada", "indica", 21000, 0, "x4"],
  ["AK47 Auto x4", "Crazy Lady Seeds", "nacional", "automatica", "hibrida", 21000, 4, "x4"],
  ["Amnesia Haze Auto x4", "Crazy Lady Seeds", "nacional", "automatica", "sativa", 21000, 4, "x4"],
  ["Auto Critical #1 x4", "Crazy Lady Seeds", "nacional", "automatica", "indica", 21000, 4, "x4"],
  ["Auto Zkittlez x4", "Crazy Lady Seeds", "nacional", "automatica", "indica", 21000, 4, "x4"],
  ["Gorila Glue Auto x4", "Crazy Lady Seeds", "nacional", "automatica", "hibrida", 21000, 4, "x4"],
  ["Lemonade Auto x4", "Crazy Lady Seeds", "nacional", "automatica", "sativa", 21000, 4, "x4"],
  ["Zkywalker Haze Auto x4", "Crazy Lady Seeds", "nacional", "automatica", "sativa", 21000, 4, "x4"],
  ["Purple Punch Auto", "Crazy Lady Seeds", "nacional", "automatica", "indica", 21000, 0, "x4"],
  ["Sky Light CBD x4", "Crazy Lady Seeds", "nacional", "cbd", "hibrida", 21000, 3, "x4"],
  ["Cherry Wine CBD", "Crazy Lady Seeds", "nacional", "cbd", "sativa", 13000, 0, "x3"],
  ["Kushie Eyes CBD", "Crazy Lady Seeds", "nacional", "cbd", "indica", 13000, 0, "x3"],
  ["Smelly Haze CBD", "Crazy Lady Seeds", "nacional", "cbd", "sativa", 13000, 0, "x3"],

  // ── NACIONALES · Silver River Seeds — registrado INASE ──
  ["0G 324", "Silver River Seeds", "nacional", "feminizada", "indica", 39000, 2, "x3"],
  ["River Haze", "Silver River Seeds", "nacional", "feminizada", "sativa", 39000, 2, "x3"],
  ["Lemon Ram", "Silver River Seeds", "nacional", "feminizada", "hibrida", 39000, 1, "x3"],
  ["Gorilash", "Silver River Seeds", "nacional", "feminizada", "indica", 39000, 0, "x3"],

  // ── NACIONALES · Cannabis Conicet — registrado INASE ──
  ["Malvina Conicet x4", "Cannabis Conicet", "nacional", "feminizada", "hibrida", 34000, 2, "x4"],

  // ── NACIONALES · Chita Seeds ──
  ["Seda CBD x3", "Chita Seeds", "nacional", "cbd", "hibrida", 22000, 3, "x3"],
  ["Bengala XL x3", "Chita Seeds", "nacional", "automatica", "indica", 22000, 0, "x3"],
  ["Dinamo x3", "Chita Seeds", "nacional", "automatica", "hibrida", 22000, 0, "x3"],
  ["La Estrella x3", "Chita Seeds", "nacional", "automatica", "sativa", 22000, 0, "x3"],
  ["La Resinosa", "Chita Seeds", "nacional", "automatica", "indica", 22000, 0, "x3"],

  // ── NACIONALES · banco a confirmar (el sheet no lo nombra) ──
  ["Choco OG x3", "A confirmar", "nacional", "feminizada", "indica", 23000, 1, "x3"],
  ["Onora x5", "A confirmar", "nacional", "feminizada", "hibrida", 40000, 1, "x5"],
  ["Santanesia x5", "A confirmar", "nacional", "feminizada", "hibrida", 40000, 2, "x5"],

  // ── IMPORTADAS · Sensi Seeds ──
  ["Durban", "Sensi Seeds", "importada", "feminizada", "sativa", 55000, 4, "x3"],
  ["Girl Scout Cookies x3", "Sensi Seeds", "importada", "feminizada", "hibrida", 38000, 5, "x3"],
  ["Sweet Cherry Kush", "Sensi Seeds", "importada", "feminizada", "indica", 48000, 4, "x3"],
  ["Mandarin Punch", "Sensi Seeds", "importada", "feminizada", "hibrida", 42000, 4, "x3"],
  ["Amnesia", "Sensi Seeds", "importada", "feminizada", "sativa", 50000, 3, "x3"],
  ["Critical Runtz", "Sensi Seeds", "importada", "feminizada", "hibrida", 50000, 2, "x3"],
  ["Sensi Skunk x3", "Sensi Seeds", "importada", "feminizada", "hibrida", 32000, 5, "x3"],
  ["Northern Lights x3", "Sensi Seeds", "importada", "feminizada", "indica", 38000, 0, "x3"],
  ["Jack Herer x3", "Sensi Seeds", "importada", "feminizada", "sativa", 60000, 0, "x3"],
  ["Hindu Kush x3", "Sensi Seeds", "importada", "feminizada", "indica", 32000, 0, "x3"],
  ["Auto Sensi Skunk", "Sensi Seeds", "importada", "automatica", "hibrida", 36000, 4, "x3"],
  ["Auto Skunk #1", "Sensi Seeds", "importada", "automatica", "hibrida", 38000, 4, "x3"],
  ["Super Skunk Auto x3", "Sensi Seeds", "importada", "automatica", "indica", 44000, 3, "x3"],
  ["Auto Big Bud", "Sensi Seeds", "importada", "automatica", "indica", 77000, 3, "x3"],
  ["Mandarin Punch Auto", "Sensi Seeds", "importada", "automatica", "hibrida", 44000, 2, "x3"],
  ["Skunk #1 Auto x3", "Sensi Seeds", "importada", "automatica", "hibrida", 29000, 1, "x3"],
  ["White Widow Auto x3", "Sensi Seeds", "importada", "automatica", "hibrida", 77000, 1, "x3"],
  ["Alpine Delight CBD Auto", "Sensi Seeds", "importada", "cbd", "hibrida", 37000, 0, "x3"],

  // ── IMPORTADAS · Buddha Seeds ──
  ["White Widow x3", "Buddha Seeds", "importada", "feminizada", "hibrida", 36000, 4, "x3"],
  ["Buddha Critical", "Buddha Seeds", "importada", "feminizada", "indica", 38000, 4, "x3"],
  ["Amnesia x3", "Buddha Seeds", "importada", "feminizada", "sativa", 25000, 5, "x3"],
  ["Skunk x3", "Buddha Seeds", "importada", "feminizada", "hibrida", 24000, 5, "x3"],
  ["Buddha Skunk x3", "Buddha Seeds", "importada", "feminizada", "hibrida", 25000, 5, "x3"],
  ["Wedding Cheese Cake x3", "Buddha Seeds", "importada", "feminizada", "indica", 48000, 3, "x3"],
  ["Buddha Diesel x3", "Buddha Seeds", "importada", "feminizada", "sativa", 25000, 2, "x3"],
  ["Zkittles Auto x3", "Buddha Seeds", "importada", "automatica", "indica", 40000, 5, "x3"],
  ["White Dwarf Auto x3", "Buddha Seeds", "importada", "automatica", "indica", 42000, 5, "x3"],
  ["Buddha Syrup Auto x3", "Buddha Seeds", "importada", "automatica", "hibrida", 40000, 5, "x3"],
  ["Buddha Auto Diesel", "Buddha Seeds", "importada", "automatica", "sativa", 36000, 3, "x3"],
  ["Buddha Red Dwarf Auto", "Buddha Seeds", "importada", "automatica", "indica", 36000, 1, "x3"],
  ["Medikit Auto CBD x3", "Buddha Seeds", "importada", "cbd", "hibrida", 40000, 2, "x3"],
  ["Medikit CBD x3", "Buddha Seeds", "importada", "cbd", "hibrida", 41000, 2, "x3"],
  ["Morpheus CBD 1:1 x3", "Buddha Seeds", "importada", "cbd", "hibrida", 29000, 0, "x3"],
  ["Gorila Auto x3", "Buddha Seeds", "importada", "automatica", "hibrida", 30000, 0, "x3"],

  // ── IMPORTADAS · Royal Queen Seeds ──
  ["Royal Highness CBD x3", "Royal Queen Seeds", "importada", "cbd", "hibrida", 27000, 2, "x3"],
  ["Royal Medic CBD x3", "Royal Queen Seeds", "importada", "cbd", "hibrida", 27000, 2, "x3"],
  ["Medical Mass CBD x3", "Royal Queen Seeds", "importada", "cbd", "indica", 27000, 1, "x3"],
  ["Sour Diesel x3", "Royal Queen Seeds", "importada", "feminizada", "sativa", 39000, 2, "x3"],
  ["Easy Bud Auto x3", "Royal Queen Seeds", "importada", "automatica", "indica", 39000, 1, "x3"],
  ["Northern Lights x3", "Royal Queen Seeds", "importada", "feminizada", "indica", 28000, 0, "x3"],
  ["Royal Cookies x3", "Royal Queen Seeds", "importada", "feminizada", "hibrida", 39000, 0, "x3"],

  // ── IMPORTADAS · Delicious Seeds ──
  ["Critical Jack Herer", "Delicious Seeds", "importada", "feminizada", "sativa", 12000, 0, "x3"],
  ["Golosa", "Delicious Seeds", "importada", "feminizada", "hibrida", 12000, 0, "x3"],
  ["Deep Mandarine CBD", "Delicious Seeds", "importada", "cbd", "hibrida", 12000, 0, "x3"],
];

export const SEMILLAS: Producto[] = FILAS.map(([nombre, banco, origen, tipo, genetica, precio, stock, presentacion], i) => ({
  id: `sem-${i + 1}`,
  slug: slugify(`${nombre}-${banco}`),
  nombre,
  banco,
  categoria: "semilla" as const,
  origen,
  tipo,
  genetica,
  precio,
  stock,
  presentacion,
  visible_web: stock > 0,
}));

export const ESQUEJES: Producto[] = [
  {
    id: "esq-1",
    slug: "esqueje-jet-puft-compound-genetics",
    nombre: "Jet Puft",
    banco: "Compound Genetics",
    categoria: "esqueje",
    origen: "importada",
    tipo: "feminizada",
    genetica: "hibrida",
    precio: 22000,
    stock: 6,
    presentacion: "1 esqueje",
    visible_web: true,
  },
];

export const PRODUCTOS: Producto[] = [...SEMILLAS, ...ESQUEJES];

export function getProducto(slug: string) {
  return PRODUCTOS.find((p) => p.slug === slug);
}

export function getBanco(slug: string) {
  return BANCOS.find((b) => b.slug === slug);
}

/** Productos con stock, ordenados por disponibilidad — la grilla de «disponibles ahora». */
export function disponibles(limit?: number) {
  const l = SEMILLAS.filter((p) => p.stock > 0).sort((a, b) => b.stock - a.stock);
  return limit ? l.slice(0, limit) : l;
}

export const TIPO_LABEL: Record<TipoSemilla, string> = {
  feminizada: "Feminizadas",
  automatica: "Automáticas",
  cbd: "CBD",
};

export const GENETICA_LABEL: Record<Genetica, string> = {
  indica: "Índica",
  sativa: "Sativa",
  hibrida: "Híbrida",
};

export const ORIGEN_LABEL: Record<Origen, string> = {
  nacional: "Nacionales",
  importada: "Importadas",
};

export function precioARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}
