# SPEC-N8N-01 — Plan de puesta en producción de las automatizaciones

**Estado:** plan listo para ejecutar — ninguna tarea iniciada todavía (las decisiones de §3 ya están tomadas; las de §4 siguen abiertas)
**Fecha:** 24 de septiembre de 2026
**Metodología:** SDD. Este documento es la fuente de verdad del trabajo pendiente de n8n y del camino a producción. Antes de implementar una tarea se actualiza el spec que la afecta (`N8N_INTEGRATION.md`, `ADMIN_SPEC.md`); al terminarla se agrega una entrada fechada en `ADMIN_AUDIT.md` y se tilda acá. Cada commit se pushea a `origin/main` en el momento.
**Pensado para traspaso:** cualquier agente (Claude, Codex) o persona puede retomar desde la primera tarea sin tildar, sin necesidad de leer el chat. Las tareas tienen ID, dueño, dependencias y criterio de aceptación verificable.

---

## 1. Hallazgos que condicionan todo (verificados en código el 24/09/2026)

1. **El disparo de eventos vive en el navegador, no en un servidor.** `dispatchEvent` (`src/context/CommerceDataContext.tsx:263`) filtra `state.automations` — que sale de `localStorage` de *ese* navegador — y hace `fetch` al webhook. Un cliente que compra en su propio navegador tiene sus automatizaciones en `enabled: false` y sus pedidos nunca llegan al admin. **Hoy `order.created`, `inventory.low` (por venta) y `cart.abandoned` no pueden funcionar en producción real**; solo funcionan las acciones hechas por el equipo desde el admin de *esa misma* computadora (`payment.confirmed`, `fulfillment.shipped`, `return.requested`, `conversation.handoff`).
2. **El payload no lleva datos de contacto del cliente**, y varias de las acciones elegidas contactan al cliente (email de pago, WhatsApp/email de despacho, email de carrito). Los datos existen en el estado (`order.customer`, `AbandonedCart.email/phone`) pero no se envían. Hace falta el contrato v1.1 (T-1).
3. **Los carritos abandonados no se capturan solos.** Solo se crean a mano en `/admin/carritos` (`AdminOperations.tsx:177`); la tienda pública no registra nada y `recoveryCode` (`VOLVE####`) no lo consume ninguna ruta ni el checkout.
4. **Los webhooks no se pueden autenticar desde el navegador** (un secreto en el bundle es público). Con la URL cualquiera puede disparar mensajes de WhatsApp desde tu número. La defensa real es despachar desde servidor (F4).
5. **WhatsApp Meta Cloud API exige plantillas aprobadas** para escribir fuera de la ventana de 24 h (aplica a *todos* los avisos al equipo y a los clientes). Aprobación: horas a días. Es el ítem de mayor plazo externo → arrancar ya.
6. **Riesgo de política de Meta:** el rubro (semillas) puede ser restringido por las políticas de comercio de WhatsApp/Meta. Mitigación: plantillas sin nombres de producto (solo N° de pedido, importe, transportista), y plan B (otro proveedor de WhatsApp o email-only para clientes).
7. **La instancia n8n conectada es compartida** (`devn8n.planetasaturno.com`): 23 workflows de otros proyectos y credenciales genéricas ("WhatsApp account", "Slack account", "Envio de mail TP CODER", varios Gmail/Sheets de Leo/Juli/Nico) cuya pertenencia no está confirmada. No hay ningún workflow de Crazy Lady Seeds creado todavía. **Regla: nunca reusar credenciales de otro proyecto sin confirmación explícita; todo lo de CLS se nombra con prefijo `CLS ·` y tag `crazy-lady-seeds`.**
8. La API key de n8n se pegó en texto plano en un chat el 16/09 → regenerarla (C-5).

## 2. Dos metas distintas (elegir consciente)

| Meta | Qué significa | Qué requiere | Cuánto |
|---|---|---|---|
| **A. Operación asistida** | n8n en vivo; el equipo opera desde el admin en una PC y los avisos de pago/despacho/devolución/derivación salen solos | F0 (parcial) + F1 + F2 + F3 | Camino corto: lo limita el plazo de Meta (días), no el desarrollo |
| **B. Producción real** | Cualquier cliente compra desde su casa, el pedido llega al admin y dispara todo | A + F4 + F5 | Camino largo: lo limita conectar Supabase (bloqueado por decisión del cliente, ver §7) |

