# Admin dashboard — override

El tablero hereda la identidad aprobada de la tienda: fondo crema, superficies papel, navegación bosque, salvia para estados correctos, miel para acciones y naranja para alertas. Quedan descartados el tema oscuro/neón y la paleta SaaS azul genérica.

## Densidad

- Sidebar de 250 px en desktop; drawer en mobile.
- Header operativo compacto de 64 px.
- Tarjetas de métricas en grilla 2/4 y paneles de alta densidad.
- Tablas desktop se convierten en fichas con etiquetas en mobile; nunca generan scroll horizontal de página.

## Jerarquía

1. Contexto del módulo y acción primaria.
2. Indicadores o formulario esencial.
3. Tabla/lista operativa.
4. Estados vacíos y límites de integración claramente señalados.

## Firma operativa

La cabecera de cada flujo muestra un **camino de estados** compacto: el operador ve dónde está el pedido, la devolución o la campaña y cuál es la próxima acción segura. Esta señal usa bosque para lo completo, miel para el paso actual y línea neutra para lo pendiente. Es información de proceso, no decoración.

Los módulos de alto uso presentan una lista maestra y una ficha lateral o expandida. En móvil la ficha sigue a la selección en el flujo natural, sin overlays que oculten acciones críticas.

## Modularidad

La navegación se deriva de un único registro. Los módulos opcionales se pueden activar/desactivar; resumen, configuración y gestor de módulos permanecen bloqueados para garantizar recuperación.
