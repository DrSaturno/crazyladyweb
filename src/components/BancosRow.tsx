import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoBanco {
  slug: string;
  nombre: string;
  src: string;
  width: number;
  height: number;
  tratamiento?: "mezclar" | "oscuro";
  href?: string;
}

const LOGOS_BANCOS: LogoBanco[] = [
  { slug: "1439", nombre: "1439 Criadores", src: "/brand-logos/1439.png", width: 1080, height: 1080 },
  { slug: "royal-queen-seeds", nombre: "Royal Queen Seeds", src: "/brand-logos/royal-queen-seeds.png", width: 567, height: 228, href: "/semillas?banco=royal-queen-seeds" },
  { slug: "delicious-seeds", nombre: "Delicious Seeds", src: "/brand-logos/delicious-seeds.png", width: 520, height: 174, href: "/semillas?banco=delicious-seeds" },
  { slug: "inase", nombre: "Instituto Nacional de Semillas", src: "/brand-logos/inase.png", width: 661, height: 175, href: "/semillas?origen=nacional" },
  { slug: "chita-seeds", nombre: "Chita Seeds", src: "/brand-logos/chita-seeds.png", width: 376, height: 375, href: "/semillas?banco=chita-seeds" },
  { slug: "la-maga", nombre: "La Maga", src: "/brand-logos/la-maga.png", width: 219, height: 200, tratamiento: "mezclar" },
  { slug: "buddha-seeds", nombre: "Buddha Seeds", src: "/brand-logos/buddha-seeds.webp", width: 800, height: 800, tratamiento: "mezclar", href: "/semillas?banco=buddha-seeds" },
  { slug: "sensi-seeds", nombre: "Sensi Seeds", src: "/brand-logos/sensi-seeds.jpg", width: 3500, height: 3254, tratamiento: "mezclar", href: "/semillas?banco=sensi-seeds" },
  { slug: "silver-river-seeds", nombre: "Silver River Seeds", src: "/brand-logos/silver-river-seeds.png", width: 640, height: 640, tratamiento: "oscuro", href: "/semillas?banco=silver-river-seeds" },
  { slug: "cannabis-conicet", nombre: "Cannabis Conicet", src: "/brand-logos/cannabis-conicet.webp", width: 793, height: 815, tratamiento: "mezclar", href: "/semillas?banco=cannabis-conicet" },
  { slug: "sweed-labs", nombre: "Sweed Labs", src: "/brand-logos/sweed-labs.webp", width: 225, height: 225, tratamiento: "mezclar" },
];

function LogoImagen({ logo }: { logo: LogoBanco }) {
  return (
    <span className="bancos-carousel__stage" aria-hidden="true">
      <img
        src={logo.src}
        alt=""
        width={logo.width}
        height={logo.height}
        loading="lazy"
        decoding="async"
        draggable="false"
        className="bancos-carousel__image"
        data-logo={logo.slug}
        data-treatment={logo.tratamiento}
      />
    </span>
  );
}

function LogosGrupo({ copia = false }: { copia?: boolean }) {
  return (
    <div className={`bancos-carousel__group${copia ? " bancos-carousel__group--copy" : ""}`} aria-hidden={copia || undefined}>
      {LOGOS_BANCOS.map((logo) => {
        if (logo.href && !copia) {
          return (
            <Link key={logo.slug} to={logo.href} className="bancos-carousel__item" aria-label={`Ver genéticas de ${logo.nombre}`} title={logo.nombre}>
              <LogoImagen logo={logo} />
            </Link>
          );
        }

        return (
          <span key={logo.slug} className="bancos-carousel__item" role={copia ? undefined : "img"} aria-label={copia ? undefined : logo.nombre} title={copia ? undefined : logo.nombre}>
            <LogoImagen logo={logo} />
          </span>
        );
      })}
    </div>
  );
}

export default function BancosRow() {
  const [pausado, setPausado] = useState(false);

  return (
    <section aria-labelledby="bancos-title" className="site-container mt-3">
      <h2 id="bancos-title" className="sr-only">Bancos obtentores e instituciones</h2>
      <div className="bancos-carousel">
        <div className="bancos-carousel__viewport">
          <div className={`bancos-carousel__track${pausado ? " is-paused" : ""}`}>
            <LogosGrupo />
            <LogosGrupo copia />
          </div>
        </div>
        <button
          type="button"
          className="bancos-carousel__control"
          onClick={() => setPausado((actual) => !actual)}
          aria-label={pausado ? "Reanudar carrusel de logos" : "Pausar carrusel de logos"}
          aria-pressed={pausado}
          title={pausado ? "Reanudar" : "Pausar"}
        >
          {pausado ? <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
