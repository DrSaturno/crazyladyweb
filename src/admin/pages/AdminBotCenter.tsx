import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BarChart3,
  Bot,
  Camera,
  CheckCircle2,
  Clock3,
  DollarSign,
  Globe2,
  MessageCircle,
  Search,
  Send,
  Share2,
  TrendingDown,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useCommerceData } from "../../context/CommerceDataContext";
import { AdminPage, EmptyState, StatusBadge, fieldClass } from "../components/AdminUI";

type BotTab = "conversations" | "metrics";
type Channel = "whatsapp" | "instagram" | "telegram" | "web";
type ConversationStatus = "active" | "human" | "resolved";
type Sender = "customer" | "bot" | "agent";

interface ConversationMessage {
  id: string;
  sender: Sender;
  text: string;
  time: string;
}

interface BotConversation {
  id: string;
  name: string;
  contact: string;
  channel: Channel;
  status: ConversationStatus;
  topic: string;
  lastMessage: string;
  ago: string;
  messages: ConversationMessage[];
}

const CHANNELS: { id: Channel; label: string; icon: LucideIcon; badge: string }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, badge: "border-cls-primary/20 bg-cls-sage/70 text-cls-primary-dark" },
  { id: "instagram", label: "Instagram", icon: Camera, badge: "border-cls-orange/20 bg-cls-orange/15 text-cls-orange" },
  { id: "telegram", label: "Telegram", icon: Send, badge: "border-sky-200 bg-sky-50 text-sky-800" },
  { id: "web", label: "Widget web", icon: Globe2, badge: "border-cls-honey/40 bg-cls-honey/25 text-cls-primary-dark" },
];

