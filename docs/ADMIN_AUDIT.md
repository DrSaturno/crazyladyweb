# Auditoría del panel admin — 15/09/2026

Auditoría técnica completa (arquitectura, UX/UI, seguridad, base de datos) del panel `/admin`, con el objetivo de llevarlo a nivel Shopify/Tiendanube en funcionalidad. Este documento es el roadmap vivo: se actualiza a medida que se implementa cada punto.

## Contexto real del proyecto (no asumir más de lo que hay)

- El panel corre **100% en modo local**: `CommerceDataContext` persiste todo en `localStorage`, no hay ninguna llamada a Supabase en el frontend hoy.
- El esquema de Supabase (`supabase/migrations/*.sql`) está completo, con RLS y auditoría reales — pero es **aspiracional**: nada del frontend lo consume todavía. Se conecta cuando exista el proyecto Supabase propio del cliente (ver `CrazyladySeeds/CLAUDE.md`).
- No hay backend propio (sin Node/API routes) — "backend" hoy es literalmente `CommerceDataContext`.

## 🔴 Crítico — decisión del cliente, no implementar sin confirmar

1. **`/admin` sin autenticación.** [src/App.tsx:59](../src/App.tsx#L59) monta el layout admin sin ningún guard. Cualquiera con la URL tiene control total. Es coherente con el modo local actual (no hay usuarios reales todavía), pero **antes de dar la URL del admin a Eliana/Nahuel en producción, esto tiene que resolverse** con Supabase Auth + `admin_users` (el esquema ya existe, ver `commerce_core.sql:8-27`).
   - **Decisión (15/09/2026): se deja documentado, no se implementa ahora.** Se retoma cuando exista el proyecto Supabase real del cliente.
2. **RLS con roles guardados pero no diferenciados.** `admin_users.role` (`owner/admin/manager/support`) existe en la DB pero ninguna policy lo usa — todo admin activo tiene los mismos privilegios. Si se activa Supabase, hay que decidir si real mente se quieren permisos por rol o si "admin sí/no" alcanza.
3. **Auditoría "inmutable" pero borrable.** La policy `_admin_all` en `audit_logs` incluye `update`/`delete` — un admin puede alterar su propio rastro. Si se activa Supabase, cambiar a policy de solo-insert para no-superadmin.

## 🟠 Alto — implementado en esta sesión

- **Sidebar**: logo desalineado (imagen 4500×5625 forzada en caja `h-12 w-16` con `object-cover object-top`, recortaba el logo) y sin forma de colapsar. → Corregido: caja cuadrada `object-contain`, botón real de colapsar/expandir con persistencia en `localStorage`, tooltips, rail de solo-íconos. Ver [AdminLayout.tsx](../src/admin/AdminLayout.tsx). El contenido ya usaba `minmax(0,1fr)` sin `max-width` — el "no aprovecha la pantalla" no era un bug real, se verificó.

## 🟠 Alto — implementado en esta sesión (continuación)

- **Productos**: agregados filtros (categoría, stock, publicación), selección + acciones masivas (publicar/ocultar/destacar/eliminar), paginación (20 por página) e importación/exportación real desde Excel/CSV con plantilla descargable, preview de validación fila por fila, reporte de errores descargable y 3 modos (crear/actualizar/ambos). Ver [src/admin/productImport.ts](../src/admin/productImport.ts) y [src/admin/pages/AdminProductImport.tsx](../src/admin/pages/AdminProductImport.tsx).
  - Se usa `xlsx` (SheetJS) instalado desde la build oficial parcheada (`cdn.sheetjs.com`, no la versión de npm que tiene 2 CVEs sin fix) y cargado con `import()` dinámico — no pesa en el bundle general del admin (492 KB en un chunk separado que solo se descarga al usar import/export).
  - **Bug real encontrado y corregido durante la prueba**: en `validateImport`, un `id` vacío en el Excel (`""`) no es "nulo" para el operador `??`, así que el fallback de UUID nunca se generaba — dos filas nuevas sin id explícito colisionaban en `id=""` y la segunda sobrescribía a la primera en vez de crearse aparte. Corregido normalizando `"" → undefined` antes del fallback.
  - Probado de punta a punta con un CSV real (fila válida nueva, fila con 3 errores simultáneos, fila que actualiza un producto existente por nombre+banco, y un duplicado dentro del mismo archivo) — los conteos y la auditoría (`Importación: N creado(s), M actualizado(s)`) salieron correctos tras el fix.
- **Todos los módulos de `AdminOperations.tsx`** (Preparación y envíos, Devoluciones, Descuentos, Marketing, Carritos abandonados, Finanzas, Automatizaciones, Equipo): sin paginación, sin búsqueda, sin bulk actions. Validaciones inconsistentes entre módulos (Descuentos es estricto; Marketing y Carritos abandonados casi no validan — ver detalle abajo).
- **Desalineación de esquema**: `products.images` en SQL es un array jsonb; el frontend (`Producto.imagen`) maneja una sola URL string. Si se conecta Supabase, definir si se migra a galería real o se deja en 1 imagen.

## 🟡 Medio

- Validaciones débiles puntuales: `AdminMarketing` solo valida `name`; presupuesto puede quedar negativo sin bloqueo real (el `min="0"` del input es solo HTML). `AdminAbandonedCarts` no valida formato de email. `AdminReturns` no compara el importe de la devolución contra el total del pedido original.
- Catches silenciosos en `CommerceDataContext.tsx:199,377` — si `localStorage.setItem` falla (cuota llena, modo incógnito), el cambio queda solo en memoria sin avisar al usuario; se pierde en el próximo refresh sin ningún mensaje.
- Umbral de "stock bajo" (`≤3`) hardcodeado en 3 lugares distintos sin constante compartida (`AdminLayout.tsx`, `AdminModules.tsx`, `CommerceDataContext.tsx`).
- Doble enlace a la tienda pública con distinto label ("Ver tienda pública" vs "Tienda") — menor, cosmético.

## 🟢 Confirmado sin código muerto

- Sin `TODO`/`FIXME`, sin `console.log`, sin `catch {}` totalmente vacíos, sin `any` explícito, sin `onClick` decorativos en todo `src/`. El código existente es limpio; la deuda es de **funcionalidad faltante**, no de basura acumulada.
- `AdminAutomations` prueba webhooks con `fetch` real (no mock). `AdminFinance`/`AdminAudit` exportan CSV real desde datos reales. Las métricas de `AdminDashboard` y del centro del bot se calculan desde `useCommerceData()`, no hay números fijos.

## Roadmap de implementación (orden de trabajo)

1. ~~Sidebar (logo, colapso, layout)~~ — hecho 15/09/2026.
2. ~~Productos: filtros, bulk actions, importación/exportación Excel/CSV con preview y reporte de errores~~ — hecho 15/09/2026.
3. Paginación + búsqueda + bulk actions en los módulos de `AdminOperations.tsx` que reciben más volumen (Ventas ya tiene búsqueda/filtro; Devoluciones, Carritos abandonados, Descuentos, Marketing no) — siguiente paso.
4. Reforzar validaciones débiles (Marketing, Carritos abandonados, Devoluciones).
5. Constante compartida para umbral de stock bajo.
6. Feedback visible cuando falla la persistencia local (toast, no silencioso).
7. Autenticación real — solo cuando exista el Supabase del cliente (bloqueado por decisión de negocio, ver sección crítica).