Recomendación: **hacer A primero** (deja lista y probada toda la parte n8n, que en B se reutiliza sin cambios) y correr F4 en paralelo apenas exista el proyecto Supabase.

## 3. Decisiones de negocio tomadas (16/09/2026)

| Evento | Acciones | Destinatario |
|---|---|---|
| `order.created` | WhatsApp + Email + Slack | equipo de ventas |
| `payment.confirmed` | WhatsApp al equipo · Email de confirmación al cliente · Email al equipo | equipo / cliente |
| `fulfillment.shipped` | WhatsApp al cliente con tracking · Email al cliente con tracking · Aviso interno (**Slack o email: sin definir, default Slack**) | cliente / equipo |
| `inventory.low` | WhatsApp, máximo 1 vez por día por producto | encargado de compras |
| `cart.abandoned` | Email al cliente con código de recuperación · Registro en Google Sheets | cliente / interno |
| `conversation.handoff` | WhatsApp | equipo de atención |
| `return.requested` | WhatsApp + Email + Slack | equipo de atención/administración |

Proveedores elegidos: WhatsApp = **Meta Cloud API oficial**; Google Sheets para el registro de carritos. Email y Slack: **todavía sin configurar** (ver decisiones abiertas).

## 4. Decisiones abiertas (bloquean tareas puntuales)

| ID | Pregunta | Bloquea |
|---|---|---|
| D-1 | ¿"WhatsApp account" y "Slack account" ya existentes en n8n son de Crazy Lady Seeds? Recomendado: crear credenciales nuevas dedicadas. | K-1 |
| D-2 | Email: SMTP del dominio de CLS (recomendado) o Gmail dedicado. No usar "Envio de mail TP CODER". | W-2, W-3, W-5, W-7, K-1 |
| D-3 | Slack: ¿se usa realmente? Si no hay workspace, conviene reemplazarlo por WhatsApp/email y quitar la dependencia (simplifica 3 workflows). | W-1, W-3, W-7 |
| D-4 | Aviso interno de `fulfillment.shipped`: ¿Slack o email? | W-3 |
| D-5 | Planilla de carritos: ¿nueva dedicada a CLS (recomendado) o existente? Necesita ID. | W-5 |
| D-6 | ¿Cuál n8n es el de producción? `devn8n…` suena a desarrollo. | K-2 |
| D-7 | Teléfonos (formato E.164) de ventas, compras y atención; emails del equipo; remitente de los emails. | W-1…W-7 |
| D-8 | `inventory.low`: ¿re-avisar apenas el stock llega a 0 aunque ya se haya avisado hoy? (propuesto: sí) | W-4 |
| D-9 | Recuperación de carrito: ¿qué recibe el cliente y qué hace `recoveryCode`? (link `…/checkout?rec=CODIGO` que aplica un descuento, o solo un mensaje). Requiere feature en tienda (T-4). | W-5, T-4 |

## 5. Lista de faltantes para producción

**Externos (cliente / Nico)**
- [ ] Alta app Meta for Developers + número de WhatsApp Business verificado + token permanente de usuario de sistema
- [ ] 6 plantillas de WhatsApp (categoría *Utility*) enviadas y aprobadas
- [ ] Definir destinatarios y credenciales de email, Slack (o descartarlo), Google Sheets
- [ ] Decidir n8n de producción; regenerar la API key expuesta
- [ ] Proyecto Supabase de Crazy Lady Seeds (decisión del cliente, ver §7)
- [ ] Proveedor de pagos (Mercado Pago u otro) y logística
- [ ] Reglas comerciales/legales finales; opt-in de WhatsApp y política de privacidad actualizada

**Código / spec**
- [ ] Contrato v1.1 del payload (datos de contacto, `eventId`, cliente en devolución) + tests
- [ ] Captura real de carritos abandonados en la tienda + consumo de `recoveryCode`
- [ ] 7 workflows en n8n + workflow de errores + exportación al repo
- [ ] Despacho de eventos desde servidor (Edge Function / trigger) con secreto
- [ ] Conectar `CommerceDataContext` a Supabase (catálogo, checkout server-side, pedidos, clientes)
- [ ] Autenticación del admin + MFA
- [ ] Webhook de pago → `payment.confirmed` real
- [ ] E2E en staging, monitoreo, runbook

## 6. Plan por fases