const INITIAL_CONVERSATIONS: BotConversation[] = [
  {
    id: "conv-valentina", name: "Valentina Gómez", contact: "+54 9 11 4523-1234", channel: "whatsapp", status: "active", topic: "Automáticas", ago: "hace 2 min", lastMessage: "¿Tenés stock de automáticas THC?",
    messages: [
      { id: "v-1", sender: "customer", text: "Hola! Hay stock de automáticas?", time: "14:19" },
      { id: "v-2", sender: "bot", text: "¡Hola! Soy Emma, la guardiana digital del jardín de Crazy Lady Seeds 🌱 ¿Buscás una genética con THC o CBD?", time: "14:19" },
      { id: "v-3", sender: "customer", text: "THC", time: "14:21" },
      { id: "v-4", sender: "bot", text: "Tengo varias autoflorecientes THC con stock. Puedo compararlas por precio, banco y cantidad de semillas.", time: "14:21" },
    ],
  },
  {
    id: "conv-lucas", name: "Lucas Fernández", contact: "@lucas.fdz", channel: "instagram", status: "resolved", topic: "Fotoperiódicas", ago: "hace 8 min", lastMessage: "Perfecto, gracias por la info de la Amnesia.",
    messages: [
      { id: "l-1", sender: "customer", text: "¿La Amnesia es fotoperiódica?", time: "14:08" },
      { id: "l-2", sender: "bot", text: "Sí. La ficha indica tipo, banco, presentación y disponibilidad actual para que puedas compararla.", time: "14:09" },
      { id: "l-3", sender: "customer", text: "Perfecto, gracias por la info.", time: "14:12" },
    ],
  },
  {
    id: "conv-tomas", name: "Tomás Rodríguez", contact: "@tomascultiva", channel: "telegram", status: "resolved", topic: "Esquejes", ago: "hace 23 min", lastMessage: "¿Los esquejes son variedades registradas?",
    messages: [
      { id: "t-1", sender: "customer", text: "¿Los esquejes son variedades registradas?", time: "13:54" },
      { id: "t-2", sender: "bot", text: "Publicamos el origen y la condición registral en cada ficha. Si querés, te muestro los disponibles.", time: "13:55" },
    ],
  },
  {
    id: "conv-sofia", name: "Sofía Martínez", contact: "sofia.m@example.com", channel: "web", status: "active", topic: "Envíos", ago: "hace 15 min", lastMessage: "¿Cuánto sale el envío a Bariloche?",
    messages: [
      { id: "s-1", sender: "customer", text: "¿Cuánto sale el envío a Bariloche?", time: "14:03" },
      { id: "s-2", sender: "bot", text: "Hacemos envíos discretos a todo el país. El valor final se valida con tu código postal antes de cobrar.", time: "14:04" },
    ],
  },
  {
    id: "conv-camila", name: "Camila López", contact: "+54 9 341 555-0184", channel: "whatsapp", status: "human", topic: "REPROCANN", ago: "hace 41 min", lastMessage: "¿Cómo tramito el REPROCANN?",
    messages: [
      { id: "c-1", sender: "customer", text: "¿Cómo tramito el REPROCANN?", time: "13:37" },
      { id: "c-2", sender: "bot", text: "Puedo darte información general y derivarte al equipo especializado para revisar tu caso.", time: "13:38" },
      { id: "c-3", sender: "agent", text: "Hola Camila, tomo la conversación para orientarte con los próximos pasos.", time: "13:40" },
    ],
  },
  {
    id: "conv-nicolas", name: "Nicolás Ríos", contact: "@nico.r", channel: "instagram", status: "active", topic: "INASE / legalidad", ago: "hace 1 h", lastMessage: "¿Cómo verifico que una genética esté registrada?",
    messages: [
      { id: "n-1", sender: "customer", text: "¿Cómo verifico que una genética esté registrada?", time: "13:15" },
      { id: "n-2", sender: "bot", text: "Las genéticas registradas muestran su identificación INASE en la ficha del producto.", time: "13:16" },
    ],
  },
  {
    id: "conv-julian", name: "Julián Acosta", contact: "julian.a@example.com", channel: "web", status: "resolved", topic: "CBD", ago: "hace 1 h", lastMessage: "Busco una opción con CBD.",
    messages: [
      { id: "j-1", sender: "customer", text: "Busco una opción con CBD.", time: "12:58" },
      { id: "j-2", sender: "bot", text: "Podés filtrar el catálogo por CBD. Te muestro únicamente las opciones publicadas y con stock.", time: "12:59" },
    ],
  },
  {
    id: "conv-marina", name: "Marina Silva", contact: "@marinasi", channel: "telegram", status: "active", topic: "Pagos", ago: "hace 2 h", lastMessage: "¿El descuento por transferencia se aplica solo?",
    messages: [
      { id: "m-1", sender: "customer", text: "¿El descuento por transferencia se aplica solo?", time: "12:24" },
      { id: "m-2", sender: "bot", text: "Sí, el checkout lo calcula automáticamente antes de confirmar el pedido.", time: "12:25" },
    ],
  },
  {
    id: "conv-paula", name: "Paula Benítez", contact: "+54 9 261 555-0142", channel: "whatsapp", status: "active", topic: "Cultivo", ago: "hace 2 h", lastMessage: "Es mi primer cultivo, ¿por dónde empiezo?",
    messages: [
      { id: "p-1", sender: "customer", text: "Es mi primer cultivo, ¿por dónde empiezo?", time: "12:02" },
      { id: "p-2", sender: "bot", text: "Empezá por espacio, experiencia, tiempo de cultivo y objetivo. Con eso puedo ayudarte a comparar.", time: "12:03" },
    ],
  },
  {
    id: "conv-diego", name: "Diego Álvarez", contact: "@diegoalvarez", channel: "instagram", status: "resolved", topic: "Automáticas", ago: "hace 3 h", lastMessage: "Gracias, ya pude elegir.",
    messages: [
      { id: "d-1", sender: "customer", text: "¿Qué automática recomendás para empezar?", time: "11:19" },
      { id: "d-2", sender: "bot", text: "Puedo compararte las alternativas disponibles por banco, precio y presentación.", time: "11:20" },
      { id: "d-3", sender: "customer", text: "Gracias, ya pude elegir.", time: "11:24" },
    ],
  },
];

const ACTIVITY = [3, 6, 9, 14, 12, 5, 9, 15, 20, 13, 8];
const HOURS = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
const TOPICS = [
  { label: "Automáticas", value: 47, color: "bg-cls-orange" },
  { label: "Envíos", value: 38, color: "bg-cls-honey" },
  { label: "Fotoperiódicas", value: 29, color: "bg-[#8bbf86]" },
  { label: "Esquejes", value: 24, color: "bg-cls-primary" },
  { label: "REPROCANN", value: 21, color: "bg-[#62aa78]" },
  { label: "INASE / legalidad", value: 14, color: "bg-[#98c99e]" },
  { label: "CBD", value: 9, color: "bg-cls-honey" },
];

