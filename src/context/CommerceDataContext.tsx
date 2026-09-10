import { createContext, useContext, useMemo, useState } from "react";
import { PRODUCTOS, type Producto } from "../data/catalogo";
import type {
  AdminCategory,
  AdminCustomer,
  AdminOrder,
  CommerceState,
  ContentEntry,
  CrmStage,
  OrderStatus,
  PaymentStatus,
  StoreSettings,
} from "../types/commerce";

const STORAGE_KEY = "cls_commerce_v1";
const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

function initialState(): CommerceState {
  const timestamp = now();
  return {
    version: 1,
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
  };
}

function readState(): CommerceState {
  if (typeof window === "undefined") return initialState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<CommerceState> | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.products)) return initialState();
    const seed = initialState();
    const savedContent = Array.isArray(parsed.content) ? parsed.content : [];
    return { ...seed, ...parsed, content: [...savedContent, ...seed.content.filter((entry) => !savedContent.some((saved) => saved.id === entry.id))], version: 1 };
  } catch {
    return initialState();
  }
}

interface NewOrderInput {
  items: { producto: Producto; cantidad: number }[];
  customer: AdminOrder["customer"];
  paymentMethod: AdminOrder["paymentMethod"];
  notas: string;
}

interface CommerceValue extends CommerceState {
  saveProduct: (product: Producto) => void;
  removeProduct: (id: string) => boolean;
  saveCategory: (category: AdminCategory) => void;
  removeCategory: (id: string) => boolean;
  createOrder: (input: NewOrderInput) => AdminOrder;
  updateOrder: (id: string, patch: Partial<Pick<AdminOrder, "status" | "paymentStatus">>) => void;
  saveCustomer: (customer: AdminCustomer) => void;
  updateCustomer: (id: string, patch: Partial<Pick<AdminCustomer, "stage" | "tags" | "notas">>) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  saveContent: (entry: ContentEntry) => void;
  updateSettings: (settings: StoreSettings) => void;
  resetDemoData: () => void;
}

const CommerceContext = createContext<CommerceValue | null>(null);

function audit(entity: string, entityId: string, action: string, detail: string) {
  return { id: uid("audit"), entity, entityId, action, detail, actor: "Administrador local", createdAt: now() };
}

