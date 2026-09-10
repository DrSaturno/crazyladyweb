import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  Archive,
  BarChart3,
  Bot,
  Boxes,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  PackageSearch,
  Settings,
  SlidersHorizontal,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

const load = <T extends keyof typeof import("./pages/AdminModules")>(name: T) =>
  lazy(() => import("./pages/AdminModules").then((module) => ({ default: module[name] as ComponentType })));

export interface AdminModuleDefinition {
  id: string;
  label: string;
  description: string;
  path: string;
  group: "Operación" | "Relación" | "Análisis" | "Sistema";
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
  { id: "inventory", label: "Inventario", description: "Ajustes de stock y trazabilidad.", path: "/admin/inventario", group: "Operación", icon: Boxes, component: load("AdminInventory"), defaultEnabled: true },
  { id: "customers", label: "Clientes / CRM", description: "Etapas, etiquetas y seguimiento.", path: "/admin/clientes", group: "Relación", icon: UsersRound, component: load("AdminCustomers"), defaultEnabled: true },
  { id: "bot", label: "Bot y conversaciones", description: "Acceso al bot existente y sus canales.", path: "/admin/bot", group: "Relación", icon: Bot, component: load("AdminBot"), defaultEnabled: true },
  { id: "content", label: "Contenidos", description: "FAQ, banners y páginas informativas.", path: "/admin/contenidos", group: "Relación", icon: FileText, component: load("AdminContent"), defaultEnabled: true },
  { id: "metrics", label: "Métricas", description: "Ventas, conversión y productos.", path: "/admin/metricas", group: "Análisis", icon: BarChart3, component: load("AdminMetrics"), defaultEnabled: true },
  { id: "audit", label: "Auditoría", description: "Registro de cambios y responsables.", path: "/admin/auditoria", group: "Sistema", icon: Archive, component: load("AdminAudit"), defaultEnabled: true },
  { id: "settings", label: "Configuración", description: "Datos comerciales, pagos y envíos.", path: "/admin/configuracion", group: "Sistema", icon: Settings, component: load("AdminSettings"), defaultEnabled: true, locked: true },
  { id: "modules", label: "Módulos", description: "Activá o quitá secciones del tablero.", path: "/admin/modulos", group: "Sistema", icon: SlidersHorizontal, component: load("AdminModuleManager"), defaultEnabled: true, locked: true },
];

