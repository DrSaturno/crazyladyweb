# Crazy Lady Seeds — ecommerce y centro de operaciones

Frontend de ecommerce para Crazy Lady Seeds, construido con React, TypeScript, Vite y Tailwind CSS.

## Estado

La interfaz pública y el tablero modular están implementados. La tienda incluye catálogo, búsqueda, producto, carrito, checkout con creación de pedidos, confirmación, favoritos, contenidos y políticas. El panel `/admin` incluye productos, categorías, ventas, inventario, CRM, métricas, contenidos, auditoría, configuración y el simulador existente de Emma.

Sin credenciales de Supabase, la aplicación funciona en modo local persistente para validación. La migración productiva con RLS está preparada; pagos, envíos, autenticación administrativa y canales reales del bot quedan condicionados a proveedores y credenciales aprobados.

## Desarrollo

```bash
npm install
npm run dev
```

## Validación

```bash
npm run build
```

## Estructura

- `src/`: aplicación pública y datos de desarrollo.
- `src/admin/`: registro de módulos, layout y operaciones administrativas.
- `src/context/CommerceDataContext.tsx`: fuente de datos compartida por tienda y panel en modo local.
- `public/`: logotipo, mascota y fotografías de producto utilizadas por la interfaz.
- `docs/WEB_SPEC.md`: especificación funcional, seguridad, trazabilidad y secuencia SDD.
- `docs/ADMIN_SPEC.md`: especificación y criterios del tablero modular.
- `supabase/migrations/`: esquema productivo, índices, RLS, privilegios y auditoría.
- `design-system/crazy-lady-seeds/MASTER.md`: dirección visual aplicada.

Los insumos privados del cliente, capturas de revisión, entornos temporales y los repositorios separados no se versionan en este repositorio.
