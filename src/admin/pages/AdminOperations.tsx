import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Link2,
  Megaphone,
  PackageCheck,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  UsersRound,
  WalletCards,
  Workflow,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FULFILLMENT_STATUS, useCommerceData } from "../../context/CommerceDataContext";
import { precioARS } from "../../data/catalogo";
import type {
  AbandonedCart,
  AutomationRun,
  AutomationWorkflow,
  DiscountRule,
  MarketingCampaign,
  ReturnCase,
  StaffMember,
} from "../../types/commerce";
import { AdminPage, EmptyState, Pagination, Panel, StatCard, StatusBadge, fieldClass, labelClass } from "../components/AdminUI";
import { ADMIN_MODULES } from "../moduleRegistry";

const PAGE_SIZE = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stamp = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
const dateTime = (value: string) => new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const dateOnly = (value?: string) => value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00`)) : "Sin vencimiento";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label><span className={labelClass}>{label}</span>{children}{hint && <span className="mt-1 block text-[10px] text-cls-ink/50">{hint}</span>}</label>;
}

function WorkflowSteps({ steps, current }: { steps: string[]; current: number }) {
  return <ol className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr" aria-label="Progreso"><>{steps.map((step, index) => <li key={step} className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-[10px] font-black ${index < current ? "border-cls-primary bg-cls-sage/70 text-cls-primary-dark" : index === current ? "border-cls-honey bg-cls-honey/25 text-cls-primary-dark" : "border-cls-line bg-cls-cream text-cls-ink/45"}`}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current">{index < current ? "✓" : index + 1}</span>{step}</li>)}</></ol>;
}

export function AdminFulfillment() {
  const { orders, updateOrder } = useCommerceData();
  const [query, setQuery] = useState("");
  const fullQueue = orders.filter((order) => !["cancelado", "completado"].includes(order.status));
  const queue = fullQueue.filter((order) => `${order.publicNumber} ${order.customer.nombre}`.toLowerCase().includes(query.toLowerCase()));
  const [selectedId, setSelectedId] = useState(queue[0]?.id ?? orders[0]?.id ?? "");
  const selected = orders.find((order) => order.id === selectedId) ?? queue[0] ?? orders[0];
  const [carrier, setCarrier] = useState(selected?.carrier || "Andreani");
  const [tracking, setTracking] = useState(selected?.trackingCode ?? "");
  const [error, setError] = useState("");
  const stepIndex = selected ? Math.max(0, ["pendiente", "preparando", "despachado", "entregado"].indexOf(selected.fulfillmentStatus)) : 0;

  function choose(id: string) {
    const order = orders.find((item) => item.id === id);
    setSelectedId(id); setCarrier(order?.carrier || "Andreani"); setTracking(order?.trackingCode || ""); setError("");
  }

  function dispatch() {
    if (!selected) return;
    if (!carrier.trim() || !tracking.trim()) { setError("Completá transportista y código de seguimiento antes de despachar."); return; }
    updateOrder(selected.id, { fulfillmentStatus: "despachado", status: "enviado", carrier: carrier.trim(), trackingCode: tracking.trim() });
    setError("");
  }

  return <AdminPage eyebrow="Operación" title="Preparación y envíos" description="Una cola única para cobrar, preparar, despachar y cerrar cada entrega con trazabilidad.">
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard label="En cola" value={String(fullQueue.length)} detail="Pedidos todavía abiertos" icon={PackageCheck} tone="honey" />
      <StatCard label="Sin cobrar" value={String(fullQueue.filter((order) => order.paymentStatus !== "pagado").length)} detail="Bloquean la preparación" icon={CircleDollarSign} />
      <StatCard label="Preparando" value={String(fullQueue.filter((order) => order.fulfillmentStatus === "preparando").length)} detail="Listos para picking" icon={ShoppingCart} tone="sage" />
      <StatCard label="Despachados" value={String(orders.filter((order) => order.fulfillmentStatus === "despachado").length)} detail="En tránsito" icon={Truck} />
    </div>
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Panel title="Cola de preparación" description={`${queue.length} de ${fullQueue.length} ${fullQueue.length === 1 ? "pedido" : "pedidos"}`}>
        <label className="relative mb-3 block"><span className="sr-only">Buscar en la cola</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido o cliente…" /></label>
        {queue.length ? <div className="space-y-2">{queue.map((order) => <button key={order.id} type="button" onClick={() => choose(order.id)} className={`w-full rounded-xl border p-3 text-left ${selected?.id === order.id ? "border-cls-primary bg-cls-sage/45" : "border-cls-line bg-cls-cream hover:border-cls-primary"}`}><span className="flex items-center justify-between gap-2"><strong className="text-xs">{order.publicNumber}</strong><StatusBadge tone={order.paymentStatus === "pagado" ? "good" : "warn"}>{order.paymentStatus}</StatusBadge></span><span className="mt-1 block truncate text-[10px] text-cls-ink/55">{order.customer.nombre} · {order.items.reduce((sum, item) => sum + item.cantidad, 0)} unidades</span></button>)}</div> : <EmptyState title={fullQueue.length ? "Sin resultados" : "Cola al día"} text={fullQueue.length ? "Probá otra búsqueda." : "No hay pedidos pendientes de preparación o despacho."} />}
      </Panel>
      {selected ? <Panel title={`${selected.publicNumber} · ${selected.customer.nombre}`} description={`Última actualización ${dateTime(selected.updatedAt)}`}>
        <WorkflowSteps steps={["Cobro", "Preparación", "Despacho", "Entrega"]} current={selected.paymentStatus !== "pagado" ? 0 : stepIndex + 1} />
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div><h3 className="text-xs font-black text-cls-primary-dark">Lista de picking</h3><div className="mt-2 space-y-2">{selected.items.map((item) => <div key={item.productId} className="flex justify-between gap-3 rounded-xl bg-cls-cream p-3 text-xs"><span><strong>{item.cantidad} ×</strong> {item.nombre}</span><span className="text-cls-ink/50">{item.sku}</span></div>)}</div><p className="mt-3 rounded-xl border border-cls-line p-3 text-xs leading-relaxed text-cls-ink/65"><strong className="block text-cls-primary-dark">Entrega</strong>{selected.customer.direccion}, {selected.customer.localidad}, {selected.customer.provincia} · CP {selected.customer.codigoPostal}</p></div>
          <div className="space-y-3"><Field label="Transportista"><input className={fieldClass} value={carrier} onChange={(event) => setCarrier(event.target.value)} /></Field><Field label="Código de seguimiento"><input className={fieldClass} value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Identificador del envío" /></Field>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800">{error}</p>}<div className="grid gap-2"><button className="btn-secondary justify-center" disabled={selected.paymentStatus !== "pagado" || selected.fulfillmentStatus !== "pendiente"} onClick={() => updateOrder(selected.id, { fulfillmentStatus: "preparando", status: "preparando" })}><PackageCheck className="h-4 w-4" /> Iniciar preparación</button><button className="btn-primary justify-center" disabled={selected.paymentStatus !== "pagado" || !["pendiente", "preparando"].includes(selected.fulfillmentStatus)} onClick={dispatch}><Truck className="h-4 w-4" /> Marcar despachado</button><button className="btn-outline justify-center" disabled={selected.fulfillmentStatus !== "despachado"} onClick={() => updateOrder(selected.id, { fulfillmentStatus: "entregado", status: "completado" })}><CheckCircle2 className="h-4 w-4" /> Confirmar entrega</button></div>{selected.paymentStatus !== "pagado" && <p className="text-[10px] font-bold text-cls-orange">Acreditá el pago en Ventas antes de preparar.</p>}</div>
        </div>
      </Panel> : <Panel title="Detalle de preparación"><EmptyState title="No hay pedidos" text="La cola se activará con el primer checkout." /></Panel>}
    </div>
  </AdminPage>;
}

