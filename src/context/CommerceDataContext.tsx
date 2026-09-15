import { createContext, useContext, useMemo, useState } from "react";
import { BOT_LIMITS, DEFAULT_BOT_PROMPT } from "../data/botDefaults";
import { LOW_STOCK_THRESHOLD, PRODUCTOS, type Producto } from "../data/catalogo";
import { NOTAS_INICIALES, type Nota } from "../data/notas";
import { resolveCatalogImage } from "../data/productPhotography";
import { quoteDiscount as computeDiscountQuote, type DiscountQuote } from "./discountEngine";
import type {
  AbandonedCart,
  AdminCategory,
  AdminCustomer,
  AdminOrder,
  AutomationEvent,
  AutomationRun,
  AutomationWorkflow,
  BotPromptSnapshot,
  CommerceState,
  ContentEntry,
  CrmStage,
  DiscountRule,
  FulfillmentStatus,
  MarketingCampaign,
  OrderTimelineEvent,
  OrderStatus,
  PaymentStatus,
  ReturnCase,
  StaffMember,
  StoreSettings,
} from "../types/commerce";

const STORAGE_KEY = "cls_commerce_v2";
const LEGACY_STORAGE_KEY = "cls_commerce_v1";
const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const configuredN8nBase = String(import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ?? "").replace(/\/$/, "");

const workflowTemplates: Omit<AutomationWorkflow, "updatedAt">[] = [
  { id: "order-created", name: "Nuevo pedido", description: "Sincroniza cliente, avisa al equipo y abre el seguimiento.", event: "order.created", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/order-created` : "", enabled: false },
  { id: "payment-confirmed", name: "Pago confirmado", description: "Emite la confirmación y mueve el pedido a preparación.", event: "payment.confirmed", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/payment-confirmed` : "", enabled: false },
  { id: "fulfillment-shipped", name: "Pedido despachado", description: "Envía el seguimiento por el canal elegido por el cliente.", event: "fulfillment.shipped", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/fulfillment-shipped` : "", enabled: false },
  { id: "inventory-low", name: "Stock bajo", description: "Crea una alerta de reposición antes de quedarse sin unidades.", event: "inventory.low", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/inventory-low` : "", enabled: false },
  { id: "cart-abandoned", name: "Carrito abandonado", description: "Inicia una secuencia de recuperación sin duplicar contactos.", event: "cart.abandoned", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/cart-abandoned` : "", enabled: false },
  { id: "conversation-handoff", name: "Derivación humana", description: "Crea una tarea cuando Emma necesita intervención del equipo.", event: "conversation.handoff", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/conversation-handoff` : "", enabled: false },
  { id: "return-requested", name: "Devolución solicitada", description: "Notifica, etiqueta el pedido y abre el control de resolución.", event: "return.requested", webhookUrl: configuredN8nBase ? `${configuredN8nBase}/return-requested` : "", enabled: false },
];

