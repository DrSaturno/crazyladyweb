# SPEC-WEB-02 — Ecommerce Crazy Lady Seeds

**Estado:** tienda y operación local implementadas; integraciones productivas pendientes
**Fecha:** 9 de septiembre de 2026
**Dirección visual:** aprobada por Crazy Lady Seeds mediante `opcion5.png`
**Alcance de este ciclo:** tienda pública. El panel admin y el bot se especifican después de estabilizar contenido, catálogo y operaciones de la tienda.

## 1. Resultado esperado

Una tienda responsive, accesible y orientada a conversión que permita descubrir genéticas, comparar información trazable, armar un carrito y completar una compra mediante un flujo seguro. La página debe reproducir la jerarquía y el lenguaje visual de la referencia aprobada sin convertir la captura en una imagen estática.

## 2. Principios no negociables

1. La fuente de verdad de producto será una única tabla `products`; los arrays actuales son fixtures de desarrollo.
2. Precio y stock se validan en servidor al crear la orden.
3. Las claves privilegiadas nunca llegan al navegador.
4. Los proveedores de pago alojan los datos de tarjeta; la aplicación no los procesa.
5. Los webhooks son firmados, idempotentes y auditables.
6. Toda mutación operativa registra actor, fecha y cambio.
7. El bot consume catálogo publicado; no mantiene una copia manual paralela.
8. La experiencia de compra funciona aunque el bot no esté disponible.

## 3. Arquitectura de información pública

| Ruta | Objetivo | Estado UI |
|---|---|---|
| `/` | descubrimiento, confianza y conversión | implementado con fixtures |
| `/semillas` | catálogo filtrable y buscable | implementado con fixtures |
| `/esquejes` | catálogo y requisitos de entrega | implementado con fixtures |
| `/producto/:slug` | ficha trazable, stock y relacionados | implementado con fixtures |
| `/notas` | guías y contenido editorial | implementado con contenido a validar |
| `/notas/:slug` | lectura + recomendación contextual | implementado con contenido a validar |
| `/reprocann` | información y derivación responsable | implementado como borrador a validar |
| `/carrito` | resumen editable | implementado y persistente en navegador |
| `/checkout` | datos, entrega y pago | crea pedido trazable en modo local; backend productivo pendiente |
| `/gracias/:orderId` | confirmación trazable | implementado |
| `/semillas?q=` | resultados globales | implementado |
| `/cuenta` | acceso, pedidos y datos | interfaz informativa; pendiente de Auth |
| `/favoritos` | lista persistente | implementado en navegador |
| `/terminos`, `/privacidad`, `/envios` | políticas | borradores implementados; contenido legal pendiente |

## 4. Home — orden de módulos

1. Barra de envío/descuento y redes.
2. Header con marca, búsqueda, favoritos, cuenta y carrito.
3. Navegación por semillas, esquejes, INASE, REPROCANN, principiantes, comunidad, blog y FAQ.
4. Hero “Sembrando felicidad” con estética retro y CTA al catálogo.
5. Banda de confianza: envío discreto, INASE, asesoramiento, medios de pago, comunidad y cultivo responsable.
6. Bancos obtentores.
7. Cuatro accesos editoriales: INASE, esquejes, semillas y REPROCANN.
8. Más vendidas y ofertas.
9. Guías para principiantes y comunidad.
10. Diario de Crazy Lady y reseñas reales cuando existan.
11. Preguntas frecuentes y suscripción con consentimiento explícito.
12. Footer operativo, legal y de contacto.

## 5. Requisitos funcionales

### Catálogo y búsqueda

- Buscar por nombre, banco, tipo y genética.
- Sugerencias accesibles al escribir y navegación por teclado.
- Filtros persistentes en query params.
- Estados de carga, error, vacío y reintento.
- Ocultar de venta productos no publicados; no confundir `sin stock` con `no visible`.

### Producto

- Nombre, banco, imágenes, precio, promoción, stock, presentación y condición INASE.
- Especificaciones aprobadas: fotoperiodo, ambiente, dificultad, ciclo, THC/CBD aproximado e ideal para.
- Cantidad limitada por stock disponible.
- Productos relacionados y guía contextual.

### Carrito y checkout

