import { AlertCircle, FileText, LockKeyhole, Truck } from "lucide-react";
import { Link } from "react-router-dom";

type PolicyKind = "terminos" | "privacidad" | "envios";

const POLICIES: Record<PolicyKind, {
  eyebrow: string;
  title: string;
  intro: string;
  icon: typeof FileText;
  sections: { title: string; body: string }[];
}> = {
  terminos: {
    eyebrow: "Condiciones de compra",
    title: "Términos claros antes de confirmar.",
    intro: "Este borrador describe el flujo previsto para la tienda. La versión vinculante debe ser revisada y aprobada por Crazy Lady Seeds antes del lanzamiento.",
    icon: FileText,
    sections: [
      { title: "Disponibilidad y precios", body: "El servidor volverá a validar precio, promoción y stock antes de crear cada orden. Agregar un producto al carrito no constituye una reserva." },
      { title: "Mayores de 18 años", body: "La compra estará disponible exclusivamente para personas mayores de 18 años y dentro del alcance legal y comercial aprobado para la operación." },
      { title: "Pagos y confirmación", body: "La orden se considerará confirmada únicamente después de la validación del medio de pago y del envío de la confirmación correspondiente." },
      { title: "Cambios y devoluciones", body: "Plazos, excepciones, costos y canal de gestión deben incorporarse cuando el cliente apruebe la política comercial definitiva." },
    ],
  },
  privacidad: {
    eyebrow: "Privacidad",
    title: "Tus datos, solamente para lo necesario.",
    intro: "La tienda se diseña con minimización de datos y permisos por rol. Esta página debe completarse con la razón social, domicilio, contacto y plazos de conservación aprobados.",
    icon: LockKeyhole,
    sections: [
      { title: "Datos utilizados", body: "Contacto, entrega, estado de la compra y comprobantes cuando correspondan. Los datos de tarjeta no serán almacenados ni procesados por esta aplicación." },
      { title: "Finalidades", body: "Gestionar pedidos, coordinar entregas, brindar soporte y enviar comunicaciones comerciales solo cuando exista consentimiento explícito." },
      { title: "Acceso y seguridad", body: "Los accesos administrativos serán individuales, con permisos mínimos, MFA, registros de auditoría y secretos limitados al servidor." },
      { title: "Derechos y contacto", body: "El canal definitivo para solicitar acceso, corrección o eliminación de datos debe publicarse junto con la política legal aprobada." },
    ],
  },
  envios: {
    eyebrow: "Entrega y seguimiento",
    title: "Envíos discretos y trazables.",
    intro: "La tienda calculará cobertura y costo con el código postal antes del pago. Los tiempos y condiciones definitivos dependen del acuerdo logístico que apruebe el cliente.",
    icon: Truck,
    sections: [
      { title: "Cobertura", body: "La experiencia está preparada para envíos a todo el país. La cobertura efectiva será confirmada por el proveedor logístico al cotizar cada destino." },
      { title: "Embalaje", body: "Los pedidos se prepararán con protección adecuada y presentación discreta, sin comprometer la identificación interna ni la trazabilidad operativa." },
      { title: "Seguimiento", body: "Una vez despachada la orden, el comprador recibirá el identificador de seguimiento por el canal transaccional configurado." },
      { title: "Incidencias", body: "Demoras, daños o faltantes deberán gestionarse desde el canal de atención asociado a la orden. Los plazos de reclamo quedan pendientes de aprobación comercial." },
    ],
  },
};

export default function Politica({ kind }: { kind: PolicyKind }) {
  const policy = POLICIES[kind];
  const Icon = policy.icon;

  return (
    <div className="site-container py-8 md:py-12">
      <header className="relative overflow-hidden rounded-[28px] bg-cls-sage px-6 py-9 md:px-10 md:py-12">
        <Icon className="absolute -bottom-8 right-5 h-44 w-44 text-cls-primary/15" strokeWidth={1.2} aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="eyebrow">{policy.eyebrow}</p>
          <h1 className="display-title mt-3 text-4xl md:text-6xl">{policy.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cls-ink/75 md:text-base">{policy.intro}</p>
        </div>
      </header>

      <div className="mt-4 flex gap-3 rounded-2xl border-l-4 border-cls-orange bg-cls-paper p-4 text-sm leading-relaxed text-cls-ink/70">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-cls-orange" aria-hidden="true" />
        <p><strong className="text-cls-primary-dark">Borrador para validación.</strong> No reemplaza el texto legal ni comercial que debe aprobarse antes de habilitar cobros reales.</p>
      </div>

      <div className="mx-auto mt-8 max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          {policy.sections.map((section, index) => (
            <section key={section.title} className="section-shell p-5 md:p-6">
              <span className="eyebrow">0{index + 1}</span>
              <h2 className="mt-2 text-2xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-cls-ink/70">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-cls-primary p-6 text-cls-paper sm:flex-row sm:items-center">
          <div><h2 className="font-sans text-lg font-bold text-cls-paper">¿Necesitás una aclaración?</h2><p className="mt-1 text-sm text-cls-paper/70">Consultá por WhatsApp antes de avanzar con tu compra.</p></div>
          <a href="https://wa.me/5491176086771" target="_blank" rel="noreferrer" className="btn-primary shrink-0">Abrir WhatsApp</a>
        </div>

        <nav aria-label="Otras políticas" className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold">
          <Link to="/terminos" className="btn-outline">Términos</Link>
          <Link to="/privacidad" className="btn-outline">Privacidad</Link>
          <Link to="/envios" className="btn-outline">Envíos</Link>
        </nav>
      </div>
    </div>
  );
}
