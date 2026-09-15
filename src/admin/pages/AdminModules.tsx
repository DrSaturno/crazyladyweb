import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  FileClock,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminModules } from "../AdminModuleContext";
import { ADMIN_MODULES } from "../moduleRegistry";
import { BulkActionsBar, EmptyState, AdminPage, Pagination, Panel, StatCard, StatusBadge, fieldClass, labelClass } from "../components/AdminUI";
import { ProductImportPanel } from "./AdminProductImport";
import { downloadProductsWorkbook } from "../productImport";
import { FULFILLMENT_STATUS, ORDER_STATUS, PAYMENT_STATUS, useCommerceData } from "../../context/CommerceDataContext";
import { LOW_STOCK_THRESHOLD, precioARS, type Producto } from "../../data/catalogo";
import type { AdminCategory, AdminCustomer, ContentEntry, CrmStage } from "../../types/commerce";

const PAGE_SIZE = 20;

const dateTime = (value: string) => new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const newId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;

export function AdminDashboard() {
  const { products, orders, customers, inventory, abandonedCarts, returns, automations, automationRuns } = useCommerceData();
  const revenue = orders.filter((order) => order.paymentStatus === "pagado").reduce((sum, order) => sum + order.total, 0);
  const openOrders = orders.filter((order) => !["completado", "cancelado"].includes(order.status));
  const lowStock = products.filter((product) => product.visible_web !== false && product.stock <= LOW_STOCK_THRESHOLD);
  const stockUnits = products.reduce((sum, product) => sum + product.stock, 0);
  return <AdminPage eyebrow="Operación" title="Resumen del negocio" description="Una vista real de ventas, catálogo, clientes y alertas. Los indicadores parten de los datos cargados en esta instalación.">
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard label="Ventas cobradas" value={precioARS(revenue)} detail={`${orders.filter((order) => order.paymentStatus === "pagado").length} pedidos pagos`} icon={DollarSign} tone="sage" />
      <StatCard label="Pedidos abiertos" value={String(openOrders.length)} detail="Pendientes de seguimiento" icon={ClipboardList} tone="honey" />
      <StatCard label="Clientes" value={String(customers.length)} detail="Contactos únicos en CRM" icon={UsersRound} />
      <StatCard label="Unidades en stock" value={String(stockUnits)} detail={`${products.length} productos cargados`} icon={Boxes} />
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Pedidos recientes" description="Estado comercial y de pago">
        {orders.length ? <div className="space-y-2">{orders.slice(0, 6).map((order) => <Link key={order.id} to="/admin/ventas" className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-cls-line bg-cls-cream p-3 hover:border-cls-primary"><span className="min-w-0"><strong className="block truncate text-xs text-cls-primary-dark">{order.publicNumber} · {order.customer.nombre}</strong><span className="text-[10px] text-cls-ink/50">{dateTime(order.createdAt)}</span></span><span className="shrink-0 text-right"><strong className="block text-xs">{precioARS(order.total)}</strong><StatusBadge tone={order.paymentStatus === "pagado" ? "good" : "warn"}>{order.paymentStatus}</StatusBadge></span></Link>)}</div> : <EmptyState title="Todavía no hay pedidos" text="El primer checkout confirmado aparecerá acá y alimentará todas las métricas." />}
      </Panel>
      <Panel title="Atención requerida" description="Prioridades operativas del día">
        <div className="space-y-2">
          <AlertRow icon={AlertTriangle} label="Stock bajo" value={lowStock.length} href="/admin/inventario" tone="warn" />
          <AlertRow icon={ClipboardList} label="Pedidos abiertos" value={openOrders.length} href="/admin/ventas" />
          <AlertRow icon={ShoppingBag} label="Carritos por recuperar" value={abandonedCarts.filter((cart) => ["open", "contacted"].includes(cart.status)).length} href="/admin/carritos-abandonados" />
          <AlertRow icon={RefreshCw} label="Devoluciones abiertas" value={returns.filter((item) => !["resolved", "rejected"].includes(item.status)).length} href="/admin/devoluciones" />
        </div>
      </Panel>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-3"><Panel title="Operación de hoy" description="Atajos al flujo diario"><div className="grid gap-2"><Link className="btn-secondary justify-center" to="/admin/envios"><PackagePlus className="h-4 w-4" /> Preparar pedidos</Link><Link className="btn-outline justify-center" to="/admin/finanzas"><DollarSign className="h-4 w-4" /> Conciliar cobros</Link></div></Panel><Panel title="n8n" description="Estado del orquestador"><p className="text-3xl font-black text-cls-primary-dark">{automations.filter((workflow) => workflow.enabled).length}/{automations.length}</p><p className="mt-1 text-xs text-cls-ink/55">flujos activos · {automationRuns.filter((run) => run.status === "failed").length} ejecuciones fallidas</p><Link to="/admin/automatizaciones" className="mt-3 inline-flex min-h-11 items-center text-xs font-black text-cls-primary underline">Administrar automatizaciones</Link></Panel><Panel title="Trazabilidad" description="Actividad conservada"><p className="text-3xl font-black text-cls-primary-dark">{inventory.length}</p><p className="mt-1 text-xs text-cls-ink/55">movimientos de inventario registrados</p><Link to="/admin/auditoria" className="mt-3 inline-flex min-h-11 items-center text-xs font-black text-cls-primary underline"><FileClock className="mr-2 h-4 w-4" /> Ver auditoría</Link></Panel></div>
  </AdminPage>;
}

function AlertRow({ icon: Icon, label, value, href, tone }: { icon: typeof AlertTriangle; label: string; value: number; href: string; tone?: "warn" }) {
  return <Link to={href} className={`flex min-h-14 items-center gap-3 rounded-xl border p-3 ${tone && value ? "border-cls-honey bg-cls-honey/20" : "border-cls-line bg-cls-cream"}`}><Icon className="h-5 w-5 shrink-0 text-cls-primary" /><span className="flex-1 text-xs font-bold">{label}</span><strong className="text-lg">{value}</strong></Link>;
}

const EMPTY_PRODUCT: Producto = { id: "", slug: "", nombre: "", banco: "Crazy Lady Seeds", categoria: "semilla", origen: "nacional", tipo: "feminizada", genetica: "hibrida", precio: 0, stock: 0, presentacion: "x3", visible_web: false, destacado: false };

type StockFilter = "todos" | "con_stock" | "stock_bajo" | "sin_stock";
type PublishFilter = "todos" | "publicado" | "oculto";

export function AdminProducts() {
  const { products, categories, saveProduct, removeProduct, bulkUpdateProducts, bulkDeleteProducts } = useCommerceData();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [stockFilter, setStockFilter] = useState<StockFilter>("todos");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("todos");
  const [editing, setEditing] = useState<Producto | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);

  const filtered = products.filter((product) => {
    const matchesQuery = `${product.nombre} ${product.banco} ${product.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "todas" || product.categoria === categoryFilter;
    const matchesStock = stockFilter === "todos" || (stockFilter === "con_stock" && product.stock > LOW_STOCK_THRESHOLD) || (stockFilter === "stock_bajo" && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD) || (stockFilter === "sin_stock" && product.stock === 0);
    const matchesPublish = publishFilter === "todos" || (publishFilter === "publicado" && product.visible_web !== false) || (publishFilter === "oculto" && product.visible_web === false);
    return matchesQuery && matchesCategory && matchesStock && matchesPublish;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const categoryName = (id: string) => categories.find((category) => category.id === id)?.nombre ?? id;

  function resetFilters() {
    setQuery(""); setCategoryFilter("todas"); setStockFilter("todos"); setPublishFilter("todos"); setPage(1);
  }

  function toggleSelected(id: string) {
    setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function toggleSelectPage() {
    setSelected((current) => {
      const allSelected = paged.every((product) => current.has(product.id));
      const next = new Set(current);
      paged.forEach((product) => allSelected ? next.delete(product.id) : next.add(product.id));
      return next;
    });
  }

  function bulkDelete() {
    if (!selected.size || !confirm(`¿Eliminar ${selected.size} producto(s)? Esta acción no se puede deshacer.`)) return;
    bulkDeleteProducts([...selected]);
    setSelected(new Set());
  }

  function exportCatalog() {
    void downloadProductsWorkbook(filtered, categories);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing?.nombre.trim()) return;
    saveProduct({ ...editing, id: editing.id || newId("product"), slug: editing.slug || slugify(`${editing.nombre}-${editing.banco}`), precio: Number(editing.precio), stock: Number(editing.stock) });
    setEditing(null);
  }
  return <AdminPage eyebrow="Catálogo" title="Productos" description="Alta, edición, publicación y baja de todo lo que se vende en la tienda." action={<div className="flex flex-wrap gap-2"><button className="btn-outline" onClick={exportCatalog}><Download className="h-4 w-4" /> Exportar</button><button className="btn-outline" onClick={() => setShowImport((current) => !current)}><Upload className="h-4 w-4" /> Importar</button><button className="btn-primary" onClick={() => setEditing({ ...EMPTY_PRODUCT })}><Plus className="h-4 w-4" /> Nuevo producto</button></div>}>
    {showImport && <ProductImportPanel onClose={() => setShowImport(false)} />}
    {editing && <Panel title={editing.id ? "Editar producto" : "Nuevo producto"} className="mb-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Nombre"><input required className={fieldClass} value={editing.nombre} onChange={(event) => setEditing({ ...editing, nombre: event.target.value })} /></Field>
      <Field label="Banco"><input required className={fieldClass} value={editing.banco} onChange={(event) => setEditing({ ...editing, banco: event.target.value })} /></Field>
      <Field label="Categoría"><select className={fieldClass} value={editing.categoria} onChange={(event) => setEditing({ ...editing, categoria: event.target.value })}>{categories.filter((category) => category.activa).map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}</select></Field>
      <Field label="Presentación"><input required className={fieldClass} value={editing.presentacion} onChange={(event) => setEditing({ ...editing, presentacion: event.target.value })} /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Field label="Descripción"><textarea className={`${fieldClass} min-h-24 py-3`} value={editing.descripcion ?? ""} onChange={(event) => setEditing({ ...editing, descripcion: event.target.value })} /></Field></div>
      <Field label="Precio"><input required min="0" type="number" className={fieldClass} value={editing.precio} onChange={(event) => setEditing({ ...editing, precio: Number(event.target.value) })} /></Field>
      <Field label="Stock"><input required min="0" type="number" className={fieldClass} value={editing.stock} onChange={(event) => setEditing({ ...editing, stock: Number(event.target.value) })} /></Field>
      <Field label="Tipo"><select className={fieldClass} value={editing.tipo} onChange={(event) => setEditing({ ...editing, tipo: event.target.value as Producto["tipo"] })}><option value="feminizada">Feminizada</option><option value="automatica">Automática</option><option value="cbd">CBD</option></select></Field>
      <Field label="Genética"><select className={fieldClass} value={editing.genetica} onChange={(event) => setEditing({ ...editing, genetica: event.target.value as Producto["genetica"] })}><option value="indica">Índica</option><option value="sativa">Sativa</option><option value="hibrida">Híbrida</option></select></Field>
      <Field label="Imagen (URL)"><input type="url" className={fieldClass} value={editing.imagen ?? ""} onChange={(event) => setEditing({ ...editing, imagen: event.target.value || undefined })} placeholder="https://…" /></Field>
      <Field label="Fotoperiodo"><input className={fieldClass} value={editing.fotoperiodo ?? ""} onChange={(event) => setEditing({ ...editing, fotoperiodo: event.target.value })} /></Field>
      <Field label="Ambiente"><input className={fieldClass} value={editing.ambiente ?? ""} onChange={(event) => setEditing({ ...editing, ambiente: event.target.value })} placeholder="Interior / exterior" /></Field>
      <Field label="Dificultad"><input className={fieldClass} value={editing.dificultad ?? ""} onChange={(event) => setEditing({ ...editing, dificultad: event.target.value })} /></Field>
      <Field label="Ciclo (semanas)"><input min="1" type="number" className={fieldClass} value={editing.ciclo_semanas ?? ""} onChange={(event) => setEditing({ ...editing, ciclo_semanas: event.target.value ? Number(event.target.value) : undefined })} /></Field>
      <Field label="THC"><input className={fieldClass} value={editing.thc ?? ""} onChange={(event) => setEditing({ ...editing, thc: event.target.value })} placeholder="Ej. 18–22%" /></Field>
      <Field label="CBD"><input className={fieldClass} value={editing.cbd ?? ""} onChange={(event) => setEditing({ ...editing, cbd: event.target.value })} placeholder="Ej. &lt;1%" /></Field>
      <label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={editing.visible_web !== false} onChange={(event) => setEditing({ ...editing, visible_web: event.target.checked })} /> Publicado en la tienda</label>
      <label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={Boolean(editing.destacado)} onChange={(event) => setEditing({ ...editing, destacado: event.target.checked })} /> Producto destacado</label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button className="btn-secondary" type="submit"><Save className="h-4 w-4" /> Guardar</button><button className="btn-outline" type="button" onClick={() => setEditing(null)}>Cancelar</button></div>
    </form></Panel>}
    <Panel title="Catálogo maestro" description={`${filtered.length} de ${products.length} productos`}>
      <div className="mb-4 space-y-2">
        <label className="relative block"><span className="sr-only">Buscar</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por producto, banco o SKU" /></label>
        <div className="flex flex-wrap gap-2">
          <label className="min-w-[160px] flex-1"><span className="sr-only">Categoría</span><select className={fieldClass} value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}><option value="todas">Todas las categorías</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}</select></label>
          <label className="min-w-[150px] flex-1"><span className="sr-only">Stock</span><select className={fieldClass} value={stockFilter} onChange={(event) => { setStockFilter(event.target.value as StockFilter); setPage(1); }}><option value="todos">Cualquier stock</option><option value="con_stock">Con stock</option><option value="stock_bajo">{`Stock bajo (≤${LOW_STOCK_THRESHOLD})`}</option><option value="sin_stock">Sin stock</option></select></label>
          <label className="min-w-[170px] flex-1"><span className="sr-only">Publicación</span><select className={fieldClass} value={publishFilter} onChange={(event) => { setPublishFilter(event.target.value as PublishFilter); setPage(1); }}><option value="todos">Publicado y oculto</option><option value="publicado">Solo publicados</option><option value="oculto">Solo ocultos</option></select></label>
          <button type="button" className="btn-outline min-h-11 shrink-0" onClick={resetFilters}>Limpiar filtros</button>
        </div>
      </div>

      <BulkActionsBar count={selected.size} onClear={() => setSelected(new Set())}>
        <button type="button" className="btn-outline min-h-9 px-3 py-1 text-xs" onClick={() => bulkUpdateProducts([...selected], { visible_web: true })}><Eye className="h-3.5 w-3.5" /> Publicar</button>
        <button type="button" className="btn-outline min-h-9 px-3 py-1 text-xs" onClick={() => bulkUpdateProducts([...selected], { visible_web: false })}><EyeOff className="h-3.5 w-3.5" /> Ocultar</button>
        <button type="button" className="btn-outline min-h-9 px-3 py-1 text-xs" onClick={() => bulkUpdateProducts([...selected], { destacado: true })}>Destacar</button>
        <button type="button" className="btn-outline min-h-9 px-3 py-1 text-xs" onClick={() => bulkUpdateProducts([...selected], { destacado: false })}>Quitar destacado</button>
        <button type="button" className="btn-outline min-h-9 px-3 py-1 text-xs text-red-700" onClick={bulkDelete}><Trash2 className="h-3.5 w-3.5" /> Eliminar</button>
      </BulkActionsBar>

      {paged.length ? <>
      <button type="button" className="mb-2 text-xs font-bold text-cls-primary hover:text-cls-orange sm:hidden" onClick={toggleSelectPage}>{paged.every((product) => selected.has(product.id)) ? "Deseleccionar todos los de esta página" : "Seleccionar todos los de esta página"}</button>
      <table className="admin-table"><thead><tr><th className="w-10"><input type="checkbox" aria-label="Seleccionar todos los de esta página" checked={paged.length > 0 && paged.every((product) => selected.has(product.id))} onChange={toggleSelectPage} /></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Web</th><th>Acciones</th></tr></thead><tbody>{paged.map((product) => <tr key={product.id}><td data-label="Sel."><input type="checkbox" aria-label={`Seleccionar ${product.nombre}`} checked={selected.has(product.id)} onChange={() => toggleSelected(product.id)} /></td><td data-label="Producto"><strong>{product.nombre}</strong><small>{product.banco} · {product.presentacion}</small></td><td data-label="Categoría">{categoryName(product.categoria)}</td><td data-label="Precio">{precioARS(product.precio)}</td><td data-label="Stock"><StatusBadge tone={product.stock === 0 ? "bad" : product.stock <= LOW_STOCK_THRESHOLD ? "warn" : "good"}>{product.stock} u.</StatusBadge></td><td data-label="Web">{product.visible_web !== false ? <Eye className="h-4 w-4 text-cls-primary" aria-label="Publicado" /> : <EyeOff className="h-4 w-4 text-cls-ink/35" aria-label="Oculto" />}</td><td data-label="Acciones"><div className="flex justify-end gap-1 sm:justify-start"><IconButton label="Editar" onClick={() => setEditing({ ...product })} icon={Pencil} /><IconButton label="Eliminar" onClick={() => { if (confirm(`¿Eliminar ${product.nombre}?`)) removeProduct(product.id); }} icon={Trash2} danger /></div></td></tr>)}</tbody></table>
      </> : <EmptyState title="No hay productos con esos filtros" text={products.length ? "Probá otra búsqueda o limpiá los filtros." : "Todavía no hay productos cargados."} />}
      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
    </Panel>
  </AdminPage>;
}

export function AdminCategories() {
  const { categories: storedCategories, products, saveCategory, removeCategory } = useCommerceData();
  const categories = [...storedCategories];
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  function fresh(): AdminCategory { const stamp = new Date().toISOString(); return { id: "", slug: "", nombre: "", descripcion: "", activa: true, orden: categories.length + 1, createdAt: stamp, updatedAt: stamp }; }
  function submit(event: React.FormEvent) { event.preventDefault(); if (!editing) return; const id = editing.id || slugify(editing.nombre); saveCategory({ ...editing, id, slug: editing.slug || slugify(editing.nombre) }); setEditing(null); }
  return <AdminPage eyebrow="Catálogo" title="Categorías" description="Organizá el catálogo sin modificar el código. No se puede borrar una categoría que todavía tiene productos." action={<button className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Nueva categoría</button>}>
    {editing && <Panel title={editing.id ? "Editar categoría" : "Nueva categoría"} className="mb-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><Field label="Nombre"><input required className={fieldClass} value={editing.nombre} onChange={(event) => setEditing({ ...editing, nombre: event.target.value })} /></Field><Field label="Descripción"><input className={fieldClass} value={editing.descripcion} onChange={(event) => setEditing({ ...editing, descripcion: event.target.value })} /></Field><Field label="Orden"><input min="1" type="number" className={fieldClass} value={editing.orden} onChange={(event) => setEditing({ ...editing, orden: Number(event.target.value) })} /></Field><label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={editing.activa} onChange={(event) => setEditing({ ...editing, activa: event.target.checked })} /> Categoría activa</label><div className="flex gap-2 sm:col-span-2"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button></div></form></Panel>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{categories.sort((a, b) => a.orden - b.orden).map((category) => { const count = products.filter((product) => product.categoria === category.id).length; return <article key={category.id} className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper"><div className="flex items-start justify-between gap-3"><div><StatusBadge tone={category.activa ? "good" : "neutral"}>{category.activa ? "Activa" : "Pausada"}</StatusBadge><h2 className="mt-3 text-2xl font-black">{category.nombre}</h2><p className="mt-1 text-xs text-cls-ink/55">{category.descripcion}</p></div><strong className="rounded-full bg-cls-cream px-3 py-2 text-xs">{count} productos</strong></div><div className="mt-4 flex gap-2"><button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...category })}><Pencil className="h-3.5 w-3.5" /> Editar</button><button disabled={count > 0} className="btn-outline min-h-11 px-3 py-1 text-xs text-red-700 disabled:opacity-35" onClick={() => removeCategory(category.id)}><Trash2 className="h-3.5 w-3.5" /> Borrar</button></div></article>; })}</div>
  </AdminPage>;
}

export function AdminOrders() {
  const { orders, updateOrder } = useCommerceData();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [status, setStatus] = useState("todos");
  const [selectedId, setSelectedId] = useState("");
  const selected = orders.find((order) => order.id === selectedId);
  const filtered = orders.filter((order) => (status === "todos" || order.status === status) && `${order.publicNumber} ${order.customer.nombre} ${order.customer.email}`.toLowerCase().includes(query.toLowerCase()));
  return <AdminPage eyebrow="Ventas" title="Pedidos y cobros" description="Una bandeja accionable para cobrar, preparar, despachar y resolver cada pedido con historial completo.">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel title="Todas las ventas" description={`${filtered.length} de ${orders.length} pedidos`}>
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_190px]"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido, cliente o email" /></div><select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="todos">Todos los estados</option>{ORDER_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        {filtered.length ? <div className="space-y-2">{filtered.map((order) => <button type="button" key={order.id} onClick={() => setSelectedId(order.id)} className={`grid w-full gap-3 rounded-2xl border p-4 text-left sm:grid-cols-[1fr_1fr_auto] sm:items-center ${selectedId === order.id ? "border-cls-primary bg-cls-sage/40" : "border-cls-line bg-cls-cream hover:border-cls-primary"}`}><span className="min-w-0"><strong className="block text-sm text-cls-primary-dark">{order.publicNumber}</strong><span className="text-[10px] text-cls-ink/50">{dateTime(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.cantidad, 0)} unidades</span></span><span className="min-w-0"><strong className="block truncate text-xs">{order.customer.nombre}</strong><span className="mt-1 flex flex-wrap gap-1"><StatusBadge tone={order.paymentStatus === "pagado" ? "good" : "warn"}>{order.paymentStatus}</StatusBadge><StatusBadge>{order.fulfillmentStatus}</StatusBadge></span></span><strong className="text-lg text-cls-primary-dark">{precioARS(order.total)}</strong></button>)}</div> : <EmptyState title="No hay pedidos con esos filtros" text={orders.length ? "Probá otra búsqueda o estado." : "Los pedidos creados desde el checkout aparecerán acá."} />}
      </Panel>
      {selected ? <Panel title={selected.publicNumber} description={`${selected.customer.nombre} · ${selected.customer.email}`} className="xl:sticky xl:top-24 xl:self-start">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><Field label="Estado comercial"><select className={fieldClass} value={selected.status} onChange={(event) => updateOrder(selected.id, { status: event.target.value as typeof selected.status })}>{ORDER_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Pago"><select className={fieldClass} value={selected.paymentStatus} onChange={(event) => updateOrder(selected.id, { paymentStatus: event.target.value as typeof selected.paymentStatus })}>{PAYMENT_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Preparación"><select className={fieldClass} value={selected.fulfillmentStatus} onChange={(event) => updateOrder(selected.id, { fulfillmentStatus: event.target.value as typeof selected.fulfillmentStatus })}>{FULFILLMENT_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field></div>
        <div className="mt-4 rounded-xl bg-cls-cream p-3"><h3 className="text-xs font-black">Productos</h3><ul className="mt-2 space-y-2">{selected.items.map((item) => <li key={item.productId} className="flex justify-between gap-3 text-xs"><span>{item.cantidad} × {item.nombre}</span><strong>{precioARS(item.cantidad * item.precioUnitario)}</strong></li>)}</ul><dl className="mt-3 space-y-1 border-t border-cls-line pt-3 text-xs"><div className="flex justify-between"><dt>Subtotal</dt><dd>{precioARS(selected.subtotal)}</dd></div>{selected.discountCode ? <div className="flex justify-between text-cls-primary"><dt>Promoción {selected.discountCode}</dt><dd>− {precioARS(selected.promotionDiscount)}</dd></div> : null}{selected.transferDiscount > 0 ? <div className="flex justify-between text-cls-primary"><dt>Transferencia</dt><dd>− {precioARS(selected.transferDiscount)}</dd></div> : null}<div className="flex justify-between"><dt>Envío</dt><dd>{selected.envio > 0 ? precioARS(selected.envio) : "Gratis"}</dd></div><div className="flex justify-between pt-2 text-sm"><dt className="font-black">Total</dt><dd className="font-black">{precioARS(selected.total)}</dd></div></dl></div>
        <p className="mt-3 text-xs leading-relaxed text-cls-ink/60"><strong className="block text-cls-primary-dark">Entrega</strong>{selected.customer.direccion}, {selected.customer.localidad}, {selected.customer.provincia} ({selected.customer.codigoPostal})</p>
        <div className="mt-4"><Field label="Nota interna"><textarea key={selected.id} defaultValue={selected.internalNotes} onBlur={(event) => updateOrder(selected.id, { internalNotes: event.target.value })} className={`${fieldClass} min-h-20 py-3`} placeholder="Visible solo para el equipo" /></Field></div>
        <div className="mt-4"><h3 className="text-xs font-black">Línea de tiempo</h3><ol className="mt-2 space-y-2">{selected.timeline.map((event) => <li key={event.id} className="flex gap-3 text-xs"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cls-orange" /><span><strong className="block">{event.label}</strong><small className="text-cls-ink/45">{dateTime(event.createdAt)}</small></span></li>)}</ol></div>
        <Link to="/admin/envios" className="btn-secondary mt-4 justify-center">Abrir preparación y envío</Link>
      </Panel> : <Panel title="Ficha del pedido" description="Seleccioná una venta"><EmptyState title="Elegí un pedido" text="Acá vas a ver productos, cliente, estados, notas y trazabilidad." /></Panel>}
    </div>
  </AdminPage>;
}

const STAGES: { value: CrmStage; label: string }[] = [{ value: "nuevo", label: "Nuevo" }, { value: "contactado", label: "Contactado" }, { value: "interesado", label: "Interesado" }, { value: "cliente", label: "Cliente" }, { value: "inactivo", label: "Inactivo" }];

export function AdminCustomers() {
  const { customers, saveCustomer, updateCustomer } = useCommerceData();
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [stageFilter, setStageFilter] = useState<CrmStage | "todos">("todos");
  const fresh = (): AdminCustomer => ({ id: newId("customer"), nombre: "", email: "", telefono: "", stage: "nuevo", tags: [], notas: "", totalPedidos: 0, gastoTotal: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  function submit(event: React.FormEvent) { event.preventDefault(); if (editing) { saveCustomer(editing); setEditing(null); } }
  const filtered = customers.filter((customer) => (stageFilter === "todos" || customer.stage === stageFilter) && `${customer.nombre} ${customer.email} ${customer.telefono}`.toLowerCase().includes(query.toLowerCase()));
  return <AdminPage eyebrow="Relación" title="Clientes y CRM" description="Centralizá contactos, etapa comercial, etiquetas, notas y valor de cada cliente." action={<button className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Nuevo contacto</button>}>
    {editing && <Panel title="Ficha de contacto" className="mb-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><Field label="Nombre"><input required className={fieldClass} value={editing.nombre} onChange={(event) => setEditing({ ...editing, nombre: event.target.value })} /></Field><Field label="Email"><input required type="email" className={fieldClass} value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></Field><Field label="Teléfono"><input className={fieldClass} value={editing.telefono} onChange={(event) => setEditing({ ...editing, telefono: event.target.value })} /></Field><Field label="Etapa"><select className={fieldClass} value={editing.stage} onChange={(event) => setEditing({ ...editing, stage: event.target.value as CrmStage })}>{STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></Field><Field label="Etiquetas (separadas por coma)"><input className={fieldClass} value={editing.tags.join(", ")} onChange={(event) => setEditing({ ...editing, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></Field><Field label="Notas"><textarea className={`${fieldClass} min-h-24 py-3`} value={editing.notas} onChange={(event) => setEditing({ ...editing, notas: event.target.value })} /></Field><div className="flex gap-2 sm:col-span-2"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button></div></form></Panel>}
    {customers.length > 0 && <div className="mb-4 flex flex-wrap gap-2">
      <label className="relative min-w-[220px] flex-1"><span className="sr-only">Buscar cliente</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, email o teléfono…" /></label>
      <label className="min-w-[160px] flex-1"><span className="sr-only">Etapa</span><select className={fieldClass} value={stageFilter} onChange={(event) => setStageFilter(event.target.value as CrmStage | "todos")}><option value="todos">Todas las etapas</option>{STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label>
    </div>}
    {filtered.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((customer) => <article key={customer.id} className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-sans text-sm font-black">{customer.nombre}</h2><p className="truncate text-xs text-cls-ink/55">{customer.email}</p></div><select aria-label={`Etapa de ${customer.nombre}`} className="rounded-full border border-cls-line bg-cls-cream px-2 py-1 text-[10px] font-bold" value={customer.stage} onChange={(event) => updateCustomer(customer.id, { stage: event.target.value as CrmStage })}>{STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></div><dl className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-cls-cream p-3"><dt className="text-cls-ink/50">Pedidos</dt><dd className="mt-1 font-black">{customer.totalPedidos}</dd></div><div className="rounded-xl bg-cls-cream p-3"><dt className="text-cls-ink/50">Valor</dt><dd className="mt-1 font-black">{precioARS(customer.gastoTotal)}</dd></div></dl><p className="mt-3 line-clamp-2 min-h-8 text-xs text-cls-ink/60">{customer.notas || "Sin notas de seguimiento."}</p><button className="btn-outline mt-3 min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...customer })}><Pencil className="h-3.5 w-3.5" /> Abrir ficha</button></article>)}</div> : <Panel title="Base de clientes"><EmptyState title={customers.length ? "Sin resultados" : "Tu CRM está listo"} text={customers.length ? "Probá otra búsqueda o etapa." : "Podés cargar un contacto manualmente o dejar que el checkout cree su ficha automáticamente."} /></Panel>}
  </AdminPage>;
}

export function AdminInventory() {
  const { products, inventory, adjustStock } = useCommerceData();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [delta, setDelta] = useState(1);
  const [reason, setReason] = useState("");
  function submit(event: React.FormEvent) { event.preventDefault(); if (!productId || !reason.trim() || !delta) return; adjustStock(productId, delta, reason.trim()); setReason(""); setDelta(1); }
  return <AdminPage eyebrow="Operación" title="Inventario" description="Cada entrada o salida deja un movimiento trazable. El stock público se actualiza en el momento.">
    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <Panel title="Registrar ajuste" description="Usá números negativos para salidas"><form onSubmit={submit} className="space-y-3"><Field label="Producto"><select className={fieldClass} value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((product) => <option key={product.id} value={product.id}>{product.nombre} ({product.stock})</option>)}</select></Field><Field label="Cantidad"><input required type="number" className={fieldClass} value={delta} onChange={(event) => setDelta(Number(event.target.value))} /></Field><Field label="Motivo"><input required className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ingreso proveedor, merma, corrección…" /></Field><button className="btn-secondary w-full"><PackagePlus className="h-4 w-4" /> Aplicar movimiento</button></form></Panel>
      <Panel title="Movimientos recientes" description="Historial de entradas y salidas">{inventory.length ? <div className="space-y-2">{inventory.slice(0, 30).map((movement) => <div key={movement.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-cls-line bg-cls-cream p-3">{movement.delta > 0 ? <ArrowUp className="h-5 w-5 shrink-0 text-cls-primary" /> : <ArrowDown className="h-5 w-5 shrink-0 text-cls-orange" />}<span className="min-w-0 flex-1"><strong className="block truncate text-xs">{movement.productName}</strong><span className="block truncate text-[10px] text-cls-ink/50">{movement.reason} · {dateTime(movement.createdAt)}</span></span><strong className={movement.delta > 0 ? "text-cls-primary" : "text-cls-orange"}>{movement.delta > 0 ? "+" : ""}{movement.delta}</strong></div>)}</div> : <EmptyState title="Sin movimientos manuales" text="Las ventas y los ajustes de stock quedarán registrados en este historial." />}</Panel>
    </div>
  </AdminPage>;
}

export function AdminMetrics() {
  const { orders, products, customers } = useCommerceData();
  const paid = orders.filter((order) => order.paymentStatus === "pagado");
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const average = paid.length ? revenue / paid.length : 0;
  const soldByProduct = new Map<string, number>();
  orders.filter((order) => order.status !== "cancelado").forEach((order) => order.items.forEach((item) => soldByProduct.set(item.nombre, (soldByProduct.get(item.nombre) ?? 0) + item.cantidad)));
  const top = [...soldByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(1, ...top.map((item) => item[1]));
  return <AdminPage eyebrow="Análisis" title="Métricas" description="Indicadores calculados desde ventas reales; sin muestras ficticias ni datos de prueba ocultos.">
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Ingresos cobrados" value={precioARS(revenue)} detail="Pedidos con pago acreditado" icon={TrendingUp} tone="sage" /><StatCard label="Ticket promedio" value={precioARS(average)} detail="Sobre ventas cobradas" icon={BarChart3} /><StatCard label="Conversión a pago" value={`${orders.length ? Math.round(paid.length / orders.length * 100) : 0}%`} detail={`${paid.length} de ${orders.length} pedidos`} icon={CheckCircle2} tone="honey" /><StatCard label="Clientes recurrentes" value={String(customers.filter((customer) => customer.totalPedidos > 1).length)} detail="Con más de una compra" icon={UsersRound} /></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2"><Panel title="Productos vendidos" description="Unidades por producto">{top.length ? <div className="space-y-3">{top.map(([name, quantity]) => <div key={name}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate font-bold">{name}</span><strong>{quantity}</strong></div><div className="h-2 overflow-hidden rounded-full bg-cls-cream"><span className="block h-full rounded-full bg-cls-primary" style={{ width: `${quantity / max * 100}%` }} /></div></div>)}</div> : <EmptyState title="Sin ventas para graficar" text="El ranking se activa cuando existan pedidos confirmados." />}</Panel><Panel title="Salud del catálogo"><div className="space-y-3"><MetricLine label="Publicados" value={products.filter((product) => product.visible_web !== false).length} total={products.length} /><MetricLine label="Con stock" value={products.filter((product) => product.stock > 0).length} total={products.length} /><MetricLine label="Destacados" value={products.filter((product) => product.destacado).length} total={products.length} /></div></Panel></div>
  </AdminPage>;
}

function MetricLine({ label, value, total }: { label: string; value: number; total: number }) { return <div className="rounded-xl bg-cls-cream p-3"><div className="flex justify-between text-xs"><span className="font-bold">{label}</span><strong>{value} / {total}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-cls-line"><span className="block h-full bg-cls-orange" style={{ width: `${total ? value / total * 100 : 0}%` }} /></div></div>; }

export function AdminContent() {
  const { content, saveContent } = useCommerceData();
  const [editing, setEditing] = useState<ContentEntry | null>(null);
  function submit(event: React.FormEvent) { event.preventDefault(); if (editing) { saveContent(editing); setEditing(null); } }
  return <AdminPage eyebrow="Contenido" title="Contenidos de la tienda" description="Gestioná preguntas frecuentes, banners y páginas informativas desde un módulo separado." action={<button className="btn-primary" onClick={() => setEditing({ id: newId("content"), tipo: "faq", titulo: "", contenido: "", publicado: false, updatedAt: new Date().toISOString() })}><Plus className="h-4 w-4" /> Nuevo contenido</button>}>
    {editing && <Panel title="Editor" className="mb-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><Field label="Tipo"><select className={fieldClass} value={editing.tipo} onChange={(event) => setEditing({ ...editing, tipo: event.target.value as ContentEntry["tipo"] })}><option value="faq">Pregunta frecuente</option><option value="banner">Banner</option><option value="pagina">Página</option></select></Field><Field label="Título"><input required className={fieldClass} value={editing.titulo} onChange={(event) => setEditing({ ...editing, titulo: event.target.value })} /></Field><div className="sm:col-span-2"><Field label="Contenido"><textarea required className={`${fieldClass} min-h-28 py-3`} value={editing.contenido} onChange={(event) => setEditing({ ...editing, contenido: event.target.value })} /></Field></div><label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={editing.publicado} onChange={(event) => setEditing({ ...editing, publicado: event.target.checked })} /> Publicado</label><div className="flex gap-2 sm:col-span-2"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button></div></form></Panel>}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{content.map((entry) => <article key={entry.id} className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper"><div className="flex items-center justify-between gap-2"><StatusBadge tone={entry.publicado ? "good" : "neutral"}>{entry.publicado ? "Publicado" : "Borrador"}</StatusBadge><span className="text-[10px] font-bold uppercase text-cls-ink/45">{entry.tipo}</span></div><h2 className="mt-3 font-sans text-sm font-black">{entry.titulo}</h2><p className="mt-2 line-clamp-3 min-h-12 text-xs text-cls-ink/60">{entry.contenido}</p><button className="btn-outline mt-3 min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...entry })}><Pencil className="h-3.5 w-3.5" /> Editar</button></article>)}</div>
  </AdminPage>;
}

export function AdminSettings() {
  const { settings, updateSettings, resetDemoData } = useCommerceData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  function submit(event: React.FormEvent) { event.preventDefault(); updateSettings(form); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  return <AdminPage eyebrow="Sistema" title="Configuración comercial" description="Datos generales, reglas de compra, descuentos y preparación de integraciones.">
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-2"><Panel title="Datos de la tienda"><div className="space-y-3"><Field label="Nombre comercial"><input className={fieldClass} value={form.nombreTienda} onChange={(event) => setForm({ ...form, nombreTienda: event.target.value })} /></Field><Field label="Email"><input type="email" className={fieldClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field><Field label="WhatsApp"><input className={fieldClass} value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></Field></div></Panel><Panel title="Compra y logística"><div className="space-y-3"><Field label="Descuento por transferencia (%)"><input min="0" max="100" type="number" className={fieldClass} value={form.descuentoTransferencia} onChange={(event) => setForm({ ...form, descuentoTransferencia: Number(event.target.value) })} /></Field><Field label="Envío base"><input min="0" type="number" className={fieldClass} value={form.envioBase} onChange={(event) => setForm({ ...form, envioBase: Number(event.target.value) })} /></Field><label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.compraInvitado} onChange={(event) => setForm({ ...form, compraInvitado: event.target.checked })} /> Permitir compra como invitado</label><label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.mercadoPagoActivo} onChange={(event) => setForm({ ...form, mercadoPagoActivo: event.target.checked })} /> Mostrar Mercado Pago cuando esté autorizado</label></div></Panel><div className="flex flex-wrap gap-2 xl:col-span-2"><button className="btn-secondary"><Save className="h-4 w-4" /> {saved ? "Guardado" : "Guardar configuración"}</button><button type="button" className="btn-outline text-red-700" onClick={() => { if (confirm("¿Restablecer catálogo, pedidos y configuración local?")) resetDemoData(); }}><RefreshCw className="h-4 w-4" /> Restablecer datos locales</button></div></form>
    <Panel title="Estado de integraciones" description="Requisitos antes del lanzamiento productivo" className="mt-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Integration label="Supabase" text="Esquema preparado; falta proyecto/credenciales." /><Integration label="Pagos" text="Proveedor y cuenta comercial a aprobar." /><Integration label="Envíos" text="Tarifario y credenciales de Andreani." /><Integration label="Email" text="Dominio y remitente transaccional." /></div></Panel>
  </AdminPage>;
}

function Integration({ label, text }: { label: string; text: string }) { return <div className="rounded-xl border border-cls-line bg-cls-cream p-3"><StatusBadge tone="warn">Pendiente</StatusBadge><h3 className="mt-2 font-sans text-xs font-black">{label}</h3><p className="mt-1 text-[11px] text-cls-ink/55">{text}</p></div>; }

export function AdminAudit() {
  const { audit } = useCommerceData();
  function exportCsv() { const rows = [["fecha", "actor", "entidad", "id", "accion", "detalle"], ...audit.map((entry) => [entry.createdAt, entry.actor, entry.entity, entry.entityId, entry.action, entry.detail])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "auditoria-crazy-lady.csv"; anchor.click(); URL.revokeObjectURL(url); }
  return <AdminPage eyebrow="Trazabilidad" title="Registro de auditoría" description="Historial cronológico de cambios realizados desde el tablero." action={<button className="btn-outline" onClick={exportCsv} disabled={!audit.length}><Download className="h-4 w-4" /> Exportar CSV</button>}><Panel title="Actividad" description={`${audit.length} eventos registrados`}>{audit.length ? <table className="admin-table"><thead><tr><th>Fecha</th><th>Actor</th><th>Entidad</th><th>Acción</th><th>Detalle</th></tr></thead><tbody>{audit.map((entry) => <tr key={entry.id}><td data-label="Fecha">{dateTime(entry.createdAt)}</td><td data-label="Actor">{entry.actor}</td><td data-label="Entidad">{entry.entity}</td><td data-label="Acción"><StatusBadge>{entry.action}</StatusBadge></td><td data-label="Detalle">{entry.detail}</td></tr>)}</tbody></table> : <EmptyState title="Sin cambios todavía" text="Altas, ediciones, ventas y ajustes de inventario se registrarán automáticamente." />}</Panel></AdminPage>;
}

export function AdminModuleManager() {
  const { enabled, toggle, reset } = useAdminModules();
  return <AdminPage eyebrow="Arquitectura modular" title="Módulos del tablero" description="Activá o quitá áreas según la operación. Los módulos esenciales permanecen protegidos para no dejar el panel inutilizable." action={<button className="btn-outline" onClick={reset}><RefreshCw className="h-4 w-4" /> Restaurar</button>}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{ADMIN_MODULES.map(({ id, label, description, group, icon: Icon, locked }) => { const active = enabled.includes(id); return <article key={id} className={`rounded-2xl border p-4 shadow-paper ${active ? "border-cls-primary bg-cls-paper" : "border-cls-line bg-cls-cream opacity-75"}`}><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-cls-primary text-cls-paper" : "bg-cls-line text-cls-ink/45"}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-widest text-cls-ink/45">{group}</p><h2 className="mt-1 font-sans text-sm font-black">{label}</h2><p className="mt-1 text-xs leading-relaxed text-cls-ink/55">{description}</p></div></div><div className="mt-4 flex items-center justify-between border-t border-cls-line pt-3"><span className="text-[10px] font-bold text-cls-ink/50">{locked ? "Módulo esencial" : active ? "Visible en el menú" : "Módulo desactivado"}</span><button type="button" role="switch" aria-checked={active} disabled={locked} onClick={() => toggle(id)} className="relative h-11 w-12 rounded-full disabled:opacity-55" aria-label={`${active ? "Desactivar" : "Activar"} ${label}`}><span className={`absolute inset-x-0 top-2 h-7 rounded-full transition ${active ? "bg-cls-primary" : "bg-cls-line"}`} /><span className={`absolute top-3 h-5 w-5 rounded-full bg-cls-paper shadow transition ${active ? "left-6" : "left-1"}`} /></button></div></article>; })}</div></AdminPage>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={labelClass}>{label}</span>{children}</label>; }
function IconButton({ label, onClick, icon: Icon, danger }: { label: string; onClick: () => void; icon: typeof Pencil; danger?: boolean }) { return <button type="button" onClick={onClick} className={`flex h-11 w-11 items-center justify-center rounded-full border border-cls-line bg-cls-paper ${danger ? "text-red-700" : "text-cls-primary"}`} aria-label={label} title={label}><Icon className="h-4 w-4" /></button>; }
