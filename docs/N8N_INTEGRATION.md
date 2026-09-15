# Integración con n8n — contrato y puesta en marcha

Este documento es la referencia técnica para conectar el panel admin (`/admin/automatizaciones`) con una instancia real de n8n. El código del lado del panel **ya está terminado y probado** (ver `ADMIN_AUDIT.md`); lo único que falta es la parte que vive en n8n.

## 1. Cómo se disparan los eventos

El panel dispara automáticamente 7 eventos desde la lógica de negocio real (no son botones de prueba sueltos):

| Evento | Se dispara cuando… | Archivo |
|---|---|---|
| `order.created` | Se confirma un pedido en el checkout | `CommerceDataContext.tsx` → `createOrder` |
| `payment.confirmed` | Un pedido pasa a `paymentStatus: "pagado"` | `CommerceDataContext.tsx` → `updateOrder` |
| `fulfillment.shipped` | Un pedido pasa a `fulfillmentStatus: "despachado"` | `CommerceDataContext.tsx` → `updateOrder` |
| `inventory.low` | El stock de un producto baja al umbral (`LOW_STOCK_THRESHOLD = 3`) | `CommerceDataContext.tsx` → `createOrder` / `adjustStock` |
| `cart.abandoned` | Se registra un carrito abandonado nuevo | `CommerceDataContext.tsx` → `saveAbandonedCart` |
| `conversation.handoff` | Emma (el bot) deriva una conversación a una persona | `AdminBotCenter.tsx` |
| `return.requested` | Se crea una devolución | `CommerceDataContext.tsx` → `createReturn` |

Cada evento solo llama al webhook si la automatización correspondiente está **configurada** (tiene `webhookUrl`) **y activada** (`enabled: true`) desde `/admin/automatizaciones`.

## 2. Contrato del payload (fijo, no cambia por evento)

Todo POST que sale del panel tiene el mismo sobre exterior:

```json
{
  "schema": "cls.automation.v1",
  "source": "crazy-lady-admin",
  "event": "order.created",
  "test": false,
  "occurredAt": "2026-09-15T21:00:00.000Z",
  "data": { "...": "payload específico del evento, ver tabla abajo" }
}
```

- `test: true` cuando el envío sale del botón "Probar" del panel (útil para no procesar de verdad en n8n si filtrás por este campo).
- El navegador exige HTTPS en la URL del webhook, salvo `localhost`/`127.0.0.1` para pruebas locales.
- No se envían tokens, firmas ni credenciales — si tu workflow necesita autenticar el origen, agregá un header secreto fijo en el nodo Webhook de n8n y validalo ahí (el panel no puede firmar peticiones desde el navegador de forma segura).

### `data` por evento

```jsonc
// order.created
{ "orderId": "order-abc123", "publicNumber": "CLS-2026-00042", "total": 53000 }

// payment.confirmed
{ "orderId": "order-abc123", "publicNumber": "CLS-2026-00042", "total": 53000 }

// fulfillment.shipped
{ "orderId": "order-abc123", "publicNumber": "CLS-2026-00042", "carrier": "Andreani", "trackingCode": "AR123456789" }

// inventory.low
{ "productId": "prod-xyz", "productName": "Amnesia x4", "stock": 2 }

// cart.abandoned
{ "cartId": "cart-abc", "total": 21000, "recoveryCode": "REC-8842" }

// conversation.handoff
{ "conversationId": "conv-123", "channel": "whatsapp", "customerName": "Juan Pérez", "topic": "Consulta sobre stock" }

// return.requested
{ "returnId": "ret-abc", "orderId": "order-abc123", "publicNumber": "CLS-2026-00042", "amount": 21000 }
```

## 3. URLs esperadas

El panel arma la URL de cada webhook como `{VITE_N8N_WEBHOOK_BASE_URL}/{id}`, donde `{id}` es fijo por evento:

```
{base}/order-created
{base}/payment-confirmed
{base}/fulfillment-shipped
{base}/inventory-low
{base}/cart-abandoned
{base}/conversation-handoff
{base}/return-requested
```

Si preferís no usar la variable de entorno, cada webhook se puede pegar a mano (URL completa, sin necesidad de que respete ese sufijo) desde el botón "Configurar" de cada tarjeta en `/admin/automatizaciones`.

## 4. Puesta en marcha (paso a paso)

1. **Importar los 7 workflows** — están en [`n8n-workflows/`](../n8n-workflows/), uno por evento, listos para importar tal cual (n8n → Workflows → Import from File). Cada uno trae:
   - Un nodo **Webhook** (POST) con el `path` ya puesto correctamente (`order-created`, `payment-confirmed`, etc.).
   - Un nodo **Set** de placeholder llamado `TODO: acción real` que solo deja pasar los datos — ahí se agrega lo que realmente tiene que pasar (mandar un WhatsApp, escribir en una planilla, notificar por Slack, etc.). Sin tocar ese nodo, el workflow funciona igual (responde 200 OK) pero no hace nada más.
   - Un nodo **Respond to Webhook** que devuelve `{ "received": true }` con 200, para que el panel registre la ejecución como éxito.
2. **Activar cada workflow** en n8n (el toggle de arriba a la derecha del editor) — mientras esté inactivo, la URL del webhook no responde y el panel va a registrar la ejecución como `failed`.
3. **Copiar la URL de producción** del nodo Webhook de cada workflow (no la de test) — en n8n aparece en el panel del nodo, algo como `https://tu-n8n.dominio.com/webhook/order-created`.
4. **Configurar en el panel**, alguna de las dos formas:
   - **Todas de una:** en `.env` (o en las variables de entorno del hosting), agregar `VITE_N8N_WEBHOOK_BASE_URL=https://tu-n8n.dominio.com/webhook` (ver `.env.example`) y rebuildear. El panel arma las 7 URLs solo.
   - **Una por una:** en `/admin/automatizaciones`, botón "Configurar" en cada tarjeta, pegar la URL completa de ese workflow puntual.
5. **Probar desde el panel:** botón "Probar" en cada tarjeta — manda un payload con `test: true` y muestra el resultado (éxito / HTTP status / error) al instante, y queda en el historial de ejecuciones de abajo.
6. **Activar la automatización en el panel:** el switch "Activo"/"Inactivo" de cada tarjeta — sin esto, aunque el webhook esté bien configurado, los eventos reales del negocio no lo van a llamar (solo el botón "Probar" funciona con automatizaciones inactivas).

## 5. Qué falta decidir (no es técnico, es de negocio)

Los 7 workflows importables son solo el esqueleto — el nodo `TODO: acción real` de cada uno queda vacío porque **qué debe pasar en cada evento es una decisión del negocio**, no algo que se pueda inferir del código:

- ¿`order.created` manda un WhatsApp al equipo, una notificación a Slack, ambas?
- ¿`conversation.handoff` crea una tarea en qué sistema (Trello, un chat interno, un email)?
- ¿`inventory.low` avisa a quién, con qué frecuencia (para no spamear si el stock se queda bajo varios días)?

Decíme qué querés que haga cada uno y con qué herramienta (WhatsApp Business API, email, Slack, una planilla, etc.) y armo el contenido real de cada nodo.
