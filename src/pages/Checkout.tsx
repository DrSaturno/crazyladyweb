import { useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { precioARS } from "../data/catalogo";

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  codigoPostal: string;
  provincia: string;
  localidad: string;
  direccion: string;
  notas: string;
  payment: "transferencia" | "mercado_pago";
  terms: boolean;
}

const INITIAL: FormState = {
  nombre: "",
  email: "",
  telefono: "",
  codigoPostal: "",
  provincia: "",
  localidad: "",
  direccion: "",
  notas: "",
  payment: "transferencia",
  terms: false,
};

export default function Checkout() {
  const { items, total } = useCart();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState("");
  const descuento = form.payment === "transferencia" ? Math.round(total * 0.1) : 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("El formulario está validado. La creación de órdenes se habilitará cuando se conecten Supabase, envíos y el proveedor de pagos.");
  }

  if (!items.length) {
    return (
      <div className="site-container py-16 text-center">
        <div className="section-shell mx-auto max-w-2xl p-10">
          <h1 className="display-title text-4xl">No hay productos para confirmar</h1>
          <p className="mt-3 text-sm text-cls-ink/65">Volvé al catálogo y armá tu selección.</p>
          <Link to="/semillas" className="btn-primary mt-6">Ver semillas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container py-7 md:py-10">
      <Link to="/carrito" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-cls-primary hover:text-cls-orange"><ArrowLeft className="h-4 w-4" /> Volver al carrito</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Compra segura</p><h1 className="display-title mt-2 text-4xl md:text-5xl">Confirmá tus datos</h1></div>
        <p className="flex items-center gap-2 rounded-full bg-cls-sage px-4 py-2 text-xs font-bold text-cls-primary-dark"><LockKeyhole className="h-4 w-4" /> Tus datos viajan cifrados en producción</p>
      </div>

      <form onSubmit={submit} className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <CheckoutSection number="1" title="Contacto">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="nombre" label="Nombre y apellido"><input id="nombre" required autoComplete="name" value={form.nombre} onChange={(event) => update("nombre", event.target.value)} /></Field>
              <Field id="email" label="Correo electrónico"><input id="email" required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></Field>
              <Field id="telefono" label="Teléfono"><input id="telefono" required type="tel" autoComplete="tel" value={form.telefono} onChange={(event) => update("telefono", event.target.value)} /></Field>
            </div>
          </CheckoutSection>

          <CheckoutSection number="2" title="Entrega">
            <div className="mb-4 flex gap-3 rounded-xl bg-cls-sage/60 p-4 text-sm text-cls-ink/70"><Truck className="h-5 w-5 shrink-0 text-cls-primary" /><p>El costo final se calcula con el código postal. Antes de cobrar, el servidor validará cobertura, precio y stock.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="codigoPostal" label="Código postal"><input id="codigoPostal" required inputMode="numeric" autoComplete="postal-code" value={form.codigoPostal} onChange={(event) => update("codigoPostal", event.target.value)} /></Field>
              <Field id="provincia" label="Provincia"><input id="provincia" required autoComplete="address-level1" value={form.provincia} onChange={(event) => update("provincia", event.target.value)} /></Field>
              <Field id="localidad" label="Localidad"><input id="localidad" required autoComplete="address-level2" value={form.localidad} onChange={(event) => update("localidad", event.target.value)} /></Field>
              <Field id="direccion" label="Dirección"><input id="direccion" required autoComplete="street-address" value={form.direccion} onChange={(event) => update("direccion", event.target.value)} /></Field>
              <Field id="notas" label="Indicaciones para la entrega" optional><textarea id="notas" rows={3} value={form.notas} onChange={(event) => update("notas", event.target.value)} /></Field>
            </div>
          </CheckoutSection>

          <CheckoutSection number="3" title="Medio de pago">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex min-h-24 cursor-pointer gap-3 rounded-2xl border p-4 transition ${form.payment === "transferencia" ? "border-cls-primary bg-cls-sage/55" : "border-cls-line bg-cls-paper"}`}>
                <input type="radio" name="payment" checked={form.payment === "transferencia"} onChange={() => update("payment", "transferencia")} className="mt-1 accent-cls-primary" />
                <span><strong className="block text-sm text-cls-primary-dark">Transferencia bancaria</strong><span className="mt-1 block text-xs text-cls-ink/65">10% de descuento. El pedido se confirma al validar el comprobante.</span></span>
              </label>
              <label className="flex min-h-24 cursor-not-allowed gap-3 rounded-2xl border border-cls-line bg-cls-cream p-4 opacity-65">
                <input type="radio" name="payment" value="mercado_pago" disabled className="mt-1" />
                <span><strong className="block text-sm text-cls-primary-dark">Mercado Pago</strong><span className="mt-1 block text-xs text-cls-ink/65">Se habilita después de la aprobación comercial del rubro.</span></span>
              </label>
            </div>
          </CheckoutSection>
        </div>

        <aside className="self-start lg:sticky lg:top-[175px]">
          <div className="section-shell p-5 md:p-6">
            <h2 className="text-2xl font-black">Tu pedido</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map(({ producto, cantidad }) => <li key={producto.id} className="flex justify-between gap-3 border-b border-cls-line pb-3 text-xs"><span className="min-w-0"><strong className="block truncate text-cls-primary-dark">{producto.nombre}</strong><span className="text-cls-ink/55">{cantidad} × {precioARS(producto.precio)}</span></span><strong className="shrink-0 text-cls-primary-dark">{precioARS(producto.precio * cantidad)}</strong></li>)}
            </ul>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{precioARS(total)}</dd></div>
              {descuento > 0 && <div className="flex justify-between text-cls-primary"><dt>Descuento transferencia</dt><dd className="font-bold">− {precioARS(descuento)}</dd></div>}
              <div className="flex justify-between"><dt>Envío</dt><dd className="text-xs text-cls-ink/55">A calcular</dd></div>
              <div className="flex justify-between border-t border-cls-line pt-4 text-lg"><dt className="font-bold">Total parcial</dt><dd className="font-black text-cls-primary-dark">{precioARS(total - descuento)}</dd></div>
            </dl>
            <label className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-cls-ink/65"><input required type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} className="mt-0.5 h-4 w-4 accent-cls-primary" /> Confirmo que soy mayor de 18 años y acepto las condiciones de compra que se publicarán antes del lanzamiento.</label>
            <button type="submit" className="btn-primary mt-5 w-full">Validar datos del pedido</button>
            <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-cls-ink/55"><ShieldCheck className="h-4 w-4 shrink-0" /> Esta maqueta no crea órdenes ni procesa pagos reales.</p>
            {status && <p role="status" className="mt-4 rounded-xl bg-cls-primary p-3 text-xs font-bold leading-relaxed text-cls-paper">{status}</p>}
          </div>
        </aside>
      </form>
    </div>
  );
}

function CheckoutSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="section-shell p-5 md:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-cls-primary text-xs font-black text-cls-paper">{number}</span><h2 className="text-2xl font-black">{title}</h2></div>{children}</section>;
}

function Field({ id, label, optional = false, children }: { id: string; label: string; optional?: boolean; children: React.ReactElement }) {
  return (
    <div className="sm:has-[textarea]:col-span-2">
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-cls-primary-dark">{label}{optional && <span className="ml-1 font-normal text-cls-ink/45">(opcional)</span>}</label>
      <div className="[&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-cls-line [&_input]:bg-cls-paper [&_input]:px-3 [&_input]:outline-none [&_input]:focus:border-cls-primary [&_input]:focus:ring-2 [&_input]:focus:ring-cls-honey/50 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-cls-line [&_textarea]:bg-cls-paper [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-cls-primary [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-cls-honey/50">{children}</div>
    </div>
  );
}
