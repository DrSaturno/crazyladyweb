import { Clock3, Mail, MapPin, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { BANCOS, TIPO_LABEL } from "../data/catalogo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-8 overflow-hidden bg-cls-primary text-cls-paper">
      <div className="absolute inset-x-0 top-0 h-8 bg-cls-cream" style={{ clipPath: "ellipse(56% 72% at 50% 0%)" }} />
      <div className="site-container pb-7 pt-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr_0.9fr]">
          <div>
            <Link to="/" className="brand-logo-frame" aria-label="Crazy Lady Seeds — inicio">
              <img src="/logo-cls-01.png" alt="" />
            </Link>
            <p className="mt-2 max-w-[220px] font-serif text-lg font-black leading-tight text-cls-paper">Sembrando un mundo más verde y libre.</p>
          </div>

          <FooterColumn title="Atención al cliente">
            <a href="https://wa.me/5491176086771" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp +54 9 11 7608-6771</a>
            <span><Mail className="h-4 w-4" /> Consultas por WhatsApp o Instagram</span>
            <span><Clock3 className="h-4 w-4" /> Lun a vie, 9 a 18 h</span>
          </FooterColumn>

          <FooterColumn title="Información">
            <Link to="/semillas">Catálogo completo</Link>
            <Link to="/carrito">Carrito</Link>
            <Link to="/reprocann">REPROCANN</Link>
            <Link to="/notas">Guías de cultivo</Link>
            <Link to="/envios">Envíos</Link>
            <Link to="/terminos">Términos de compra</Link>
            <Link to="/privacidad">Privacidad</Link>
          </FooterColumn>

          <FooterColumn title="Comprar por tipo">
            {(["feminizada", "automatica", "cbd"] as const).map((type) => <Link key={type} to={`/semillas?tipo=${type}`}>{TIPO_LABEL[type]}</Link>)}
            <Link to="/esquejes">Esquejes</Link>
            <Link to="/favoritos">Favoritos</Link>
          </FooterColumn>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cls-honey">Seguinos</p>
            <a href="https://instagram.com/crazyladyseedsok" target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cls-paper/30 transition hover:bg-cls-paper hover:text-cls-primary" aria-label="Instagram"><InstagramIcon className="h-5 w-5" /></a>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="rounded-lg bg-cls-paper px-2 py-1 text-cls-primary">Transferencia</span>
              <span className="rounded-lg border border-cls-paper/30 px-2 py-1 text-cls-paper">Mercado Pago*</span>
            </div>
            <p className="mt-2 text-[9px] text-cls-paper/67">*Sujeto a habilitación comercial.</p>
          </div>
        </div>

        <div className="mt-9 grid gap-4 border-t border-cls-paper/20 pt-6 text-[11px] leading-relaxed text-cls-paper/65 lg:grid-cols-[1fr_auto]">
          <p className="max-w-4xl">
            Crazy Lady Seeds trabaja bajo las normativas declaradas por el cliente para la distribución, comercialización y producción de semillas y esquejes de cannabis medicinal. Registro informado: INASE N° 12665. La información no reemplaza asesoramiento médico ni legal.
          </p>
          <div className="flex gap-3 lg:justify-end">
            <ShieldCheck className="h-5 w-5 shrink-0 text-cls-honey" aria-hidden="true" />
            <span>Venta exclusiva a mayores de 18 años.</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-cls-paper/15 pt-5 text-[10px] text-cls-paper/66 sm:flex-row">
          <p>© {new Date().getFullYear()} Crazy Lady Seeds. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Argentina · Envíos discretos a todo el país <Truck className="ml-1 h-3 w-3" /></p>
          <p>Otra forma de ver el mundo. <span className="text-cls-honey" aria-hidden="true">✦</span></p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-cls-paper/65">
          {BANCOS.slice(0, 6).map((bank) => <Link key={bank.slug} to={`/semillas?banco=${bank.slug}`} className="hover:text-cls-paper">{bank.nombre}</Link>)}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cls-honey">{title}</p>
      <div className="mt-3 flex flex-col gap-2.5 text-xs text-cls-paper/70 [&>*]:flex [&>*]:items-center [&>*]:gap-2 [&>a]:transition [&>a:hover]:text-cls-paper">
        {children}
      </div>
    </div>
  );
}
