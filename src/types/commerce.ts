import type { Producto } from "../data/catalogo";

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
  envio: number;
  total: number;
  notas: string;
  createdAt: string;
  updatedAt: string;
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

export interface CommerceState {
  version: 1;
  products: Producto[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  inventory: InventoryMovement[];
  audit: AuditEntry[];
  content: ContentEntry[];
  settings: StoreSettings;
}

