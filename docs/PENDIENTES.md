# Pendientes

Lista de tareas identificadas pero no desarrolladas todavía. Se agregan a medida que surgen y se marcan al completarse.

## Abiertos

1. **Imágenes nuevas del home sin integrar.** Carpeta sin trackear `imagenes web/` (69 MB) en la raíz del repo con una tanda actualizada de imágenes para las secciones del home (blog, comunidad, diario, doctor, esquejes, fundación, head, inase, reprocann, semillas). Los nombres corresponden 1 a 1 con las que ya están en `public/images/home/` (usadas desde `src/pages/Home.tsx`), con otra convención de nombre. Pendiente decidir si se integran y reemplazan las actuales.

## Completados

- **Módulo del bot — pestaña de personalización del prompt** (15/09/2026). Pestaña `Personalización` en `/admin/bot`: nombre, tono, saludo y prompt del sistema, con vista previa, historial de versiones y migración `bot_prompts`.
- **Nuevo módulo admin — gestión de posts del blog ("el diario")** (15/09/2026). Módulo `Diario / Blog` en `/admin/diario`: alta, edición, vista previa, publicación y baja de notas, conectado a `/notas` y al home, con migración `blog_posts`.
