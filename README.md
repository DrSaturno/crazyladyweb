# Crazy Lady Seeds — tienda pública

Frontend de ecommerce para Crazy Lady Seeds, construido con React, TypeScript, Vite y Tailwind CSS.

## Estado

La interfaz pública está implementada: inicio, catálogo con búsqueda y filtros, detalle de producto, carrito, checkout de interfaz, favoritos, cuenta, contenidos, REPROCANN y páginas de políticas. La especificación y los bloqueos de producción están documentados en [`docs/WEB_SPEC.md`](docs/WEB_SPEC.md).

La integración de base de datos, autenticación, órdenes, pagos, envíos y bot multicanal queda deliberadamente pendiente hasta definir las reglas comerciales y los proveedores autorizados.

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
- `public/`: logotipo, mascota y fotografías de producto utilizadas por la interfaz.
- `docs/WEB_SPEC.md`: especificación funcional, seguridad, trazabilidad y secuencia SDD.
- `design-system/crazy-lady-seeds/MASTER.md`: dirección visual aplicada.

Los insumos privados del cliente, capturas de revisión, entornos temporales y los repositorios separados no se versionan en este repositorio.