- Persistencia por sesión y sincronización posterior al identificar al cliente.
- Cálculo de envío antes del pago.
- Cupones validados en servidor.
- Mercado Pago Checkout Pro y transferencia en fase 1, condicionados a aprobación del rubro.
- La transferencia reserva o descuenta stock únicamente según la regla operativa aprobada.
- Confirmación de orden con identificador legible y correo transaccional.

### Cuenta

- Registro/inicio de sesión, recuperación, direcciones y pedidos.
- El comprador puede comprar como invitado si la regla comercial lo permite.
- Exportación y eliminación de datos según política aprobada.

## 6. Contrato mínimo de datos

`Product`: id, slug, name, description, category_id, bank_id, price, promotional_price, stock, presentation, images, type, genetics, photoperiod, environment, difficulty, cycle_weeks, thc, cbd, inase, visible_web, featured, created_at, updated_at.

`Order`: id, public_number, customer_id/session_id, status, payment_status, fulfillment_status, currency, subtotal, discount, shipping, total, address snapshot, created_at, updated_at.

`Payment`: id, order_id, provider, external_id, status, amount, raw_event_hash, processed_at. `external_id` es único.

`AuditLog`: id, actor_id, entity, entity_id, action, before, after, created_at.

## 7. Eventos de medición

`page_view`, `search`, `filter_applied`, `product_view`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `shipping_selected`, `payment_started`, `purchase`, `newsletter_opt_in`, `bot_opened`, `bot_handoff_requested`.

No registrar contenido sensible de formularios ni mensajes del bot dentro de analytics.

## 8. Seguridad y trazabilidad

- Supabase RLS deniega por defecto y separa lectura pública de operaciones administrativas.
- Auth admin con usuarios individuales y MFA antes de producción.
- Rate limiting y validación de esquema en endpoints públicos.
- Archivos comprobantes: bucket privado, tipo/tamaño validados, URLs firmadas de corta duración.
- Política CSP, headers seguros, dependencias auditadas y secretos solo en entorno servidor.
- Webhooks: firma, idempotencia, replay seguro y registro de resultado.
- Backups automáticos con una restauración probada.

## 9. Criterios de aceptación visual y UX

- Fidelidad de jerarquía, densidad, paleta y lenguaje gráfico respecto de la referencia.
- Funcional a 375, 768, 1024 y 1440 px, sin scroll horizontal.
- Navegable completamente con teclado y foco visible.
- Texto normal con contraste mínimo 4.5:1.
- Targets táctiles de 44 px.
- Imágenes con dimensiones reservadas, `loading="lazy"` fuera del primer viewport y alt descriptivo.
- Imágenes fotográficas en JPEG optimizado (no PNG sin comprimir); las 16 imágenes de portada de Home pesaban 30 MB en PNG sin comprimir y hoy pesan 5.7 MB en JPEG (`mozjpeg`, calidad 82) a la misma resolución — verificado 15/09/2026.
- `prefers-reduced-motion` respetado.
- Búsqueda y formularios con labels y errores anunciados.

## 10. Decisiones abiertas que bloquean producción, no la maqueta

- Proveedor de pago autorizado para el rubro y credenciales.
- Reglas definitivas de envío, retiro y reserva de stock.
- Dominio y remitente transaccional.
- Texto legal INASE/ARICCAME aprobado.
- Genéticas publicables y clasificación técnica validada.
- Políticas de privacidad, cambios y devoluciones.
- Fotografías faltantes y testimonios reales con autorización.

## 11. Secuencia SDD

1. Aprobar esta especificación funcional y registrar cambios como decisiones fechadas.
2. Implementar el sistema visual y la home contra fixtures reales. **Completado.**
3. Rediseñar catálogo, producto, contenido y carrito. **Completado.**
4. Implementar las interfaces de checkout, cuenta y políticas. **Completado; integración pendiente.**
5. Definir esquema/migraciones y reemplazar fixtures por una fuente compartida. **Esquema y adaptador listos; conexión remota pendiente.**
6. Ejecutar pruebas unitarias, integración, accesibilidad, responsive y compra real. **Build, flujo local y responsive verificados; compra productiva pendiente.**
7. Solo entonces conectar el bot a la fuente publicada.
