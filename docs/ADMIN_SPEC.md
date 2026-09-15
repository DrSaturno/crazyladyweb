# SPEC-ADMIN-01 — Centro de operaciones Crazy Lady Seeds

**Estado:** centro operativo modular v3 implementado en modo local; conectores productivos pendientes de credenciales
**Fecha:** 10 de septiembre de 2026 — última revisión 15 de septiembre de 2026
**Alcance del bot:** centro omnicanal, métricas y personalización del prompt integrados sobre la información disponible; sin ampliar la lógica conversacional ni conectar canales reales.
**Metodología:** este documento es la fuente de verdad — se actualiza antes de implementar, no después (spec-driven development, decisión del cliente del 15/09/2026). `docs/ADMIN_AUDIT.md` es el registro fechado de auditoría, bugs y decisiones que sustenta cada cambio de este spec; no lo reemplaza.

## Principios no negociables (agregado 15/09/2026, tras el bug de precio de checkout)

1. El precio y el nombre de cada línea de pedido se resuelven **siempre** contra el catálogo vivo (`state.products`) en el momento de crear la orden — nunca contra la copia que trae el carrito, que puede tener horas o días. Esta regla está en código, no solo en la spec: `src/context/orderEngine.ts` (`buildOrderQuote`) es una función pura probada con tests que hacen justamente esto — pasarle un producto "viejo" en el carrito y un catálogo "vivo" distinto, y verificar que gana el vivo.
2. El carrito se resincroniza contra el catálogo vivo cada vez que cambia, no solo al pagar: lo que la persona ve siempre tiene que coincidir con lo que termina pagando. Un producto que se agota o se oculta mientras está en un carrito se quita solo.
3. Ningún formulario copia un valor del store a `useState` sin un mecanismo que lo resincronice si el store cambia por otra vía (reset, otra pestaña, otra acción). Si un componente hace `useState(valorDelStore)`, tiene que existir un `useEffect` o un `key` que lo mantenga al día.
4. Todo input nativo (`type="url"`, `type="email"`, etc.) tiene que aceptar los valores reales que el sistema produce — si el catálogo guarda rutas internas relativas, el campo no puede exigir una URL absoluta.

## 1. Objetivo

Centralizar la operación del ecommerce en un tablero de marca que permita administrar catálogo, stock, pedidos, clientes, contenidos, métricas, configuración y conversaciones. Cada área vive como un módulo registrado y puede activarse o quitarse sin reescribir navegación ni rutas.

## 2. Módulos y aceptación

| Módulo | Capacidad implementada | Fuente |
|---|---|---|
| Resumen | ventas cobradas, pedidos abiertos, clientes, stock y alertas | datos operativos |
| Productos | alta, edición, búsqueda, filtros (categoría/stock/publicación), paginación, selección y acciones masivas (publicar/ocultar/destacar/eliminar), importación y exportación Excel/CSV con validación y reporte de errores | catálogo compartido |
| Categorías | alta, edición, orden, estado y borrado protegido | catálogo compartido |
| Ventas | pedido, cliente, total, estado comercial y de pago, búsqueda y filtro por estado | checkout |
| Inventario | ajuste con motivo e historial de movimientos | productos/pedidos |
| Preparación y envíos | cola de picking con búsqueda, transportista, seguimiento, despacho y entrega | pedidos |
| Devoluciones | solicitud, aprobación, recepción, resolución, reintegro enlazado, filtro por estado y tope de importe contra el total del pedido | pedidos/pagos |
| Clientes / CRM | alta, edición, búsqueda, filtro por etapa, etiquetas, notas, pedidos y gasto | checkout/manual |
| Carritos abandonados | captura, contacto, descarte, recuperación, filtro por estado y acción masiva de contacto | checkout/n8n |
| Bot | bandeja única filtrable, etiquetas por canal, intervención humana, métricas y personalización del prompt para WhatsApp, Instagram, Telegram y Web | conversaciones/analítica/prompt |
| Contenidos | FAQ, banner y página; borrador/publicado | contenido compartido |
| Diario / Blog | alta, edición, vista previa, publicación y baja de notas del diario | notas compartidas |
| Descuentos | códigos, condiciones, vigencia, límites, activación, búsqueda, filtro por estado y paginación | promociones |
| Marketing | campañas por canal, audiencia, presupuesto, ciclo de publicación, filtros por canal/estado y validación real (nombre, audiencia, presupuesto no negativo) | CRM/n8n |
| Métricas | ingresos, ticket, conversión, recurrencia y ranking | ventas reales |
| Finanzas | conciliación de cobros, pendientes, reintegros, exportación, búsqueda, filtro por estado y paginación | pedidos/pagos |
| Automatizaciones | siete eventos configurables, prueba de webhook e historial de ejecuciones paginado sobre las últimas 100 | n8n |
| Equipo y permisos | roles, estado y alcance modular preparados para Auth | administración |
| Auditoría | actor, entidad, acción, detalle, fecha y CSV | mutaciones administrativas |
| Configuración | datos comerciales, descuento, envío y flags de compra; el formulario se resincroniza si el store cambia por otra vía (p. ej. reset) | configuración compartida |
| Módulos | activación/desactivación persistente; esenciales bloqueados | registro de módulos |
| Búsqueda global | busca productos, pedidos, clientes y módulos reales desde el header; cada resultado navega al módulo con el filtro ya aplicado (`?q=`) | catálogo/ventas/clientes |

