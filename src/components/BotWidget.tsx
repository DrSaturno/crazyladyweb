import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sprout, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCommerceData } from "../context/CommerceDataContext";
import { getBotResponse } from "../data/clsKnowledge";
import { useEscapeClose } from "../hooks/useEscapeClose";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface Message {
  from: "bot" | "user";
  text: string;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function BotWidget() {
  const { bot, products } = useCommerceData();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: bot.saludo, time: now() }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const widgetRef = useFocusTrap<HTMLElement>(open);
  const location = useLocation();
  const productSlug = location.pathname.startsWith("/producto/") ? location.pathname.replace("/producto/", "") : null;
  const viewedProduct = productSlug ? products.find((product) => product.slug === productSlug) : undefined;

  function openWidget() {
    setOpen(true);
    if (viewedProduct && messages.length === 1) {
      setMessages((current) => [...current, { from: "bot", text: `Veo que estás mirando ${viewedProduct.nombre} de ${viewedProduct.banco}. ¿Querés que la comparemos con tu espacio y experiencia?`, time: now() }]);
    }
  }

  useEffect(() => {
    const handleOpen = () => openWidget();
    window.addEventListener("cls:open-bot", handleOpen);
    return () => window.removeEventListener("cls:open-bot", handleOpen);
  });

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  function closeWidget() {
    setOpen(false);
    toggleButtonRef.current?.focus();
  }

  useEscapeClose(open, closeWidget);

  function send(text: string) {
    if (!text.trim() || typing) return;
    setMessages((current) => [...current, { from: "user", text: text.trim(), time: now() }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { from: "bot", text: getBotResponse(text), time: now() }]);
      setTyping(false);
    }, 650);
  }

  return (
    <>
      {!open && (
        <button ref={toggleButtonRef} type="button" onClick={openWidget} style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }} className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-cls-paper bg-cls-orange text-cls-primary-dark shadow-lift transition hover:-translate-y-1 hover:bg-cls-honey" aria-label={`Hablar con ${bot.nombre}`}>
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {open && (
        <section ref={widgetRef} role="dialog" aria-modal="true" aria-label={`Asistente virtual ${bot.nombre}`} className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden bg-cls-cream shadow-2xl sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[560px] sm:max-h-[calc(100dvh-2.5rem)] sm:w-[390px] sm:rounded-[22px] sm:border sm:border-cls-line">
          <header className="flex shrink-0 items-center gap-3 bg-cls-primary px-4 py-3 text-cls-paper">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cls-honey text-cls-primary-dark"><Sprout className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><h2 className="font-sans text-sm font-bold text-cls-paper">{bot.nombre}</h2><p className="text-[11px] text-cls-paper/70">Asistente de cultivo · demo informativa</p></div>
            <button type="button" onClick={closeWidget} className="flex h-11 w-11 items-center justify-center rounded-full text-cls-paper/80 hover:bg-white/10 hover:text-cls-paper" aria-label="Cerrar asistente"><X className="h-5 w-5" aria-hidden="true" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${message.from === "user" ? "rounded-br-sm bg-cls-primary text-cls-paper" : "rounded-bl-sm border border-cls-line bg-cls-paper text-cls-ink"}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p className={`mt-1 text-right text-[9px] ${message.from === "user" ? "text-cls-paper/68" : "text-cls-ink/84"}`}>{message.time}</p>
                </div>
              </div>
            ))}
            {typing && <div className="flex justify-start"><div className="flex gap-1 rounded-2xl rounded-bl-sm border border-cls-line bg-cls-paper px-4 py-3" aria-label={`${bot.nombre} está escribiendo`}>{[0, 1, 2].map((item) => <span key={item} className="h-1.5 w-1.5 animate-bounce rounded-full bg-cls-primary/55" style={{ animationDelay: `${item * 120}ms` }} />)}</div></div>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={(event) => { event.preventDefault(); send(input); }} className="shrink-0 border-t border-cls-line bg-cls-paper px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <label htmlFor="bot-message" className="sr-only">Escribí tu consulta</label>
            <div className="flex gap-2">
              <input id="bot-message" name="message" autoComplete="off" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribí tu consulta…" className="h-11 min-w-0 flex-1 rounded-full border border-cls-line bg-cls-cream px-4 text-base outline-none focus:border-cls-primary focus:ring-2 focus:ring-cls-honey/50 sm:text-sm" />
              <button type="submit" disabled={!input.trim() || typing} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cls-honey text-cls-primary-dark transition hover:bg-[#F7C85E] disabled:opacity-40" aria-label="Enviar mensaje"><Send className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <p className="mt-2 text-center text-[9px] text-cls-ink/84">Las respuestas actuales son locales; no se envían datos a terceros.</p>
          </form>
        </section>
      )}
    </>
  );
}
