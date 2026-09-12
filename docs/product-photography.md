# Serie fotográfica de productos

79 imágenes ilustrativas de flores, una por producto del catálogo actual, incluidos productos sin stock y Jet Puft. Generadas con la herramienta integrada `image_gen`.

## Dirección visual

Fondo marfil cálido, iluminación amplia desde arriba a la izquierda, sombra de contacto suave y encuadre macro cuadrado. Cada flor tiene una composición individual, con variaciones de silueta, textura y color dentro de la misma sesión visual. Mix muestra un conjunto de tres flores.

Las imágenes son representaciones artísticas: no documentan ejemplares reales ni verifican el aspecto de una genética. La ficha las identifica como ilustrativas y mantiene clara la presentación comercial de semillas o esqueje.

## Archivos

- Imagen para detalle: `public/products/studio/<slug>.webp`, 1200 × 1200.
- Miniatura: `public/products/studio/<slug>-480.webp`, 480 × 480.
- Originales locales: `output/product-photography/originals/<slug>.png`.
- Galería local de revisión: `output/product-photography/gallery.html`.
- Todos los nombres, rutas y prompts exactos: [product-photo-prompts.json](./product-photo-prompts.json).

Los originales y la galería están en `output/`, excluido del repositorio. Los WebP utilizados por la web se incluyen en `public/`. Los cuatro archivos de imagen anteriores se conservan.

## Integración

`src/data/productPhotography.ts` declara los productos cubiertos y resuelve la transición desde el arte anterior. Los datos guardados en el navegador reciben la nueva imagen cuando tenían un valor vacío o una de las cuatro imágenes predeterminadas antiguas. Una URL personalizada del administrador conserva su valor.

Las tarjetas usan encuadre cuadrado y archivos adaptables mediante `srcSet`. Las fichas usan la versión grande, respetando las proporciones originales.

## Verificación reproducible

Verificación completada el 12/09/2026: 79 productos, 79 imágenes únicas, 158 WebP presentes también en la compilación de producción y 79 originales PNG conservados. Tamaño medio de las miniaturas: 34 KiB. Comprobaciones de transición de imágenes y compilación correctas. Revisión visual de la serie por grupos, las diez tarjetas destacadas en escritorio y la ficha de Jet Puft en móvil.

`npm run build` verifica TypeScript y la compilación de producción.

`node scripts/check-product-photos.mjs` verifica cobertura del catálogo, archivos, dimensiones, ausencia de duplicados exactos y transición de imágenes predeterminadas sin reemplazar imágenes personalizadas.

Los scripts de codificación y verificación requieren `sharp`. Se puede indicar una instalación existente mediante la variable `SHARP_MODULE`. `scripts/prepare-product-photo.mjs` recibe la ruta del JSON de un trabajo de generación y únicamente cambia resolución y formato; no retoca ni recompone la imagen.
