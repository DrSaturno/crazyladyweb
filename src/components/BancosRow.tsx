import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { BANCOS } from "../data/catalogo";

export default function BancosRow() {
  return (
    <section aria-labelledby="bancos-title" className="site-container mt-3">
      <h2 id="bancos-title" className="sr-only">Bancos obtentores</h2>
      <div className="grid grid-cols-2 items-stretch gap-0 rounded-2xl border border-cls-line bg-cls-paper px-2 py-2.5 shadow-[0_3px_12px_rgba(23,53,44,0.04)] sm:grid-cols-4 md:grid-cols-8">
        {BANCOS.map((banco) => (
          <Link
            key={banco.slug}
            to={`/semillas?banco=${banco.slug}`}
            className="group flex min-h-14 min-w-0 items-center justify-center gap-1.5 border-b border-r border-cls-line px-2 text-center even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:even:border-r sm:[&:nth-child(4n)]:border-r-0 sm:[&:nth-last-child(-n+4)]:border-b-0 md:border-b-0 md:[&:nth-child(4n)]:border-r md:last:border-r-0"
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
