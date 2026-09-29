# Guía — Alta de WhatsApp Business Cloud API para Crazy Lady Seeds

Cubre las tareas **C-1** y **C-2** de [`N8N_PRODUCTION_PLAN.md`](N8N_PRODUCTION_PLAN.md). Dueño: Nico (no delegable — requiere identidad legal del negocio, un teléfono que solo vos puedas verificar y aceptar términos). Nadie más puede completarla en tu nombre.

**Tiempo estimado:** 30–45 min de trabajo activo. **Tiempo de espera:** verificación de negocio y aprobación de plantillas pueden tardar de horas a varios días — por eso conviene arrancar ya, en paralelo con las decisiones D-1…D-9.

## Antes de empezar — juntá esto

- Un número de teléfono que **no** esté ya activo en la app normal de WhatsApp ni en WhatsApp Business (Meta lo va a "adoptar" para la API y deja de poder usarse en el celular). Si querés seguir usando el número actual de Crazy Lady Seeds en el celular del equipo, comprá una línea nueva para esto.
- Acceso a ese número para recibir un código de verificación (SMS o llamada).
- Datos legales del negocio: razón social o nombre del titular, dirección, y si tenés CUIT/documento que lo respalde (Meta puede pedir verificación de negocio — no siempre, pero conviene tenerlo a mano).
- Una cuenta de Facebook personal (Meta la exige para crear el Business Manager, aunque no vayas a usarla para nada más).

## Paso 1 — Meta Business Suite (Business Manager)

