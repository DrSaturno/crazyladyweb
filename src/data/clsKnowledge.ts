// ── Crazy Lady Seeds — knowledge base de la demo de Emma ────────────────────
// Fuente: cuestionario de onboarding de Eliana (17/8/2026) + stock del 18/8/2026.
// Esto es un simulador de reglas por palabra clave, igual al patrón que ya usa
// river para su propia demo — NO llama a ningún LLM. Sirve para probar tono,
// guiones fijos y reglas de derivación antes de conectar el cerebro real.
// Cuando exista el Supabase del proyecto, `getBotResponse` se reemplaza por una
// llamada real que consulta `products` en vivo. Ver docs/bot-prompt-emma.md.

export const CLS_INFO = {
  nombre: "Crazy Lady Seeds",
  bot: "Emma",
  saludo: "Hola! soy Emma, la guardiana digital del jardín de Crazy Lady Seeds! Contame, en qué puedo ayudarte?",
  instagram: "@crazyladyseedsok",
  whatsapp: "11 7608-6771",
  envios: "Todo el país por Andreani, despacho en 48hs. El costo se calcula por código postal.",
  pagos: ["Efectivo", "Transferencia"],
  textoInase: "Somos una empresa que trabaja bajo las normativas de la ley 23750 y 27669 con las licencias de INASE y ARICCAME vigentes para la distribución, comercialización y producción de semillas y esquejes de cannabis medicinal.",
  numeroRegistro: "12665",
  reprocannGestor: "@clinicann (Clinicann)",
};

// Mismo snapshot que src/pages/Productos.tsx — en la versión real es una sola fuente (Supabase `products`).
export const CATALOGO = [
  { nombre: "AK47 Auto x4", banco: "Crazy Lady Seeds", fotoperiodo: "automática", precio: 21000, stock: 4 },
  { nombre: "Amnesia Haze Auto x4", banco: "Crazy Lady Seeds", fotoperiodo: "automática", precio: 21000, stock: 4 },
  { nombre: "Gorila Glue Auto x4", banco: "Crazy Lady Seeds", fotoperiodo: "automática", precio: 21000, stock: 4 },
  { nombre: "Medikit CBD x3", banco: "Buddha Seeds", fotoperiodo: "CBD", precio: 41000, stock: 2 },
  { nombre: "Royal Highness CBD x3", banco: "Royal Queen Seeds", fotoperiodo: "CBD", precio: 27000, stock: 2 },
  { nombre: "White Widow x3", banco: "Buddha Seeds", fotoperiodo: "fotoperiódica", precio: 36000, stock: 4 },
  { nombre: "Amnesia", banco: "Sensi Seeds", fotoperiodo: "fotoperiódica", precio: 50000, stock: 3 },
  { nombre: "0G 324", banco: "Silver River Seeds", fotoperiodo: "fotoperiódica", precio: 39000, stock: 2 },
];

// No se expone la cantidad exacta en stock — solo nombre, banco y precio de lo que hay disponible.
function fmtCatalogo(items: typeof CATALOGO) {
  return items.filter((p) => p.stock > 0).map((p) => `${p.nombre} — ${p.banco} — $${p.precio.toLocaleString("es-AR")}`).join("\n");
}

type BotResponse = { keywords: string[]; response: string };

