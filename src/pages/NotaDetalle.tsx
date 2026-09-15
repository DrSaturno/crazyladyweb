import { AlertCircle, ArrowRight, BookOpen, ChevronLeft, Leaf, MessageCircle } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import NotaParagraph from "../components/NotaParagraph";
import { useCart } from "../context/CartContext";
import { useCommerceData } from "../context/CommerceDataContext";
import { precioARS } from "../data/catalogo";
import { formatFechaNota, notasPublicadas } from "../data/notas";

export default function NotaDetalle() {
  const { slug } = useParams();
  const { posts, products } = useCommerceData();
  const { agregar } = useCart();
  const published = notasPublicadas(posts);
  const note = published.find((item) => item.slug === slug);
  if (!note) return <Navigate to="/notas" replace />;

  const recommended = note.productoRecomendado ? products.find((product) => product.slug === note.productoRecomendado && product.visible_web !== false) : undefined;
  const others = published.filter((item) => item.slug !== note.slug).slice(0, 3);

  return (
    <div className="site-container py-8 md:py-12">
      <Link to="/notas" className="inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-cls-primary hover:text-cls-orange"><ChevronLeft className="h-4 w-4" /> El diario de Crazy Lady</Link>

      <article className="mx-auto mt-3 max-w-4xl">
        <header className="overflow-hidden rounded-[28px] border border-cls-line bg-cls-sage p-6 md:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cls-primary text-cls-paper"><BookOpen className="h-6 w-6" /></span>
          <p className="eyebrow mt-6">{formatFechaNota(note.fecha)} · {note.minutos} min de lectura</p>
          <h1 className="display-title mt-3 text-4xl leading-[0.98] md:text-6xl">{note.titulo}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-cls-ink/70">{note.bajada}</p>
        </header>

        {note.causa && <aside className="mt-5 rounded-2xl border-l-4 border-cls-orange bg-cls-paper p-5 shadow-paper"><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-cls-orange"><AlertCircle className="h-4 w-4" /> Causa más probable</p><p className="mt-2 text-sm leading-relaxed text-cls-ink/75">{note.causa}</p></aside>}

        <div className="mx-auto mt-8 max-w-3xl space-y-6">{note.cuerpo.map((paragraph, index) => <NotaParagraph key={index} text={paragraph} />)}</div>

        {recommended && (
          <section className="mt-10 grid gap-5 overflow-hidden rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center sm:p-5">
            <div className="product-art flex aspect-square items-center justify-center overflow-hidden rounded-xl">{recommended.imagen ? <img src={recommended.imagen} alt={`Presentación de ${recommended.nombre}`} className="h-full w-full object-cover" /> : <Leaf className="h-12 w-12 text-cls-primary" strokeWidth={1.4} />}</div>
            <div><p className="eyebrow">Producto relacionado</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-cls-ink/50">{recommended.banco}</p><Link to={`/producto/${recommended.slug}`} className="mt-1 block text-lg font-bold text-cls-primary-dark hover:text-cls-orange">{recommended.nombre}</Link><p className="mt-1 text-xl font-black text-cls-primary-dark">{precioARS(recommended.precio)}</p></div>
            <button onClick={() => agregar(recommended)} disabled={!recommended.stock} className="btn-primary sm:min-w-40">{recommended.stock ? "Sumar al carrito" : "Sin stock"}</button>
          </section>
        )}

        <section className="mt-5 flex flex-col justify-between gap-4 rounded-2xl bg-cls-primary p-6 text-cls-paper sm:flex-row sm:items-center"><div><h2 className="font-sans text-base font-bold text-cls-paper">¿Te quedó alguna duda?</h2><p className="mt-1 text-sm text-cls-paper/70">Contale a Emma tu espacio y experiencia para orientar la búsqueda.</p></div><button onClick={() => window.dispatchEvent(new CustomEvent("cls:open-bot"))} className="btn-primary shrink-0"><MessageCircle className="h-4 w-4" /> Hablar con Emma</button></section>
      </article>

      <section className="mt-12 border-t border-cls-line pt-8" aria-labelledby="continue-title"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">El diario</p><h2 id="continue-title" className="section-heading mt-1">Seguí leyendo</h2></div><Link to="/notas" className="text-xs font-bold text-cls-primary hover:text-cls-orange">Ver todas →</Link></div><div className="grid gap-3 md:grid-cols-3">{others.map((item) => <Link key={item.slug} to={`/notas/${item.slug}`} className="group section-shell p-5"><BookOpen className="h-6 w-6 text-cls-primary" /><h3 className="mt-4 font-sans text-sm font-bold leading-snug text-cls-primary-dark group-hover:text-cls-orange">{item.titulo}</h3><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cls-primary">Leer <ArrowRight className="h-3.5 w-3.5" /></span></Link>)}</div></section>
    </div>
  );
}