function initialState(): CommerceState {
  const timestamp = now();
  return {
    version: 2,
    products: PRODUCTOS,
    categories: [
      { id: "semilla", slug: "semillas", nombre: "Semillas", descripcion: "Semillas nacionales e importadas.", activa: true, orden: 1, createdAt: timestamp, updatedAt: timestamp },
      { id: "esqueje", slug: "esquejes", nombre: "Esquejes", descripcion: "Clones enraizados disponibles por tandas.", activa: true, orden: 2, createdAt: timestamp, updatedAt: timestamp },
    ],
    orders: [],
    customers: [],
    inventory: [],
    audit: [],
    content: [
      { id: "faq-envios", tipo: "faq", titulo: "¿Hacen envíos a todo el país?", contenido: "Sí. Despachamos con embalaje discreto y trazabilidad.", publicado: true, updatedAt: timestamp },
      { id: "faq-originales", tipo: "faq", titulo: "¿Las semillas son originales?", contenido: "Trabajamos con bancos de origen declarado y mostramos el banco obtentor en cada ficha. Las genéticas registradas llevan su identificación INASE.", publicado: true, updatedAt: timestamp },
      { id: "faq-reprocann", tipo: "faq", titulo: "¿Qué es el REPROCANN?", contenido: "Es el registro nacional para personas autorizadas al cultivo con fines medicinales. Brindamos información y derivamos el trámite a profesionales especializados.", publicado: true, updatedAt: timestamp },
      { id: "faq-eleccion", tipo: "faq", titulo: "¿Cómo elijo la genética ideal para mí?", contenido: "Empezá por espacio, experiencia, tiempo de cultivo y objetivo. Podés usar los filtros o hablar con Emma para comparar opciones disponibles.", publicado: true, updatedAt: timestamp },
      { id: "banner-home", tipo: "banner", titulo: "Sembrando felicidad", contenido: "Genéticas con origen claro y acompañamiento real.", publicado: true, updatedAt: timestamp },
    ],
    settings: {
      nombreTienda: "Crazy Lady Seeds",
      email: "hola@crazyladyseeds.com.ar",
      whatsapp: "+54 9 11 7608 6771",
      descuentoTransferencia: 10,
      envioBase: 0,
      compraInvitado: true,
      mercadoPagoActivo: false,
    },
    discounts: [],
    campaigns: [],
    abandonedCarts: [],
    returns: [],
    automations: workflowTemplates.map((workflow) => ({ ...workflow, updatedAt: timestamp })),
    automationRuns: [],
    staff: [{ id: "local-owner", name: "Administrador local", email: "", role: "owner", status: "active", modules: ["*"], createdAt: timestamp, updatedAt: timestamp }],
    bot: { ...DEFAULT_BOT_PROMPT, updatedAt: timestamp, history: [] },
    posts: NOTAS_INICIALES.map((nota) => ({ ...nota, id: nota.slug, publicado: true, updatedAt: timestamp })),
  };
}

function readState(): CommerceState {
  if (typeof window === "undefined") return initialState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? "null") as Partial<CommerceState> | null;
    if (!parsed || !Array.isArray(parsed.products)) return initialState();
    const seed = initialState();
    const savedContent = Array.isArray(parsed.content) ? parsed.content : [];
    const savedWorkflows = Array.isArray(parsed.automations) ? parsed.automations : [];
    return {
      ...seed,
      ...parsed,
      version: 2,
      products: parsed.products.map((product) => ({ ...product, imagen: resolveCatalogImage(product) })),
      settings: { ...seed.settings, ...parsed.settings },
      orders: (parsed.orders ?? []).map((order) => ({
        ...order,
        promotionDiscount: order.promotionDiscount ?? 0,
        transferDiscount: order.transferDiscount ?? order.descuento ?? 0,
        fulfillmentStatus: order.fulfillmentStatus ?? (order.status === "enviado" ? "despachado" : order.status === "completado" ? "entregado" : "pendiente"),
        carrier: order.carrier ?? "",
        trackingCode: order.trackingCode ?? "",
        internalNotes: order.internalNotes ?? "",
        timeline: order.timeline ?? [{ id: uid("event"), type: "order", label: "Pedido creado", createdAt: order.createdAt }],
      })),
      content: [...savedContent, ...seed.content.filter((entry) => !savedContent.some((saved) => saved.id === entry.id))],
      discounts: Array.isArray(parsed.discounts) ? parsed.discounts : [],
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
      abandonedCarts: Array.isArray(parsed.abandonedCarts) ? parsed.abandonedCarts : [],
      returns: Array.isArray(parsed.returns) ? parsed.returns : [],
      automations: [...savedWorkflows, ...seed.automations.filter((workflow) => !savedWorkflows.some((saved) => saved.id === workflow.id))],
      automationRuns: Array.isArray(parsed.automationRuns) ? parsed.automationRuns : [],
      staff: Array.isArray(parsed.staff) && parsed.staff.length ? parsed.staff : seed.staff,
      bot: parsed.bot ? { ...seed.bot, ...parsed.bot, history: Array.isArray(parsed.bot.history) ? parsed.bot.history : [] } : seed.bot,
      posts: Array.isArray(parsed.posts) ? parsed.posts : seed.posts,
    };
  } catch {
    return initialState();
  }
}