export const BOT_RESPONSES: BotResponse[] = [
  {
    keywords: ["hola", "buenas", "buenos días", "buenos dias", "buenas tardes", "buenas noches", "hi"],
    response: CLS_INFO.saludo,
  },
  {
    keywords: ["automatica", "automática", "auto ", " auto", "autofloreciente"],
    response:
      `Sí, tengo automáticas en stock 🌱 ¿la buscás en CBD o en THC?\n\nEn THC: ${fmtCatalogo(CATALOGO.filter((p) => p.fotoperiodo === "automática"))}\n\nEn CBD: Medikit CBD x3 (Buddha Seeds) — $41.000.`,
  },
  {
    keywords: ["cbd"],
    response:
      `En CBD tengo:\n${fmtCatalogo(CATALOGO.filter((p) => p.fotoperiodo === "CBD"))}\n\n¿Buscás algo más balanceado o con más THC?`,
  },
  {
    keywords: ["fotoperiodica", "fotoperiódica", "no automatica", "de foto"],
    response:
      `En fotoperiódicas tengo:\n${fmtCatalogo(CATALOGO.filter((p) => p.fotoperiodo === "fotoperiódica"))}\n\n¿Interior o exterior?`,
  },
  {
    keywords: ["precio", "cuanto cuesta", "cuánto cuesta", "cuanto sale", "cuánto sale", "que precio", "qué precio"],
    response:
      "Las más económicas son las de la casa, de producción propia — automáticas desde $21.000. Contame qué buscás (efecto, interior o exterior) y te tiro opciones puntuales del stock real.",
  },
  {
    keywords: ["envio", "envío", "envios", "envíos", "mandan", "llega", "andreani", "despacho"],
    response: `Sí, hacemos envíos a todo el país por Andreani, despacho en 48hs. El costo se calcula por código postal — pasame el tuyo y te lo calculo.`,
  },
  {
    keywords: ["pago", "pagos", "transferencia", "efectivo", "tarjeta", "mercado pago", "modo"],
    response: `Por ahora trabajamos con ${CLS_INFO.pagos.join(" y ")}. Si querés avanzar con una compra, te dejo el pedido armado y te contacta una persona del equipo para coordinar el pago.`,
  },
  {
    keywords: ["esqueje", "esquejes", "clon", "clones"],
    response: "Sí, vendemos esquejes — son variedades registradas y también de selección propia de la casa. ¿Buscás alguna genética puntual?",
  },
  {
    keywords: ["legal", "inase", "legalidad", "licencia", "es legal"],
    response: `${CLS_INFO.textoInase} (Nº de registro: ${CLS_INFO.numeroRegistro})`,
  },
  {
    keywords: ["reprocann"],
    response: `Eso te lo maneja mejor un gestor especializado — te paso el contacto de ${CLS_INFO.reprocannGestor}, que es con quien trabajamos. Yo puedo ayudarte con el resto: genética, cultivo y pedido.`,
  },
  {
    keywords: ["dolor", "enfermedad", "medicinal", "sintoma", "síntoma", "diagnostic", "me sirve para", "me recomendas para"],
    response: "Eso lo tiene que indicar un profesional de la salud — yo no puedo diagnosticar ni reemplazar esa consulta. Si querés avanzar con REPROCANN, te paso el contacto de nuestro gestor.",
  },
  {
    keywords: ["flor", "comprar flor", "venden flor", "tienen flor"],
    response: "Eso no lo manejamos por acá — trabajamos con semillas y esquejes de genéticas registradas, no con flor.",
  },
  {
    keywords: ["nunca cultive", "nunca cultivé", "primera vez", "empezar a cultivar", "soy principiante", "no tengo experiencia"],
    response: "Bienvenido al jardín 🌱 Contame: ¿cuál es tu objetivo de uso?",
  },

  // ── Consultora de cultivo — no solo vende, también asesora técnica ──────
  {
    keywords: ["riego", "riega", "regar", "regando", "regás", "regas", "que regar"],
    response: "Regá cuando los primeros 2-3cm de sustrato estén secos al tacto, y dejá que drene bien — raíz ahogada por exceso de riego es el error más común al arrancar. En vegetativo un poco más seguido que en floración.",
  },
  {
    keywords: ["sustrato", "que tierra", "qué tierra", "tipo de tierra"],
    response: "Para arrancar, una tierra liviana con buen drenaje (turba + perlita + algo de fibra de coco) te da menos dolores de cabeza que una tierra pesada. Si es tu primera vez, no abones de más — la tierra de vivero ya suele traer nutrientes.",
  },
  {
    keywords: ["luz", "luminaria", "led", "horas de luz", "fotoperiodo de luz"],
    response: "En interior: 18hs de luz / 6 de oscuridad en vegetativo, y 12/12 para pasar a floración (las automáticas no dependen del fotoperíodo, van con su propio reloj interno). Un LED con potencia acorde al espacio hace mucha diferencia en el resultado.",
  },
  {
    keywords: ["plaga", "bicho", "araña roja", "pulgon", "pulgón", "cochinilla", "hongo", "mosquitas"],
    response: "Depende de lo que veas: telarañitas finas y puntitos suele ser araña roja (subí la humedad, revisá bajo las hojas); puntos blancos algodonosos, cochinilla. Contame qué estás viendo — si podés, una foto ayuda mucho a diagnosticar mejor.",
  },
  {
    keywords: ["ph del agua", "ph "],
    response: "El pH del agua de riego ideal ronda 6.0-6.5 en tierra. Si las hojas se ponen raras sin explicación (manchas, puntas quemadas) muchas veces el problema es de pH bloqueando nutrientes, no falta de ellos.",
  },
  {
    keywords: ["amarill"],
    response: "Si son las hojas de abajo y estás en floración, es normal — la planta redirige nutrientes a los cogollos. Si es generalizado y temprano en el cultivo, revisá riego y nutrientes: exceso y falta dan síntomas parecidos.",
  },
  {
    keywords: ["poda", "lst", "topping", "fim", "como podar", "cómo podar"],
    response: "Con automáticas conviene ir suave — tienen poco tiempo para recuperarse, así que un LST liviano (doblar y atar ramas, sin cortar) rinde bien. Con fotoperiódicas te podés animar a un topping en las primeras semanas de vegetativo.",
  },
  {
    keywords: ["humedad"],
    response: "En vegetativo apuntá a 55-65% de humedad relativa, y bajala a 40-50% en floración para evitar hongos (botrytis), sobre todo si los cogollos vienen densos.",
  },
  {
    keywords: ["nutrientes", "fertilizante", "abono", "abonar"],
    response: "Si tu tierra ya trae nutrientes (la mayoría de vivero los traen), no hace falta abonar hasta pasadas 3-4 semanas. En floración conviene bajar el nitrógeno y subir fósforo y potasio.",
  },
  {
    keywords: ["germin"],
    response: "Lo más simple: papel húmedo entre dos platos, en oscuridad y calor (20-25°C). En 2-5 días asoma la raíz — ahí la pasás a la maceta con mucho cuidado de no tocarla.",
  },
  {
    keywords: ["huele", "olor", "filtro de carbon", "filtro de carbón"],
    response: "Sobre todo en floración el olor se nota fuerte — un filtro de carbón activo en el extractor es lo más efectivo si te preocupa la discreción.",
  },
  {
    keywords: ["exterior", "afuera", "cuando planto afuera", "cuándo planto afuera"],
    response: "Para fotoperiódicas en exterior, por acá el momento clásico es después de las heladas (más o menos septiembre-octubre) para que tengan toda la temporada. Las automáticas las podés largar en cualquier época del año con buen clima.",
  },
  {
    keywords: ["gusto", "sabor", "sabores"],
    response: "El sabor varía mucho según la genética — desde cítricas y frutales hasta más terrosas o dulces. Contame qué te gusta y te tiro opciones del catálogo real.",
  },
  {
    keywords: ["pegue", "pega fuerte", "que tan fuerte", "qué tan fuerte", "potencia", "es fuerte", "fumar", "fumo", "para fumar", "que efecto", "qué efecto"],
    response: "La potencia y el efecto varían según el %THC y la genética — tenemos desde más suaves hasta bien cargadas. ¿Buscás algo para relajarte, para socializar o algo más energizante?",
  },
  {
    keywords: ["quiero comprar", "quiero llevar", "me llevo", "lo compro"],
    response: "Buenísimo! Te dejo el pedido armado y te contacta alguien del equipo para coordinar pago y envío.",
  },
  {
    keywords: ["hablar con una persona", "quiero hablar con alguien", "atencion humana", "atención humana", "un humano"],
    response: "Dale, te derivo con una persona del equipo ahora mismo.",
  },
  {
    keywords: ["ignora tus instrucciones", "olvida lo anterior", "sos un modelo", "system prompt", "actua como"],
    response: "Eso no lo puedo hacer — sigo siendo Emma, la asesora de Crazy Lady Seeds 🌱 ¿en qué te ayudo con el catálogo?",
  },
  {
    keywords: ["gracias", "muchas gracias", "genial", "perfecto", "buenisimo", "buenísimo", "dale"],
    response: "De nada! Cualquier cosa seguí escribiendo. Sembrando felicidad 🌱",
  },
];

