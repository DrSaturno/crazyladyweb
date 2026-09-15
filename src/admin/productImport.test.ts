import { describe, expect, it } from "vitest";
import type { Producto } from "../data/catalogo";
import type { AdminCategory } from "../types/commerce";
import { buildErrorReportCsv, validateImport } from "./productImport";

const CATEGORIES: AdminCategory[] = [
  { id: "semilla", slug: "semillas", nombre: "Semillas", descripcion: "", activa: true, orden: 1, createdAt: "", updatedAt: "" },
  { id: "esqueje", slug: "esquejes", nombre: "Esquejes", descripcion: "", activa: true, orden: 2, createdAt: "", updatedAt: "" },
];

function row(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "", nombre: "Amnesia x4", banco: "Crazy Lady Seeds", categoria: "Semillas", origen: "nacional",
    tipo: "feminizada", genetica: "sativa", precio: "21000", stock: "10", presentacion: "x4",
    descripcion: "", fotoperiodo: "", ambiente: "", dificultad: "", ciclo_semanas: "", thc: "", cbd: "",
    imagen: "", visible_web: "true", destacado: "false",
    ...overrides,
  };
}

describe("validateImport", () => {
  it("creates a new product from a fully valid row, resolving category by name", () => {
    const result = validateImport([row()], CATEGORIES, []);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].action).toBe("create");
    expect(result.rows[0].producto.categoria).toBe("semilla");
    expect(result.rows[0].producto.precio).toBe(21000);
    expect(result.rows[0].producto.stock).toBe(10);
  });

  it("matches an existing product by slug (nombre+banco) and marks it as update", () => {
    const existing: Producto = { id: "prod-1", slug: "amnesia-x4-crazy-lady-seeds", nombre: "Amnesia x4", banco: "Crazy Lady Seeds", categoria: "semilla", origen: "nacional", tipo: "feminizada", genetica: "sativa", precio: 15000, stock: 2, presentacion: "x4", imagen: "https://example.com/old.jpg" };
    const result = validateImport([row({ precio: "18000", stock: "5" })], CATEGORIES, [existing]);
    expect(result.errors).toEqual([]);
    expect(result.rows[0].action).toBe("update");
    expect(result.rows[0].producto.id).toBe("prod-1");
    expect(result.rows[0].producto.slug).toBe("amnesia-x4-crazy-lady-seeds");
    expect(result.rows[0].producto.precio).toBe(18000);
    // La imagen existente se conserva si la fila del Excel no trae una nueva.
    expect(result.rows[0].producto.imagen).toBe("https://example.com/old.jpg");
  });

  it("matches an existing product by explicit id even if the name changed", () => {
    const existing: Producto = { id: "prod-1", slug: "old-slug", nombre: "Nombre viejo", banco: "Crazy Lady Seeds", categoria: "semilla", origen: "nacional", tipo: "feminizada", genetica: "sativa", precio: 1000, stock: 1, presentacion: "x4" };
    const result = validateImport([row({ id: "prod-1", nombre: "Nombre nuevo" })], CATEGORIES, [existing]);
    expect(result.rows[0].action).toBe("update");
    expect(result.rows[0].producto.id).toBe("prod-1");
    expect(result.rows[0].producto.nombre).toBe("Nombre nuevo");
  });

  it("regression: two new rows with an empty id column never collide on id=\"\"", () => {
    // Bug real encontrado en pruebas manuales: "" no es nulo para `??`, así que el fallback de
    // id generado nunca se aplicaba y la segunda fila pisaba a la primera.
    const result = validateImport([row({ nombre: "Producto A" }), row({ nombre: "Producto B" })], CATEGORIES, []);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);
    const [first, second] = result.rows;
    expect(first.producto.id).not.toBe("");
    expect(second.producto.id).not.toBe("");
    expect(first.producto.id).not.toBe(second.producto.id);
  });

  it("flags an unknown category, invalid enums, negative price and non-integer stock", () => {
    const result = validateImport([row({ categoria: "No existe", origen: "marte", tipo: "legendaria", genetica: "mitica", precio: "-5", stock: "abc" })], CATEGORIES, []);
    expect(result.rows).toEqual([]);
    const fields = result.errors.map((error) => error.field).sort();
    expect(fields).toEqual(["categoria", "genetica", "origen", "precio", "stock", "tipo"]);
  });

  it("requires ciclo_semanas to be a positive number only when provided", () => {
    const empty = validateImport([row({ ciclo_semanas: "" })], CATEGORIES, []);
    expect(empty.errors).toEqual([]);

    const invalid = validateImport([row({ ciclo_semanas: "0" })], CATEGORIES, []);
    expect(invalid.errors.some((error) => error.field === "ciclo_semanas")).toBe(true);

    const valid = validateImport([row({ ciclo_semanas: "9" })], CATEGORIES, []);
    expect(valid.errors).toEqual([]);
    expect(valid.rows[0].producto.ciclo_semanas).toBe(9);
  });

  it("flags the second occurrence of a duplicate nombre+banco within the same file, not the first", () => {
    const result = validateImport([row(), row()], CATEGORIES, []);
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].row).toBe(3); // fila 1 = encabezado, fila 2 = primera ocurrencia (válida), fila 3 = duplicado
  });

  it("computes row numbers accounting for the header row", () => {
    const result = validateImport([row(), row({ nombre: "x" })], CATEGORIES, []);
    expect(result.errors[0].row).toBe(3);
  });

  it("parses visible_web/destacado from common truthy/falsy spellings and falls back sensibly", () => {
    const visibleOff = validateImport([row({ visible_web: "no", destacado: "si" })], CATEGORIES, []);
    expect(visibleOff.rows[0].producto.visible_web).toBe(false);
    expect(visibleOff.rows[0].producto.destacado).toBe(true);

    const blank = validateImport([row({ visible_web: "", destacado: "" })], CATEGORIES, []);
    expect(blank.rows[0].producto.visible_web).toBe(true); // fallback: publicado por defecto para un producto nuevo
    expect(blank.rows[0].producto.destacado).toBe(false);
  });

  it("rejects a name shorter than 2 characters and a missing presentacion", () => {
    const result = validateImport([row({ nombre: "A", presentacion: "" })], CATEGORIES, []);
    const fields = result.errors.map((error) => error.field).sort();
    expect(fields).toEqual(["nombre", "presentacion"]);
  });
});

describe("buildErrorReportCsv", () => {
  it("escapes embedded quotes and produces one row per error plus a header", () => {
    const csv = buildErrorReportCsv([{ row: 5, field: "categoria", value: 'Con "comillas"', problem: "No existe." }]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe('"fila","campo","valor","problema"');
    expect(lines[1]).toBe('"5","categoria","Con ""comillas""","No existe."');
  });
});
