import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  CreditCard,
  Leaf,
  Mail,
  MessageCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Truck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import BancosRow from "../components/BancosRow";
import ProductCard from "../components/ProductCard";
import { esInase, type Producto } from "../data/catalogo";
import { useCommerceData } from "../context/CommerceDataContext";
import { NOTAS } from "../data/notas";

const BENEFICIOS = [
  { icon: Truck, title: "Envíos discretos", text: "a todo el país" },
  { icon: ShieldCheck, title: "Genéticas certificadas", text: "por INASE" },
  { icon: MessageCircle, title: "Asesoramiento", text: "real y personalizado" },
  { icon: CreditCard, title: "Múltiples medios", text: "de pago" },
  { icon: UsersRound, title: "Comunidad", text: "que te acompaña" },
  { icon: Leaf, title: "Cultivo responsable", text: "y consciente" },
];

const ACCESOS = [
  { label: "Ver genéticas certificadas por INASE", to: "/semillas?origen=nacional", horizontal: "/images/home/inase-horizontal.jpg", vertical: "/images/home/inase-vertical.jpg" },
  { label: "Ver esquejes disponibles", to: "/esquejes", horizontal: "/images/home/esquejes-horizontal.jpg", vertical: "/images/home/esquejes-vertical.jpg" },
  { label: "Ver el catálogo de semillas", to: "/semillas", horizontal: "/images/home/semillas-horizontal.jpg", vertical: "/images/home/semillas-vertical.jpg" },
  { label: "Conocer la orientación sobre REPROCANN", to: "/reprocann", horizontal: "/images/home/reprocann-horizontal.jpg", vertical: "/images/home/reprocann-vertical.jpg" },
];

const FAQS = [
  { q: "¿Hacen envíos a todo el país?", a: "Sí. Despachamos por Andreani y el costo se calcula según tu código postal. El embalaje es discreto y protege la trazabilidad del pedido." },
  { q: "¿Las semillas son originales?", a: "Trabajamos con bancos de origen declarado y mostramos el banco obtentor en cada ficha. Las genéticas registradas llevan su identificación INASE." },
  { q: "¿Qué es el REPROCANN?", a: "Es el registro nacional para personas autorizadas al cultivo con fines medicinales. Crazy Lady Seeds brinda información y deriva el trámite a profesionales especializados." },
  { q: "¿Cómo elijo la genética ideal para mí?", a: "Empezá por espacio, experiencia, tiempo de cultivo y objetivo. Podés usar los filtros o hablar con Emma para comparar opciones disponibles." },
];

const ARTICLE_ICONS = [Sprout, Sun, Leaf, BookOpen];

const DIARIO_IMAGES = [
  { horizontal: "/images/home/diario1-horizontal.png", vertical: "/images/home/diario1-vertical.png" },
  { horizontal: "/images/home/diario2-horizontal.png", vertical: "/images/home/diario2-vertical.png" },
  { horizontal: "/images/home/diario3-horizontal.png", vertical: "/images/home/diario3-vertical.png" },
  { horizontal: "/images/home/diario4-horizontal.png", vertical: "/images/home/diario4-vertical.png" },
];