export function AdminDiscounts() {
  const { discounts, saveDiscount, removeDiscount } = useCommerceData();
  const [editing, setEditing] = useState<DiscountRule | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiscountRule["status"] | "todos">("todos");
  const [page, setPage] = useState(1);
  const fresh = (): DiscountRule => ({ id: newId("discount"), code: "", type: "percentage", value: 10, minimumAmount: 0, usageCount: 0, status: "draft", startsAt: stamp().slice(0, 10), createdAt: stamp(), updatedAt: stamp() });
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    const code = editing.code.trim().toUpperCase();
    if (!code) { setError("Ingresá un código."); return; }
    if (!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(code)) { setError("Usá entre 2 y 40 letras, números, guiones o guion bajo."); return; }
    if (discounts.some((item) => item.id !== editing.id && item.code.toUpperCase() === code)) { setError("Ese código ya existe."); return; }
    if (editing.type === "percentage" && (editing.value <= 0 || editing.value > 100)) { setError("El porcentaje debe estar entre 1 y 100."); return; }
    if (editing.type === "fixed" && editing.value <= 0) { setError("El monto fijo debe ser mayor a cero."); return; }
    if (!editing.startsAt) { setError("Definí la fecha de inicio."); return; }
    if (editing.endsAt && new Date(`${editing.endsAt}T23:59:59`).getTime() <= new Date(`${editing.startsAt}T00:00:00`).getTime()) { setError("La fecha de fin debe ser posterior al inicio."); return; }
    saveDiscount({ ...editing, code, value: editing.type === "free_shipping" ? 0 : editing.value }); setEditing(null); setError("");
  }
  const active = discounts.filter((item) => item.status === "active").length;
  const filtered = discounts.filter((item) => (statusFilter === "todos" || item.status === statusFilter) && `${item.code}`.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return <AdminPage eyebrow="Promociones" title="Descuentos" description="Creá códigos con reglas claras, vigencia y límites de uso; activalos cuando estén revisados." action={<button className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Nuevo descuento</button>}>
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3"><StatCard label="Activos" value={String(active)} detail="Aplicables en checkout" icon={BadgePercent} tone="sage" /><StatCard label="Borradores" value={String(discounts.filter((item) => item.status === "draft").length)} detail="Pendientes de revisión" icon={Pencil} /><StatCard label="Usos registrados" value={String(discounts.reduce((sum, item) => sum + item.usageCount, 0))} detail="Acumulado por códigos" icon={CheckCircle2} tone="honey" /></div>
    {editing && <Panel title={discounts.some((item) => item.id === editing.id) ? "Editar descuento" : "Nuevo descuento"} className="mb-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Código"><input required className={`${fieldClass} uppercase`} value={editing.code} onChange={(event) => setEditing({ ...editing, code: event.target.value })} placeholder="EJ. BIENVENIDA10" /></Field><Field label="Beneficio"><select className={fieldClass} value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value as DiscountRule["type"] })}><option value="percentage">Porcentaje</option><option value="fixed">Monto fijo</option><option value="free_shipping">Envío gratis</option></select></Field><Field label={editing.type === "percentage" ? "Porcentaje" : "Valor"}><input disabled={editing.type === "free_shipping"} min="0" type="number" className={fieldClass} value={editing.value} onChange={(event) => setEditing({ ...editing, value: Number(event.target.value) })} /></Field><Field label="Compra mínima"><input min="0" type="number" className={fieldClass} value={editing.minimumAmount} onChange={(event) => setEditing({ ...editing, minimumAmount: Number(event.target.value) })} /></Field><Field label="Inicio"><input type="date" className={fieldClass} value={editing.startsAt.slice(0, 10)} onChange={(event) => setEditing({ ...editing, startsAt: event.target.value })} /></Field><Field label="Fin"><input type="date" className={fieldClass} value={editing.endsAt ?? ""} onChange={(event) => setEditing({ ...editing, endsAt: event.target.value || undefined })} /></Field><Field label="Límite de usos"><input min="1" type="number" className={fieldClass} value={editing.usageLimit ?? ""} onChange={(event) => setEditing({ ...editing, usageLimit: event.target.value ? Number(event.target.value) : undefined })} placeholder="Sin límite" /></Field><Field label="Estado"><select className={fieldClass} value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as DiscountRule["status"] })}><option value="draft">Borrador</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="expired">Vencido</option></select></Field>{error && <p role="alert" className="text-xs font-bold text-red-700 sm:col-span-2 lg:col-span-4">{error}</p>}<div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar descuento</button><button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancelar</button></div></form></Panel>}
    <Panel title="Códigos y promociones" description={`${filtered.length} de ${discounts.length} ${discounts.length === 1 ? "regla creada" : "reglas creadas"}`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1"><span className="sr-only">Buscar código</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar código…" /></label>
        <label className="min-w-[160px] flex-1"><span className="sr-only">Estado</span><select className={fieldClass} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as DiscountRule["status"] | "todos"); setPage(1); }}><option value="todos">Todos los estados</option><option value="draft">Borrador</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="expired">Vencido</option></select></label>
      </div>
      {paged.length ? <><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{paged.map((discount) => <article key={discount.id} className="rounded-2xl border border-cls-line bg-cls-cream p-4"><div className="flex items-center justify-between gap-2"><code className="rounded-lg bg-cls-primary px-2 py-1 text-xs font-black text-cls-paper">{discount.code}</code><StatusBadge tone={discount.status === "active" ? "good" : discount.status === "draft" ? "warn" : "neutral"}>{discount.status}</StatusBadge></div><p className="mt-4 text-2xl font-black text-cls-primary-dark">{discount.type === "percentage" ? `${discount.value}% OFF` : discount.type === "fixed" ? `${precioARS(discount.value)} OFF` : "Envío gratis"}</p><p className="mt-1 text-[11px] text-cls-ink/55">Mínimo {precioARS(discount.minimumAmount)} · {discount.usageCount}/{discount.usageLimit ?? "∞"} usos</p><p className="mt-1 text-[10px] text-cls-ink/45">Desde {dateOnly(discount.startsAt)} · {dateOnly(discount.endsAt)}</p><div className="mt-4 flex gap-2"><button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...discount })}><Pencil className="h-3.5 w-3.5" /> Editar</button><button className="flex h-11 w-11 items-center justify-center rounded-full border border-cls-line text-red-700" aria-label={`Eliminar ${discount.code}`} onClick={() => confirm(`¿Eliminar ${discount.code}?`) && removeDiscount(discount.id)}><Trash2 className="h-4 w-4" /></button></div></article>)}</div><Pagination page={currentPage} pageCount={pageCount} onChange={setPage} /></> : <EmptyState title={discounts.length ? "Sin resultados" : "Creá tu primera promoción"} text={discounts.length ? "Probá otra búsqueda o filtro." : "Los códigos quedan en borrador hasta que decidas activarlos."} />}
    </Panel>
  </AdminPage>;
}

