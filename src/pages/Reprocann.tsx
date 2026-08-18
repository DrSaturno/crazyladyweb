import { Link } from "react-router-dom";
import { FileText, UserCheck, MessageCircle, ArrowRight, Info } from "lucide-react";

// ⚠️ CONTENIDO A VALIDAR ANTES DE PUBLICAR.
// Esta página describe el REPROCANN en términos generales y **deriva el trámite** al
// gestor con el que trabaja el cliente (@clinicann). Deliberadamente NO detalla
// requisitos, plazos ni pasos concretos: son datos que cambian, y la regla del
// cliente es que ni el bot ni la web den indicación médica ni reemplacen a un
// profesional (cuestionario 17/08). Antes de salir a producción, este texto lo
// tiene que revisar Clinicann.

const PASOS = [
  {
    icon: UserCheck,
    titulo: "Consulta con un profesional de la salud",
    texto:
      "El registro requiere el aval de un profesional matriculado. Esa evaluación es personal y la hace quien corresponde — nosotros no intervenimos ahí.",
  },
  {
    icon: FileText,
    titulo: "Presentación del trámite",
    texto:
      "Una vez que tenés el aval profesional, se completa la inscripción con la documentación que pide el registro. De esa parte se encarga el equipo gestor.",
  },
  {
    icon: MessageCircle,
    titulo: "Seguimiento hasta la aprobación",
    texto:
      "El gestor te acompaña hasta que sale la autorización, y te avisa cuando corresponde renovarla.",
  },
];

export default function Reprocann() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-cls-green/15 text-cls-green border border-cls-green/30">
          <FileText className="w-3 h-3" /> REPROCANN
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl font-black text-white leading-tight">
          Tramitá tu REPROCANN
        </h1>
        <p className="text-base text-white/60 mt-4 leading-relaxed">
          El REPROCANN es el Registro del Programa de Cannabis: es lo que habilita el autocultivo con
          fines medicinales en Argentina, dentro del marco de la ley 27350 y su reglamentación.
        </p>
      </header>

      {/* Aclaración de alcance — regla dura del cliente */}
      <div className="bg-navy-800 border-l-4 border-cls-green rounded-r-2xl p-5 mb-10">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cls-green mb-2">
          <Info className="w-3.5 h-3.5" /> Importante
        </p>
        <p className="text-sm text-white/75 leading-relaxed">
          Desde Crazy Lady Seeds <strong className="text-white">no damos indicación médica</strong> ni
          reemplazamos la consulta con un profesional de la salud. Lo que sí hacemos es conectarte con
          el equipo que gestiona el trámite, para que no tengas que hacerlo solo.
        </p>
      </div>

      {/* Pasos */}
      <section className="mb-10">
        <h2 className="text-xl font-black text-white mb-5">Cómo es el camino</h2>
        <div className="space-y-4">
          {PASOS.map((p, i) => (
            <div key={p.titulo} className="flex gap-4 bg-navy-800 border border-navy-500 rounded-2xl p-5">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cls-green/15 border border-cls-green/30 flex items-center justify-center">
                  <p.icon className="w-4 h-4 text-cls-green" />
                </div>
                {i < PASOS.length - 1 && <div className="w-px flex-1 bg-navy-500 mt-2" />}
              </div>
              <div className="pb-2">
                <p className="text-sm font-bold text-white">{p.titulo}</p>
                <p className="text-sm text-white/55 mt-1.5 leading-relaxed">{p.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Derivación al gestor */}
      <section className="bg-navy-800 border border-navy-500 rounded-3xl overflow-hidden mb-10">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-cls-gradient opacity-[0.07]" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-cls-green mb-3">
              Nuestro equipo de confianza
            </p>
            <h2 className="text-2xl font-black text-white">Clinicann</h2>
            <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-xl">
              Es con quienes trabajamos para todo lo que tiene que ver con REPROCANN. Se encargan del
              trámite completo y del seguimiento hasta la aprobación.
            </p>
            <a
              href="https://instagram.com/clinicann"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-cls-green hover:bg-cls-green-dark text-black font-bold text-sm px-5 py-3 rounded-xl transition"
            >
              Escribirle a @clinicann <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Cierre hacia el catálogo */}
      <section className="bg-navy-800 border border-navy-500 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white">¿Ya tenés tu REPROCANN?</h2>
        <p className="text-sm text-white/55 mt-2 leading-relaxed">
          Entonces el próximo paso es elegir la genética. Si no sabés por dónde arrancar, abrí el chat
          y contame tu espacio de cultivo y tu experiencia — te ayudo a decidir.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            to="/semillas?tipo=cbd"
            className="inline-flex items-center gap-2 bg-cls-primary hover:bg-cls-primary-dark text-white font-bold text-sm px-5 py-3 rounded-xl transition"
          >
            Ver genéticas CBD <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/notas"
            className="inline-flex items-center gap-2 border border-navy-500 hover:border-white/40 text-white font-bold text-sm px-5 py-3 rounded-xl transition"
          >
            Guías de cultivo
          </Link>
        </div>
      </section>
    </div>
  );
}
