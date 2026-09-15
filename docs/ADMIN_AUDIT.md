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

## 🟠 Alto — implementado en esta sesión (continuación 2)

- **`AdminOperations.tsx` — búsqueda, filtros, paginación y validación real en los módulos de mayor volumen**:
  - **Preparación y envíos**: búsqueda por pedido/cliente en la cola (antes no existía).
  - **Descuentos**: búsqueda por código + filtro por estado + paginación (12 por página). Probado con 15 códigos de prueba: filtro y paginación correctos.
  - **Marketing**: filtro por canal y estado + validación real (nombre, audiencia y presupuesto no negativo — antes el `min="0"` del input era solo HTML, se podía guardar un presupuesto negativo). Probado: presupuesto `-500` ahora se rechaza con mensaje.
  - **Carritos abandonados**: filtro por estado, validación de formato de email y de cantidades (antes solo se validaba que el email no estuviera vacío), y una acción masiva "Marcar los N abiertos como contactados" (antes no existía ninguna acción en lote). Probado de punta a punta.
  - **Devoluciones**: filtro por estado + validación de que el importe sea mayor a 0 y **no supere el total del pedido original** (antes no había ningún tope, se podía reintegrar más de lo que se cobró). Probado con un pedido de $20.000 e importe $999.999: rechazado con mensaje.
  - **Finanzas**: búsqueda por pedido/cliente + filtro por estado + paginación (12 por página) en la tabla de movimientos, que antes renderizaba todos los pedidos sin límite.
  - **Automatizaciones**: el historial de ejecuciones estaba fijo en las últimas 20 aunque el store conserva hasta 100 — sin forma de ver el resto. Ahora tiene paginación real sobre las 100.

## 🟠 Alto — implementado en esta sesión (continuación 3)

- **Umbral de "stock bajo" unificado**: era `≤3` hardcodeado en 3 archivos distintos (`AdminLayout.tsx`, `AdminModules.tsx` ×3, `CommerceDataContext.tsx` ×2). Ahora es una sola constante `LOW_STOCK_THRESHOLD` en `src/data/catalogo.ts`, usada en los 6 lugares — incluido el texto del filtro ("Stock bajo (≤3)"), que antes podía quedar desactualizado si alguien cambiaba el número en un solo lugar.
- **Feedback visible cuando falla la persistencia local**: antes, si `localStorage.setItem` fallaba (cuota llena, modo privado), el cambio quedaba solo en memoria sin ningún aviso — se perdía en el próximo refresh en silencio. Ahora `CommerceDataContext` expone `persistenceError` y `AdminLayout` muestra un banner rojo persistente en todas las páginas del admin mientras el último guardado no se pudo escribir, y desaparece solo en el próximo guardado exitoso. Probado simulando un `QuotaExceededError` real en `localStorage.setItem`.

## 🟠 Alto — implementado en esta sesión (continuación 4: tests)

- **Se agregó Vitest** (instalado en su versión 5, no la 2.x que tiene una vulnerabilidad de path traversal en `@vitest/mocker` — 0 vulnerabilidades tras la actualización). `npm test` corre la suite.
- **`src/admin/productImport.ts` (validador de importación de productos) — 11 tests.** Cubre: alta nueva, actualización por slug (nombre+banco), actualización por id explícito, categorías/enums inválidos, tope de precio/stock, `ciclo_semanas` opcional, duplicados dentro del archivo, números de fila correctos, parsing de `visible_web`/`destacado`, y **test de regresión específico para el bug de `id=""` encontrado antes** (dos filas nuevas sin id nunca vuelven a colisionar).
- **Motor de descuentos del checkout extraído y probado — 12 tests.** `quoteDiscount` vivía como función interna de `CommerceDataContext` (no se podía probar sin renderizar React); se extrajo tal cual a `src/context/discountEngine.ts` como función pura (mismo comportamiento, ahora con un parámetro `now` opcional para fechas determinísticas en tests). Cubre: código vacío, mayúsculas/espacios, código inexistente, borrador/pausado, antes de vigencia, vencido (incluyendo que el día de vencimiento cuenta completo), límite de usos, compra mínima, redondeo de porcentaje, tope de descuento fijo al subtotal, envío gratis, y que devuelve el `ruleId` correcto.
- Verificado que el refactor no cambió el comportamiento real: se creó un cupón 10% desde el admin y se aplicó en el checkout público real — descuento de $2.100 sobre $21.000, correcto.

