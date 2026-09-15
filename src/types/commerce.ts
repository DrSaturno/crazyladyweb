import type { Producto } from "../data/catalogo";
import type { Nota } from "../data/notas";

export interface AdminCategory {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pendiente" | "confirmado" | "preparando" | "enviado" | "completado" | "cancelado";
export type PaymentStatus = "pendiente" | "pagado" | "fallido" | "reintegrado";
export type CrmStage = "nuevo" | "contactado" | "interesado" | "cliente" | "inactivo";
export type FulfillmentStatus = "pendiente" | "preparando" | "despachado" | "entregado" | "cancelado";
export type AutomationEvent = "order.created" | "payment.confirmed" | "fulfillment.shipped" | "inventory.low" | "cart.abandoned" | "conversation.handoff" | "return.requested";

export interface OrderItem {
  productId: string;
  nombre: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CustomerSnapshot {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
}

export interface AdminOrder {
  id: string;
  publicNumber: string;
  items: OrderItem[];
  customer: CustomerSnapshot;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "transferencia" | "mercado_pago";
  subtotal: number;
  descuento: number;
  discountCode?: string;
  promotionDiscount: number;
  transferDiscount: number;
  envio: number;
  total: number;
  notas: string;
  fulfillmentStatus: FulfillmentStatus;
  carrier: string;
  trackingCode: string;
  internalNotes: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEvent {
  id: string;
  type: "order" | "payment" | "fulfillment" | "note";
  label: string;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  stage: CrmStage;
  tags: string[];
  notas: string;
  totalPedidos: number;
  gastoTotal: number;
  lastOrderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  detail: string;
  actor: string;
  createdAt: string;
}

export interface ContentEntry {
  id: string;
  tipo: "faq" | "banner" | "pagina";
  titulo: string;
  contenido: string;
  publicado: boolean;
  updatedAt: string;
}

export interface StoreSettings {
  nombreTienda: string;
  email: string;
  whatsapp: string;
  descuentoTransferencia: number;
  envioBase: number;
  compraInvitado: boolean;
  mercadoPagoActivo: boolean;
}

export interface DiscountRule {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minimumAmount: number;
  usageLimit?: number;
  usageCount: number;
  status: "draft" | "active" | "paused" | "expired";
  startsAt: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: "email" | "whatsapp" | "instagram" | "telegram";
  objective: "conversion" | "retention" | "launch" | "education";
  audience: string;
  budget: number;
  status: "draft" | "scheduled" | "active" | "completed" | "paused";
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbandonedCart {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  items: number;
  total: number;
  status: "open" | "contacted" | "recovered" | "dismissed";
  recoveryCode: string;
  lastActivityAt: string;
  updatedAt: string;
}

export interface ReturnCase {
  id: string;
  orderId: string;
  publicNumber: string;
  reason: string;
  resolution: "refund" | "exchange" | "store_credit";
  status: "requested" | "approved" | "received" | "resolved" | "rejected";
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  event: AutomationEvent;
  webhookUrl: string;
  enabled: boolean;
  updatedAt: string;
}

export interface AutomationRun {
  id: string;
  workflowId: string;
  workflowName: string;
  event: AutomationEvent;
  status: "success" | "failed" | "configuration_required";
  httpStatus?: number;
  detail: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "support";
  status: "active" | "invited" | "disabled";
  modules: string[];
  createdAt: string;
  updatedAt: string;
}

export type BotTone = "profesional" | "cercano_humor" | "dinamico";

export interface BotPromptSnapshot {
  nombre: string;
  tono: BotTone;
  saludo: string;
  prompt: string;
}

export interface BotPromptVersion extends BotPromptSnapshot {
  id: string;
  savedAt: string;
}

export interface BotSettings extends BotPromptSnapshot {
  updatedAt: string;
  history: BotPromptVersion[];
}

export interface CommerceState {
  version: 2;
  products: Producto[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  inventory: InventoryMovement[];
  audit: AuditEntry[];
  content: ContentEntry[];
  settings: StoreSettings;
  discounts: DiscountRule[];
  campaigns: MarketingCampaign[];
  abandonedCarts: AbandonedCart[];
  returns: ReturnCase[];
  automations: AutomationWorkflow[];
  automationRuns: AutomationRun[];
  staff: StaffMember[];
  bot: BotSettings;
  posts: Nota[];
}