## 3. Arquitectura modular

- `moduleRegistry.ts` declara id, grupo, ruta, icono, descripción, carga diferida y estado inicial.
- `AdminModuleContext.tsx` persiste los módulos activos con una clave versionada.
- Una ruta desactivada vuelve al administrador de módulos y desaparece del menú.
- Resumen, configuración y administrador de módulos son esenciales y no se pueden quitar.
- Los módulos cargan con `React.lazy`, por lo que sumar uno nuevo no obliga a engordar el arranque público.

## 4. Flujos operativos de aceptación

### Pedido a entrega

1. El checkout crea el pedido, descuenta stock y registra cliente, inventario y auditoría.
2. El equipo acredita o rechaza el pago desde la ficha del pedido.
3. Un pago acreditado puede pasar a preparación; el pedido conserva una línea de tiempo inmutable.
4. El despacho exige transportista y código de seguimiento.
5. El despacho emite `fulfillment.shipped`; la entrega cierra el flujo.

### Postventa

1. Una devolución se abre contra un pedido existente con motivo, resolución e importe.
2. Avanza por solicitada, aprobada, recibida y resuelta, o se rechaza.
3. Resolver con reintegro actualiza el pago del pedido a `reintegrado` y deja trazabilidad.

### Crecimiento y retención

1. Los descuentos nacen como borrador y validan código, tipo, vigencia, mínimo y límite; el checkout los revalida, aplica y registra su uso en el pedido.
2. Las campañas avanzan por borrador, programada, activa, pausada y completada.
3. Los carritos abandonados se registran una sola vez y avanzan por abierto, contactado, recuperado o descartado.

### n8n

1. Cada automatización tiene un evento y un webhook HTTPS independiente.
2. Solo las automatizaciones habilitadas reciben eventos reales del tablero.
3. La prueba manual envía un payload `cls.automation.v1` sin secretos y registra éxito, error HTTP o configuración faltante.
4. Los secretos, firmas y reintentos productivos deben vivir en una Edge Function o backend; nunca en el bundle del navegador.
5. Eventos cubiertos: `order.created`, `payment.confirmed`, `fulfillment.shipped`, `inventory.low`, `cart.abandoned`, `conversation.handoff` y `return.requested`.

### Bot omnicanal