## 🟠 Alto — implementado en esta sesión (continuación 5: consistencia visual)

Auditoría de consistencia sobre `cards, tablas, inputs, selects, checkboxes, badges, botones, iconos, modales, empty states` — el proyecto ya usaba bastante bien primitivas compartidas (`Panel`, `StatusBadge`, `fieldClass`, clases `.admin-table`/`.btn-*`), así que no había mucho roto. Se encontraron y corrigieron 2 inconsistencias reales:

- **Checkboxes y radios sin color de marca**: nunca se definió `accent-color`, así que cada checkbox/radio (selección masiva de Productos, checkboxes de publicar/destacar, permisos de Equipo, checkout público) renderizaba con el azul por defecto del navegador/SO, chocando contra la paleta verde/crema/miel de la marca. Se agregó `accent-color: var(--cls-forest)` en `html` (hereda a todos los controles, admin y tienda pública) en [src/index.css](../src/index.css). Verificado en `/admin/productos` (checkbox verde al tildar) y en el checkout público (sin romper nada).
- **Botón de cerrar con el carácter "×" en vez del ícono `X`**: en el banner de resultado de `AdminAutomations`, único lugar de todo el admin que no usaba el ícono `X` de lucide para "cerrar" (la barra lateral y el panel de notificaciones sí lo usan). Corregido para usar el mismo ícono.

## 🟠 Alto — implementado en esta sesión (continuación 6: búsqueda global)

El buscador del header (`AdminLayout.tsx`) solo buscaba dentro de los 20 módulos del menú — no encontraba nada de negocio real, contradiciendo el propio texto del placeholder ("Buscar un módulo o tarea…"). Ahora busca de verdad:

- **Productos** (nombre, banco, id) → resultado con banco, stock y precio, lleva a `/admin/productos?q=…` con el filtro de texto ya aplicado.
- **Ventas** (número de pedido, cliente, email) → resultado con cliente y total, lleva a `/admin/ventas?q=…`.
- **Clientes** (nombre, email, teléfono) → resultado con email, lleva a `/admin/clientes?q=…`. Se sumó un campo de búsqueda + filtro por etapa a `AdminCustomers`, que **no tenía ninguno** (no existía forma de encontrar un cliente puntual en el CRM salvo scrolleando).
- Los módulos siguen apareciendo, agrupados junto con las categorías nuevas.

`AdminProducts`, `AdminOrders` y `AdminCustomers` ahora leen `?q=` de la URL al montar para prellenar su buscador local, así el resultado de la búsqueda global aterriza con el filtro ya aplicado en vez de en una lista completa. Probado de punta a punta: buscar "amnesia" devuelve 4 productos reales; buscar un cliente de prueba lo encuentra en Ventas y en Clientes y navega a cada uno filtrado a 1 resultado; una búsqueda sin coincidencias muestra "Sin resultados" en vez de quedar en blanco.

## 🔴 Crítico — 2 bugs reales encontrados y corregidos (continuación 7: pase de bugs transversal)

Pase de bugs sobre módulos todavía no revisados (Categorías, Inventario, Métricas, Contenidos, Configuración, Auditoría, Módulos) y sobre el checkout/carrito público. Se encontraron y corrigieron dos bugs reales, ambos verificados de punta a punta en el navegador antes y después del fix:

