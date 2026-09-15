import type { WorkBook } from "xlsx";
import type { Genetica, Origen, Producto, TipoSemilla } from "../data/catalogo";
import type { AdminCategory } from "../types/commerce";

export const IMPORT_COLUMNS = ["id", "nombre", "banco", "categoria", "origen", "tipo", "genetica", "precio", "stock", "presentacion", "descripcion", "fotoperiodo", "ambiente", "dificultad", "ciclo_semanas", "thc", "cbd", "imagen", "visible_web", "destacado"] as const;

export interface ImportError {
  row: number;
  field: string;
  value: string;
  problem: string;
}

export interface ImportRow {
  row: number;
  action: "create" | "update";
  producto: Producto;
}

export interface ImportResult {
  rows: ImportRow[];
  errors: ImportError[];
  totalRows: number;
}

const TIPOS: TipoSemilla[] = ["feminizada", "automatica", "cbd"];
const GENETICAS: Genetica[] = ["indica", "sativa", "hibrida"];
const ORIGENES: Origen[] = ["nacional", "importada"];

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseBool(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  const text = String(value).trim().toLowerCase();
  if (["true", "1", "si", "sí", "x", "yes"].includes(text)) return true;
  if (["false", "0", "no"].includes(text)) return false;
  return fallback;
}

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "number" ? value : Number(String(value).trim().replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

/** Lee la primera hoja de un .xlsx/.csv como filas de objetos, encabezados de la fila 1. Carga SheetJS en su propio chunk: no pesa en el bundle general del admin. */
export async function readWorkbookRows(buffer: ArrayBuffer): Promise<Record<string, unknown>[]> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
}

export function validateImport(rawRows: Record<string, unknown>[], categories: AdminCategory[], existingProducts: Producto[]): ImportResult {
  const errors: ImportError[] = [];
  const rows: ImportRow[] = [];
  const seenSlugs = new Set<string>();

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2; // la fila 1 del archivo son los encabezados
    const get = (key: string) => String(raw[key] ?? "").trim();
    const nombre = get("nombre");
    const banco = get("banco");
    const categoriaRaw = get("categoria");
    const origen = get("origen").toLowerCase();
    const tipo = get("tipo").toLowerCase();
    const genetica = get("genetica").toLowerCase();
    const precioRaw = get("precio");
    const stockRaw = get("stock");
    const precio = parseNumber(raw.precio);
    const stock = parseNumber(raw.stock);
    const presentacion = get("presentacion");
    const idRaw = get("id") || undefined; // "" no es un id válido — sin esto, todas las filas nuevas sin id colisionan en id="".
    const rowErrors: ImportError[] = [];

    if (nombre.length < 2) rowErrors.push({ row: rowNumber, field: "nombre", value: nombre, problem: "Necesita al menos 2 caracteres." });
    if (!banco) rowErrors.push({ row: rowNumber, field: "banco", value: banco, problem: "Es obligatorio." });
    const category = categories.find((candidate) => candidate.id === categoriaRaw || candidate.slug === slugify(categoriaRaw) || candidate.nombre.toLowerCase() === categoriaRaw.toLowerCase());
    if (!category) rowErrors.push({ row: rowNumber, field: "categoria", value: categoriaRaw, problem: "No coincide con ninguna categoría existente." });
    if (!ORIGENES.includes(origen as Origen)) rowErrors.push({ row: rowNumber, field: "origen", value: origen, problem: `Debe ser "${ORIGENES.join('" o "')}".` });
    if (!TIPOS.includes(tipo as TipoSemilla)) rowErrors.push({ row: rowNumber, field: "tipo", value: tipo, problem: `Debe ser: ${TIPOS.join(", ")}.` });
    if (!GENETICAS.includes(genetica as Genetica)) rowErrors.push({ row: rowNumber, field: "genetica", value: genetica, problem: `Debe ser: ${GENETICAS.join(", ")}.` });
    if (precio === null || precio < 0) rowErrors.push({ row: rowNumber, field: "precio", value: precioRaw, problem: "Tiene que ser un número mayor o igual a 0." });
    if (stock === null || stock < 0 || !Number.isInteger(stock)) rowErrors.push({ row: rowNumber, field: "stock", value: stockRaw, problem: "Tiene que ser un número entero mayor o igual a 0." });
    if (!presentacion) rowErrors.push({ row: rowNumber, field: "presentacion", value: presentacion, problem: "Es obligatoria." });
    const cicloRaw = get("ciclo_semanas");
    const ciclo = cicloRaw ? parseNumber(cicloRaw) : null;
    if (cicloRaw && (ciclo === null || ciclo <= 0)) rowErrors.push({ row: rowNumber, field: "ciclo_semanas", value: cicloRaw, problem: "Tiene que ser un número mayor a 0 (o dejarlo vacío)." });

    const slug = nombre && banco ? slugify(`${nombre}-${banco}`) : "";
    const existingById = idRaw ? existingProducts.find((product) => product.id === idRaw) : undefined;
    const existingBySlug = !existingById && slug ? existingProducts.find((product) => product.slug === slug) : undefined;
    const matched = existingById ?? existingBySlug;

    if (slug) {
      if (seenSlugs.has(slug)) rowErrors.push({ row: rowNumber, field: "nombre / banco", value: `${nombre} · ${banco}`, problem: "Duplicado dentro del mismo archivo (mismo nombre y banco que otra fila)." });
      seenSlugs.add(slug);
    }

    if (rowErrors.length) { errors.push(...rowErrors); return; }

    const producto: Producto = {
      id: matched?.id ?? idRaw ?? `product-${globalThis.crypto?.randomUUID?.() ?? Date.now()}-${index}`,
      slug: matched?.slug ?? slug,
      nombre, banco, categoria: category!.id, origen: origen as Origen, tipo: tipo as TipoSemilla, genetica: genetica as Genetica,
      precio: precio!, stock: stock!, presentacion,
      descripcion: get("descripcion") || undefined,
      fotoperiodo: get("fotoperiodo") || undefined,
      ambiente: get("ambiente") || undefined,
      dificultad: get("dificultad") || undefined,
      ciclo_semanas: ciclo ?? undefined,
      thc: get("thc") || undefined,
      cbd: get("cbd") || undefined,
      imagen: get("imagen") || matched?.imagen,
      visible_web: parseBool(raw.visible_web, matched?.visible_web ?? true),
      destacado: parseBool(raw.destacado, matched?.destacado ?? false),
    };
    rows.push({ row: rowNumber, action: matched ? "update" : "create", producto });
  });

  return { rows, errors, totalRows: rawRows.length };
}

