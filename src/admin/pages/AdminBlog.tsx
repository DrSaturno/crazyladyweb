import { useRef, useState, type FormEvent } from "react";
import { BookOpen, Bug, ExternalLink, Eye, EyeOff, NotebookPen, Pencil, Plus, Save, Search, Trash2, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import NotaParagraph from "../../components/NotaParagraph";
import { useCommerceData } from "../../context/CommerceDataContext";
import { estimarMinutos, formatFechaNota, PALABRAS_VETADAS, TIPOS_NOTA, type Nota, type TipoNota } from "../../data/notas";
import { AdminPage, EmptyState, Panel, StatCard, StatusBadge, fieldClass, labelClass } from "../components/AdminUI";

type StatusFilter = "todas" | "publicadas" | "borradores";

interface Draft {
  id: string;
  originalSlug: string;
  titulo: string;
  slug: string;
  slugTouched: boolean;
  tipo: TipoNota;
  bajada: string;
  fecha: string;
  minutos: string;
  causa: string;
  productoRecomendado: string;
  cuerpo: string;
  publicado: boolean;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const newId = () => `post-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
const splitParagraphs = (text: string) => text.split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function emptyDraft(): Draft {
  return { id: "", originalSlug: "", titulo: "", slug: "", slugTouched: false, tipo: "guia", bajada: "", fecha: today(), minutos: "", causa: "", productoRecomendado: "", cuerpo: "", publicado: false };
}

function draftFromPost(post: Nota): Draft {
  return { id: post.id, originalSlug: post.slug, titulo: post.titulo, slug: post.slug, slugTouched: true, tipo: post.tipo, bajada: post.bajada, fecha: post.fecha, minutos: String(post.minutos), causa: post.causa ?? "", productoRecomendado: post.productoRecomendado ?? "", cuerpo: post.cuerpo.join("\n\n"), publicado: post.publicado };
}

function findBannedWords(texts: string[]) {
  const text = texts.join(" ").toLowerCase();
  return PALABRAS_VETADAS.filter((word) => new RegExp(`(^|[^a-záéíóúüñ])${word}([^a-záéíóúüñ]|$)`).test(text));
}

export function AdminBlog() {
  const { posts, products, savePost, removePost } = useCommerceData();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todas");
  const editorRef = useRef<HTMLDivElement>(null);

  const sorted = [...posts].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const filtered = sorted.filter((post) => (status === "todas" || (status === "publicadas" ? post.publicado : !post.publicado)) && `${post.titulo} ${post.slug} ${post.bajada}`.toLowerCase().includes(query.trim().toLowerCase()));
  const recommendable = [...products].sort((a, b) => a.nombre.localeCompare(b.nombre));

  function open(next: Draft) {
    setDraft(next);
    setPreview(false);
    setSubmitted(false);
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function update(patch: Partial<Draft>) {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.titulo !== undefined && !current.slugTouched) next.slug = slugify(patch.titulo);
      return next;
    });
  }

  const paragraphs = draft ? splitParagraphs(draft.cuerpo) : [];
  const errors = draft ? validate(draft, paragraphs) : [];
  const bannedWords = draft ? findBannedWords([draft.titulo, draft.bajada, draft.causa, draft.cuerpo]) : [];
  const estimated = estimarMinutos(paragraphs);

  function validate(current: Draft, body: string[]) {
    const list: string[] = [];
    if (current.titulo.trim().length < 3) list.push("El título necesita al menos 3 caracteres.");
    if (!SLUG_PATTERN.test(current.slug)) list.push("El slug solo admite minúsculas, números y guiones.");
    else if (posts.some((post) => post.slug === current.slug && post.id !== current.id)) list.push("Ya existe otra nota con ese slug.");
    if (!current.bajada.trim()) list.push("Escribí la bajada de la nota.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(current.fecha)) list.push("Elegí una fecha de publicación.");
    if (current.minutos && !(Number.isInteger(Number(current.minutos)) && Number(current.minutos) >= 1 && Number(current.minutos) <= 120)) list.push("Los minutos de lectura van de 1 a 120.");
    if (current.tipo === "problema" && !current.causa.trim()) list.push("Las notas de problema necesitan la causa más probable.");
    if (!body.length) list.push("El cuerpo de la nota está vacío.");
    return list;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSubmitted(true);
    if (errors.length) return;
    savePost({
      id: draft.id || newId(),
      slug: draft.slug,
      tipo: draft.tipo,
      titulo: draft.titulo.trim(),
      bajada: draft.bajada.trim(),
      fecha: draft.fecha,
      minutos: draft.minutos ? Number(draft.minutos) : estimated,
      causa: draft.tipo === "problema" ? draft.causa.trim() : undefined,
      productoRecomendado: draft.productoRecomendado || undefined,
      cuerpo: paragraphs,
      publicado: draft.publicado,
      updatedAt: new Date().toISOString(),
    });
    setDraft(null);
  }

  function remove(post: Nota) {
    if (!confirm(`¿Eliminar la nota «${post.titulo}»? Esta acción no se puede deshacer.`)) return;
    removePost(post.id);
    if (draft?.id === post.id) setDraft(null);
  }

  return (
    <AdminPage eyebrow="Contenido" title="El diario de Crazy Lady" description="Alta, edición, publicación y baja de las notas del blog. Lo publicado aparece al instante en /notas y en el home." action={<button className="btn-primary" onClick={() => open(emptyDraft())}><Plus className="h-4 w-4" /> Nueva nota</button>}>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Publicadas" value={String(posts.filter((post) => post.publicado).length)} detail="Visibles en la tienda" icon={Eye} tone="sage" />
        <StatCard label="Borradores" value={String(posts.filter((post) => !post.publicado).length)} detail="Solo visibles en el panel" icon={NotebookPen} tone="honey" />
        <StatCard label="Guías de cultivo" value={String(posts.filter((post) => post.tipo === "guia").length)} detail="Aparecen también en el home" icon={BookOpen} />
        <StatCard label="Problema → solución" value={String(posts.filter((post) => post.tipo === "problema").length)} detail="Con causa y producto sugerido" icon={Bug} />
      </div>

      {draft && (
        <div ref={editorRef} className="mt-4 scroll-mt-24">
          <Panel title={draft.id ? "Editar nota" : "Nueva nota"} description={draft.id ? `Última versión guardada: /notas/${draft.originalSlug}` : "Se guarda como borrador hasta que marques «Publicada»."}>
            <form onSubmit={submit} noValidate className="grid gap-4 lg:grid-cols-2">
              <Field label="Título" className="lg:col-span-2"><input className={fieldClass} value={draft.titulo} maxLength={180} onChange={(event) => update({ titulo: event.target.value })} placeholder="Ej. Cómo saber cuándo cosechar" /></Field>
              <Field label="Slug (dirección de la nota)" hint={draft.id && draft.publicado && draft.slug !== draft.originalSlug ? "Cambiar el slug de una nota publicada rompe los enlaces que ya se compartieron." : `crazyladyseeds.com.ar/notas/${draft.slug || "…"}`} warn={Boolean(draft.id && draft.publicado && draft.slug !== draft.originalSlug)}>
                <input className={fieldClass} value={draft.slug} maxLength={120} onChange={(event) => update({ slug: slugify(event.target.value), slugTouched: true })} />
              </Field>
              <Field label="Tipo de nota"><select className={fieldClass} value={draft.tipo} onChange={(event) => update({ tipo: event.target.value as TipoNota })}>{TIPOS_NOTA.map((tipo) => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}</select></Field>
              <Field label="Fecha de publicación"><input type="date" className={fieldClass} value={draft.fecha} onChange={(event) => update({ fecha: event.target.value })} /></Field>
              <Field label="Minutos de lectura" hint={`Si lo dejás vacío se calcula solo: ${estimated} min.`}><input type="number" min={1} max={120} className={fieldClass} value={draft.minutos} onChange={(event) => update({ minutos: event.target.value })} placeholder={String(estimated)} /></Field>
              <Field label="Bajada" className="lg:col-span-2"><textarea rows={2} maxLength={300} className={`${fieldClass} resize-y py-3`} value={draft.bajada} onChange={(event) => update({ bajada: event.target.value })} placeholder="Una o dos líneas que resumen la nota." /></Field>
              {draft.tipo === "problema" && <Field label="Causa más probable" className="lg:col-span-2"><textarea rows={3} className={`${fieldClass} resize-y py-3`} value={draft.causa} onChange={(event) => update({ causa: event.target.value })} /></Field>}
              <Field label="Producto recomendado (opcional)" className="lg:col-span-2" hint="Muestra una ficha con botón para sumar al carrito al final de la nota."><select className={fieldClass} value={draft.productoRecomendado} onChange={(event) => update({ productoRecomendado: event.target.value })}><option value="">Sin producto recomendado</option>{recommendable.map((product) => <option key={product.id} value={product.slug}>{product.nombre} · {product.banco}{product.visible_web === false ? " (oculto)" : product.stock ? "" : " (sin stock)"}</option>)}</select></Field>
              <Field label="Cuerpo de la nota" className="lg:col-span-2" hint="Separá los párrafos con una línea en blanco. Escribí **así** para resaltar en negrita."><textarea rows={14} className={`${fieldClass} resize-y py-3 leading-relaxed`} value={draft.cuerpo} onChange={(event) => update({ cuerpo: event.target.value })} /></Field>

              {bannedWords.length > 0 && <p className="flex items-start gap-2 rounded-xl border border-cls-honey bg-cls-honey/25 p-3 text-xs text-cls-primary-dark lg:col-span-2"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-cls-orange" /><span>La nota usa palabras que Crazy Lady Seeds pidió evitar: <strong>{bannedWords.join(", ")}</strong>.</span></p>}

              {preview && (
                <article className="rounded-2xl border border-cls-line bg-cls-cream p-4 sm:p-6 lg:col-span-2" aria-label="Vista previa de la nota">
                  <p className="eyebrow">{formatFechaNota(draft.fecha)} · {draft.minutos || estimated} min de lectura</p>
                  <h2 className="display-title mt-2 text-3xl leading-tight">{draft.titulo || "Sin título"}</h2>
                  <p className="mt-3 text-sm text-cls-ink/94">{draft.bajada}</p>
                  {draft.tipo === "problema" && draft.causa.trim() && <p className="mt-4 rounded-xl border-l-4 border-cls-orange bg-cls-paper p-3 text-sm text-cls-ink/96"><strong className="block text-[10px] font-black uppercase tracking-[0.14em] text-cls-orange">Causa más probable</strong>{draft.causa}</p>}
                  <div className="mt-5 space-y-4">{paragraphs.length ? paragraphs.map((paragraph, index) => <NotaParagraph key={index} text={paragraph} compact />) : <p className="text-sm text-cls-ink/84">El cuerpo todavía está vacío.</p>}</div>
                </article>
              )}

              {submitted && errors.length > 0 && <ul className="space-y-1 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800 lg:col-span-2" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}

              <div className="flex flex-col gap-3 border-t border-cls-line pt-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
                <label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={draft.publicado} onChange={(event) => update({ publicado: event.target.checked })} /> Publicada en la tienda</label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-outline" onClick={() => setPreview((value) => !value)}>{preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{preview ? "Ocultar vista previa" : "Vista previa"}</button>
                  <button type="button" className="btn-outline" onClick={() => setDraft(null)}>Cancelar</button>
                  <button type="submit" className="btn-secondary"><Save className="h-4 w-4" /> Guardar nota</button>
                </div>
              </div>
            </form>
          </Panel>
        </div>
      )}

      <Panel title="Todas las notas" description={`${filtered.length} de ${posts.length} notas`} className="mt-4">
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_200px]">
          <label className="relative"><span className="sr-only">Buscar nota</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/82" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, slug o bajada" /></label>
          <label><span className="sr-only">Filtrar por estado</span><select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="todas">Todos los estados</option><option value="publicadas">Publicadas</option><option value="borradores">Borradores</option></select></label>
        </div>
        {filtered.length ? (
          <table className="admin-table">
            <thead><tr><th>Nota</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{filtered.map((post) => (
              <tr key={post.id}>
                <td data-label="Nota"><strong>{post.titulo}</strong><small>/notas/{post.slug}</small></td>
                <td data-label="Tipo">{post.tipo === "problema" ? "Problema → solución" : "Guía de cultivo"}</td>
                <td data-label="Fecha">{formatFechaNota(post.fecha)}</td>
                <td data-label="Estado"><StatusBadge tone={post.publicado ? "good" : "neutral"}>{post.publicado ? "Publicada" : "Borrador"}</StatusBadge></td>
                <td data-label="Acciones">
                  <div className="flex justify-end gap-1 sm:justify-start">
                    {post.publicado ? <Link to={`/notas/${post.slug}`} target="_blank" rel="noopener" className="flex h-11 w-11 items-center justify-center rounded-full border border-cls-line bg-cls-paper text-cls-primary" aria-label={`Ver «${post.titulo}» en la tienda`} title="Ver en la tienda"><ExternalLink className="h-4 w-4" /></Link> : null}
                    <IconButton label={post.publicado ? "Pasar a borrador" : "Publicar"} icon={post.publicado ? EyeOff : Eye} onClick={() => savePost({ ...post, publicado: !post.publicado })} />
                    <IconButton label="Editar" icon={Pencil} onClick={() => open(draftFromPost(post))} />
                    <IconButton label="Eliminar" icon={Trash2} danger onClick={() => remove(post)} />
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        ) : <EmptyState title={posts.length ? "No hay notas con esos filtros" : "Todavía no hay notas"} text={posts.length ? "Probá otra búsqueda o estado." : "Creá la primera nota del diario con «Nueva nota»."} />}
      </Panel>
    </AdminPage>
  );
}

function Field({ label, hint, warn = false, className = "", children }: { label: string; hint?: string; warn?: boolean; className?: string; children: React.ReactNode }) {
  return <label className={className}><span className={labelClass}>{label}</span>{children}{hint && <span className={`mt-1 block text-[10px] ${warn ? "font-bold text-cls-orange" : "text-cls-ink/86"}`}>{hint}</span>}</label>;
}

function IconButton({ label, onClick, icon: Icon, danger = false }: { label: string; onClick: () => void; icon: typeof Pencil; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex h-11 w-11 items-center justify-center rounded-full border border-cls-line bg-cls-paper ${danger ? "text-red-700" : "text-cls-primary"}`} aria-label={label} title={label}><Icon className="h-4 w-4" /></button>;
}