interface NewOrderInput {
  items: { producto: Producto; cantidad: number }[];
  customer: AdminOrder["customer"];
  paymentMethod: AdminOrder["paymentMethod"];
  notas: string;
  discountCode?: string;
}


type OrderPatch = Partial<Pick<AdminOrder, "status" | "paymentStatus" | "fulfillmentStatus" | "carrier" | "trackingCode" | "internalNotes">>;

interface CommerceValue extends CommerceState {
  /** true si el último intento de guardar en localStorage falló (cuota llena, modo privado, etc.) — el cambio quedó solo en memoria. */
  persistenceError: boolean;
  saveProduct: (product: Producto) => void;
  removeProduct: (id: string) => boolean;
  bulkUpdateProducts: (ids: string[], patch: Partial<Pick<Producto, "visible_web" | "destacado" | "categoria">>) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  importProducts: (rows: { producto: Producto; action: "create" | "update" }[]) => { created: number; updated: number };
  saveCategory: (category: AdminCategory) => void;
  removeCategory: (id: string) => boolean;
  createOrder: (input: NewOrderInput) => AdminOrder;
  quoteDiscount: (code: string, subtotal: number) => DiscountQuote;
  updateOrder: (id: string, patch: OrderPatch) => void;
  saveCustomer: (customer: AdminCustomer) => void;
  updateCustomer: (id: string, patch: Partial<Pick<AdminCustomer, "stage" | "tags" | "notas">>) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  saveContent: (entry: ContentEntry) => void;
  updateSettings: (settings: StoreSettings) => void;
  saveDiscount: (discount: DiscountRule) => void;
  removeDiscount: (id: string) => void;
  saveCampaign: (campaign: MarketingCampaign) => void;
  updateCampaignStatus: (id: string, status: MarketingCampaign["status"]) => void;
  saveAbandonedCart: (cart: AbandonedCart) => void;
  updateAbandonedCart: (id: string, status: AbandonedCart["status"]) => void;
  createReturn: (item: ReturnCase) => void;
  updateReturn: (id: string, status: ReturnCase["status"]) => void;
  saveAutomation: (workflow: AutomationWorkflow) => void;
  runAutomation: (id: string, payload?: Record<string, unknown>) => Promise<AutomationRun>;
  triggerAutomation: (event: AutomationEvent, payload: Record<string, unknown>) => Promise<void>;
  saveStaff: (member: StaffMember) => void;
  updateStaffStatus: (id: string, status: StaffMember["status"]) => void;
  saveBotSettings: (snapshot: BotPromptSnapshot) => void;
  savePost: (post: Nota) => void;
  removePost: (id: string) => void;
  resetDemoData: () => void;
}

const CommerceContext = createContext<CommerceValue | null>(null);

function audit(entity: string, entityId: string, action: string, detail: string) {
  return { id: uid("audit"), entity, entityId, action, detail, actor: "Administrador local", createdAt: now() };
}

function timelineEvent(type: "order" | "payment" | "fulfillment" | "note", label: string) {
  return { id: uid("event"), type, label, createdAt: now() };
}