export function CommerceDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CommerceState>(readState);

  function commit(recipe: (current: CommerceState) => CommerceState) {
    setState((current) => {
      const next = recipe(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function saveProduct(product: Producto) {
    commit((current) => {
      const exists = current.products.some((item) => item.id === product.id);
      return {
        ...current,
        products: exists ? current.products.map((item) => item.id === product.id ? product : item) : [product, ...current.products],
        audit: [audit("product", product.id, exists ? "updated" : "created", product.nombre), ...current.audit],
      };
    });
  }

  function removeProduct(id: string) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return false;
    commit((current) => ({ ...current, products: current.products.filter((item) => item.id !== id), audit: [audit("product", id, "deleted", product.nombre), ...current.audit] }));
    return true;
  }

  function saveCategory(category: AdminCategory) {
    commit((current) => {
      const exists = current.categories.some((item) => item.id === category.id);
      return {
        ...current,
        categories: exists ? current.categories.map((item) => item.id === category.id ? { ...category, updatedAt: now() } : item) : [...current.categories, category],
        audit: [audit("category", category.id, exists ? "updated" : "created", category.nombre), ...current.audit],
      };
    });
  }

  function removeCategory(id: string) {
    if (state.products.some((product) => product.categoria === id)) return false;
    commit((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== id), audit: [audit("category", id, "deleted", id), ...current.audit] }));
    return true;
  }

  function createOrder(input: NewOrderInput) {
    for (const line of input.items) {
      const currentProduct = state.products.find((product) => product.id === line.producto.id);
      if (!currentProduct || currentProduct.visible_web === false || currentProduct.stock < line.cantidad) {
        throw new Error(`No hay stock suficiente de ${line.producto.nombre}. Revisá el carrito antes de confirmar.`);
      }
    }
    const createdAt = now();
    const subtotal = input.items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    const descuento = input.paymentMethod === "transferencia" ? Math.round(subtotal * state.settings.descuentoTransferencia / 100) : 0;
    const order: AdminOrder = {
      id: uid("order"),
      publicNumber: `CLS-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(5, "0")}`,
      items: input.items.map(({ producto, cantidad }) => ({ productId: producto.id, nombre: producto.nombre, sku: producto.id, cantidad, precioUnitario: producto.precio })),
      customer: input.customer,
      status: "pendiente",
      paymentStatus: "pendiente",
      paymentMethod: input.paymentMethod,
      subtotal,
      descuento,
      envio: state.settings.envioBase,
      total: subtotal - descuento + state.settings.envioBase,
      notas: input.notas,
      createdAt,
      updatedAt: createdAt,
    };

    commit((current) => {
      const existing = current.customers.find((customer) => customer.email.toLowerCase() === input.customer.email.toLowerCase());
      const customer: AdminCustomer = existing ? {
        ...existing,
        nombre: input.customer.nombre,
        telefono: input.customer.telefono,
        stage: "cliente" as CrmStage,
        totalPedidos: existing.totalPedidos + 1,
        gastoTotal: existing.gastoTotal + order.total,
        lastOrderAt: createdAt,
        updatedAt: createdAt,
      } : {
        id: uid("customer"), nombre: input.customer.nombre, email: input.customer.email, telefono: input.customer.telefono,
        stage: "cliente", tags: ["checkout"], notas: "", totalPedidos: 1, gastoTotal: order.total,
        lastOrderAt: createdAt, createdAt, updatedAt: createdAt,
      };
      const movements = input.items.map(({ producto, cantidad }) => ({ id: uid("movement"), productId: producto.id, productName: producto.nombre, delta: -cantidad, reason: `Venta ${order.publicNumber}`, createdAt }));
      return {
        ...current,
        orders: [order, ...current.orders],
        customers: existing ? current.customers.map((item) => item.id === existing.id ? customer : item) : [customer, ...current.customers],
        products: current.products.map((product) => {
          const line = input.items.find((item) => item.producto.id === product.id);
          return line ? { ...product, stock: Math.max(0, product.stock - line.cantidad) } : product;
        }),
        inventory: [...movements, ...current.inventory],
        audit: [audit("order", order.id, "created", order.publicNumber), ...current.audit],
      };
    });
    return order;
  }

  function updateOrder(id: string, patch: Partial<Pick<AdminOrder, "status" | "paymentStatus">>) {
    commit((current) => ({
      ...current,
      orders: current.orders.map((order) => order.id === id ? { ...order, ...patch, updatedAt: now() } : order),
      audit: [audit("order", id, "status_updated", JSON.stringify(patch)), ...current.audit],
    }));
  }

  function saveCustomer(customer: AdminCustomer) {
    commit((current) => {
      const exists = current.customers.some((item) => item.id === customer.id);
      return { ...current, customers: exists ? current.customers.map((item) => item.id === customer.id ? { ...customer, updatedAt: now() } : item) : [customer, ...current.customers], audit: [audit("customer", customer.id, exists ? "updated" : "created", customer.nombre), ...current.audit] };
    });
  }

  function updateCustomer(id: string, patch: Partial<Pick<AdminCustomer, "stage" | "tags" | "notas">>) {
    commit((current) => ({ ...current, customers: current.customers.map((customer) => customer.id === id ? { ...customer, ...patch, updatedAt: now() } : customer), audit: [audit("customer", id, "updated", Object.keys(patch).join(", ")), ...current.audit] }));
  }

  function adjustStock(productId: string, delta: number, reason: string) {
    const product = state.products.find((item) => item.id === productId);
    if (!product || !Number.isFinite(delta) || delta === 0) return;
    const movement = { id: uid("movement"), productId, productName: product.nombre, delta, reason, createdAt: now() };
    commit((current) => ({ ...current, products: current.products.map((item) => item.id === productId ? { ...item, stock: Math.max(0, item.stock + delta) } : item), inventory: [movement, ...current.inventory], audit: [audit("inventory", productId, "adjusted", `${delta > 0 ? "+" : ""}${delta}: ${reason}`), ...current.audit] }));
  }

  function saveContent(entry: ContentEntry) {
    commit((current) => ({ ...current, content: current.content.some((item) => item.id === entry.id) ? current.content.map((item) => item.id === entry.id ? { ...entry, updatedAt: now() } : item) : [entry, ...current.content], audit: [audit("content", entry.id, "saved", entry.titulo), ...current.audit] }));
  }

  function updateSettings(settings: StoreSettings) {
    commit((current) => ({ ...current, settings, audit: [audit("settings", "store", "updated", "Configuración comercial"), ...current.audit] }));
  }

  function resetDemoData() {
    const fresh = initialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setState(fresh);
  }

  const value = useMemo<CommerceValue>(() => ({ ...state, saveProduct, removeProduct, saveCategory, removeCategory, createOrder, updateOrder, saveCustomer, updateCustomer, adjustStock, saveContent, updateSettings, resetDemoData }), [state]);
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