export function AdminMarketing() {
  const { campaigns, saveCampaign, updateCampaignStatus } = useCommerceData();
  const [editing, setEditing] = useState<MarketingCampaign | null>(null);
  const [error, setError] = useState("");
  const [channelFilter, setChannelFilter] = useState<MarketingCampaign["channel"] | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<MarketingCampaign["status"] | "todos">("todos");
  const fresh = (): MarketingCampaign => ({ id: newId("campaign"), name: "", channel: "email", objective: "conversion", audience: "Clientes", budget: 0, status: "draft", createdAt: stamp(), updatedAt: stamp() });
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    const name = editing.name.trim();
    const audience = editing.audience.trim();
    if (!name) { setError("Ingresá un nombre para la campaña."); return; }
    if (!audience) { setError("Definí la audiencia."); return; }
    if (!Number.isFinite(editing.budget) || editing.budget < 0) { setError("El presupuesto no puede ser negativo."); return; }
    saveCampaign({ ...editing, name, audience });
    setEditing(null); setError("");
  }
  const filtered = campaigns.filter((campaign) => (channelFilter === "todos" || campaign.channel === channelFilter) && (statusFilter === "todos" || campaign.status === statusFilter));
  return <AdminPage eyebrow="Crecimiento" title="Marketing" description="Planificá campañas por canal y movelas por un ciclo de aprobación visible." action={<button className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Nueva campaña</button>}>
    <div className="mb-4 rounded-2xl border border-cls-sage bg-cls-sage/35 p-4 text-xs text-cls-primary-dark"><strong>Automatización disponible.</strong> Programá el envío y conectá la ejecución desde <Link to="/admin/automatizaciones" className="font-black underline">Automatizaciones con n8n</Link>.</div>
    {editing && <Panel title="Plan de campaña" className="mb-4"><form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label="Nombre"><input required className={fieldClass} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field><Field label="Canal"><select className={fieldClass} value={editing.channel} onChange={(event) => setEditing({ ...editing, channel: event.target.value as MarketingCampaign["channel"] })}><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="telegram">Telegram</option></select></Field><Field label="Objetivo"><select className={fieldClass} value={editing.objective} onChange={(event) => setEditing({ ...editing, objective: event.target.value as MarketingCampaign["objective"] })}><option value="conversion">Conversión</option><option value="retention">Retención</option><option value="launch">Lanzamiento</option><option value="education">Educación</option></select></Field><Field label="Audiencia"><input required className={fieldClass} value={editing.audience} onChange={(event) => setEditing({ ...editing, audience: event.target.value })} /></Field><Field label="Presupuesto"><input required min="0" type="number" className={fieldClass} value={editing.budget} onChange={(event) => setEditing({ ...editing, budget: Number(event.target.value) })} /></Field><Field label="Fecha y hora"><input type="datetime-local" className={fieldClass} value={editing.scheduledAt?.slice(0, 16) ?? ""} onChange={(event) => setEditing({ ...editing, scheduledAt: event.target.value || undefined, status: event.target.value ? "scheduled" : editing.status })} /></Field>{error && <p role="alert" className="text-xs font-bold text-red-700 sm:col-span-2 lg:col-span-3">{error}</p>}<div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar campaña</button><button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancelar</button></div></form></Panel>}
    {campaigns.length > 0 && <div className="mb-4 flex flex-wrap gap-2">
      <label className="min-w-[160px] flex-1"><span className="sr-only">Canal</span><select className={fieldClass} value={channelFilter} onChange={(event) => setChannelFilter(event.target.value as MarketingCampaign["channel"] | "todos")}><option value="todos">Todos los canales</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="telegram">Telegram</option></select></label>
      <label className="min-w-[160px] flex-1"><span className="sr-only">Estado</span><select className={fieldClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as MarketingCampaign["status"] | "todos")}><option value="todos">Todos los estados</option><option value="draft">Borrador</option><option value="scheduled">Programada</option><option value="active">Activa</option><option value="completed">Completada</option><option value="paused">Pausada</option></select></label>
    </div>}
    {filtered.length ? <div className="grid gap-3 lg:grid-cols-2">{filtered.map((campaign) => <article key={campaign.id} className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper"><div className="flex items-start justify-between gap-3"><div><span className="text-[9px] font-black uppercase tracking-widest text-cls-orange">{campaign.channel} · {campaign.objective}</span><h2 className="mt-1 font-sans text-base font-black">{campaign.name}</h2><p className="mt-1 text-xs text-cls-ink/55">{campaign.audience} · {precioARS(campaign.budget)}</p></div><StatusBadge tone={campaign.status === "active" || campaign.status === "completed" ? "good" : campaign.status === "scheduled" ? "warn" : "neutral"}>{campaign.status}</StatusBadge></div><WorkflowSteps steps={["Borrador", "Programada", "Activa", "Completada"]} current={Math.max(0, ["draft", "scheduled", "active", "completed"].indexOf(campaign.status))} /><div className="mt-4 flex flex-wrap gap-2"><button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...campaign })}><Pencil className="h-3.5 w-3.5" /> Editar</button>{campaign.status === "draft" && <button className="btn-secondary min-h-11 px-3 py-1 text-xs" onClick={() => updateCampaignStatus(campaign.id, campaign.scheduledAt ? "scheduled" : "active")}>Aprobar</button>}{campaign.status === "scheduled" && <button className="btn-secondary min-h-11 px-3 py-1 text-xs" onClick={() => updateCampaignStatus(campaign.id, "active")}>Iniciar</button>}{campaign.status === "active" && <button className="btn-primary min-h-11 px-3 py-1 text-xs" onClick={() => updateCampaignStatus(campaign.id, "completed")}>Completar</button>}</div></article>)}</div> : <Panel title="Calendario comercial"><EmptyState title={campaigns.length ? "Sin resultados" : "No hay campañas planificadas"} text={campaigns.length ? "Probá otro filtro." : "Creá una campaña, definí su audiencia y conectá su ejecución con n8n."} /></Panel>}
  </AdminPage>;
}

export function AdminAbandonedCarts() {
  const { abandonedCarts, saveAbandonedCart, updateAbandonedCart } = useCommerceData();
  const [editing, setEditing] = useState<AbandonedCart | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<AbandonedCart["status"] | "todos">("todos");
  const fresh = (): AbandonedCart => ({ id: newId("cart"), customerName: "", email: "", phone: "", items: 1, total: 0, status: "open", recoveryCode: `VOLVE${Math.floor(1000 + Math.random() * 9000)}`, lastActivityAt: stamp(), updatedAt: stamp() });
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    const email = editing.email.trim();
    if (!EMAIL_PATTERN.test(email)) { setError("Ingresá un email válido."); return; }
    if (!Number.isInteger(editing.items) || editing.items < 1) { setError("La cantidad de productos debe ser un entero mayor a 0."); return; }
    if (!Number.isFinite(editing.total) || editing.total < 0) { setError("El total no puede ser negativo."); return; }
    saveAbandonedCart({ ...editing, email });
    setEditing(null); setError("");
  }
  const open = abandonedCarts.filter((cart) => ["open", "contacted"].includes(cart.status));
  const recovered = abandonedCarts.filter((cart) => cart.status === "recovered");
  const filtered = abandonedCarts.filter((cart) => statusFilter === "todos" || cart.status === statusFilter);
  const openIds = abandonedCarts.filter((cart) => cart.status === "open").map((cart) => cart.id);
  function contactAllOpen() {
    if (!openIds.length) return;
    openIds.forEach((id) => updateAbandonedCart(id, "contacted"));
  }
  return <AdminPage eyebrow="Retención" title="Carritos abandonados" description="Priorizá intención de compra, registrá el contacto y medí recuperaciones sin mensajes duplicados." action={<button className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Registrar carrito</button>}>
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3"><StatCard label="Por recuperar" value={String(open.length)} detail="Abiertos o contactados" icon={ShoppingCart} tone="honey" /><StatCard label="Valor en riesgo" value={precioARS(open.reduce((sum, cart) => sum + cart.total, 0))} detail="Sin afirmar conversión" icon={CircleDollarSign} /><StatCard label="Recuperados" value={String(recovered.length)} detail={recovered.length ? precioARS(recovered.reduce((sum, cart) => sum + cart.total, 0)) : "Todavía sin recuperaciones"} icon={CheckCircle2} tone="sage" /></div>
    {editing && <Panel title="Capturar carrito" className="mb-4"><form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Cliente"><input className={fieldClass} value={editing.customerName} onChange={(event) => setEditing({ ...editing, customerName: event.target.value })} /></Field><Field label="Email"><input required type="email" className={fieldClass} value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></Field><Field label="Teléfono"><input className={fieldClass} value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} /></Field><Field label="Cantidad de productos"><input required min="1" type="number" className={fieldClass} value={editing.items} onChange={(event) => setEditing({ ...editing, items: Number(event.target.value) })} /></Field><Field label="Total"><input required min="0" type="number" className={fieldClass} value={editing.total} onChange={(event) => setEditing({ ...editing, total: Number(event.target.value) })} /></Field><Field label="Código de recuperación"><input className={fieldClass} value={editing.recoveryCode} onChange={(event) => setEditing({ ...editing, recoveryCode: event.target.value.toUpperCase() })} /></Field>{error && <p role="alert" className="text-xs font-bold text-red-700 sm:col-span-2 lg:col-span-4">{error}</p>}<div className="flex gap-2 sm:col-span-2"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar y disparar flujo</button><button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancelar</button></div></form></Panel>}
    <Panel title="Bandeja de recuperación" description="La creación emite cart.abandoned si la automatización está activa">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="min-w-[180px] flex-1"><span className="sr-only">Estado</span><select className={fieldClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AbandonedCart["status"] | "todos")}><option value="todos">Todos los estados</option><option value="open">Abierto</option><option value="contacted">Contactado</option><option value="recovered">Recuperado</option><option value="dismissed">Descartado</option></select></label>
        {openIds.length > 0 && <button type="button" className="btn-outline shrink-0" onClick={contactAllOpen}>Marcar los {openIds.length} abiertos como contactados</button>}
      </div>
      {filtered.length ? <div className="space-y-3">{filtered.map((cart) => <article key={cart.id} className="grid gap-3 rounded-2xl border border-cls-line bg-cls-cream p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="truncate text-sm">{cart.customerName || cart.email}</strong><StatusBadge tone={cart.status === "recovered" ? "good" : cart.status === "open" ? "warn" : "neutral"}>{cart.status}</StatusBadge></div><p className="mt-1 truncate text-xs text-cls-ink/55">{cart.email} · {cart.items} productos · {cart.recoveryCode}</p></div><strong className="text-lg text-cls-primary-dark">{precioARS(cart.total)}</strong><div className="flex flex-wrap gap-2">{cart.status === "open" && <button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => updateAbandonedCart(cart.id, "contacted")}>Marcar contactado</button>}{cart.status === "contacted" && <button className="btn-secondary min-h-11 px-3 py-1 text-xs" onClick={() => updateAbandonedCart(cart.id, "recovered")}>Marcar recuperado</button>}{!["recovered", "dismissed"].includes(cart.status) && <button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => updateAbandonedCart(cart.id, "dismissed")}>Descartar</button>}</div></article>)}</div> : <EmptyState title={abandonedCarts.length ? "Sin resultados" : "No hay carritos abandonados"} text={abandonedCarts.length ? "Probá otro filtro." : "Podés registrar uno para validar el flujo o conectarlo al evento de checkout."} />}
    </Panel>
  </AdminPage>;
}

export function AdminReturns() {
  const { orders, returns, createReturn, updateReturn } = useCommerceData();
  const eligible = orders.filter((order) => order.paymentStatus === "pagado" && order.status !== "cancelado");
  const [editing, setEditing] = useState<ReturnCase | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnCase["status"] | "todos">("todos");
  const fresh = (): ReturnCase => ({ id: newId("return"), orderId: eligible[0]?.id ?? "", publicNumber: `DEV-${new Date().getFullYear()}-${String(returns.length + 1).padStart(4, "0")}`, reason: "", resolution: "refund", status: "requested", amount: eligible[0]?.total ?? 0, note: "", createdAt: stamp(), updatedAt: stamp() });
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    const reason = editing.reason.trim();
    const order = orders.find((item) => item.id === editing.orderId);
    if (!editing.orderId || !order) { setError("Elegí el pedido de origen."); return; }
    if (!reason) { setError("Describí el motivo de la devolución."); return; }
    if (!Number.isFinite(editing.amount) || editing.amount <= 0) { setError("El importe debe ser mayor a 0."); return; }
    if (editing.amount > order.total) { setError(`El importe no puede superar el total del pedido (${precioARS(order.total)}).`); return; }
    createReturn({ ...editing, reason });
    setEditing(null); setError("");
  }
  const filtered = returns.filter((item) => statusFilter === "todos" || item.status === statusFilter);
  return <AdminPage eyebrow="Postventa" title="Devoluciones" description="Resolvé cambios, créditos o reintegros enlazados al pedido original y a su historial." action={<button disabled={!eligible.length} className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Nueva devolución</button>}>
    {editing && <Panel title="Abrir caso" className="mb-4"><form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Pedido"><select className={fieldClass} value={editing.orderId} onChange={(event) => { const order = orders.find((item) => item.id === event.target.value); setEditing({ ...editing, orderId: event.target.value, amount: order?.total ?? editing.amount }); }}>{eligible.map((order) => <option key={order.id} value={order.id}>{order.publicNumber} · {order.customer.nombre}</option>)}</select></Field><Field label="Resolución"><select className={fieldClass} value={editing.resolution} onChange={(event) => setEditing({ ...editing, resolution: event.target.value as ReturnCase["resolution"] })}><option value="refund">Reintegro</option><option value="exchange">Cambio</option><option value="store_credit">Crédito en tienda</option></select></Field><Field label="Importe" hint={(() => { const order = orders.find((item) => item.id === editing.orderId); return order ? `Máximo ${precioARS(order.total)} (total del pedido).` : undefined; })()}><input required min="0" type="number" className={fieldClass} value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })} /></Field><Field label="Motivo"><input required className={fieldClass} value={editing.reason} onChange={(event) => setEditing({ ...editing, reason: event.target.value })} /></Field><div className="sm:col-span-2 lg:col-span-4"><Field label="Nota interna"><textarea className={`${fieldClass} min-h-20 py-3`} value={editing.note} onChange={(event) => setEditing({ ...editing, note: event.target.value })} /></Field></div>{error && <p role="alert" className="text-xs font-bold text-red-700 sm:col-span-2 lg:col-span-4">{error}</p>}<div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button className="btn-secondary"><Save className="h-4 w-4" /> Abrir devolución</button><button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancelar</button></div></form></Panel>}
    <Panel title="Casos de postventa" description={`${filtered.length} de ${returns.length} devoluciones`}>
      {returns.length > 0 && <label className="mb-4 block max-w-xs"><span className="sr-only">Estado</span><select className={fieldClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ReturnCase["status"] | "todos")}><option value="todos">Todos los estados</option><option value="requested">Solicitada</option><option value="approved">Aprobada</option><option value="received">Recibida</option><option value="resolved">Resuelta</option><option value="rejected">Rechazada</option></select></label>}
      {filtered.length ? <div className="space-y-3">{filtered.map((item) => { const order = orders.find((candidate) => candidate.id === item.orderId); const current = Math.max(0, ["requested", "approved", "received", "resolved"].indexOf(item.status)); return <article key={item.id} className="rounded-2xl border border-cls-line bg-cls-cream p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><span className="text-[10px] font-black text-cls-orange">{item.publicNumber} · {order?.publicNumber ?? "Pedido no disponible"}</span><h2 className="mt-1 text-sm font-black">{item.reason}</h2><p className="mt-1 text-xs text-cls-ink/55">{item.resolution} · {precioARS(item.amount)}</p></div><StatusBadge tone={item.status === "resolved" ? "good" : item.status === "rejected" ? "neutral" : "warn"}>{item.status}</StatusBadge></div>{item.status !== "rejected" && <div className="mt-4"><WorkflowSteps steps={["Solicitada", "Aprobada", "Recibida", "Resuelta"]} current={current} /></div>}<div className="mt-4 flex flex-wrap gap-2">{item.status === "requested" && <button className="btn-secondary min-h-11 px-3 py-1 text-xs" onClick={() => updateReturn(item.id, "approved")}>Aprobar</button>}{item.status === "approved" && <button className="btn-secondary min-h-11 px-3 py-1 text-xs" onClick={() => updateReturn(item.id, "received")}>Marcar recibida</button>}{item.status === "received" && <button className="btn-primary min-h-11 px-3 py-1 text-xs" onClick={() => updateReturn(item.id, "resolved")}>Resolver</button>}{!["resolved", "rejected"].includes(item.status) && <button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => updateReturn(item.id, "rejected")}>Rechazar</button>}</div></article>; })}</div> : <EmptyState title={returns.length ? "Sin resultados" : "Sin devoluciones"} text={returns.length ? "Probá otro filtro." : eligible.length ? "Abrí un caso contra un pedido cobrado cuando sea necesario." : "Las devoluciones se habilitan cuando exista un pedido cobrado."} />}
    </Panel>
  </AdminPage>;
}

export function AdminFinance() {
  const { orders } = useCommerceData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<typeof orders[number]["paymentStatus"] | "todos">("todos");
  const [page, setPage] = useState(1);
  const paid = orders.filter((order) => order.paymentStatus === "pagado");
  const refunds = orders.filter((order) => order.paymentStatus === "reintegrado");
  const pending = orders.filter((order) => order.paymentStatus === "pendiente");
  const net = paid.reduce((sum, order) => sum + order.total, 0) - refunds.reduce((sum, order) => sum + order.total, 0);
  const filtered = orders.filter((order) => (statusFilter === "todos" || order.paymentStatus === statusFilter) && `${order.publicNumber} ${order.customer.nombre}`.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function exportCsv() { const rows = [["pedido", "fecha", "medio", "estado", "subtotal", "codigo_promocional", "descuento_promocional", "descuento_transferencia", "envio", "total"], ...filtered.map((order) => [order.publicNumber, order.createdAt, order.paymentMethod, order.paymentStatus, order.subtotal, order.discountCode ?? "", order.promotionDiscount, order.transferDiscount, order.envio, order.total])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "finanzas-crazy-lady.csv"; anchor.click(); URL.revokeObjectURL(url); }
  return <AdminPage eyebrow="Dinero" title="Finanzas" description="Conciliación operativa de cobros y reintegros. Los montos reflejan pedidos cargados, no acreditaciones bancarias externas." action={<button className="btn-outline" onClick={exportCsv} disabled={!filtered.length}><Download className="h-4 w-4" /> Exportar CSV</button>}>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Neto registrado" value={precioARS(net)} detail="Cobrado menos reintegrado" icon={WalletCards} tone="sage" /><StatCard label="Cobrado" value={precioARS(paid.reduce((sum, order) => sum + order.total, 0))} detail={`${paid.length} operaciones`} icon={CheckCircle2} /><StatCard label="Pendiente" value={precioARS(pending.reduce((sum, order) => sum + order.total, 0))} detail={`${pending.length} por conciliar`} icon={Clock3} tone="honey" /><StatCard label="Reintegrado" value={precioARS(refunds.reduce((sum, order) => sum + order.total, 0))} detail={`${refunds.length} operaciones`} icon={RotateCcw} /></div>
    <Panel title="Movimientos por pedido" description={`${filtered.length} de ${orders.length} · verificá el proveedor antes de acreditar un pago`} className="mt-4">
      {orders.length > 0 && <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1"><span className="sr-only">Buscar</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/40" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Pedido o cliente…" /></label>
        <label className="min-w-[160px] flex-1"><span className="sr-only">Estado</span><select className={fieldClass} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as typeof orders[number]["paymentStatus"] | "todos"); setPage(1); }}><option value="todos">Todos los estados</option><option value="pendiente">Pendiente</option><option value="pagado">Pagado</option><option value="fallido">Fallido</option><option value="reintegrado">Reintegrado</option></select></label>
      </div>}
      {paged.length ? <><table className="admin-table"><thead><tr><th>Pedido</th><th>Fecha</th><th>Medio</th><th>Estado</th><th>Total</th><th>Acción</th></tr></thead><tbody>{paged.map((order) => <tr key={order.id}><td data-label="Pedido"><strong>{order.publicNumber}</strong><small>{order.customer.nombre}</small></td><td data-label="Fecha">{dateTime(order.createdAt)}</td><td data-label="Medio">{order.paymentMethod.replace("_", " ")}</td><td data-label="Estado"><StatusBadge tone={order.paymentStatus === "pagado" ? "good" : order.paymentStatus === "pendiente" ? "warn" : "neutral"}>{order.paymentStatus}</StatusBadge></td><td data-label="Total"><strong>{precioARS(order.total)}</strong></td><td data-label="Acción"><Link to="/admin/ventas" className="text-xs font-black text-cls-primary underline">Abrir venta</Link></td></tr>)}</tbody></table><Pagination page={currentPage} pageCount={pageCount} onChange={setPage} /></> : <EmptyState title={orders.length ? "Sin resultados" : "Sin movimientos"} text={orders.length ? "Probá otra búsqueda o filtro." : "Los pagos registrados en Ventas aparecerán en esta conciliación."} />}
    </Panel>
  </AdminPage>;
}

const EVENT_LABELS: Record<AutomationWorkflow["event"], string> = {
  "order.created": "Pedido creado", "payment.confirmed": "Pago confirmado", "fulfillment.shipped": "Pedido despachado", "inventory.low": "Stock bajo", "cart.abandoned": "Carrito abandonado", "conversation.handoff": "Derivación humana", "return.requested": "Devolución solicitada",
};

export function AdminAutomations() {
  const { automations, automationRuns, saveAutomation, runAutomation } = useCommerceData();
  const [editing, setEditing] = useState<AutomationWorkflow | null>(null);
  const [running, setRunning] = useState("");
  const [result, setResult] = useState<AutomationRun | null>(null);
  const [runsPage, setRunsPage] = useState(1);
  const runsPageCount = Math.max(1, Math.ceil(automationRuns.length / PAGE_SIZE));
  const currentRunsPage = Math.min(runsPage, runsPageCount);
  const pagedRuns = automationRuns.slice((currentRunsPage - 1) * PAGE_SIZE, currentRunsPage * PAGE_SIZE);
  async function test(workflow: AutomationWorkflow) { setRunning(workflow.id); const next = await runAutomation(workflow.id, { sampleId: `test-${Date.now()}` }); setResult(next); setRunning(""); }
  const configured = automations.filter((workflow) => workflow.webhookUrl).length;
  return <AdminPage eyebrow="Orquestación" title="Automatizaciones con n8n" description="Conectá cada evento a un webhook independiente, probalo y revisá su ejecución desde un solo lugar.">
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3"><StatCard label="Flujos activos" value={String(automations.filter((workflow) => workflow.enabled).length)} detail="Escuchando eventos" icon={Workflow} tone="sage" /><StatCard label="Configurados" value={`${configured}/${automations.length}`} detail="Con URL de webhook" icon={Link2} /><StatCard label="Ejecuciones" value={String(automationRuns.length)} detail="Últimas 100 conservadas" icon={Play} tone="honey" /></div>
    <div className="mb-4 rounded-2xl border border-cls-honey bg-cls-honey/20 p-4 text-xs leading-relaxed text-cls-primary-dark"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Contrato seguro.</strong> El navegador solo guarda URLs públicas de webhook. Tokens, firmas, reintentos e idempotencia deben resolverse en n8n o en una función de servidor. La prueba envía un payload marcado como <code>test: true</code>.</p></div></div>
    {editing && <Panel title={`Configurar · ${editing.name}`} className="mb-4"><form onSubmit={(event) => { event.preventDefault(); saveAutomation(editing); setEditing(null); }} className="grid gap-3 lg:grid-cols-[1fr_auto]"><Field label="URL del webhook" hint="Debe ser HTTPS. Usá la URL de producción del nodo Webhook de n8n."><input type="url" className={fieldClass} value={editing.webhookUrl} onChange={(event) => setEditing({ ...editing, webhookUrl: event.target.value })} placeholder="https://n8n.tudominio.com/webhook/…" /></Field><div className="flex items-end gap-2"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button></div></form></Panel>}
    {result && <div role="status" className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 text-xs ${result.status === "success" ? "border-cls-primary bg-cls-sage/40" : "border-cls-honey bg-cls-honey/20"}`}>{result.status === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-cls-primary" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-cls-orange" />}<p><strong>{result.workflowName}:</strong> {result.detail}</p><button type="button" className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/40" onClick={() => setResult(null)} aria-label="Cerrar resultado"><X className="h-4 w-4" /></button></div>}
    <div className="grid gap-3 lg:grid-cols-2">{automations.map((workflow) => <article key={workflow.id} className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${workflow.enabled ? "bg-cls-primary text-cls-paper" : "bg-cls-cream text-cls-primary"}`}><Workflow className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-sans text-sm font-black">{workflow.name}</h2><StatusBadge tone={workflow.enabled ? "good" : workflow.webhookUrl ? "warn" : "neutral"}>{workflow.enabled ? "Activo" : workflow.webhookUrl ? "Listo" : "Sin configurar"}</StatusBadge></div><p className="mt-1 text-xs text-cls-ink/55">{workflow.description}</p><code className="mt-2 block truncate rounded-lg bg-cls-cream px-2 py-1 text-[10px] text-cls-primary">{EVENT_LABELS[workflow.event]} · {workflow.event}</code></div></div><div className="mt-4 flex flex-wrap gap-2 border-t border-cls-line pt-3"><button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...workflow })}><Link2 className="h-3.5 w-3.5" /> Configurar</button><button className="btn-outline min-h-11 px-3 py-1 text-xs" disabled={running === workflow.id} onClick={() => test(workflow)}><Play className="h-3.5 w-3.5" /> {running === workflow.id ? "Probando…" : "Probar"}</button><button type="button" role="switch" aria-checked={workflow.enabled} disabled={!workflow.webhookUrl} onClick={() => saveAutomation({ ...workflow, enabled: !workflow.enabled })} className="ml-auto flex min-h-11 items-center gap-2 rounded-full px-2 text-[10px] font-black disabled:opacity-40"><span>{workflow.enabled ? "Activo" : "Inactivo"}</span><span className={`relative h-7 w-12 rounded-full ${workflow.enabled ? "bg-cls-primary" : "bg-cls-line"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-cls-paper shadow transition ${workflow.enabled ? "left-6" : "left-1"}`} /></span></button></div></article>)}</div>
    <Panel title="Historial de ejecuciones" description={`${automationRuns.length} conservadas · resultado técnico sin exponer secretos`} className="mt-4">{pagedRuns.length ? <><div className="space-y-2">{pagedRuns.map((run) => <div key={run.id} className="grid gap-2 rounded-xl bg-cls-cream p-3 text-xs sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><strong className="block truncate">{run.workflowName}</strong><span className="block truncate text-[10px] text-cls-ink/50">{dateTime(run.createdAt)} · {run.detail}</span></div><StatusBadge tone={run.status === "success" ? "good" : run.status === "failed" ? "warn" : "neutral"}>{run.httpStatus ?? run.status}</StatusBadge></div>)}</div><Pagination page={currentRunsPage} pageCount={runsPageCount} onChange={setRunsPage} /></> : <EmptyState title="Todavía no hay ejecuciones" text="Configurá un webhook y usá Probar para validar el contrato con n8n." />}</Panel>
  </AdminPage>;
}

export function AdminTeam() {
  const { staff, saveStaff, updateStaffStatus } = useCommerceData();
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const moduleOptions = ADMIN_MODULES.filter((module) => !module.locked);
  const fresh = (): StaffMember => ({ id: newId("staff"), name: "", email: "", role: "support", status: "invited", modules: ["customers", "bot"], createdAt: stamp(), updatedAt: stamp() });
  function submit(event: React.FormEvent) { event.preventDefault(); if (!editing?.email.trim()) return; saveStaff(editing); setEditing(null); }
  return <AdminPage eyebrow="Seguridad" title="Equipo y permisos" description="Definí roles y alcance por módulo. La invitación real se habilita al conectar Supabase Auth." action={<button className="btn-primary" onClick={() => setEditing(fresh())}><Plus className="h-4 w-4" /> Definir acceso</button>}>
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-cls-honey bg-cls-honey/20 p-4 text-xs leading-relaxed"><AlertTriangle className="h-5 w-5 shrink-0 text-cls-orange" /><p><strong>Modo de definición.</strong> Guardar un acceso registra el rol y los módulos, pero no envía credenciales mientras el panel siga sin autenticación.</p></div>
    {editing && <Panel title="Acceso de equipo" className="mb-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><Field label="Nombre"><input required className={fieldClass} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field><Field label="Email"><input required type="email" className={fieldClass} value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></Field><Field label="Rol"><select className={fieldClass} value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value as StaffMember["role"] })}><option value="owner">Propietario</option><option value="admin">Administrador</option><option value="manager">Gestión</option><option value="support">Atención</option></select></Field><div className="sm:col-span-2"><span className={labelClass}>Módulos permitidos</span><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{moduleOptions.map((module) => <label key={module.id} className="flex min-h-11 items-center gap-2 rounded-xl border border-cls-line bg-cls-cream px-3 text-xs font-bold"><input type="checkbox" checked={editing.modules.includes(module.id)} onChange={(event) => setEditing({ ...editing, modules: event.target.checked ? [...editing.modules, module.id] : editing.modules.filter((id) => id !== module.id) })} />{module.label}</label>)}</div></div><div className="flex gap-2 sm:col-span-2"><button className="btn-secondary"><Save className="h-4 w-4" /> Guardar acceso</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button></div></form></Panel>}
    <Panel title="Personas con acceso" description={`${staff.length} perfiles definidos`}>{staff.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{staff.map((member) => <article key={member.id} className="rounded-2xl border border-cls-line bg-cls-cream p-4"><div className="flex items-start justify-between gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-cls-primary text-cls-paper"><UsersRound className="h-5 w-5" /></span><StatusBadge tone={member.status === "active" ? "good" : member.status === "invited" ? "warn" : "neutral"}>{member.status}</StatusBadge></div><h2 className="mt-3 text-sm font-black">{member.name}</h2><p className="truncate text-xs text-cls-ink/55">{member.email || "Sesión local"}</p><p className="mt-2 text-[10px] font-black uppercase tracking-widest text-cls-orange">{member.role}</p><p className="mt-2 line-clamp-2 text-[10px] text-cls-ink/50">{member.modules.includes("*") ? "Acceso completo" : `${member.modules.length} módulos: ${member.modules.join(", ")}`}</p>{member.id !== "local-owner" && <div className="mt-4 flex gap-2"><button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => setEditing({ ...member })}><Pencil className="h-3.5 w-3.5" /> Editar</button><button className="btn-outline min-h-11 px-3 py-1 text-xs" onClick={() => updateStaffStatus(member.id, member.status === "disabled" ? "active" : "disabled")}>{member.status === "disabled" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{member.status === "disabled" ? "Activar" : "Desactivar"}</button></div>}</article>)}</div> : <EmptyState title="Sin equipo" text="Definí el primer rol para preparar la activación de autenticación." />}</Panel>
  </AdminPage>;
}
