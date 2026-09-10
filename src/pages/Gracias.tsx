import { CheckCircle2, ClipboardList, MessageCircle } from "lucide-react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useCommerceData } from "../context/CommerceDataContext";
import { precioARS } from "../data/catalogo";

export default function Gracias() {
  const { orderId } = useParams();
  const location = useLocation();
  const { orders } = useCommerceData();
  const order = orders.find((item) => item.id === orderId);
  if (!order && !(location.state as { publicNumber?: string } | null)?.publicNumber) return <Navigate to="/" replace />;
  const publicNumber = order?.publicNumber ?? (location.state as { publicNumber: string }).publicNumber;
  return <div className="site-container py-12 sm:py-20"><section className="section-shell mx-auto max-w-3xl overflow-hidden text-center"><div className="bg-cls-primary px-5 py-9 text-cls-paper"><CheckCircle2 className="mx-auto h-12 w-12 text-cls-honey" /><p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-cls-honey">Pedido recibido</p><h1 className="mt-2 text-4xl font-black text-cls-paper sm:text-5xl">¡Gracias por elegirnos!</h1><p className="mt-3 text-sm text-cls-paper/75">Guardá este número para cualquier consulta.</p><p className="mt-5 inline-flex rounded-full bg-cls-paper px-5 py-2 text-lg font-black text-cls-primary-dark">{publicNumber}</p></div><div className="p-5 sm:p-8"><div className="grid gap-3 text-left sm:grid-cols-3"><Step number="1" title="Revisamos" text="Validamos disponibilidad y datos de entrega." /><Step number="2" title="Coordinamos" text="Te contactamos para pago y envío." /><Step number="3" title="Despachamos" text="Recibís la trazabilidad del paquete." /></div>{order && <p className="mt-6 text-sm text-cls-ink/65">Total pendiente de confirmación: <strong className="text-cls-primary-dark">{precioARS(order.total)}</strong></p>}<div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row"><Link to="/semillas" className="btn-primary"><ShoppingLinkIcon /> Seguir comprando</Link><a href={`https://wa.me/5491176086771?text=${encodeURIComponent(`Hola, consulto por mi pedido ${publicNumber}`)}`} target="_blank" rel="noreferrer" className="btn-secondary"><MessageCircle className="h-4 w-4" /> Consultar pedido</a></div><p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-cls-ink/50"><ClipboardList className="h-4 w-4" /> El pedido ya está visible en el tablero administrativo.</p></div></section></div>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) { return <div className="rounded-xl bg-cls-cream p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-cls-honey text-xs font-black">{number}</span><h2 className="mt-3 font-sans text-sm font-black">{title}</h2><p className="mt-1 text-xs text-cls-ink/60">{text}</p></div>; }
function ShoppingLinkIcon() { return <span aria-hidden="true">+</span>; }
