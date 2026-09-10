# SPEC-ADMIN-01 — Centro de operaciones Crazy Lady Seeds

**Estado:** interfaz modular y operación local implementadas  
**Fecha:** 9 de septiembre de 2026  
**Alcance del bot:** integración visual del repositorio `DrSaturno/crazzyladyseeds`; sin ampliación de lógica ni canales reales.

## 1. Objetivo

Centralizar la operación del ecommerce en un tablero de marca que permita administrar catálogo, stock, pedidos, clientes, contenidos, métricas, configuración y conversaciones. Cada área vive como un módulo registrado y puede activarse o quitarse sin reescribir navegación ni rutas.

## 2. Módulos y aceptación

| Módulo | Capacidad implementada | Fuente |
|---|---|---|
| Resumen | ventas cobradas, pedidos abiertos, clientes, stock y alertas | datos operativos |
| Productos | alta, edición, búsqueda, publicación, precio, stock y baja | catálogo compartido |
| Categorías | alta, edición, orden, estado y borrado protegido | catálogo compartido |
| Ventas | pedido, cliente, total, estado comercial y de pago | checkout |
| Inventario | ajuste con motivo e historial de movimientos | productos/pedidos |
| Clientes / CRM | alta, etapa, etiquetas, notas, pedidos y gasto | checkout/manual |
| Bot | simulación existente para WhatsApp, Instagram, Telegram y Web | `clsKnowledge.ts` |
| Contenidos | FAQ, banner y página; borrador/publicado | contenido compartido |
| Métricas | ingresos, ticket, conversión, recurrencia y ranking | ventas reales |
| Auditoría | actor, entidad, acción, detalle, fecha y CSV | mutaciones administrativas |
| Configuración | datos comerciales, descuento, envío y flags de compra | configuración compartida |
| Módulos | activación/desactivación persistente; esenciales bloqueados | registro de módulos |

## 3. Arquitectura modular

- `moduleRegistry.ts` declara id, grupo, ruta, icono, descripción, carga diferida y estado inicial.
- `AdminModuleContext.tsx` persiste los módulos activos con una clave versionada.
- Una ruta desactivada vuelve al administrador de módulos y desaparece del menú.
- Resumen, configuración y administrador de módulos son esenciales y no se pueden quitar.
- Los módulos cargan con `React.lazy`, por lo que sumar uno nuevo no obliga a engordar el arranque público.

## 4. Fuente de datos y transición

En validación, `CommerceDataContext` ofrece una fuente única versionada en `localStorage`; los cambios del panel impactan inmediatamente en tienda, stock, carrito y checkout. Al conectar Supabase, el contrato se conserva y el almacenamiento local pasa a ser caché/fallback, no una base de producción.

La migración `commerce_core` modela productos, categorías, clientes, órdenes, ítems, pagos, inventario, conversaciones, mensajes, contenido, configuración, módulos, analítica y auditoría.

## 5. Seguridad y trazabilidad productiva

- RLS habilitada en todas las tablas públicas.
- Lectura anónima limitada a catálogo/contenido publicado.
- Operación administrativa condicionada a usuarios activos de `admin_users`.
- Roles y claves privilegiadas nunca se exponen al navegador.
- Grants explícitos y funciones privadas con `search_path` cerrado.
- Índices de claves foráneas, bandejas, pedidos abiertos y consultas de analítica.
- Auditoría por trigger para altas, cambios y bajas operativas.
- Órdenes y pagos públicos se crean mediante función de servidor con revalidación de precio, stock e idempotencia.

## 6. Responsive y accesibilidad

- Sidebar fijo en escritorio y drawer táctil en móvil.
- Tablas se transforman en fichas etiquetadas por debajo de 640 px.
- No existe scroll horizontal de página desde 320 px.
- Controles esenciales de 44 px, foco visible, labels persistentes y estados vacíos explícitos.

## 7. Pendientes para producción

- Proyecto Supabase específico y credenciales de entorno.
- Alta del primer propietario y MFA.
- Edge Function de checkout y webhook de pago una vez definido el proveedor autorizado.
- Tarifario y credenciales de logística.
- Webhooks y credenciales de WhatsApp, Instagram y Telegram cuando se retome el bot.
- Reglas comerciales, legales y de publicación finales aprobadas por Crazy Lady Seeds.