Convención de dueño: **N** = Nico/cliente (no delegable), **AI** = Claude o Codex. Esfuerzo: S ≤ 2 h, M ≤ 1 día, L > 1 día.

### F0 — Desbloqueos externos (arrancar hoy, en paralelo con todo)

| ID | Tarea | Dueño | Criterio de aceptación |
|---|---|---|---|
| C-1 | Crear app de Meta + número WhatsApp Business de CLS + token permanente (usuario de sistema) | N | Enviar un mensaje de prueba desde Graph API Explorer al número de Nico |
| C-2 | Enviar a aprobación las 6 plantillas *Utility* (textos en §8) | N (AI redacta) | Las 6 en estado `APPROVED` |
| C-3 | Responder D-1…D-9 | N | Sección 4 sin filas abiertas (mover a §3) |
| C-4 | Crear en n8n las credenciales dedicadas de CLS (WhatsApp, email, Slack si D-3, Sheets) **desde la UI de n8n, sin pegar secretos en el chat** | N | 4 credenciales `CLS · …` visibles en n8n |
| C-5 | Regenerar la API key de n8n y actualizar `claude mcp` | N | La key vieja devuelve 401 |
| C-7 | Pedir a Supabase proyecto propio de CLS (habilita F4) | N | URL y publishable key en variables de entorno de Vercel |

### F1 — Spec y contrato (SDD, sin credenciales; Codex puede hacerlo)

| ID | Tarea | Archivos | Criterio de aceptación |
|---|---|---|---|
| T-1 | **Contrato v1.1 (aditivo, mismo `schema: cls.automation.v1`)**: agregar `customer: { nombre, email, telefono }` a `order.created`, `payment.confirmed`, `fulfillment.shipped`; en `cart.abandoned` agregar `customer` (desde `customerName/email/phone`) e `items`; en `return.requested` agregar `customerName`; en `inventory.low` sin cambios; `conversation.handoff` sin cambios. Agregar `eventId` (uid) al sobre para que n8n deduplique reintentos | `CommerceDataContext.tsx` líneas 285/299/300/322/324 (+ `executeWorkflow` para `eventId`); `AdminBotCenter.tsx:303` | Actualizado primero `N8N_INTEGRATION.md §2` (quitar "fijo, no cambia" → "solo cambios aditivos"); tests de los payload builders (extraer a funciones puras tipo `orderEngine.ts`); `npm run build` y `npm test` verdes |
| T-2 | Tests: un caso por evento verificando forma exacta del `data` | `src/context/*.test.ts` | Falla si se quita un campo del contrato |
| T-3 | Actualizar `ADMIN_SPEC.md §4 (n8n)` y `§8`, entrada nueva en `ADMIN_AUDIT.md`, marcar §3 de este doc | docs | Coincide con lo implementado |
| T-4 | **Captura de carrito abandonado en la tienda + `recoveryCode` funcional** según D-9: al ingresar email/teléfono en checkout y no completar tras N minutos, `saveAbandonedCart`; el checkout acepta `?rec=` y aplica el descuento asociado | `src/pages/*Checkout*`, `CommerceDataContext.tsx`, `AdminOperations.tsx` | Prueba manual: cargar carrito, salir, aparece en `/admin/carritos` sin intervención; abrir link con `rec` aplica el descuento |

### F2 — Workflows en n8n (AI con n8n-mcp; si no hay MCP, importar los JSON de `n8n-workflows/`)

Convenciones para **todos**: nombre `CLS · <evento>`, tag `crazy-lady-seeds`, `path` = id del evento (ver `N8N_INTEGRATION.md §3`), Webhook con *Allowed Origins* = dominio de la tienda, **responder 200 apenas llega el evento** (`responseMode: onReceived`) y procesar después para que un envío lento no cuelgue el navegador, dedupe por `eventId`, y **si `body.test === true`: no contactar nunca a clientes; los avisos internos salen prefijados `[PRUEBA]`**. Nodos de envío con `continueOnFail` + workflow de errores.

