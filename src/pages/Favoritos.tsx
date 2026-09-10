import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCommerceData } from "../context/CommerceDataContext";
import { useWishlist } from "../context/WishlistContext";

export default function Favoritos() {
  const { products } = useCommerceData();
  const { ids } = useWishlist();
  const productos = products.filter((producto) => ids.includes(producto.id) && producto.visible_web !== false);

  return (
    <div className="site-container py-10 md:py-14">
      <header className="mb-8">
        <p className="eyebrow">Tu selección</p>
        <h1 className="display-title mt-2 text-4xl md:text-5xl">Favoritos</h1>
        <p className="mt-3 max-w-2xl text-sm text-cls-ink/70">
          Guardá genéticas para compararlas con calma. La lista queda en este dispositivo.
        </p>
      </header>

      {productos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productos.map((producto) => <ProductCard key={producto.id} producto={producto} />)}
        </div>
      ) : (
        <section className="section-shell flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <Heart className="h-10 w-10 text-cls-primary/35" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black">Todavía no guardaste ninguna genética</h2>
          <p className="mt-2 max-w-md text-sm text-cls-ink/65">
            Tocá el corazón de una tarjeta para encontrarla de nuevo acá.
          </p>
          <Link className="btn-primary mt-6" to="/semillas">Explorar semillas</Link>
        </section>
      )}
    </div>
  );
}