export function CommerceDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CommerceState>(readState);
  const [persistenceError, setPersistenceError] = useState(false);

  function commit(recipe: (current: CommerceState) => CommerceState) {
    setState((current) => {
      const next = recipe(current);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (persistenceError) setPersistenceError(false);
      } catch {
        // El estado en memoria sigue operativo, pero el cambio se perdería en el próximo refresh: avisamos en vez de fallar en silencio.
        setPersistenceError(true);
      }
      return next;
    });
  }

  function saveProduct(product: Producto) {
    commit((current) => {
      const exists = current.products.some((item) => item.id === product.id);
      return { ...current, products: exists ? current.products.map((item) => item.id === product.id ? product : item) : [product, ...current.products], audit: [audit("product", product.id, exists ? "updated" : "created", product.nombre), ...current.audit] };
    });
  }

  function removeProduct(id: string) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return false;
    commit((current) => ({ ...current, products: current.products.filter((item) => item.id !== id), audit: [audit("product", id, "deleted", product.nombre), ...current.audit] }));
    return true;
  }

  function bulkUpdateProducts(ids: string[], patch: Partial<Pick<Producto, "visible_web" | "destacado" | "categoria">>) {
    if (!ids.length) return;
    const idSet = new Set(ids);
    commit((current) => ({ ...current, products: current.products.map((item) => idSet.has(item.id) ? { ...item, ...patch } : item), audit: [audit("product", "bulk", "bulk_updated", `${ids.length} producto(s) · ${Object.entries(patch).map(([key, value]) => `${key}=${value}`).join(", ")}`), ...current.audit] }));
  }

  function bulkDeleteProducts(ids: string[]) {
    if (!ids.length) return;
    const idSet = new Set(ids);
    commit((current) => ({ ...current, products: current.products.filter((item) => !idSet.has(item.id)), audit: [audit("product", "bulk", "bulk_deleted", `${ids.length} producto(s) eliminados`), ...current.audit] }));
  }

  function importProducts(rows: { producto: Producto; action: "create" | "update" }[]) {
    if (!rows.length) return { created: 0, updated: 0 };
    const existingIds = new Set(state.products.map((item) => item.id));
    const created = rows.filter((row) => !existingIds.has(row.producto.id)).length;
    const updated = rows.length - created;
    commit((current) => {
      let products = current.products;
      for (const row of rows) {
        const exists = products.some((item) => item.id === row.producto.id);
        products = exists ? products.map((item) => item.id === row.producto.id ? row.producto : item) : [row.producto, ...products];
      }
      return { ...current, products, audit: [audit("product", "import", "imported", `Importación: ${created} creado(s), ${updated} actualizado(s)`), ...current.audit] };
    });
    return { created, updated };
  }

  function saveCategory(category: AdminCategory) {
    commit((current) => {
      const exists = current.categories.some((item) => item.id === category.id);
      return { ...current, categories: exists ? current.categories.map((item) => item.id === category.id ? { ...category, updatedAt: now() } : item) : [...current.categories, category], audit: [audit("category", category.id, exists ? "updated" : "created", category.nombre), ...current.audit] };
    });
  }

  function removeCategory(id: string) {
    if (state.products.some((product) => product.categoria === id)) return false;
    commit((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== id), audit: [audit("category", id, "deleted", id), ...current.audit] }));
    return true;
  }

  function quoteDiscount(code: string, subtotal: number): DiscountQuote {
    return computeDiscountQuote(state.discounts, subtotal, code);
  }

  async function dispatchEvent(event: AutomationEvent, payload: Record<string, unknown>) {
    const targets = state.automations.filter((workflow) => workflow.event === event && workflow.enabled);
    await Promise.all(targets.map((workflow) => executeWorkflow(workflow, payload, false)));
  }

  function createOrder(input: NewOrderInput) {
    for (const line of input.items) {
      const currentProduct = state.products.find((product) => product.id === line.producto.id);
      if (!currentProduct || currentProduct.visible_web === false || currentProduct.stock < line.cantidad) throw new Error(`No hay stock suficiente de ${line.producto.nombre}. Revisá el carrito antes de confirmar.`);
    }
    const createdAt = now();
    const subtotal = input.items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    const promotion = input.discountCode ? quoteDiscount(input.discountCode, subtotal) : null;
    if (promotion && !promotion.valid) throw new Error(promotion.message);
    const promotionDiscount = promotion?.amount ?? 0;
    const transferDiscount = input.paymentMethod === "transferencia" ? Math.round((subtotal - promotionDiscount) * state.settings.descuentoTransferencia / 100) : 0;
    const descuento = promotionDiscount + transferDiscount;
    const envio = promotion?.freeShipping ? 0 : state.settings.envioBase;
    const order: AdminOrder = {
      id: uid("order"), publicNumber: `CLS-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(5, "0")}`,
      items: input.items.map(({ producto, cantidad }) => ({ productId: producto.id, nombre: producto.nombre, sku: producto.id, cantidad, precioUnitario: producto.precio })),
      customer: input.customer, status: "pendiente", paymentStatus: "pendiente", paymentMethod: input.paymentMethod,
      subtotal, descuento, discountCode: promotion?.code, promotionDiscount, transferDiscount, envio, total: subtotal - descuento + envio, notas: input.notas,
      fulfillmentStatus: "pendiente", carrier: "", trackingCode: "", internalNotes: "", timeline: [{ id: uid("event"), type: "order", label: "Pedido creado", createdAt }], createdAt, updatedAt: createdAt,
    };
    commit((current) => {
      const existing = current.customers.find((customer) => customer.email.toLowerCase() === input.customer.email.toLowerCase());
      const customer: AdminCustomer = existing ? { ...existing, nombre: input.customer.nombre, telefono: input.customer.telefono, stage: "cliente" as CrmStage, totalPedidos: existing.totalPedidos + 1, gastoTotal: existing.gastoTotal + order.total, lastOrderAt: createdAt, updatedAt: createdAt } : { id: uid("customer"), nombre: input.customer.nombre, email: input.customer.email, telefono: input.customer.telefono, stage: "cliente", tags: ["checkout"], notas: "", totalPedidos: 1, gastoTotal: order.total, lastOrderAt: createdAt, createdAt, updatedAt: createdAt };
      const movements = input.items.map(({ producto, cantidad }) => ({ id: uid("movement"), productId: producto.id, productName: producto.nombre, delta: -cantidad, reason: `Venta ${order.publicNumber}`, createdAt }));
      return { ...current, orders: [order, ...current.orders], customers: existing ? current.customers.map((item) => item.id === existing.id ? customer : item) : [customer, ...current.customers], products: current.products.map((product) => { const line = input.items.find((item) => item.producto.id === product.id); return line ? { ...product, stock: Math.max(0, product.stock - line.cantidad) } : product; }), discounts: promotion?.ruleId ? current.discounts.map((discount) => discount.id === promotion.ruleId ? { ...discount, usageCount: discount.usageCount + 1, updatedAt: createdAt } : discount) : current.discounts, inventory: [...movements, ...current.inventory], audit: [audit("order", order.id, "created", `${order.publicNumber}${promotion ? ` · cupón ${promotion.code}` : ""}`), ...current.audit] };
    });
    void dispatchEvent("order.created", { orderId: order.id, publicNumber: order.publicNumber, total: order.total });
    input.items.forEach(({ producto, cantidad }) => { if (producto.stock - cantidad <= LOW_STOCK_THRESHOLD) void dispatchEvent("inventory.low", { productId: producto.id, productName: producto.nombre, stock: Math.max(0, producto.stock - cantidad) }); });
    return order;
  }

  function updateOrder(id: string, patch: OrderPatch) {
    const previous = state.orders.find((order) => order.id === id);
    if (!previous) return;
    const events: OrderTimelineEvent[] = [];
    if (patch.status && patch.status !== previous.status) events.push(timelineEvent("order", `Estado del pedido: ${patch.status}`));
    if (patch.paymentStatus && patch.paymentStatus !== previous.paymentStatus) events.push(timelineEvent("payment", `Estado del pago: ${patch.paymentStatus}`));
    if (patch.fulfillmentStatus && patch.fulfillmentStatus !== previous.fulfillmentStatus) events.push(timelineEvent("fulfillment", `Preparación: ${patch.fulfillmentStatus}`));
    if (patch.internalNotes && patch.internalNotes !== previous.internalNotes) events.push(timelineEvent("note", "Nota interna actualizada"));
    commit((current) => ({ ...current, orders: current.orders.map((order) => order.id === id ? { ...order, ...patch, timeline: [...events, ...order.timeline], updatedAt: now() } : order), audit: [audit("order", id, "updated", Object.keys(patch).join(", ")), ...current.audit] }));
    if (patch.paymentStatus === "pagado" && previous.paymentStatus !== "pagado") void dispatchEvent("payment.confirmed", { orderId: id, publicNumber: previous.publicNumber, total: previous.total });
    if (patch.fulfillmentStatus === "despachado" && previous.fulfillmentStatus !== "despachado") void dispatchEvent("fulfillment.shipped", { orderId: id, publicNumber: previous.publicNumber, carrier: patch.carrier ?? previous.carrier, trackingCode: patch.trackingCode ?? previous.trackingCode });
  }

  function saveCustomer(customer: AdminCustomer) { commit((current) => { const exists = current.customers.some((item) => item.id === customer.id); return { ...current, customers: exists ? current.customers.map((item) => item.id === customer.id ? { ...customer, updatedAt: now() } : item) : [customer, ...current.customers], audit: [audit("customer", customer.id, exists ? "updated" : "created", customer.nombre), ...current.audit] }; }); }
  function updateCustomer(id: string, patch: Partial<Pick<AdminCustomer, "stage" | "tags" | "notas">>) { commit((current) => ({ ...current, customers: current.customers.map((customer) => customer.id === id ? { ...customer, ...patch, updatedAt: now() } : customer), audit: [audit("customer", id, "updated", Object.keys(patch).join(", ")), ...current.audit] })); }

  function adjustStock(productId: string, delta: number, reason: string) {
    const product = state.products.find((item) => item.id === productId);
    if (!product || !Number.isFinite(delta) || delta === 0) return;
    const nextStock = Math.max(0, product.stock + delta);
    const movement = { id: uid("movement"), productId, productName: product.nombre, delta, reason, createdAt: now() };
    commit((current) => ({ ...current, products: current.products.map((item) => item.id === productId ? { ...item, stock: nextStock } : item), inventory: [movement, ...current.inventory], audit: [audit("inventory", productId, "adjusted", `${delta > 0 ? "+" : ""}${delta}: ${reason}`), ...current.audit] }));
    if (nextStock <= LOW_STOCK_THRESHOLD) void dispatchEvent("inventory.low", { productId, productName: product.nombre, stock: nextStock });
  }

  function saveContent(entry: ContentEntry) { commit((current) => ({ ...current, content: current.content.some((item) => item.id === entry.id) ? current.content.map((item) => item.id === entry.id ? { ...entry, updatedAt: now() } : item) : [entry, ...current.content], audit: [audit("content", entry.id, "saved", entry.titulo), ...current.audit] })); }
  function updateSettings(settings: StoreSettings) { commit((current) => ({ ...current, settings, audit: [audit("settings", "store", "updated", "Configuración comercial"), ...current.audit] })); }

  function saveDiscount(discount: DiscountRule) { commit((current) => { const exists = current.discounts.some((item) => item.id === discount.id); return { ...current, discounts: exists ? current.discounts.map((item) => item.id === discount.id ? { ...discount, updatedAt: now() } : item) : [{ ...discount, createdAt: discount.createdAt || now(), updatedAt: now() }, ...current.discounts], audit: [audit("discount", discount.id, exists ? "updated" : "created", discount.code), ...current.audit] }; }); }
  function removeDiscount(id: string) { commit((current) => ({ ...current, discounts: current.discounts.filter((item) => item.id !== id), audit: [audit("discount", id, "deleted", id), ...current.audit] })); }
  function saveCampaign(campaign: MarketingCampaign) { commit((current) => { const exists = current.campaigns.some((item) => item.id === campaign.id); return { ...current, campaigns: exists ? current.campaigns.map((item) => item.id === campaign.id ? { ...campaign, updatedAt: now() } : item) : [{ ...campaign, updatedAt: now() }, ...current.campaigns], audit: [audit("campaign", campaign.id, exists ? "updated" : "created", campaign.name), ...current.audit] }; }); }
  function updateCampaignStatus(id: string, status: MarketingCampaign["status"]) { commit((current) => ({ ...current, campaigns: current.campaigns.map((item) => item.id === id ? { ...item, status, updatedAt: now() } : item), audit: [audit("campaign", id, "status_updated", status), ...current.audit] })); }
  function saveAbandonedCart(cart: AbandonedCart) { const exists = state.abandonedCarts.some((item) => item.id === cart.id); commit((current) => ({ ...current, abandonedCarts: exists ? current.abandonedCarts.map((item) => item.id === cart.id ? { ...cart, updatedAt: now() } : item) : [{ ...cart, updatedAt: now() }, ...current.abandonedCarts], audit: [audit("abandoned_cart", cart.id, exists ? "updated" : "created", cart.email), ...current.audit] })); if (!exists) void dispatchEvent("cart.abandoned", { cartId: cart.id, total: cart.total, recoveryCode: cart.recoveryCode }); }
  function updateAbandonedCart(id: string, status: AbandonedCart["status"]) { commit((current) => ({ ...current, abandonedCarts: current.abandonedCarts.map((item) => item.id === id ? { ...item, status, updatedAt: now() } : item), audit: [audit("abandoned_cart", id, "status_updated", status), ...current.audit] })); }
  function createReturn(item: ReturnCase) { commit((current) => ({ ...current, returns: [item, ...current.returns], audit: [audit("return", item.id, "created", item.publicNumber), ...current.audit] })); void dispatchEvent("return.requested", { returnId: item.id, orderId: item.orderId, publicNumber: item.publicNumber, amount: item.amount }); }
  function updateReturn(id: string, status: ReturnCase["status"]) { commit((current) => { const target = current.returns.find((item) => item.id === id); const shouldRefund = target?.resolution === "refund" && status === "resolved"; return { ...current, returns: current.returns.map((item) => item.id === id ? { ...item, status, updatedAt: now() } : item), orders: shouldRefund ? current.orders.map((order) => order.id === target?.orderId ? { ...order, paymentStatus: "reintegrado", timeline: [timelineEvent("payment", "Reintegro registrado"), ...order.timeline], updatedAt: now() } : order) : current.orders, audit: [audit("return", id, "status_updated", status), ...current.audit] }; }); }
  function saveAutomation(workflow: AutomationWorkflow) { commit((current) => ({ ...current, automations: current.automations.map((item) => item.id === workflow.id ? { ...workflow, updatedAt: now() } : item), audit: [audit("automation", workflow.id, "updated", workflow.name), ...current.audit] })); }

  function recordRun(run: AutomationRun) { commit((current) => ({ ...current, automationRuns: [run, ...current.automationRuns].slice(0, 100), audit: [audit("automation", run.workflowId, "executed", `${run.status}: ${run.detail}`), ...current.audit] })); }

  async function executeWorkflow(workflow: AutomationWorkflow, payload: Record<string, unknown>, isTest: boolean): Promise<AutomationRun> {
    const createdAt = now();
    if (!workflow.webhookUrl.trim()) {
      const run: AutomationRun = { id: uid("run"), workflowId: workflow.id, workflowName: workflow.name, event: workflow.event, status: "configuration_required", detail: "Falta configurar la URL del webhook de n8n.", createdAt };
      recordRun(run);
      return run;
    }
    try {
      const url = new URL(workflow.webhookUrl);
      if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") throw new Error("El webhook debe usar HTTPS.");
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schema: "cls.automation.v1", source: "crazy-lady-admin", event: workflow.event, test: isTest, occurredAt: createdAt, data: payload }) });
      const run: AutomationRun = { id: uid("run"), workflowId: workflow.id, workflowName: workflow.name, event: workflow.event, status: response.ok ? "success" : "failed", httpStatus: response.status, detail: response.ok ? "n8n aceptó el evento." : `n8n respondió HTTP ${response.status}.`, createdAt };
      recordRun(run);
      return run;
    } catch (error) {
      const run: AutomationRun = { id: uid("run"), workflowId: workflow.id, workflowName: workflow.name, event: workflow.event, status: "failed", detail: error instanceof Error ? error.message : "No se pudo contactar a n8n.", createdAt };
      recordRun(run);
      return run;
    }
  }

  async function runAutomation(id: string, payload: Record<string, unknown> = {}) {
    const workflow = state.automations.find((item) => item.id === id);
    if (!workflow) throw new Error("La automatización no existe.");
    return executeWorkflow(workflow, { manualTest: true, ...payload }, true);
  }

  function saveStaff(member: StaffMember) { commit((current) => { const exists = current.staff.some((item) => item.id === member.id); return { ...current, staff: exists ? current.staff.map((item) => item.id === member.id ? { ...member, updatedAt: now() } : item) : [{ ...member, updatedAt: now() }, ...current.staff], audit: [audit("staff", member.id, exists ? "updated" : "invited", member.email || member.name), ...current.audit] }; }); }
  function updateStaffStatus(id: string, status: StaffMember["status"]) { if (id === "local-owner") return; commit((current) => ({ ...current, staff: current.staff.map((item) => item.id === id ? { ...item, status, updatedAt: now() } : item), audit: [audit("staff", id, "status_updated", status), ...current.audit] })); }

  function saveBotSettings(snapshot: BotPromptSnapshot) {
    commit((current) => {
      const { history, updatedAt, ...previous } = current.bot;
      const version = { ...previous, id: uid("prompt"), savedAt: updatedAt };
      return { ...current, bot: { ...snapshot, updatedAt: now(), history: [version, ...history].slice(0, BOT_LIMITS.historial) }, audit: [audit("bot", "emma", "prompt_updated", `${snapshot.nombre} · ${snapshot.prompt.length} caracteres`), ...current.audit] };
    });
  }

  function savePost(post: Nota) {
    commit((current) => {
      const exists = current.posts.some((item) => item.id === post.id);
      const saved = { ...post, updatedAt: now() };
      return { ...current, posts: exists ? current.posts.map((item) => item.id === post.id ? saved : item) : [saved, ...current.posts], audit: [audit("blog_post", post.id, exists ? "updated" : "created", `${post.titulo} · ${post.publicado ? "publicada" : "borrador"}`), ...current.audit] };
    });
  }

  function removePost(id: string) {
    commit((current) => {
      const post = current.posts.find((item) => item.id === id);
      if (!post) return current;
      return { ...current, posts: current.posts.filter((item) => item.id !== id), audit: [audit("blog_post", id, "deleted", post.titulo), ...current.audit] };
    });
  }

  function resetDemoData() { const fresh = initialState(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); localStorage.removeItem(LEGACY_STORAGE_KEY); setPersistenceError(false); } catch { setPersistenceError(true); } setState(fresh); }

  const value = useMemo<CommerceValue>(() => ({ ...state, persistenceError, saveProduct, removeProduct, bulkUpdateProducts, bulkDeleteProducts, importProducts, saveCategory, removeCategory, createOrder, quoteDiscount, updateOrder, saveCustomer, updateCustomer, adjustStock, saveContent, updateSettings, saveDiscount, removeDiscount, saveCampaign, updateCampaignStatus, saveAbandonedCart, updateAbandonedCart, createReturn, updateReturn, saveAutomation, runAutomation, triggerAutomation: dispatchEvent, saveStaff, updateStaffStatus, saveBotSettings, savePost, removePost, resetDemoData }), [state, persistenceError]);
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerceData() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error("useCommerceData debe usarse dentro de CommerceDataProvider");
  return value;
}

export const ORDER_STATUS: { value: OrderStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" }, { value: "confirmado", label: "Confirmado" }, { value: "preparando", label: "Preparando" },
  { value: "enviado", label: "Enviado" }, { value: "completado", label: "Completado" }, { value: "cancelado", label: "Cancelado" },
];

export const PAYMENT_STATUS: { value: PaymentStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" }, { value: "pagado", label: "Pagado" }, { value: "fallido", label: "Fallido" }, { value: "reintegrado", label: "Reintegrado" },
];

export const FULFILLMENT_STATUS: { value: FulfillmentStatus; label: string }[] = [
  { value: "pendiente", label: "Sin preparar" }, { value: "preparando", label: "Preparando" }, { value: "despachado", label: "Despachado" }, { value: "entregado", label: "Entregado" }, { value: "cancelado", label: "Cancelado" },
];
