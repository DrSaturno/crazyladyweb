import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { BANCOS } from "../data/catalogo";

export default function BancosRow() {
  return (
    <section aria-labelledby="bancos-title" className="site-container mt-3">
      <h2 id="bancos-title" className="sr-only">Bancos obtentores</h2>
      <div className="flex items-stretch gap-2 overflow-x-auto rounded-2xl border border-cls-line bg-cls-paper px-3 py-2.5 shadow-[0_3px_12px_rgba(23,53,44,0.04)] md:grid md:grid-cols-8 md:overflow-visible">
        {BANCOS.map((banco) => (
          <Link
            key={banco.slug}
            to={`/semillas?banco=${banco.slug}`}
            className="group flex min-h-14 min-w-[126px] items-center justify-center gap-2 border-r border-cls-line px-2 text-center last:border-r-0 md:min-w-0"
            title={`Ver genéticas de ${banco.nombre}`}
          >
            <span className="font-serif text-sm font-black leading-tight text-cls-primary-dark transition group-hover:text-cls-orange">
              {banco.nombre}
            </span>
            {banco.inase && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cls-primary" aria-label="Banco registrado INASE" />}
          </Link>
        ))}
      </div>
    </section>
  );
}
