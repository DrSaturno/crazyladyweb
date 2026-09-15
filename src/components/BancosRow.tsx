import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { BANCOS } from "../data/catalogo";

const BANCO_LOGOS: Record<string, { src: string; width: number; height: number }> = {
  "crazy-lady-seeds": { src: "/logo-cls-01.png", width: 4500, height: 5625 },
  "silver-river-seeds": { src: "/brand-logos/silver-river-seeds.png", width: 640, height: 640 },
  "cannabis-conicet": { src: "/brand-logos/cannabis-conicet.webp", width: 793, height: 815 },
  "chita-seeds": { src: "/brand-logos/chita-seeds.png", width: 376, height: 375 },
  "sensi-seeds": { src: "/brand-logos/sensi-seeds.jpg", width: 3500, height: 3254 },
  "buddha-seeds": { src: "/brand-logos/buddha-seeds.webp", width: 800, height: 800 },
  "royal-queen-seeds": { src: "/brand-logos/royal-queen-seeds.png", width: 567, height: 228 },
  "delicious-seeds": { src: "/brand-logos/delicious-seeds.png", width: 520, height: 174 },
};

export default function BancosRow() {
  return (
    <section aria-labelledby="bancos-title" className="site-container mt-3">
      <h2 id="bancos-title" className="sr-only">Bancos obtentores</h2>
      <div className="grid grid-cols-2 items-stretch overflow-hidden rounded-2xl border border-cls-line bg-cls-paper shadow-[0_3px_12px_rgba(23,53,44,0.04)] sm:grid-cols-4 md:grid-cols-8">
        {BANCOS.map((banco) => {
          const logo = BANCO_LOGOS[banco.slug];

          return (
            <Link
              key={banco.slug}
              to={`/semillas?banco=${banco.slug}`}
              className="group relative flex min-h-20 min-w-0 items-center justify-center overflow-hidden border-b border-r border-cls-line bg-cls-paper px-3 py-2.5 text-center transition-colors duration-200 hover:bg-white focus-visible:z-10 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:even:border-r sm:[&:nth-child(4n)]:border-r-0 sm:[&:nth-last-child(-n+4)]:border-b-0 md:border-b-0 md:[&:nth-child(4n)]:border-r md:last:border-r-0"
              title={`Ver genéticas de ${banco.nombre}`}
              aria-label={`Ver genéticas de ${banco.nombre}${banco.inase ? ", banco registrado en INASE" : ""}`}
            >
              <span className="banco-logo-stage" aria-hidden="true">
                <img
                  src={logo.src}
                  alt=""
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  className="banco-logo"
                  data-logo={banco.slug}
                />
              </span>
              {banco.inase && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-cls-primary/20 bg-cls-paper text-cls-primary shadow-sm" title="Banco registrado en INASE">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
