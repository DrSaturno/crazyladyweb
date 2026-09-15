# Pendientes

Lista de tareas identificadas pero no desarrolladas todavía. Se agregan a medida que surgen y se marcan al completarse.

## Abiertos

1. **Música de fondo autoplay en la tienda pública.** Sumar el tema de `C:\Users\nicol\Downloads\videoplayback.mp4` (contenedor MP4 con pista de audio, ~1:49 min) como música de fondo que arranque sola cuando alguien entra al sitio. Tiene que quedar un control visible (mini reproductor flotante) para pausar/reanudar y subir/bajar volumen — no puede ser autoplay sin forma de frenarlo. Pendiente: extraer el audio del archivo (probablemente no haga falta el video, solo el sonido) y confirmar si va en todas las páginas públicas o solo en el home. **Ojo:** todos los navegadores bloquean el autoplay con sonido sin que la persona interactúe primero con la página — hay que definir el fallback (¿arranca muteado y se activa con el primer click/scroll? ¿un botón de play bien visible en el primer segundo?) antes de implementarlo, porque "que se inicie de forma automática" con sonido tal cual no es 100% garantizable en todos los navegadores.

## Completados

- **Módulo del bot — pestaña de personalización del prompt** (15/09/2026). Pestaña `Personalización` en `/admin/bot`: nombre, tono, saludo y prompt del sistema, con vista previa, historial de versiones y migración `bot_prompts`.
- **Nuevo módulo admin — gestión de posts del blog ("el diario")** (15/09/2026). Módulo `Diario / Blog` en `/admin/diario`: alta, edición, vista previa, publicación y baja de notas, conectado a `/notas` y al home, con migración `blog_posts`.
- **Carpeta `imagenes web/` revisada** (15/09/2026). Se comparó pixel a pixel contra lo publicado (hero, sección Comunidad, diario) y resultó ser un duplicado exacto de imágenes ya en vivo — no había arte nuevo para integrar. Decisión del cliente: dejar la carpeta como está, sin tocarla.
