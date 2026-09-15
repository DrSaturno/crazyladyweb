import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  Archive,
  BadgePercent,
  BarChart3,
  Bot,
  Boxes,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  NotebookPen,
  PackageSearch,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  UsersRound,
  WalletCards,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const load = <T extends keyof typeof import("./pages/AdminModules")>(name: T) =>
  lazy(() => import("./pages/AdminModules").then((module) => ({ default: module[name] as ComponentType })));

const loadOperations = <T extends keyof typeof import("./pages/AdminOperations")>(name: T) =>
  lazy(() => import("./pages/AdminOperations").then((module) => ({ default: module[name] as ComponentType })));

const loadBot = <T extends keyof typeof import("./pages/AdminBotCenter")>(name: T) =>
  lazy(() => import("./pages/AdminBotCenter").then((module) => ({ default: module[name] as ComponentType })));

const loadBlog = <T extends keyof typeof import("./pages/AdminBlog")>(name: T) =>
  lazy(() => import("./pages/AdminBlog").then((module) => ({ default: module[name] as ComponentType })));

export interface AdminModuleDefinition {
  id: string;
  label: string;
  description: string;
  path: string;
  group: "Operación" | "Relación" | "Crecimiento" | "Análisis" | "Sistema";
  icon: LucideIcon;
  component: LazyExoticComponent<ComponentType>;
  defaultEnabled: boolean;
  locked?: boolean;
}

export const ADMIN_MODULES: AdminModuleDefinition[] = [
  { id: "dashboard", label: "Resumen", description: "Pulso diario y alertas operativas.", path: "/admin", group: "Operación", icon: LayoutDashboard, component: load("AdminDashboard"), defaultEnabled: true, locked: true },
  { id: "products", label: "Productos", description: "Catálogo, publicación, precio y stock.", path: "/admin/productos", group: "Operación", icon: PackageSearch, component: load("AdminProducts"), defaultEnabled: true },
  { id: "categories", label: "Categorías", description: "Taxonomía modular del catálogo.", path: "/admin/categorias", group: "Operación", icon: FolderTree, component: load("AdminCategories"), defaultEnabled: true },
  { id: "orders", label: "Ventas", description: "Pedidos, pagos y preparación.", path: "/admin/ventas", group: "Operación", icon: ClipboardList, component: load("AdminOrders"), defaultEnabled: true },
  { id: "fulfillment", label: "Preparación y envíos", description: "Picking, despacho, seguimiento y entrega.", path: "/admin/envios", group: "Operación", icon: Truck, component: loadOperations("AdminFulfillment"), defaultEnabled: true },
  { id: "returns", label: "Devoluciones", description: "Postventa, cambios, créditos y reintegros.", path: "/admin/devoluciones", group: "Operación", icon: RotateCcw, component: loadOperations("AdminReturns"), defaultEnabled: true },
  { id: "inventory", label: "Inventario", description: "Ajustes de stock y trazabilidad.", path: "/admin/inventario", group: "Operación", icon: Boxes, component: load("AdminInventory"), defaultEnabled: true },
  { id: "customers", label: "Clientes / CRM", description: "Etapas, etiquetas y seguimiento.", path: "/admin/clientes", group: "Relación", icon: UsersRound, component: load("AdminCustomers"), defaultEnabled: true },
  { id: "abandoned-carts", label: "Carritos abandonados", description: "Recuperación, contacto y conversión.", path: "/admin/carritos-abandonados", group: "Relación", icon: ShoppingCart, component: loadOperations("AdminAbandonedCarts"), defaultEnabled: true },
  { id: "bot", label: "Bot y conversaciones", description: "Bandeja omnicanal, intervención y métricas de Emma.", path: "/admin/bot", group: "Relación", icon: Bot, component: loadBot("AdminBot"), defaultEnabled: true },
  { id: "content", label: "Contenidos", description: "FAQ, banners y páginas informativas.", path: "/admin/contenidos", group: "Relación", icon: FileText, component: load("AdminContent"), defaultEnabled: true },
  { id: "blog", label: "Diario / Blog", description: "Alta, edición, publicación y baja de notas del diario.", path: "/admin/diario", group: "Relación", icon: NotebookPen, component: loadBlog("AdminBlog"), defaultEnabled: true },
  { id: "discounts", label: "Descuentos", description: "Códigos, vigencia, reglas y límites.", path: "/admin/descuentos", group: "Crecimiento", icon: BadgePercent, component: loadOperations("AdminDiscounts"), defaultEnabled: true },
  { id: "marketing", label: "Marketing", description: "Campañas, audiencias, canales y calendario.", path: "/admin/marketing", group: "Crecimiento", icon: Megaphone, component: loadOperations("AdminMarketing"), defaultEnabled: true },
  { id: "metrics", label: "Métricas", description: "Ventas, conversión y productos.", path: "/admin/metricas", group: "Análisis", icon: BarChart3, component: load("AdminMetrics"), defaultEnabled: true },
  { id: "finance", label: "Finanzas", description: "Cobros, pendientes, reintegros y conciliación.", path: "/admin/finanzas", group: "Análisis", icon: WalletCards, component: loadOperations("AdminFinance"), defaultEnabled: true },
  { id: "automations", label: "Automatizaciones", description: "Eventos, webhooks y ejecuciones de n8n.", path: "/admin/automatizaciones", group: "Sistema", icon: Workflow, component: loadOperations("AdminAutomations"), defaultEnabled: true },
  { id: "team", label: "Equipo y permisos", description: "Roles, accesos y alcance por módulo.", path: "/admin/equipo", group: "Sistema", icon: ShieldCheck, component: loadOperations("AdminTeam"), defaultEnabled: true },
  { id: "audit", label: "Auditoría", description: "Registro de cambios y responsables.", path: "/admin/auditoria", group: "Sistema", icon: Archive, component: load("AdminAudit"), defaultEnabled: true },
  { id: "settings", label: "Configuración", description: "Datos comerciales, pagos y envíos.", path: "/admin/configuracion", group: "Sistema", icon: Settings, component: load("AdminSettings"), defaultEnabled: true, locked: true },
  { id: "modules", label: "Módulos", description: "Activá o quitá secciones del tablero.", path: "/admin/modulos", group: "Sistema", icon: SlidersHorizontal, component: load("AdminModuleManager"), defaultEnabled: true, locked: true },
];
