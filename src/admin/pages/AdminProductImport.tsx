import { useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useCommerceData } from "../../context/CommerceDataContext";
import {
  buildErrorReportCsv,
  downloadTemplateWorkbook,
  downloadTextFile,
  readWorkbookRows,
  validateImport,
  type ImportResult,
} from "../productImport";
import { Panel, StatusBadge, labelClass } from "../components/AdminUI";

type ImportMode = "create" | "update" | "both";

const MODE_LABELS: { value: ImportMode; label: string; hint: string }[] = [
  { value: "both", label: "Crear y actualizar", hint: "Comportamiento por defecto." },
  { value: "create", label: "Solo crear nuevos", hint: "Ignora filas que coinciden con un producto existente." },
  { value: "update", label: "Solo actualizar existentes", hint: "Ignora filas que no coinciden con ningún producto." },
];

export function ProductImportPanel({ onClose }: { onClose: () => void }) {
  const { products, categories, importProducts } = useCommerceData();
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mode, setMode] = useState<ImportMode>("both");
  const [summary, setSummary] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setParsing(true);
    setParseError("");
    setResult(null);
    setSummary(null);
    try {
      const buffer = await file.arrayBuffer();
      const rawRows = await readWorkbookRows(buffer);
      if (!rawRows.length) { setParseError("El archivo no tiene filas de datos debajo del encabezado."); return; }
      setFileName(file.name);
      setResult(validateImport(rawRows, categories, products));
    } catch {
      setParseError("No pudimos leer el archivo. Verificá que sea un .xlsx o .csv válido, exportado desde la plantilla.");
    } finally {
      setParsing(false);
    }
  }

  const applicable = result ? result.rows.filter((row) => mode === "both" || row.action === mode) : [];
  const skippedByMode = result ? result.rows.length - applicable.length : 0;

  function confirmImport() {
    if (!applicable.length) return;
    const { created, updated } = importProducts(applicable.map((row) => ({ producto: row.producto, action: row.action })));
    setSummary({ created, updated, skipped: skippedByMode });
    setResult(null);
    setFileName("");
  }

  function downloadTemplate() {
    void downloadTemplateWorkbook(categories);
  }

  function downloadErrors() {
    if (!result?.errors.length) return;
    downloadTextFile("errores-importacion-productos.csv", buildErrorReportCsv(result.errors), "text/csv");
  }

  return (
    <Panel title="Importar productos desde Excel / CSV" description="Cargá varios productos a la vez. Se valida todo antes de importar nada." className="mb-4">
      <div className="flex flex-col gap-4">
        {!result && !summary && (
          <>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-cls-line bg-cls-cream p-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 shrink-0 text-cls-primary" />
                <div>
                  <p className="text-sm font-black text-cls-primary-dark">Subí un archivo .xlsx o .csv</p>
                  <p className="mt-0.5 text-xs text-cls-ink/88">Usá la plantilla para respetar las columnas: id, nombre, banco, categoría, precio, stock y el resto de los campos del producto.</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" className="btn-outline" onClick={downloadTemplate}><Download className="h-4 w-4" /> Plantilla</button>
                <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={parsing}>{parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Subir archivo</button>
              </div>
              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); event.target.value = ""; }} />
            </div>
            {parseError && <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800" role="alert"><CircleAlert className="h-4 w-4 shrink-0" />{parseError}</p>}
          </>
        )}

        {result && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Filas detectadas" value={result.totalRows} />
              <MiniStat label="Válidas" value={result.rows.length} tone="good" />
              <MiniStat label="Con errores" value={result.errors.length} tone={result.errors.length ? "bad" : "neutral"} />
              <MiniStat label={`Se van a aplicar (${MODE_LABELS.find((item) => item.value === mode)?.label.toLowerCase()})`} value={applicable.length} tone="honey" />
            </div>

            <fieldset>
              <legend className={labelClass}>¿Qué hacer con las filas válidas?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {MODE_LABELS.map((item) => <label key={item.value} className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 transition ${mode === item.value ? "border-cls-primary bg-cls-sage/45" : "border-cls-line bg-cls-cream hover:border-cls-primary"}`}><input type="radio" name="import-mode" className="sr-only" checked={mode === item.value} onChange={() => setMode(item.value)} /><span className="text-xs font-black text-cls-primary-dark">{item.label}</span><span className="mt-0.5 text-[10px] text-cls-ink/88">{item.hint}</span></label>)}
              </div>
            </fieldset>

            {result.errors.length > 0 && (
              <div className="rounded-xl border border-cls-line bg-cls-paper">
                <div className="flex items-center justify-between gap-2 border-b border-cls-line p-3">
                  <p className="flex items-center gap-2 text-xs font-black text-cls-orange"><CircleAlert className="h-4 w-4" /> {result.errors.length} error(es) — esas filas no se van a importar</p>
                  <button type="button" className="btn-outline min-h-9 px-3 py-1 text-xs" onClick={downloadErrors}><Download className="h-3.5 w-3.5" /> Descargar reporte</button>
                </div>
                <div className="max-h-56 overflow-y-auto"><table className="admin-table"><thead><tr><th>Fila</th><th>Campo</th><th>Valor</th><th>Problema</th></tr></thead><tbody>{result.errors.slice(0, 100).map((error, index) => <tr key={index}><td data-label="Fila">{error.row}</td><td data-label="Campo">{error.field}</td><td data-label="Valor">{error.value || "—"}</td><td data-label="Problema">{error.problem}</td></tr>)}</tbody></table>{result.errors.length > 100 && <p className="p-3 text-center text-[11px] text-cls-ink/86">Mostrando los primeros 100 de {result.errors.length}. Descargá el reporte para verlos todos.</p>}</div>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-cls-line pt-4 sm:flex-row sm:justify-end">
              <button type="button" className="btn-outline" onClick={() => { setResult(null); setFileName(""); }}>Cancelar</button>
              <button type="button" className="btn-secondary" disabled={!applicable.length} onClick={confirmImport}><Upload className="h-4 w-4" /> Importar {applicable.length} producto(s)</button>
            </div>
            <p className="text-center text-[10px] text-cls-ink/84">Archivo: {fileName}</p>
          </>
        )}

        {summary && (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-cls-sage/40 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-cls-primary" />
            <p className="text-sm font-black text-cls-primary-dark">Importación completa</p>
            <p className="text-xs text-cls-ink/92">{summary.created} producto(s) creado(s) · {summary.updated} actualizado(s){summary.skipped ? ` · ${summary.skipped} omitido(s) por el modo elegido` : ""}.</p>
            <div className="flex gap-2"><button type="button" className="btn-outline" onClick={() => setSummary(null)}>Importar otro archivo</button><button type="button" className="btn-secondary" onClick={onClose}>Cerrar</button></div>
          </div>
        )}

        {!result && !summary && !parsing && (
          <button type="button" className="self-start text-xs font-bold text-cls-ink/86 hover:text-cls-primary" onClick={onClose}><X className="mr-1 inline h-3.5 w-3.5" />Cerrar sin importar</button>
        )}
      </div>
    </Panel>
  );
}

function MiniStat({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "good" | "bad" | "honey" | "neutral" }) {
  return <div className="rounded-xl bg-cls-cream p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-cls-ink/86">{label}</p><div className="mt-1 flex items-center gap-2"><strong className="text-xl text-cls-primary-dark">{value}</strong>{tone !== "neutral" && <StatusBadge tone={tone === "good" ? "good" : tone === "bad" ? "bad" : "warn"}>{tone === "good" ? "OK" : tone === "bad" ? "Revisar" : "Aplica"}</StatusBadge>}</div></div>;
}