export function AdminBot() {
  const [tab, setTab] = useState<BotTab>("conversations");
  return (
    <AdminPage
      eyebrow="Emma · centro omnicanal"
      title="Bot y conversaciones"
      description="Revisá las consultas de todos los canales en una bandeja única y seguí el rendimiento del bot sin salir del módulo."
      action={<BotStatus />}
    >
      <div className="mb-4 inline-flex w-full rounded-2xl border border-cls-line bg-cls-paper p-1 shadow-paper sm:w-auto" role="tablist" aria-label="Vistas del módulo del bot">
        <TabButton id="bot-tab-conversations" controls="bot-panel-conversations" active={tab === "conversations"} icon={MessageCircle} onClick={() => setTab("conversations")}>Conversaciones</TabButton>
        <TabButton id="bot-tab-metrics" controls="bot-panel-metrics" active={tab === "metrics"} icon={BarChart3} onClick={() => setTab("metrics")}>Métricas</TabButton>
      </div>
      <div id="bot-panel-conversations" role="tabpanel" aria-labelledby="bot-tab-conversations" hidden={tab !== "conversations"}><ConversationsView /></div>
      <div id="bot-panel-metrics" role="tabpanel" aria-labelledby="bot-tab-metrics" hidden={tab !== "metrics"}><BotMetrics /></div>
    </AdminPage>
  );
}

function BotStatus() {
  return <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cls-primary/25 bg-cls-sage/45 px-4 text-xs font-black text-cls-primary-dark"><span className="h-2 w-2 rounded-full bg-cls-primary" />Emma activa · 4 canales</div>;
}

function TabButton({ id, controls, active, icon: Icon, onClick, children }: { id: string; controls: string; active: boolean; icon: LucideIcon; onClick: () => void; children: ReactNode }) {
  return <button id={id} type="button" role="tab" aria-controls={controls} aria-selected={active} tabIndex={active ? 0 : -1} onClick={onClick} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition sm:flex-none ${active ? "bg-cls-primary text-cls-paper shadow-sm" : "text-cls-ink/55 hover:bg-cls-cream hover:text-cls-primary-dark"}`}><Icon className="h-4 w-4" />{children}</button>;
}

function ConversationsView() {
  const { triggerAutomation } = useCommerceData();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [selectedId, setSelectedId] = useState(INITIAL_CONVERSATIONS[0].id);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const visible = useMemo(() => conversations.filter((conversation) => {
    const matchesChannel = channel === "all" || conversation.channel === channel;
    const haystack = `${conversation.name} ${conversation.contact} ${conversation.topic} ${conversation.lastMessage}`.toLowerCase();
    return matchesChannel && haystack.includes(query.trim().toLowerCase());
  }), [channel, conversations, query]);
  const selected = visible.find((conversation) => conversation.id === selectedId) ?? visible[0];

  function updateStatus(id: string, status: ConversationStatus) {
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, status } : conversation));
  }

  function intervene() {
    if (!selected) return;
    updateStatus(selected.id, "human");
    void triggerAutomation("conversation.handoff", { conversationId: selected.id, channel: selected.channel, customerName: selected.name, topic: selected.topic });
  }

  function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    const text = reply.trim();
    const time = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    setConversations((current) => current.map((conversation) => conversation.id === selected.id ? { ...conversation, status: "human", lastMessage: text, ago: "ahora", messages: [...conversation.messages, { id: `agent-${Date.now()}`, sender: "agent", text, time }] } : conversation));
    setReply("");
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-[22px] border border-cls-line bg-cls-paper shadow-paper">
      <header className="border-b border-cls-line p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ChannelFilter active={channel === "all"} onClick={() => setChannel("all")} label="Todos" count={conversations.length} />
          {CHANNELS.map((item) => <ChannelFilter key={item.id} active={channel === item.id} onClick={() => setChannel(item.id)} label={item.label} count={conversations.filter((conversation) => conversation.channel === item.id).length} icon={item.icon} />)}
        </div>
      </header>
      <div className="grid min-h-[640px] min-w-0 xl:grid-cols-12">
        <aside className="min-w-0 border-b border-cls-line xl:col-span-4 xl:border-b-0 xl:border-r">
          <div className="border-b border-cls-line p-3">
            <label className="relative block"><span className="sr-only">Buscar contacto o tema</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cls-ink/35" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contacto o tema…" /></label>
          </div>
          {visible.length ? <div className="max-h-[560px] overflow-y-auto">{visible.map((conversation) => <ConversationRow key={conversation.id} conversation={conversation} selected={selected?.id === conversation.id} onClick={() => setSelectedId(conversation.id)} />)}</div> : <EmptyState title="Sin conversaciones" text="No encontramos charlas para ese canal o búsqueda." />}
        </aside>
        {selected ? <ConversationDetail conversation={selected} reply={reply} setReply={setReply} onReply={sendReply} onIntervene={intervene} onRelease={() => updateStatus(selected.id, "active")} /> : <div className="xl:col-span-8"><EmptyState title="Elegí una conversación" text="La charla completa y sus acciones aparecerán acá." /></div>}
      </div>
    </section>
  );
}

function ChannelFilter({ active, onClick, label, count, icon: Icon }: { active: boolean; onClick: () => void; label: string; count: number; icon?: LucideIcon }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-[11px] font-black transition ${active ? "border-cls-primary bg-cls-primary text-cls-paper" : "border-cls-line bg-cls-cream text-cls-ink/60 hover:border-cls-primary"}`}>{Icon ? <Icon className="h-3.5 w-3.5" /> : null}{label} <span className={active ? "text-cls-paper/75" : "text-cls-ink/40"}>({count})</span></button>;
}

