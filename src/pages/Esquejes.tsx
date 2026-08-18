import { Scissors, ShieldCheck, Thermometer, Droplets } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { ESQUEJES } from "../data/catalogo";

const CUIDADOS = [
  {
    icon: Droplets,
    titulo: "Llega con raíz",
    texto: "El esqueje viaja ya enraizado. Al recibirlo, trasplantalo a su maceta definitiva sin romper el cepellón.",
  },
  {
    icon: Thermometer,
    titulo: "Aclimatación",
    texto: "Los primeros días bajale la intensidad de luz y mantené humedad alta. Viene de un ambiente controlado.",
  },
  {
    icon: ShieldCheck,
    titulo: "Sabés qué vas a obtener",
    texto: "Es un clon de una madre seleccionada: mismas características, sin la variabilidad de una semilla.",
  },
];

export default function Esquejes() {
  const disponibles = ESQUEJES.filter((e) => e.stock > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-cls-primary/15 text-cls-primary border border-cls-primary/30">
          <Scissors className="w-3 h-3" /> Esquejes
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl font-black text-white">Esquejes de genéticas seleccionadas</h1>
        <p className="text-sm text-white/60 mt-3 max-w-2xl leading-relaxed">
          Variedades registradas y de selección propia de la casa. Un esqueje es un clon de una planta
          madre elegida por sus características, así que ya sabés exactamente qué vas a obtener — y te
          salteás la etapa de germinación.
        </p>
      </header>

      {/* Cuidados */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {CUIDADOS.map((c) => (
          <div key={c.titulo} className="bg-navy-800 border border-navy-500 rounded-2xl p-5">
            <c.icon className="w-5 h-5 text-cls-green mb-3" />
            <p className="text-sm font-bold text-white">{c.titulo}</p>
            <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{c.texto}</p>
          </div>
        ))}
      </section>

      {/* Catálogo */}
      <section>
        <h2 className="text-xl font-black text-white mb-5">
          {disponibles.length > 0 ? "Disponibles ahora" : "Sin esquejes disponibles"}
        </h2>

        {disponibles.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ESQUEJES.map((e) => (
              <ProductCard key={e.id} producto={e} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-navy-500 rounded-2xl">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-white font-bold">Por ahora no hay esquejes en stock</p>
            <p className="text-sm text-white/50 mt-1 max-w-md mx-auto">
              Los esquejes salen por tandas según la madre disponible. Escribinos y te avisamos apenas
              entren.
            </p>
          </div>
        )}
      </section>

      {/* Nota de disponibilidad */}
      <section className="mt-10 bg-navy-800 border border-navy-500 rounded-2xl p-6">
        <p className="text-sm text-white/60 leading-relaxed">
          <span className="font-bold text-white">¿Buscás una genética puntual como esqueje?</span>{" "}
          Trabajamos por tandas según la madre que tengamos en producción. Escribinos por Instagram o
          WhatsApp y te contamos qué viene en camino.
        </p>
      </section>
    </div>
  );
}
