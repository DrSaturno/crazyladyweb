# Crazy Lady Seeds — sistema visual maestro

> Fuente visual aprobada: `C:\Users\nicol\Downloads\opcion5.png`.
> Este archivo reemplaza la sugerencia automática genérica: la referencia aprobada por el cliente es autoritativa.

## Dirección

Ecommerce editorial retro–groovy inspirado en afiches de cultivo de los años setenta. La tienda debe sentirse cálida, experta y comunitaria; nunca clandestina, clínica ni como un dashboard oscuro. La ornamentación se concentra en el hero y en banners editoriales. Catálogo, formularios y checkout permanecen calmos, legibles y previsibles.

La firma visual es un sistema de **ondas orgánicas estratificadas**, estrellas de cuatro puntas y carteles ilustrados. Se usa como marco y separador, no como decoración indiscriminada.

## Tokens

| Rol | Valor | Uso |
|---|---|---|
| Fondo | `#F7F0DF` | página y superficies principales |
| Papel | `#FFF9EC` | tarjetas y controles |
| Bosque | `#174F3E` | navegación, títulos, footer |
| Bosque profundo | `#0C382C` | texto fuerte y hover |
| Salvia | `#BCD8BD` | banners regulatorios y fondos secundarios |
| Naranja | `#E8753D` | ondas, promos y acentos editoriales |
| Miel | `#F3B942` | CTA de compra y foco |
| Tinta | `#17352C` | cuerpo de texto |
| Línea | `#DED3BC` | bordes |
| Error | `#B7352C` | validación, agotados y descuentos |

## Tipografía

- Display: `Fraunces`, fallback Georgia. Peso 800–900, tracking ajustado. Solo títulos y claims.
- Interfaz y cuerpo: `DM Sans`, fallback system-ui. Peso 400–700.
- Datos breves y etiquetas: `DM Sans`, mayúsculas solo cuando expresan taxonomía real.
- Cuerpo mínimo: 16 px en formularios; 14 px en cards; 12 px reservado a metadata.

## Layout

- Contenedor: máximo 1440 px; gutters 16/24/32 px.
- Header de tres niveles en desktop: anuncio, marca/búsqueda/acciones, navegación.
- En mobile: anuncio, marca + acciones, buscador y navegación horizontal reducida.
- Home densa pero respirable: bandas y grillas alternadas, radio 16–24 px.
- Cards de producto: imagen protagonista, metadatos mínimos, precio y CTA inequívoco.
- Todas las listas comerciales conservan filtros en URL y destinos profundos compartibles.

## Componentes

- Botón primario comercial: miel, tinta oscura, 44 px mínimo, radio píldora.
- Botón secundario: bosque, texto crema, 44 px mínimo.
- Card: papel, borde `--line`, sombra corta, elevación de 2 px al hover sin reflow.
- Inputs: fondo papel, borde bosque al foco, label visible y errores con `role="alert"`.
- Badges: texto + icono; nunca depender solo del color.
- Iconos: exclusivamente Lucide/SVG. Las ilustraciones de marca sí pueden ser raster.

## Movimiento

- 160–240 ms para estados de interacción.
- El hero puede tener una única animación ambiental lenta en las estrellas/ondas.
- Sin scroll-jacking, parallax ni carruseles automáticos.
- `prefers-reduced-motion: reduce` desactiva transformaciones y animaciones no esenciales.

## Reglas de experiencia

- Contraste WCAG AA y foco visible.
- Objetivos táctiles de 44×44 px.
- Búsqueda con sugerencias, teclado y estado sin resultados útil.
- Precio, stock, presentación y origen visibles antes de agregar.
- El carrito nunca depende de una respuesta del bot.
- Ningún control de demo puede afirmar que ejecutó pagos, envíos o mensajes reales.
- En producción, stock y precios se validan nuevamente en servidor.

## Breakpoints de aceptación

- 375 px: sin scroll horizontal; acciones esenciales accesibles con una mano.
- 768 px: grillas de 2–3 columnas y filtros desplegables.
- 1024 px: header completo y rail de productos de 4 columnas.
- 1440 px: densidad equivalente a la referencia aprobada.

## Evitar

- Tema negro/neón previo.
- Gradientes púrpura genéricos.
- Emojis como iconos de interfaz.
- Vidrio translúcido, glassmorphism o tarjetas flotantes sin relación con la marca.
- Texto legal inventado, descuentos ficticios o testimonios atribuidos a personas reales.
- Ocultar labels de formularios detrás de placeholders.