function ConversationRow({ conversation, selected, onClick }: { conversation: BotConversation; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-full border-b border-cls-line p-3 text-left transition sm:p-4 ${selected ? "bg-cls-sage/40 shadow-[inset_4px_0_0_#174f3e]" : "hover:bg-cls-cream"}`}>
      <span className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cls-primary-dark text-xs font-black text-cls-paper">{conversation.name.charAt(0)}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-cls-primary-dark">{conversation.name}</strong><small className="shrink-0 text-[9px] text-cls-ink/40">{conversation.ago}</small></span>
          <span className="mt-0.5 block truncate text-[11px] text-cls-ink/60">{conversation.lastMessage}</span>
          <span className="mt-2 flex flex-wrap gap-1"><ConversationStatusBadge status={conversation.status} /><ChannelBadge channel={conversation.channel} compact /><span className="rounded-full bg-cls-cream px-2 py-1 text-[9px] font-bold text-cls-ink/50">{conversation.topic}</span></span>
        </span>
      </span>
    </button>
  );
}

function ConversationDetail({ conversation, reply, setReply, onReply, onIntervene, onRelease }: { conversation: BotConversation; reply: string; setReply: (value: string) => void; onReply: (event: FormEvent) => void; onIntervene: () => void; onRelease: () => void }) {
  return (
    <article className="flex min-h-[640px] min-w-0 flex-col xl:col-span-8">
      <header className="flex flex-col gap-3 border-b border-cls-line p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cls-orange text-sm font-black text-white">{conversation.name.charAt(0)}</span><div className="min-w-0"><h2 className="truncate font-sans text-sm font-black">{conversation.name}</h2><p className="truncate text-[11px] text-cls-ink/50">{conversation.contact}</p></div></div>
        <div className="flex flex-wrap gap-2 sm:ml-auto"><ChannelBadge channel={conversation.channel} /><ConversationStatusBadge status={conversation.status} /></div>
      </header>
      <div className="flex-1 space-y-4 bg-cls-cream/45 p-4 sm:p-5">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-cls-line bg-cls-paper px-3 py-1.5 text-[10px] font-bold text-cls-ink/50"><Bot className="h-3.5 w-3.5 text-cls-primary" />Tema detectado: {conversation.topic}</div>
        {conversation.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
      </div>
      <footer className="border-t border-cls-line bg-cls-paper p-3 sm:p-4">
        {conversation.status === "human" ? <form onSubmit={onReply} className="flex flex-col gap-2 sm:flex-row"><label className="min-w-0 flex-1"><span className="sr-only">Respuesta del agente</span><input className={fieldClass} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Escribí una respuesta como agente…" /></label><button className="btn-secondary shrink-0" disabled={!reply.trim()}><Send className="h-4 w-4" />Responder</button><button type="button" className="btn-outline shrink-0" onClick={onRelease}>Devolver a Emma</button></form> : conversation.status === "resolved" ? <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-cls-sage/35 p-3 text-xs sm:flex-row"><span className="flex items-center gap-2 font-bold text-cls-primary-dark"><CheckCircle2 className="h-4 w-4" />Conversación resuelta</span><button type="button" className="btn-outline min-h-10 px-4 py-1 text-xs" onClick={onIntervene}>Reabrir e intervenir</button></div> : <button type="button" onClick={onIntervene} className="btn-secondary w-full"><Share2 className="h-4 w-4" />Intervenir en esta conversación</button>}
        <p className="mt-2 text-center text-[9px] text-cls-ink/40">Los mensajes externos se habilitan al conectar las credenciales de cada canal.</p>
      </footer>
    </article>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const customer = message.sender === "customer";
  const agent = message.sender === "agent";
  return <div className={`flex ${customer ? "justify-start" : "justify-end"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:max-w-[72%] ${customer ? "rounded-bl-sm bg-cls-orange text-white" : agent ? "rounded-br-sm bg-cls-honey text-cls-primary-dark" : "rounded-br-sm bg-cls-primary-dark text-cls-paper"}`}><span className="mb-1 block text-[9px] font-black uppercase tracking-wider opacity-65">{customer ? "Cliente" : agent ? "Equipo" : "Emma"}</span><p className="whitespace-pre-wrap break-words">{message.text}</p><time className="mt-1 block text-right text-[9px] opacity-55">{message.time}</time></div></div>;
}

function ChannelBadge({ channel, compact = false }: { channel: Channel; compact?: boolean }) {
  const item = CHANNELS.find((candidate) => candidate.id === channel) ?? CHANNELS[3];
  const Icon = item.icon;
  return <span className={`inline-flex items-center gap-1 rounded-full border font-black ${item.badge} ${compact ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]"}`}><Icon className="h-3 w-3" />{item.label}</span>;
}

function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  const content = status === "active" ? "Activa" : status === "human" ? "Con agente" : "Resuelta";
  return <StatusBadge tone={status === "active" ? "good" : status === "human" ? "warn" : "neutral"}>{content}</StatusBadge>;
}

function BotMetrics() {
  const updatedAt = new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short" }).format(new Date());
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-sans text-sm font-black">Panel de control de Emma</h2><p className="mt-1 text-[11px] text-cls-ink/50">Actualizado {updatedAt}</p></div><BotStatus /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Conversaciones hoy" value="86" detail="9% vs. ayer" icon={MessageCircle} positive />
        <MetricCard label="Tasa de resolución" value="84%" detail="2% vs. ayer" icon={CheckCircle2} positive />
        <MetricCard label="Tiempo promedio" value="1,8 min" detail="6% vs. ayer" icon={Clock3} />
        <MetricCard label="Contactos nuevos" value="17" detail="11% vs. ayer" icon={UserRoundPlus} positive />
        <MetricCard label="Derivados a persona" value="12" detail="3% vs. ayer" icon={Share2} positive />
        <MetricCard label="Ventas cerradas" value="5" detail="0% vs. ayer" icon={DollarSign} positive />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper sm:p-5"><h2 className="font-sans text-sm font-black">Actividad del día</h2><p className="mt-1 text-[11px] text-cls-ink/50">Conversaciones iniciadas por franja horaria</p><ActivityChart /></section>
        <section className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper sm:p-5"><h2 className="font-sans text-sm font-black">Temas más consultados</h2><p className="mt-1 text-[11px] text-cls-ink/50">Clasificación automática de las últimas conversaciones</p><div className="mt-6 space-y-3">{TOPICS.map((topic) => <div key={topic.label} className="flex items-center gap-2 text-[10px]"><strong className="w-[88px] shrink-0 truncate text-right text-cls-primary-dark sm:w-[125px]">{topic.label}</strong><div className="h-5 min-w-0 flex-1 overflow-hidden rounded-r-full bg-cls-cream"><div className={`h-full rounded-r-full ${topic.color}`} style={{ width: `${Math.max(8, topic.value / 50 * 100)}%` }} /></div><span className="w-6 shrink-0 font-black text-cls-ink/45 sm:w-8">{topic.value}</span></div>)}</div></section>
      </div>
      <section className="rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper sm:p-5"><div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-sans text-sm font-black">Rendimiento por canal</h2><p className="mt-1 text-[11px] text-cls-ink/50">Distribución de la bandeja importada</p></div><span className="text-[10px] font-black uppercase tracking-widest text-cls-primary">Un cerebro · cuatro entradas</span></div><div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{CHANNELS.map((channel) => { const count = INITIAL_CONVERSATIONS.filter((conversation) => conversation.channel === channel.id).length; const resolved = INITIAL_CONVERSATIONS.filter((conversation) => conversation.channel === channel.id && conversation.status === "resolved").length; return <article key={channel.id} className="rounded-xl border border-cls-line bg-cls-cream p-3"><ChannelBadge channel={channel.id} /><p className="mt-3 text-2xl font-black text-cls-primary-dark">{count}</p><p className="text-[10px] text-cls-ink/50">conversaciones visibles · {resolved} resueltas</p></article>; })}</div></section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, positive = false }: { label: string; value: string; detail: string; icon: LucideIcon; positive?: boolean }) {
  const TrendIcon = positive ? TrendingUp : TrendingDown;
  return <article className="min-w-0 rounded-2xl border border-cls-line bg-cls-paper p-4 shadow-paper"><div className="flex items-start justify-between gap-2"><p className="max-w-[9rem] text-[10px] font-black uppercase tracking-[0.12em] text-cls-ink/55">{label}</p><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cls-sage/55 text-cls-primary"><Icon className="h-4 w-4" /></span></div><p className="mt-4 truncate text-2xl font-black text-cls-primary-dark sm:text-3xl">{value}</p><p className={`mt-1 flex items-center gap-1 text-[10px] font-black ${positive ? "text-cls-primary" : "text-cls-orange"}`}><TrendIcon className="h-3.5 w-3.5" />{detail}</p></article>;
}

function ActivityChart() {
  const width = 600;
  const height = 220;
  const left = 38;
  const top = 20;
  const plotWidth = 540;
  const plotHeight = 160;
  const points = ACTIVITY.map((value, index) => `${left + index * plotWidth / (ACTIVITY.length - 1)},${top + plotHeight - value / 20 * plotHeight}`).join(" ");
  const area = `${left},${top + plotHeight} ${points} ${left + plotWidth},${top + plotHeight}`;
  return (
    <svg className="mt-4 h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="bot-activity-title bot-activity-desc">
      <title id="bot-activity-title">Actividad del bot durante el día</title><desc id="bot-activity-desc">La actividad alcanza su máximo a las dieciséis horas con veinte conversaciones.</desc>
      {[0, 5, 10, 15, 20].map((tick) => { const y = top + plotHeight - tick / 20 * plotHeight; return <g key={tick}><line x1={left} x2={left + plotWidth} y1={y} y2={y} stroke="#ded3bc" strokeDasharray="4 6" /><text x={left - 10} y={y + 4} textAnchor="end" fill="#718378" fontSize="10">{tick}</text></g>; })}
      <polygon points={area} fill="#bcd8bd" opacity="0.38" />
      <polyline points={points} fill="none" stroke="#e8753d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {ACTIVITY.map((value, index) => <circle key={HOURS[index]} cx={left + index * plotWidth / (ACTIVITY.length - 1)} cy={top + plotHeight - value / 20 * plotHeight} r="4" fill="#fff9ec" stroke="#174f3e" strokeWidth="2" />)}
      {HOURS.map((hour, index) => <text key={hour} x={left + index * plotWidth / (HOURS.length - 1)} y={205} textAnchor="middle" fill="#536c61" fontSize="10">{hour}h</text>)}
    </svg>
  );
}
