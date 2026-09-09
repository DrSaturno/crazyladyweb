import { Droplets, Scissors, ShieldCheck, Thermometer } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { ESQUEJES } from "../data/catalogo";

const CUIDADOS = [
  { icon: Droplets, title: "Llega con raíz", text: "El esqueje viaja enraizado. Al recibirlo, trasplantalo sin romper el cepellón." },
  { icon: Thermometer, title: "Aclimatación gradual", text: "Los primeros días bajá la intensidad de luz y mantené una humedad estable." },
  { icon: ShieldCheck, title: "Sabés qué vas a obtener", text: "Es un clon de una madre seleccionada, con características conocidas y trazables." },
];

export default function Esquejes() {
  const disponibles = ESQUEJES.filter((item) => item.stock > 0 && item.visible_web !== false);

  return (
    <div className="site-container py-8 md:py-12">
      <header className="relative overflow-hidden rounded-[28px] border border-cls-line bg-[#F2C291] p-6 md:p-10">
        <Scissors className="absolute -bottom-8 right-4 h-44 w-44 rotate-[-8deg] text-cls-primary/18" strokeWidth={1.2} aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="eyebrow flex items-center gap-2"><Scissors className="h-4 w-4" /> Esquejes</p>
          <h1 className="display-title mt-3 text-4xl md:text-6xl">Genéticas seleccionadas, listas para arrancar.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cls-ink/75 md:text-base">Un esqueje es un clon de una planta madre elegida por sus características. Te salteás la germinación y empezás con una base conocida, siempre con acompañamiento para la adaptación.</p>
        </div>
      </header>

      <section className="mt-4 grid gap-3 md:grid-cols-3" aria-label="Cuidados iniciales">
        {CUIDADOS.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className={`rounded-2xl border border-cls-line p-5 ${index === 1 ? "bg-cls-paper" : "bg-cls-sage/70"}`}>
            <Icon className="h-6 w-6 text-cls-primary" aria-hidden="true" />
            <h2 className="mt-3 font-sans text-sm font-bold text-cls-primary-dark">{title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-cls-ink/65">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-10" aria-labelledby="esquejes-title">
        <div className="mb-5"><p className="eyebrow">Stock actual</p><h2 id="esquejes-title" className="section-heading mt-1">{disponibles.length ? "Disponibles ahora" : "Sin esquejes disponibles"}</h2></div>
        {disponibles.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{disponibles.map((item) => <ProductCard key={item.id} producto={item} />)}</div>
        ) : (
          <div className="section-shell flex min-h-64 flex-col items-center justify-center px-6 text-center"><Scissors className="h-10 w-10 text-cls-primary/40" /><h3 className="mt-4 text-2xl font-black">Los esquejes salen por tandas</h3><p className="mt-2 max-w-md text-sm text-cls-ink/65">Consultanos qué madres están en producción y cuándo ingresa la próxima tanda.</p></div>
        )}
      </section>

      <section className="mt-10 flex flex-col justify-between gap-4 rounded-2xl bg-cls-primary p-6 text-cls-paper md:flex-row md:items-center">
        <div><h2 className="font-sans text-base font-bold text-cls-paper">¿Buscás una genética puntual como esqueje?</h2><p className="mt-1 max-w-3xl text-sm text-cls-paper/70">Trabajamos por tandas según la madre disponible. Escribinos y te contamos qué viene en camino.</p></div>
        <a href="https://wa.me/5491176086771" target="_blank" rel="noreferrer" className="btn-primary shrink-0">Consultar disponibilidad</a>
      </section>
    </div>
  );
}
