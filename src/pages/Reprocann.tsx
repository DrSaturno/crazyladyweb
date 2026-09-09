import { ArrowRight, FileText, Info, MessageCircle, ShieldCheck, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
  { icon: UserCheck, title: "Consulta con un profesional", text: "La evaluación de salud es personal y corresponde a un profesional matriculado. Crazy Lady Seeds no interviene ni brinda indicaciones médicas." },
  { icon: FileText, title: "Presentación del trámite", text: "Con la documentación correspondiente, el equipo gestor acompaña la inscripción en el registro." },
  { icon: MessageCircle, title: "Seguimiento", text: "El gestor acompaña el estado de la solicitud y orienta sobre renovaciones cuando corresponde." },
];

export default function Reprocann() {
  return (
    <div className="site-container py-8 md:py-12">
      <header className="relative overflow-hidden rounded-[28px] border border-cls-line bg-cls-sage p-6 md:p-10">
        <ShieldCheck className="absolute -bottom-12 right-5 h-56 w-56 text-cls-primary/15" strokeWidth={1.1} aria-hidden="true" />
        <div className="relative max-w-3xl"><p className="eyebrow flex items-center gap-2"><FileText className="h-4 w-4" /> REPROCANN</p><h1 className="display-title mt-3 text-4xl md:text-6xl">Información clara para iniciar tu trámite.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-cls-ink/75 md:text-base">El REPROCANN es el registro nacional vinculado al cultivo con fines medicinales. Esta página orienta y deriva: no reemplaza la consulta profesional ni la información oficial.</p></div>
      </header>

      <div className="mt-4 flex gap-3 rounded-2xl border-l-4 border-cls-orange bg-cls-paper p-5 shadow-paper"><Info className="mt-0.5 h-5 w-5 shrink-0 text-cls-orange" /><div><p className="text-xs font-black uppercase tracking-[0.12em] text-cls-orange">Contenido a validar antes de publicar</p><p className="mt-2 text-sm leading-relaxed text-cls-ink/70">Los requisitos y procedimientos pueden cambiar. La versión productiva debe ser revisada por el equipo gestor y enlazar siempre a la fuente oficial vigente.</p></div></div>

      <section className="mt-10" aria-labelledby="steps-title">
        <p className="eyebrow">Orientación general</p><h2 id="steps-title" className="section-heading mt-1">Cómo es el camino</h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => <li key={title} className="section-shell p-5"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-cls-sage text-cls-primary"><Icon className="h-5 w-5" /></span><span className="font-serif text-3xl font-black text-cls-orange/45">0{index + 1}</span></div><h3 className="mt-4 font-sans text-base font-bold text-cls-primary-dark">{title}</h3><p className="mt-2 text-sm leading-relaxed text-cls-ink/65">{text}</p></li>)}
        </ol>
      </section>

      <section className="retro-wave mt-10 overflow-hidden rounded-[28px] border border-cls-line bg-[#F3C39A] p-6 md:p-9">
        <div className="max-w-2xl"><p className="eyebrow">Equipo recomendado por el cliente</p><h2 className="mt-2 text-4xl font-black">Clinicann</h2><p className="mt-3 text-sm leading-relaxed text-cls-ink/70">El equipo indicado por Crazy Lady Seeds para orientar el trámite y su seguimiento. Confirmá requisitos, alcance y honorarios directamente con ellos.</p><a href="https://instagram.com/clinicann" target="_blank" rel="noreferrer" className="btn-secondary mt-6">Contactar a @clinicann <ArrowRight className="h-4 w-4" /></a></div>
      </section>

      <section className="mt-4 flex flex-col justify-between gap-5 rounded-2xl bg-cls-primary p-6 text-cls-paper md:flex-row md:items-center md:p-8">
        <div><h2 className="text-2xl font-black text-cls-paper">¿Ya tenés tu autorización?</h2><p className="mt-2 max-w-2xl text-sm text-cls-paper/70">Podés seguir con las guías y comparar genéticas según tu espacio y experiencia.</p></div>
        <div className="flex flex-wrap gap-2"><Link to="/semillas?tipo=cbd" className="btn-primary">Ver genéticas CBD</Link><Link to="/notas" className="btn-outline border-cls-paper bg-transparent text-cls-paper hover:bg-cls-paper hover:text-cls-primary">Guías de cultivo</Link></div>
      </section>
    </div>
  );
}