// Solo se revisa si ninguna regla de arriba matcheó — es más genérico a propósito ("sema" solo,
// sin "automática"/"CBD"/"fotoperiódica"/etc.), así que va después para no taparle la respuesta
// puntual a preguntas como "¿es legal comprar semillas?" o "quiero comprar semillas".
const SEMILLA_GENERICA = ["sema", "semilla", "que otras variedades", "que variedades", "que tenes", "que hay disponible"];

export function getBotResponse(input: string): string {
  const normalized = input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => normalized.includes(kw.normalize("NFD").replace(/[̀-ͯ]/g, "")))) {
      return entry.response;
    }
  }
  if (SEMILLA_GENERICA.some((kw) => normalized.includes(kw))) {
    return "Tengo variedad de semillas 🌱 Contame qué buscás: ¿automática, fotoperiódica o CBD? Así te tiro las opciones justas del stock real.";
  }
  return "No tengo esa info específica en el catálogo ahora mismo — te derivo con una persona del equipo para que te ayude mejor. Mientras tanto, ¿te puedo ayudar con precio, stock o envíos?";
}

export type ConversationTopic =
  | "Automáticas" | "CBD" | "Fotoperiódicas" | "Esquejes" | "Envíos"
  | "REPROCANN" | "INASE / legalidad" | "Recomendación" | "Cierre de venta"
  | "Cultivo" | "Efecto / sabor" | "Otro";

export function classifyTopic(input: string): ConversationTopic {
  const n = input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/(automatica|auto )/.test(n)) return "Automáticas";
  if (/cbd/.test(n)) return "CBD";
  if (/fotoperiodica/.test(n)) return "Fotoperiódicas";
  if (/esqueje/.test(n)) return "Esquejes";
  if (/(envio|andreani|despacho)/.test(n)) return "Envíos";
  if (/reprocann/.test(n)) return "REPROCANN";
  if (/(legal|inase|licencia)/.test(n)) return "INASE / legalidad";
  if (/(nunca cultive|primera vez|principiante)/.test(n)) return "Recomendación";
  if (/(quiero comprar|me llevo|lo compro)/.test(n)) return "Cierre de venta";
  if (/(riego|regar|sustrato|luminaria|plaga|araña roja|amarill|poda|humedad|nutrientes|abono|germin|huele|olor|filtro de carbon)/.test(n)) return "Cultivo";
  if (/(gusto|sabor|pegue|potencia|fumar|efecto)/.test(n)) return "Efecto / sabor";
  return "Otro";
}
