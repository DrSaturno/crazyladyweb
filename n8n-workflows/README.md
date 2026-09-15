# Workflows de n8n para Crazy Lady Seeds

7 workflows, uno por cada evento que el panel admin ya dispara. Instrucciones completas de puesta en marcha y contrato del payload en [`docs/N8N_INTEGRATION.md`](../docs/N8N_INTEGRATION.md).

Import rápido: n8n → **Workflows** → **Import from File** → elegir el `.json` correspondiente. Cada uno trae un nodo Webhook con el `path` ya correcto, un nodo `TODO: acción real` de placeholder (ahí va lo que realmente tiene que pasar en cada evento) y un nodo de respuesta que devuelve 200 OK.

| Archivo | Evento | Path del webhook |
|---|---|---|
| `order-created.json` | Pedido creado | `/order-created` |
| `payment-confirmed.json` | Pago confirmado | `/payment-confirmed` |
| `fulfillment-shipped.json` | Pedido despachado | `/fulfillment-shipped` |
| `inventory-low.json` | Stock bajo | `/inventory-low` |
| `cart-abandoned.json` | Carrito abandonado | `/cart-abandoned` |
| `conversation-handoff.json` | Derivación humana (bot) | `/conversation-handoff` |
| `return-requested.json` | Devolución solicitada | `/return-requested` |

Después de importar, hay que **activar** cada workflow (toggle arriba a la derecha del editor de n8n) para que el webhook responda.