export default function Home() {
  const { products, content, settings } = useCommerceData();
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [suscripto, setSuscripto] = useState(false);
  const semillas = products.filter((product) => product.categoria === "semilla");
  const esquejes = products.filter((product) => product.categoria === "esqueje");
  const conStock = semillas.filter((product) => product.stock > 0 && product.visible_web !== false).sort((a, b) => b.stock - a.stock);
  const masVendidas = conStock.slice(0, 5);
  const seleccion = conStock.slice(5, 10);
  const inaseCount = semillas.filter((product) => product.stock > 0 && esInase(product.banco)).length;
  const notas = NOTAS.filter((nota) => nota.tipo === "guia").slice(0, 4);
  const cmsFaqs = content.filter((entry) => entry.tipo === "faq" && entry.publicado).map((entry) => ({ q: entry.titulo, a: entry.contenido }));
  const faqs = cmsFaqs.length ? cmsFaqs : FAQS;
  const heroBanner = content.find((entry) => entry.id === "banner-home" && entry.publicado);

  return (
    <div className="pb-8">
      <section className="site-container pt-3" aria-labelledby="hero-title">
        <div className="relative">
          <div className="overflow-hidden rounded-[26px] border-[5px] border-cls-paper bg-cls-primary shadow-lift md:rounded-[30px]">
            <h1 id="hero-title" className="sr-only">Sembrando felicidad</h1>
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/home/head-vertical.jpg" />
              <img src="/images/home/head-horizontal.jpg" alt="" width="2172" height="724" loading="eager" decoding="async" className="block aspect-[941/1672] w-full object-cover md:aspect-[3/1]" />
            </picture>
          </div>
          <div className="relative z-10 mx-3 -mt-5 flex flex-col gap-3 rounded-2xl border border-cls-line bg-cls-paper/95 p-3 shadow-lift backdrop-blur sm:mx-6 md:flex-row md:items-center md:justify-between md:px-4">
            <p className="hidden max-w-xl text-xs leading-relaxed text-cls-ink/65 lg:block">{heroBanner?.contenido ?? "Genéticas nacionales e importadas con origen claro. Te acompañamos desde la elección hasta la cosecha."}</p>
            <div className="flex flex-col gap-2 sm:flex-row md:ml-auto">
              <Link to="/semillas" className="btn-primary">Ver el catálogo <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/notas/primer-cultivo-por-donde-arrancar" className="btn-outline">¿Primera vez cultivando?</Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Beneficios de comprar en Crazy Lady Seeds" className="site-container mt-3">
        <div className="grid grid-cols-2 gap-y-4 rounded-2xl border border-cls-line bg-cls-paper px-4 py-4 shadow-[0_3px_12px_rgba(23,53,44,0.04)] sm:grid-cols-3 lg:grid-cols-6">
          {BENEFICIOS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex min-w-0 items-center gap-2.5 border-cls-line px-2 lg:border-r lg:last:border-r-0">
              <Icon className="h-7 w-7 shrink-0 text-cls-primary" strokeWidth={1.7} aria-hidden="true" />
              <p className="text-[11px] leading-tight text-cls-ink/75"><strong className="block text-cls-primary-dark">{title}</strong>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <BancosRow />

      <section className="site-container mt-3 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Categorías destacadas">
        {ACCESOS.map(({ label, to, horizontal, vertical }) => (
          <Link key={to} to={to} aria-label={label} className="group relative overflow-hidden rounded-2xl border border-cls-line bg-white shadow-[0_3px_12px_rgba(23,53,44,0.04)] transition duration-300 hover:-translate-y-1 hover:border-cls-primary hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cls-orange focus-visible:ring-offset-2">
            <picture>
              <source media="(max-width: 767px)" srcSet={vertical} />
              <img src={horizontal} alt="" width="1200" height="675" loading="lazy" decoding="async" className="block aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.015] md:aspect-[11/5]" />
            </picture>
            <span className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-cls-paper/70 bg-cls-primary text-cls-paper shadow-md transition group-hover:bg-cls-orange" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
          </Link>
        ))}
      </section>

      <section className="site-container mt-3 grid gap-3 xl:grid-cols-2" aria-label="Productos destacados">
        <ProductShelf title="Más vendidas" subtitle="Lo que más elige la comunidad." icon={Sparkles} products={masVendidas} href="/semillas?stock=1" />
        <ProductShelf title="Elegidas esta semana" subtitle={`${settings.descuentoTransferencia}% OFF pagando por transferencia.`} icon={Sun} products={seleccion} href="/semillas?stock=1" accent />
      </section>

      <section id="principiantes" className="site-container mt-3 grid gap-3 lg:grid-cols-2">
        <div className="section-shell p-3 md:p-4">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-heading flex items-center gap-2"><BookOpen className="h-6 w-6" aria-hidden="true" /> Para principiantes</h2>
              <p className="mt-1 text-xs text-cls-ink/65">Todo lo que necesitás para empezar con confianza.</p>
            </div>
            <Link to="/notas" className="text-xs font-bold text-cls-primary hover:text-cls-orange">Ver todas →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {notas.map((nota, index) => {
              const Icon = ARTICLE_ICONS[index % ARTICLE_ICONS.length];
              return (
                <Link key={nota.slug} to={`/notas/${nota.slug}`} className="group overflow-hidden rounded-xl border border-cls-line bg-cls-paper">
                  <div className={`flex aspect-[4/3] items-center justify-center ${index % 2 ? "bg-[#EEC49D]" : "bg-cls-sage"}`}>
                    <Icon className="h-12 w-12 text-cls-primary transition group-hover:scale-110" strokeWidth={1.3} aria-hidden="true" />
                  </div>
                  <div className="p-2.5">
                    <h3 className="line-clamp-3 font-sans text-xs font-bold leading-snug text-cls-primary-dark">{nota.titulo}</h3>
                    <ArrowRight className="ml-auto mt-2 h-4 w-4 text-cls-primary" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div id="comunidad" className="grid gap-3 sm:grid-cols-2">
          <Link to="/notas" className="relative min-h-[178px] overflow-hidden rounded-2xl sm:col-span-2">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/home/fundacion-vertical.png" />
              <img src="/images/home/fundacion-horizontal.png" alt="Fundación — Comunidad de cultivadoras" width="1200" height="600" loading="lazy" decoding="async" className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)] object-cover" />
            </picture>
          </Link>
          <div className="relative min-h-[160px] overflow-hidden rounded-2xl">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/home/comunidad-vertical.png" />
              <img src="/images/home/comunidad-horizontal.png" alt="Comunidad — Cultivando en comunidad" width="600" height="400" loading="lazy" decoding="async" className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)] object-cover" />
            </picture>
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("cls:open-bot"))} className="relative min-h-[160px] overflow-hidden rounded-2xl text-left transition hover:-translate-y-0.5 hover:shadow-lift">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/home/doctor-vertical.png" />
              <img src="/images/home/doctor-horizontal.png" alt="Plant Doctor — Diagnóstico en vivo" width="600" height="400" loading="lazy" decoding="async" className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)] object-cover" />
            </picture>
          </button>
        </div>
      </section>

      <section className="site-container mt-3 grid gap-3 lg:grid-cols-2">
        <div className="section-shell p-3 md:p-4">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="section-heading">El diario de Crazy Lady</h2>
              <p className="mt-1 text-xs text-cls-ink/65">Historias, guías y novedades del cultivo.</p>
            </div>
            <Link to="/notas" className="text-xs font-bold text-cls-primary hover:text-cls-orange">Ver todas →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {notas.map((nota, index) => {
              const img = DIARIO_IMAGES[index % DIARIO_IMAGES.length];
              return (
                <Link key={nota.slug} to={`/notas/${nota.slug}`} className="group overflow-hidden rounded-xl border border-cls-line bg-cls-paper">
                  <picture>
                    <source media="(max-width: 767px)" srcSet={img.vertical} />
                    <img src={img.horizontal} alt="" width="1200" height="750" loading="lazy" decoding="async" className="block aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  </picture>
                  <div className="p-2.5">
                    <h3 className="line-clamp-3 font-sans text-xs font-bold leading-snug">{nota.titulo}</h3>
                    <p className="mt-2 text-[10px] text-cls-ink/55">{nota.minutos} min de lectura</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="section-shell p-5 md:p-6">
          <div className="flex items-start gap-4">
            <UsersRound className="h-9 w-9 shrink-0 text-cls-primary" aria-hidden="true" />
            <div>
              <p className="eyebrow">Lo que construimos</p>
              <h2 className="section-heading mt-1">Una compra acompañada</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Origen y trazabilidad visibles", "Asesoramiento antes y después", "Información clara para decidir"].map((text) => (
              <div key={text} className="rounded-xl border border-cls-line bg-cls-cream p-4 text-sm font-bold leading-snug text-cls-primary-dark">
                <Sparkles className="mb-3 h-5 w-5 text-cls-orange" aria-hidden="true" />{text}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-cls-ink/60">Las reseñas se publicarán únicamente cuando existan testimonios reales y autorizados.</p>
        </div>
      </section>

      <section className="site-container mt-3 grid gap-3 lg:grid-cols-2">
        <div id="faq" className="section-shell p-4 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <CircleHelp className="h-7 w-7 text-cls-primary" aria-hidden="true" />
            <div><h2 className="section-heading">Preguntas frecuentes</h2><p className="mt-1 text-xs text-cls-ink/60">Resolvemos tus dudas.</p></div>
          </div>
          <div className="divide-y divide-cls-line border-y border-cls-line">
            {faqs.map((item, index) => {
              const open = faqAbierta === index;
              return (
                <div key={item.q}>
                  <button onClick={() => setFaqAbierta(open ? null : index)} className="flex min-h-11 w-full items-center justify-between gap-4 py-2.5 text-left text-sm font-bold text-cls-primary-dark" aria-expanded={open}>
                    {item.q}<span className="text-xl font-normal" aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  {open && <p className="pb-4 pr-8 text-sm leading-relaxed text-cls-ink/70">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div id="newsletter" className="retro-wave section-shell relative overflow-hidden p-6 md:p-8">
          <div className="relative z-10 max-w-lg">
            <Mail className="h-8 w-8 text-cls-primary" aria-hidden="true" />
            <h2 className="mt-3 text-3xl font-black leading-none">Sumate a nuestra comunidad y recibí novedades.</h2>
            <p className="mt-2 text-sm text-cls-ink/70">Stock nuevo, guías y beneficios, sin llenar tu bandeja.</p>
            {suscripto ? (
              <p role="status" className="mt-5 rounded-xl bg-cls-primary px-4 py-3 text-sm font-bold text-cls-paper">El formulario está validado. La suscripción se activará al conectar el backend.</p>
            ) : (
              <form className="mt-5" onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSuscripto(true); }}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex-1"><label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Tu email…" className="h-11 w-full rounded-full border border-cls-primary bg-cls-paper px-4 text-sm outline-none focus:ring-2 focus:ring-cls-honey" /></div>
                  <button className="btn-primary" type="submit">Suscribirme</button>
                </div>
                <label className="mt-3 flex items-start gap-2 text-[11px] text-cls-ink/65"><input required type="checkbox" className="mt-0.5 h-4 w-4 accent-cls-primary" /> Acepto recibir comunicaciones de Crazy Lady Seeds. Puedo cancelar cuando quiera.</label>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="site-container mt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cls-line bg-cls-sage px-5 py-4 text-sm">
          <p className="font-bold text-cls-primary-dark"><Scissors className="mr-2 inline h-5 w-5" aria-hidden="true" /> También trabajamos con esquejes seleccionados.</p>
          <p className="text-cls-ink/70">{esquejes.filter((item) => item.stock > 0).length} variedad disponible · {inaseCount} genéticas INASE con stock</p>
        </div>
      </section>
    </div>
  );
}

function ProductShelf({ title, subtitle, icon: Icon, products, href, accent = false }: { title: string; subtitle: string; icon: typeof Sparkles; products: Producto[]; href: string; accent?: boolean }) {
  return (
    <div className="section-shell p-3 md:p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="section-heading flex items-center gap-2"><Icon className={`h-6 w-6 ${accent ? "text-cls-orange" : "text-cls-honey"}`} fill="currentColor" aria-hidden="true" />{title}</h2>
          <p className="mt-1 text-xs text-cls-ink/65">{subtitle}</p>
        </div>
        <Link to={href} className="shrink-0 text-xs font-bold text-cls-primary hover:text-cls-orange">Ver todas →</Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {products.map((product) => <ProductCard key={product.id} producto={product} compact />)}
      </div>
    </div>
  );
}