1. El módulo contiene tres vistas internas: `Conversaciones`, `Métricas` y `Personalización`.
2. La bandeja reúne todas las charlas, permite buscar y filtrar por WhatsApp, Instagram, Telegram o Widget web y mantiene visible el canal, estado y tema de cada conversación.
3. La ficha muestra el historial completo; intervenir cambia el estado a atención humana y emite `conversation.handoff` hacia n8n cuando el flujo está habilitado.
4. Las métricas concentran volumen, resolución, tiempo promedio, contactos nuevos, derivaciones, ventas, actividad horaria, temas y rendimiento por canal.
5. En modo local se utilizan conversaciones y métricas demostrativas; la fuente productiva será `conversations`, `messages` y eventos analíticos de Supabase.
6. `Personalización` edita nombre, tono, saludo inicial y prompt del sistema (parte del prompt v0.1 de Emma). Guardar exige nombre de 2 a 40 caracteres, saludo y un prompt de 50 a 20.000 caracteres; descartar vuelve a la versión vigente.
7. Cada guardado conserva la versión anterior (últimas 10) y deja un evento `prompt_updated` en auditoría. Cargar una versión la lleva al editor y se aplica recién al guardar.
8. El widget de la tienda usa el nombre y el saludo guardados. El prompt y el tono se envían al modelo cuando se conecte el cerebro real; en producción viven en `bot_prompts` (una versión activa por bot, lectura solo para administradores).

### Diario / Blog

1. Las notas son de tipo `guia` o `problema`; las de problema exigen causa más probable. Todas admiten un producto recomendado con botón de compra.
2. Alta y edición validan título, slug único con formato URL, bajada, fecha, minutos de lectura (1 a 120, o estimación automática) y cuerpo. El slug se genera desde el título mientras no se edite a mano; cambiar el slug de una nota publicada muestra una advertencia.
3. El cuerpo se escribe en párrafos separados por una línea en blanco y admite `**negrita**`; la vista previa muestra la nota antes de guardarla.
4. El editor avisa si el texto usa palabras vetadas por el cliente (flor/flores, hash, edibles, vapers), sin bloquear el guardado.
5. Solo las notas publicadas aparecen en `/notas`, en su URL de detalle y en el home; un borrador redirige al listado. Altas, cambios y bajas quedan en auditoría.
6. La fuente productiva es `blog_posts`: lectura anónima limitada a notas publicadas y escritura solo para administradores.

## 5. Fuente de datos y transición

En validación, `CommerceDataContext` ofrece una fuente única versionada en `localStorage`; los cambios del panel impactan inmediatamente en tienda, stock, carrito y checkout. Al conectar Supabase, el contrato se conserva y el almacenamiento local pasa a ser caché/fallback, no una base de producción.

La migración `commerce_core` modela productos, categorías, clientes, órdenes, ítems, pagos, inventario, conversaciones, mensajes, contenido, configuración, módulos, analítica y auditoría. La migración `blog_posts_bot_prompts` suma las notas del diario y las versiones del prompt del bot.

## 6. Seguridad y trazabilidad productiva

- RLS habilitada en todas las tablas públicas.
- Lectura anónima limitada a catálogo/contenido publicado.
- Operación administrativa condicionada a usuarios activos de `admin_users`.
- Roles y claves privilegiadas nunca se exponen al navegador.
- Grants explícitos y funciones privadas con `search_path` cerrado.
- Índices de claves foráneas, bandejas, pedidos abiertos y consultas de analítica.
- Auditoría por trigger para altas, cambios y bajas operativas.
- Órdenes y pagos públicos se crean mediante función de servidor con revalidación de precio, stock e idempotencia.

## 7. Responsive y accesibilidad

- Sidebar fijo en escritorio (colapsable a un riel de solo íconos, persistente en `localStorage`, con tooltips) y drawer táctil en móvil.
- Tablas se transforman en fichas etiquetadas por debajo de 640 px.
- No existe scroll horizontal de página desde 320 px.
- Controles esenciales de 44 px, foco visible, labels persistentes y estados vacíos explícitos.
- Checkboxes y radios usan el color de marca (`accent-color` global) en todo el sitio, admin y tienda pública.
- Si `localStorage.setItem` falla (cuota llena, modo privado), se muestra un aviso persistente en el admin en vez de perder el cambio en silencio.

## 8. Pendientes para producción

- Proyecto Supabase específico y credenciales de entorno.
- Alta del primer propietario y MFA.
- Edge Function de checkout y webhook de pago una vez definido el proveedor autorizado.
- Tarifario y credenciales de logística.
- Webhooks y credenciales de WhatsApp, Instagram y Telegram cuando se retome el bot.
- URL pública de webhooks n8n, política de firma, reintentos e idempotencia.
- Reglas comerciales, legales y de publicación finales aprobadas por Crazy Lady Seeds.
