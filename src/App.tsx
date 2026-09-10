import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CommerceDataProvider } from "./context/CommerceDataContext";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/PublicLayout";
import { AdminModuleProvider, useAdminModules } from "./admin/AdminModuleContext";
import { ADMIN_MODULES, type AdminModuleDefinition } from "./admin/moduleRegistry";

import Home from "./pages/Home";
import Semillas from "./pages/Semillas";
import Esquejes from "./pages/Esquejes";
import ProductoDetalle from "./pages/ProductoDetalle";
import Notas from "./pages/Notas";
import NotaDetalle from "./pages/NotaDetalle";
import Reprocann from "./pages/Reprocann";
import Carrito from "./pages/Carrito";
import Favoritos from "./pages/Favoritos";
import Cuenta from "./pages/Cuenta";
import Checkout from "./pages/Checkout";
import Gracias from "./pages/Gracias";
import Politica from "./pages/Politica";

const AdminLayout = lazy(() => import("./admin/AdminLayout"));

function ModuleRoute({ module }: { module: AdminModuleDefinition }) {
  const { isEnabled } = useAdminModules();
  if (!isEnabled(module.id)) return <Navigate to="/admin/modulos" replace />;
  const Component = module.component;
  return <Suspense fallback={<div className="min-h-64 animate-pulse rounded-2xl border border-cls-line bg-cls-paper" aria-label="Cargando módulo" />}><Component /></Suspense>;
}

export default function App() {
  return (
    <CommerceDataProvider>
      <AdminModuleProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/semillas" element={<Semillas />} />
                <Route path="/esquejes" element={<Esquejes />} />
                <Route path="/producto/:slug" element={<ProductoDetalle />} />
                <Route path="/notas" element={<Notas />} />
                <Route path="/notas/:slug" element={<NotaDetalle />} />
                <Route path="/reprocann" element={<Reprocann />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/gracias/:orderId" element={<Gracias />} />
                <Route path="/terminos" element={<Politica kind="terminos" />} />
                <Route path="/privacidad" element={<Politica kind="privacidad" />} />
                <Route path="/envios" element={<Politica kind="envios" />} />
              </Route>
              <Route path="/admin" element={<Suspense fallback={<div className="min-h-screen animate-pulse bg-cls-cream" aria-label="Cargando administrador" />}><AdminLayout /></Suspense>}>
                {ADMIN_MODULES.map((module) => <Route key={module.id} index={module.path === "/admin"} path={module.path === "/admin" ? undefined : module.path.replace("/admin/", "")} element={<ModuleRoute module={module} />} />)}
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AdminModuleProvider>
    </CommerceDataProvider>
  );
}
