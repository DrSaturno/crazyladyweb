import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/PublicLayout";

import Home from "./pages/Home";
import Semillas from "./pages/Semillas";
import Esquejes from "./pages/Esquejes";
import ProductoDetalle from "./pages/ProductoDetalle";
import Notas from "./pages/Notas";
import NotaDetalle from "./pages/NotaDetalle";
import Reprocann from "./pages/Reprocann";
import Carrito from "./pages/Carrito";

// El panel del bot y el ABM de productos viven en otro repo
// (github.com/DrSaturno/crazzyladyseeds) — ver docs/web.md § Dos repos.

export default function App() {
  return (
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
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}