1. **El pedido se cobraba al precio viejo del carrito, no al precio real del catálogo.** `createOrder` (`CommerceDataContext.tsx`) validaba el stock contra el producto **vivo**, pero calculaba el subtotal y guardaba `precioUnitario`/`nombre` desde la **foto que trae el carrito** (`localStorage`, puede tener días). Reproducido: agregado un producto a $21.000, subido el precio a $99.000 desde el admin sin tocar el carrito, el pedido se creaba a $21.000 — pérdida directa de $78.000 por unidad. Corregido resolviendo precio y nombre contra `state.products` en el momento de crear la orden, no contra la foto del carrito.
   - Al arreglar esto se destapó un problema peor: el **carrito y el checkout seguían mostrando el precio viejo** hasta el instante de confirmar, momento en el que el total registrado saltaba sin aviso (mostraba $18.900, el pedido se creaba por $89.100). Se corrigió de raíz: `CartContext` ahora se sincroniza contra el catálogo vivo (`useCommerceData().products`) cada vez que cambia, no solo al momento de pagar — así lo que ve la persona en el carrito siempre coincide con lo que termina pagando. De paso, un producto que se agota u oculta mientras está en el carrito de alguien ahora se quita solo, en vez de quedar como una fila rota.
2. **El formulario de edición de productos no se podía guardar para prácticamente ningún producto existente.** El campo "Imagen" era `<input type="url">`, que el navegador valida como URL absoluta — pero las fotos de estudio (commit `ca8cb4a`, "add studio photos for every product") usan rutas relativas (`/products/studio/…`), que son inválidas para ese tipo de input. El navegador bloqueaba el envío del formulario en silencio (sin mensaje visible salvo el tooltip nativo), así que **cualquier intento de editar y guardar un producto con foto de estudio no hacía nada** — probado y confirmado antes del fix (el precio nunca llegaba a `localStorage`). Corregido a `type="text"` con una ayuda que aclara que acepta ruta interna o URL completa.

Un tercer bug del mismo tipo, encontrado al arrancar este pase: **Configuración** copiaba `settings` a un `useState` local una sola vez; si el store cambiaba por otra vía en la misma pantalla (el botón "Restablecer datos locales" de ese mismo panel), el formulario seguía mostrando los valores viejos sin ningún aviso, y un guardado posterior los volvía a pisar sobre el reset recién hecho. Corregido con un efecto que resincroniza el formulario cuando cambia `settings`.

## 🟠 Alto — continuación 8: barrido módulo por módulo (pedido explícito del cliente)

Repaso sistemático de todo lo que no se había revisado con la misma lupa que encontró los 3 bugs anteriores (copias locales de datos que no se resincronizan, fixtures estáticas usadas donde debería usarse el catálogo vivo). Revisados sin hallazgos: `AdminCategories`, `AdminInventory`, `AdminMetrics`, `AdminContent`, `AdminAudit`, `AdminModuleManager`, la pestaña `Personalización` del bot (el `dirty` se recalcula fresco cada render, así que un cambio externo se nota enseguida — no tiene el bug de Configuración), `Header.tsx`, `Favoritos.tsx`, `ProductoDetalle.tsx`, `Cuenta.tsx`, `Gracias.tsx`.

Dos hallazgos reales, ambos corregidos:

1. **El widget del bot mostraba el nombre/banco viejo del producto en pantalla.** El mensaje "Veo que estás mirando…" resolvía el producto con `getProducto()` de `src/data/catalogo.ts` (la fixture estática de desarrollo), no contra `useCommerceData().products` (el catálogo vivo). Si se renombraba un producto desde el admin, el bot seguía usando el nombre viejo — y para cualquier producto dado de alta desde el admin (no en la fixture original), la función devolvía `undefined` y el mensaje ni aparecía. Probado: renombrado "Amnesia x4" a "Amnesia RENOMBRADA" desde el admin, el widget mostró el nombre nuevo correctamente tras el fix.
2. **Favoritos "parpadeaba" a 0 en cada carga de página.** `WishlistProvider` leía `localStorage` dentro de un `useEffect` (después del primer render) en vez de en el inicializador de `useState`, a diferencia de `CartContext` que sí lo hace bien. Se corrigió para que sea consistente: lectura síncrona, sin parpadeo.

## 🔴 Crítico — continuación 9: contraste de texto en todo el sitio (decisión del cliente)

El propio `docs/WEB_SPEC.md` (§9) exige contraste mínimo 4.5:1 para texto normal. Medí el contraste **real** (color + opacidad efectiva, no solo el color base) de los textos secundarios que usan `text-cls-ink/NN` y `text-cls-paper/NN` en todo el sitio (admin y tienda pública) — ninguno llegaba al mínimo: `ink/65` (el más oscuro en uso) daba 4.36:1, `ink/45` daba 2.56:1; en fondo miel (el peor caso del sitio) se necesita ≥80% de opacidad para pasar.