async function buildWorkbook(rows: Record<string, unknown>[]): Promise<WorkBook> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows, { header: [...IMPORT_COLUMNS] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Productos");
  return workbook;
}

async function downloadWorkbook(workbook: WorkBook, filename: string) {
  const XLSX = await import("xlsx");
  XLSX.writeFile(workbook, filename);
}

export async function downloadTemplateWorkbook(categories: AdminCategory[], filename = "plantilla-productos-crazylady.xlsx") {
  const example = {
    id: "", nombre: "Amnesia x4", banco: "Crazy Lady Seeds", categoria: categories[0]?.nombre ?? "Semillas", origen: "nacional",
    tipo: "feminizada", genetica: "sativa", precio: 21000, stock: 10, presentacion: "x4", descripcion: "", fotoperiodo: "",
    ambiente: "", dificultad: "", ciclo_semanas: "", thc: "", cbd: "", imagen: "", visible_web: "true", destacado: "false",
  };
  await downloadWorkbook(await buildWorkbook([example]), filename);
}

export async function downloadProductsWorkbook(products: Producto[], categories: AdminCategory[], filename = "catalogo-crazylady.xlsx") {
  const rows = products.map((product) => ({
    id: product.id, nombre: product.nombre, banco: product.banco,
    categoria: categories.find((category) => category.id === product.categoria)?.nombre ?? product.categoria,
    origen: product.origen, tipo: product.tipo, genetica: product.genetica, precio: product.precio, stock: product.stock,
    presentacion: product.presentacion, descripcion: product.descripcion ?? "", fotoperiodo: product.fotoperiodo ?? "",
    ambiente: product.ambiente ?? "", dificultad: product.dificultad ?? "", ciclo_semanas: product.ciclo_semanas ?? "",
    thc: product.thc ?? "", cbd: product.cbd ?? "", imagen: product.imagen ?? "",
    visible_web: product.visible_web !== false ? "true" : "false", destacado: product.destacado ? "true" : "false",
  }));
  await downloadWorkbook(await buildWorkbook(rows), filename);
}

export function buildErrorReportCsv(errors: ImportError[]) {
  const header = ["fila", "campo", "valor", "problema"];
  const rows = errors.map((error) => [String(error.row), error.field, error.value, error.problem]);
  return [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