| ID | Workflow | Nodos / lógica | Depende de |
|---|---|---|---|
| W-0 | `CLS · Errores` | Error Trigger → aviso al equipo (WhatsApp o email) con nombre de workflow y ejecución | T-1 |
| W-1 | `CLS · Pedido creado` | Webhook → WhatsApp plantilla `cls_pedido_nuevo` a ventas + Email al equipo + Slack (si D-3) | T-1, D-2, D-3, D-7 |
| W-2 | `CLS · Pago confirmado` | WhatsApp al equipo + Email al equipo + Email al cliente (`customer.email`, salta si vacío) | T-1, D-2 |
| W-3 | `CLS · Pedido despachado` | WhatsApp plantilla `cls_pedido_despachado` al cliente (`customer.telefono`) + Email al cliente con transportista y código + aviso interno (D-4). Ramas de cliente se omiten si falta el dato | T-1, D-4 |
| W-4 | `CLS · Stock bajo` | Data Table `cls_inventory_alerts (productId, lastNotifiedAt)`: si `now − lastNotifiedAt < 24 h` corta; si pasó, WhatsApp a compras y upsert. Excepción D-8: `stock = 0` re-avisa | D-7, D-8 |
| W-5 | `CLS · Carrito abandonado` | Email al cliente con `recoveryCode` (y link según D-9) + fila en Google Sheets (fecha, cartId, cliente, total, código) | T-4, D-5, D-9 |
| W-6 | `CLS · Derivación humana` | WhatsApp plantilla `cls_derivacion` a atención con canal, cliente y tema | D-7 |
| W-7 | `CLS · Devolución solicitada` | WhatsApp + Email + Slack (si D-3) al equipo | D-2, D-3 |
| W-8 | Exportar los 7 finales al repo (`n8n-workflows/*.json`, reemplazando los esqueletos) y actualizar su README | — | W-0…W-7 |

Criterio de aceptación de F2 (por workflow): `POST` con `test: true` devuelve 200; la ejecución en n8n muestra cada rama en verde o "omitida" con motivo; con `test: false` y datos de prueba de Nico (no de clientes) llega el mensaje real; un envío fallido dispara `CLS · Errores`. Validar con `n8n_validate_workflow` y `n8n_test_workflow` antes de activar.

### F3 — Activación (cierra la Meta A)

| ID | Tarea | Dueño | Criterio |
|---|---|---|---|
| K-1 | Asignar credenciales `CLS · …` a los nodos y activar los workflows | AI + N | Los 7 en `active` |
| K-2 | Cargar `VITE_N8N_WEBHOOK_BASE_URL` en Vercel (según D-6) y redeploy | N | Las 7 tarjetas de `/admin/automatizaciones` muestran URL |
| K-3 | Botón **Probar** en las 7 tarjetas y activar el switch de cada una | N | 7 ejecuciones `success` en el historial; mensajes `[PRUEBA]` recibidos |
| K-4 | Prueba real de punta a punta en el admin: pago → despacho → devolución | N | Llegan los avisos reales |

### F4 — Backbone de producción (Meta B; el verdadero camino crítico)

Bloqueado hasta que exista el Supabase de CLS (§7). Ya existen 3 migraciones en `supabase/migrations/` que hay que aplicar y auditar.

| ID | Tarea | Esfuerzo | Criterio |
|---|---|---|---|
| P-1 | Aplicar migraciones al proyecto real; variables `VITE_SUPABASE_*`; revisar RLS con los advisors | M | Sin advertencias críticas de seguridad |
| P-2 | Conectar `CommerceDataContext` a Supabase (catálogo → pedidos → clientes → inventario → resto), `localStorage` queda solo como caché | L | Un pedido hecho en otro navegador aparece en el admin |
| P-3 | Edge Function `create-order`: revalida precio/stock/idempotencia (principio 1 del spec) y reemplaza `createOrder` en el checkout público | L | Test: precio manipulado en el cliente se ignora |
| P-4 | **Despacho de eventos desde servidor**: trigger/webhook de base de datos o Edge Function `dispatch-automation` que llama a n8n con header secreto (`X-CLS-Secret`, credencial *Header Auth* en el Webhook de n8n); tabla `automations` con RLS de admin; el cliente deja de llamar a n8n salvo "Probar" vía función | L | Un pedido de un visitante anónimo dispara `order.created`; el webhook rechaza sin secreto (401/403) |
| P-5 | Autenticación del admin + MFA + guard de rutas (`admin_users`) | M | `/admin` inaccesible sin sesión |
| P-6 | Webhook del proveedor de pagos → `payment.confirmed` automático | M | Pago aprobado marca el pedido y avisa |
| P-7 | Logística: tarifario y credenciales (al lanzar puede quedar manual: transportista + código cargados por el equipo) | S–M | Decisión documentada |
| P-8 | Bot real (canales WhatsApp/Instagram/Telegram) — hoy `conversation.handoff` solo sale del botón "Intervenir" | L | Fuera del go-live salvo pedido expreso del cliente |