**Decisión del cliente (15/09/2026): oscurecer los tokens de opacidad en todo el sitio.** Se hizo con un reemplazo global, no archivo por archivo:

- `text-cls-ink/NN` (texto oscuro sobre fondos claros): mapeado 35→80, 40→82, 45→84, 50→86, 55→88, 60→90, 65→92, 70→94, 75→96 — todos ahora ≥80%, que pasa 4.5:1 incluso sobre el fondo miel (el más exigente de la paleta).
- `text-cls-paper/NN` (texto claro sobre fondos oscuros como `bg-cls-primary`): mapeado 45→65, 50→66, 55→67, 60→68 — 65% es el piso que pasa 4.5:1 sobre `bg-cls-primary` (el fondo oscuro más claro de la paleta, el caso más exigente). Los que ya estaban en 70/75/80 se dejaron igual.
- `text-cls-primary/NN` se dejó sin tocar: se verificó que **todos** sus usos son íconos decorativos (`aria-hidden` o ilustrativos en estados vacíos), exentos de la regla de contraste de texto.
- Dos usos dentro de `@apply` en `index.css` no podían llevar el valor arbitrario resultante (Tailwind solo resuelve opacidades múltiplo de 5 dentro de `@apply`, a diferencia de las clases en JSX que sí aceptan cualquier valor); se ajustaron a 85/95, los múltiplos de 5 más cercanos que siguen pasando 4.5:1.
- Verificado con una medición real en el DOM renderizado (no solo el cálculo teórico): de 39 elementos de texto revisados en el Resumen del admin, solo 1 seguía fallando — la insignia numérica de notificaciones (blanco sobre `bg-cls-orange`, 2.98:1; ningún color oscuro de la marca llegaba a 4.5:1 contra ese naranja específico). **Corregido (15/09/2026)**: se cambió el fondo de esa insignia puntual a `bg-cls-primary-dark` (ya existente en la paleta, no es un color nuevo) → 12.98:1. Verificado con la misma medición real en el DOM.

## 🟡 Medio
- Doble enlace a la tienda pública con distinto label ("Ver tienda pública" vs "Tienda") — menor, cosmético.

## 🟢 Confirmado sin código muerto

- Sin `TODO`/`FIXME`, sin `console.log`, sin `catch {}` totalmente vacíos, sin `any` explícito, sin `onClick` decorativos en todo `src/`. El código existente es limpio; la deuda es de **funcionalidad faltante**, no de basura acumulada.
- `AdminAutomations` prueba webhooks con `fetch` real (no mock). `AdminFinance`/`AdminAudit` exportan CSV real desde datos reales. Las métricas de `AdminDashboard` y del centro del bot se calculan desde `useCommerceData()`, no hay números fijos.

## Roadmap de implementación (orden de trabajo)

1. ~~Sidebar (logo, colapso, layout)~~ — hecho 15/09/2026.
2. ~~Productos: filtros, bulk actions, importación/exportación Excel/CSV con preview y reporte de errores~~ — hecho 15/09/2026.
3. ~~Paginación + búsqueda + validaciones reales en los módulos de `AdminOperations.tsx` (Preparación y envíos, Descuentos, Marketing, Carritos abandonados, Devoluciones, Finanzas, Automatizaciones)~~ — hecho 15/09/2026.
4. ~~Constante compartida para umbral de stock bajo~~ — hecho 15/09/2026.
5. ~~Feedback visible cuando falla la persistencia local~~ — hecho 15/09/2026.
6. ~~Tests automatizados para la lógica de mayor riesgo (importación Excel, motor de descuentos del checkout)~~ — hecho 15/09/2026.
7. Autenticación real — solo cuando exista el Supabase del cliente (bloqueado por decisión de negocio, ver sección crítica).
8. Doble enlace a la tienda pública con distinto label — cosmético, baja prioridad.
9. Desalineación de esquema `products.images` (array) vs `Producto.imagen` (string) — a resolver cuando se conecte Supabase.
