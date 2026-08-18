import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";
import { getBotResponse, CLS_INFO } from "../data/clsKnowledge";
import { getProducto } from "../data/catalogo";

// Canal «widget web» del bot (docs/bot.md § El adaptador del widget web).
// Ventaja sobre los otros tres canales: Emma sabe qué producto está mirando la
// persona en este momento, así que puede arrancar desde ahí en vez de preguntar
// desde cero. En producción el POST va a un webhook de n8n; acá responde local.

interface Msg {
  from: "bot" | "user";
  text: string;
  hora: string;
}

function ahora() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function BotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: CLS_INFO.saludo, hora: ahora() }]);
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Contexto de página: si está en una ficha de producto, Emma lo menciona al abrir.
  const slugProducto = location.pathname.startsWith("/producto/")
    ? location.pathname.replace("/producto/", "")
    : null;
  const productoMirando = slugProducto ? getProducto(slugProducto) : undefined;

  useEffect(() => {
    if (abierto) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, escribiendo, abierto]);

  function abrir() {
    setAbierto(true);
    // Solo la primera vez que abre estando en una ficha, sumamos el contexto.
    if (productoMirando && msgs.length === 1) {
      setMsgs((prev) => [
        ...prev,
        {
          from: "bot",
          text: `Veo que estás mirando la ${productoMirando.nombre} de ${productoMirando.banco} 🌱 ¿Te cuento cómo se lleva con tu espacio de cultivo?`,
          hora: ahora(),
        },
      ]);
    }
  }

  function enviar(texto: string) {
    if (!texto.trim()) return;
    setMsgs((prev) => [...prev, { from: "user", text: texto.trim(), hora: ahora() }]);
    setInput("");
    setEscribiendo(true);
    setTimeout(() => {
      setMsgs((prev) => [...prev, { from: "bot", text: getBotResponse(texto), hora: ahora() }]);
      setEscribiendo(false);
    }, 600 + Math.random() * 500);
  }

  return (
    <>
      {/* Burbuja */}
      {!abierto && (
        <button
          onClick={abrir}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-cls-gradient shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Hablar con Emma"
        >
          <MessageCircle className="w-6 h-6 text-black" />
        </button>
      )}

      {/* Panel */}
      {abierto && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[520px] max-h-[calc(100vh-2.5rem)] bg-navy-800 border border-navy-500 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-navy-900 border-b border-navy-500 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-cls-gradient flex items-center justify-center text-black font-bold flex-shrink-0">
              🌱
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Emma</p>
              <p className="text-[11px] text-cls-green">La guardiana del jardín · en línea</p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="p-1.5 rounded-lg hover:bg-navy-700 text-white/60 hover:text-white transition"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.from === "user"
                      ? "bg-cls-primary text-white rounded-tr-sm"
                      : "bg-navy-600 text-white/90 rounded-tl-sm"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${m.from === "user" ? "text-fuchsia-200" : "text-white/40"}`}>
                    {m.hora}
                  </p>
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="flex justify-start">
                <div className="bg-navy-600 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(input);
            }}
            className="border-t border-navy-500 bg-navy-900 p-3 flex gap-2 flex-shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu consulta..."
              className="flex-1 bg-navy-700 border border-navy-500 rounded-full px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cls-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || escribiendo}
              className="w-9 h-9 rounded-full bg-cls-primary hover:bg-cls-primary-dark disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
