import { LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";

export default function Cuenta() {
  return (
    <div className="site-container py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-cls-line bg-cls-paper shadow-paper lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-cls-primary p-7 text-cls-paper md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cls-honey">Mi cuenta</p>
          <h1 className="mt-3 text-4xl font-black leading-none text-cls-paper">Todo tu cultivo, en orden.</h1>
          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex gap-3"><PackageCheck className="h-5 w-5 shrink-0 text-cls-honey" /> Seguí pedidos y entregas desde un solo lugar.</li>
            <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-cls-honey" /> Tus datos se protegen con acceso individual.</li>
            <li className="flex gap-3"><LockKeyhole className="h-5 w-5 shrink-0 text-cls-honey" /> La autenticación segura se habilita junto con Supabase.</li>
          </ul>
        </section>
        <section className="p-7 md:p-10">
          <p className="eyebrow">Acceso de clientes</p>
          <h2 className="mt-2 text-3xl font-black">Estamos preparando este espacio</h2>
          <p className="mt-3 text-sm leading-relaxed text-cls-ink/94">
            La interfaz está definida, pero no habilitamos un inicio de sesión de demostración: primero conectaremos Auth, recuperación de cuenta y trazabilidad de pedidos de forma segura.
          </p>
          <div className="mt-7 rounded-2xl border border-cls-line bg-cls-cream p-5 text-sm text-cls-ink/96">
            Mientras tanto, podés comprar como invitado cuando el checkout quede habilitado.
          </div>
        </section>
      </div>
    </div>
  );
}