### F5 — Salida a producción

| ID | Tarea | Criterio |
|---|---|---|
| G-1 | E2E en staging: compra → 3 avisos de pedido → pago → email al cliente → despacho → WhatsApp con tracking → carrito abandonado → devolución | Checklist completa sin intervención manual |
| G-2 | Monitoreo: `CLS · Errores` activo, revisión semanal de ejecuciones fallidas del panel | Aviso real recibido en una falla provocada |
| G-3 | Runbook (qué hacer si cae n8n, si Meta bloquea una plantilla, cómo rotar secretos) en `docs/` | Documento revisado por Nico |
| G-4 | Opt-in de WhatsApp en checkout + política de privacidad + revisión de política de Meta para el rubro | Aprobado por el cliente |
| G-5 | Rotar todas las claves usadas en pruebas | Claves nuevas cargadas solo en variables de entorno/credenciales |

## 7. Camino crítico y paralelización

```
HOY:      C-1 ─ C-2 (plazo Meta: días) ──────────────┐
          C-3 (decisiones) ─┬─ C-4 credenciales ─────┤
          C-5 regenerar key │                         ├─ K-1..K-4 ── META A ✔
          T-1 ─ T-2 ─ T-3 ──┴─ W-0..W-8 ─────────────┘
          C-7 Supabase ───────── P-1 ─ P-2 ─ P-3 ─ P-4 ─ P-5 ─ P-6 ── G-1..G-5 ── META B ✔
```

- **Meta A** se puede cerrar apenas Meta apruebe las plantillas; todo el desarrollo (T-1…W-8) cabe en 1–2 jornadas de trabajo de agente.
- **Meta B** depende de una decisión del cliente, no de esfuerzo: el propio cliente dijo que la autenticación y la base se harán "de un saque" cuando se dé de alta Supabase. Ese es el primer disparador de F4; hasta entonces F4 no debe arrancar.
- Lo único que Nico tiene que hacer para acelerar hoy: C-1, C-2, C-3, C-5, C-7.

## 8. Plantillas de WhatsApp a enviar a Meta (texto propuesto, categoría Utility, idioma es_AR)

Sin nombres de producto por la política de rubro (hallazgo 6). Variables `{{n}}`.

1. `cls_pedido_nuevo` — "Nuevo pedido {{1}} por ${{2}}. Revisalo en el panel de Crazy Lady."
2. `cls_pago_confirmado` — "Se acreditó el pago del pedido {{1}} por ${{2}}. Ya se puede preparar."
3. `cls_pedido_despachado` (cliente) — "Hola {{1}}, tu pedido {{2}} salió con {{3}}. Código de seguimiento: {{4}}."
4. `cls_stock_bajo` — "Alerta de stock: {{1}} quedó con {{2}} unidades."
5. `cls_derivacion` — "Emma derivó una conversación de {{1}} ({{2}}). Tema: {{3}}."
6. `cls_devolucion` — "Nueva devolución {{1}} del pedido {{2}} por ${{3}}."

## 9. Guía de traspaso (Claude → Codex u otra persona)

1. Leer, en orden: este documento, `N8N_INTEGRATION.md`, `ADMIN_SPEC.md §4 y §8`, últimas entradas de `ADMIN_AUDIT.md`.
2. Tomar la primera tarea sin tildar cuyo "depende de" esté cumplido y que no sea de dueño **N**.
3. SDD: actualizar spec → implementar → verificar (`npm run build`, `npm test`, y en la UI real) → entrada fechada en `ADMIN_AUDIT.md` → tildar acá → commit → `git push origin main` de inmediato.
4. Sin acceso al MCP `n8n-mcp` (URL `https://devn8n.planetasaturno.com`, alcance usuario): editar los JSON de `n8n-workflows/` siguiendo las mismas convenciones y avisar a Nico para importarlos.
5. Nunca pedir ni pegar secretos en el chat; las credenciales se crean en la UI de n8n o en variables de entorno.
6. No tocar la carpeta `imagenes web/` (decisión del cliente) ni reusar credenciales de otros proyectos de la instancia n8n.
7. No construir autenticación ni conectar Supabase antes de que exista el proyecto del cliente (ver memoria `project_auth_blocked`).