1. Entrá a [business.facebook.com](https://business.facebook.com) y creá un Business Portfolio si todavía no tenés uno para Crazy Lady Seeds (`Crear cuenta` → nombre del negocio, tu nombre, email del negocio).
2. En **Configuración del negocio** → **Información del negocio**, completá dirección y datos legales. Si Meta pide **Verificación de negocio** (Security Center → Business verification), es el paso que más puede demorar (puede pedir documentación) — arrancalo ya aunque el resto lo termines después.

## Paso 2 — Crear la app en Meta for Developers

1. Andá a [developers.facebook.com/apps](https://developers.facebook.com/apps) → **Crear app**.
2. Tipo de app: **Otro** → **Empresa** (Business).
3. Nombre: algo identificable, por ejemplo `Crazy Lady Seeds - WhatsApp`. Asociá la app al Business Portfolio del Paso 1.
4. Dentro del panel de la app, en **Agregar productos**, buscá **WhatsApp** → **Configurar**.

## Paso 3 — Alta del número de WhatsApp Business

1. En el panel de configuración de WhatsApp de la app (**WhatsApp → Configuración de la API**), Meta te da automáticamente un número de prueba para testear (podés mandarte mensajes a vos mismo ahí mismo, sirve para probar el nodo de n8n antes de tener el número real).
2. Para el número real: **Agregar número de teléfono** → cargá el número comprado/dedicado → elegí verificación por SMS o llamada → ingresá el código.
3. Completá el **perfil de WhatsApp Business** (nombre visible, foto/logo de Crazy Lady Seeds, categoría del rubro, descripción). Ojo con la categoría: elegí algo genérico de e-commerce/retail, no algo que dispare la política de sustancias controladas (ver nota de riesgo abajo).
4. Anotá dos IDs que vas a necesitar después en n8n:
   - **Phone number ID** (aparece en esa misma pantalla, es distinto del número en sí).
   - **WhatsApp Business Account ID (WABA ID)**.

## Paso 4 — Token de acceso permanente (no el temporal de 24h)

El token que aparece por defecto en el panel dura 24 horas — no sirve para producción. Hay que crear un **usuario de sistema**:

1. En Business Manager → **Configuración del negocio** → **Usuarios** → **Usuarios del sistema** → **Añadir**.
2. Nombre: `n8n-crazyladyseeds`. Rol: **Admin** (o el mínimo que permita administrar WhatsApp — revisar si Meta ofrece un rol más acotado).
3. **Asignar activos**: seleccioná la app creada en el Paso 2 y la cuenta de WhatsApp Business del Paso 3, con permiso de administración.
4. **Generar nuevo token** para ese usuario de sistema → elegí la app → permisos: `whatsapp_business_messaging` y `whatsapp_business_management` → sin fecha de expiración (o la más larga disponible).
5. Copiá el token una sola vez (Meta no lo vuelve a mostrar) y **pegalo directo en la credencial de n8n** (`CLS · WhatsApp Business Cloud API` — tarea C-4), no en un archivo de texto ni en el chat. Si lo perdés, se genera uno nuevo repitiendo este paso.

## Paso 5 — Las 6 plantillas (categoría *Utility*)

Fuera de la ventana de 24 h desde el último mensaje del cliente, WhatsApp solo permite enviar **plantillas pre-aprobadas**. Todos los avisos automáticos de Crazy Lady Seeds caen en esa categoría, así que las 6 plantillas son obligatorias antes de activar los workflows.

1. En Business Manager → **WhatsApp Manager** → **Plantillas de mensajes** → **Crear plantilla**.
2. Para cada una: categoría **Utility** (no Marketing — Utility se aprueba más rápido y no cuenta como promocional), idioma **Español (ARG)**.
3. Cargá el texto tal cual está en `N8N_PRODUCTION_PLAN.md §8` (reproducido abajo) — **sin nombres de producto**, para no chocar con la política de Meta sobre el rubro (ver nota de riesgo).

| Nombre exacto | Texto | Variables |
|---|---|---|
| `cls_pedido_nuevo` | Nuevo pedido {{1}} por ${{2}}. Revisalo en el panel de Crazy Lady. | 1=N° pedido, 2=total |
| `cls_pago_confirmado` | Se acreditó el pago del pedido {{1}} por ${{2}}. Ya se puede preparar. | 1=N° pedido, 2=total |
| `cls_pedido_despachado` | Hola {{1}}, tu pedido {{2}} salió con {{3}}. Código de seguimiento: {{4}}. | 1=nombre cliente, 2=N° pedido, 3=transportista, 4=código |
| `cls_stock_bajo` | Alerta de stock: {{1}} quedó con {{2}} unidades. | 1=producto, 2=stock |
| `cls_derivacion` | Emma derivó una conversación de {{1}} ({{2}}). Tema: {{3}}. | 1=cliente, 2=canal, 3=tema |
| `cls_devolucion` | Nueva devolución {{1}} del pedido {{2}} por ${{3}}. | 1=N° devolución, 2=N° pedido, 3=importe |

4. Guardá cada una y mandala a revisión. El estado pasa a **En revisión** → **Aprobada** o **Rechazada**. Si rechazan una, Meta suele decir el motivo (frase ambigua, parece promocional, etc.) — se puede editar y reenviar.
5. Revisá el estado en la misma pantalla; no hace falta hacer nada más mientras esperás.

## Nota de riesgo — política de Meta para el rubro

WhatsApp Business tiene reglas más estrictas que Facebook Ads para "productos restringidos", y semillas/cultivo puede quedar en zona gris según cómo se describa el negocio. Para minimizar el riesgo:
- No uses palabras como "marihuana", "cannabis", "flor", "thc" en el nombre de la app, el perfil de WhatsApp ni en las plantillas — quedate en "semillas", "e-commerce", "Crazy Lady Seeds" a secas.
- Las plantillas de arriba ya evitan nombrar productos, tal como quedó definido en el plan.
- Si Meta rechaza el número o la verificación del negocio citando la categoría, el plan B es no usar WhatsApp Business oficial y resolver esos eventos solo por email (implica revisar D-2 y las decisiones de plantilla, y ajustar W-1/W-2/W-3/W-6/W-7 en el plan).

## Cuándo está "hecho" C-1 y C-2

- C-1: podés mandar un mensaje de prueba desde el botón **Enviar mensaje de prueba** del panel de WhatsApp de la app (o desde el Graph API Explorer) y te llega al celular.
- C-2: las 6 plantillas de la tabla figuran como **Aprobada** en WhatsApp Manager.

Con eso completo, seguimos con las decisiones D-1 a D-9 del plan (`N8N_PRODUCTION_PLAN.md §4`) y arrancamos T-1 (contrato del payload) y los workflows en n8n.
