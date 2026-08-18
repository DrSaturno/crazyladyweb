// ── El diario íntimo de Crazy Lady — blog y notas de asesoramiento ──────────
// Dos tipos de contenido en una sola tabla, como en imperioverde:
//   · `guia`     → nota de blog / cultivo
//   · `problema` → nota «problema → causa → producto recomendado», con
//                  botón de agregar al carrito desde la propia nota.
// Textos de muestra escritos con la voz que definió Eliana (tutea, cercano, con
// humor, sin solemnidad). Antes de publicar los tiene que aprobar el cliente.
// Palabras vetadas por el cliente: flor, hash, edibles, vapers.

export type TipoNota = "guia" | "problema";

export interface Nota {
  slug: string;
  tipo: TipoNota;
  titulo: string;
  bajada: string;
  fecha: string;
  minutos: number;
  emoji: string;
  /** Solo en tipo `problema` */
  causa?: string;
  /** slug de un producto del catálogo, para el bloque de recomendación */
  productoRecomendado?: string;
  cuerpo: string[];
}

export const NOTAS: Nota[] = [
  {
    slug: "primer-cultivo-por-donde-arrancar",
    tipo: "guia",
    titulo: "Tu primer cultivo: por dónde arrancar sin marearte",
    bajada: "Tres decisiones que definen todo el resto. Si resolvés estas, el 80% del camino ya está.",
    fecha: "12 de agosto de 2026",
    minutos: 6,
    emoji: "🌱",
    cuerpo: [
      "Cuando alguien nos escribe diciendo «quiero empezar pero no sé nada», siempre arrancamos por lo mismo: tres preguntas. Interior o exterior, cuánto espacio tenés, y qué buscás del cultivo. Todo lo demás sale de ahí.",
      "**Interior o exterior.** En exterior el sol hace la mitad del trabajo y no gastás en luminaria, pero dependés de la temporada. En interior manejás vos todas las variables — y también todos los errores. Si es tu primera vez y tenés patio o balcón con buen sol, exterior es más perdonador.",
      "**El espacio manda sobre la genética.** No al revés. Si tenés un placard de 80cm, una fotoperiódica que estira un metro y medio te va a quedar contra el techo. Ahí conviene una automática, que se queda más compacta y termina su ciclo sola en 70-90 días.",
      "**Automática o fotoperiódica.** La automática florece sola con el tiempo, no depende de las horas de luz. Es más corta, más rápida y te perdona más. La fotoperiódica te da más rendimiento y más control, pero te pide entender el cambio de 18/6 a 12/12.",
      "Para un primer cultivo casi siempre recomendamos una automática de las nuestras: son de producción propia, salen más baratas, y si algo sale mal no perdiste una fortuna aprendiendo.",
    ],
  },
  {
    slug: "hojas-amarillas-que-significa",
    tipo: "problema",
    titulo: "Se me están poniendo amarillas las hojas",
    bajada: "El síntoma más común y el más malinterpretado. No siempre es falta de nutrientes.",
    fecha: "8 de agosto de 2026",
    minutos: 4,
    emoji: "🍂",
    causa: "En la mayoría de los casos es exceso de riego o un pH fuera de rango bloqueando la absorción — no falta de nutrientes. Abonar más suele empeorarlo.",
    productoRecomendado: "seda-cbd-x3-chita-seeds",
    cuerpo: [
      "Primero: ¿qué hojas? Si son **las de abajo y estás en floración**, es normal. La planta está moviendo nutrientes hacia los cogollos y sacrifica las hojas viejas. No hagas nada.",
      "Si es **generalizado y temprano en el cultivo**, ahí sí hay algo que corregir. Y el error más común es asumir que falta comida y empezar a abonar. Nueve de cada diez veces el problema es otro.",
      "**Revisá el riego antes que nada.** Raíz ahogada da síntomas casi idénticos a falta de nitrógeno: hoja amarilla, planta caída, crecimiento frenado. Meté el dedo dos o tres centímetros en el sustrato. Si está húmedo, no riegues.",
      "**Después revisá el pH del agua.** En tierra querés algo entre 6.0 y 6.5. Fuera de ese rango la planta no puede absorber lo que tiene disponible, aunque el sustrato esté lleno de nutrientes. Es el clásico «le doy de todo y no reacciona».",
      "Recién si el riego y el pH están bien, ahí sí mirá los nutrientes. Y si tu tierra es de vivero, probablemente ya venga con carga para las primeras 3 o 4 semanas.",
    ],
  },
  {
    slug: "automaticas-vs-fotoperiodicas",
    tipo: "guia",
    titulo: "Automáticas vs fotoperiódicas: cuál te conviene de verdad",
    bajada: "No hay una mejor. Hay una que se lleva mejor con tu espacio, tu tiempo y tu paciencia.",
    fecha: "3 de agosto de 2026",
    minutos: 5,
    emoji: "⏱️",
    cuerpo: [
      "La diferencia técnica es simple: la automática florece por edad, la fotoperiódica florece por horas de luz. Lo interesante es lo que eso implica en la práctica.",
      "**La automática es un reloj.** Arranca y termina en 70-90 días, pase lo que pase. No le podés extender el vegetativo para que crezca más, ni recuperarla si la estresás mucho en las primeras semanas. A cambio: es corta, discreta, y podés largarla en cualquier época del año.",
      "**La fotoperiódica es un instrumento.** Vos decidís cuándo pasa a floración, así que podés dejarla vegetar hasta el tamaño que quieras. Rinde más y te deja hacer podas y técnicas de formación con margen para que se recupere. Pero te exige entender el ciclo de luz.",
      "**Para interior chico:** automática. **Para exterior con temporada completa:** fotoperiódica. **Para primera vez:** automática, casi siempre.",
      "Un detalle que a veces se pasa por alto: con automáticas podés hacer varias tandas por año. Con fotoperiódicas en exterior tenés una sola oportunidad por temporada, y si algo sale mal esperás hasta el año que viene.",
    ],
  },
  {
    slug: "bichos-en-el-cultivo",
    tipo: "problema",
    titulo: "Tengo bichos y no sé qué son",
    bajada: "Cómo identificar las tres plagas más comunes antes de tirarle cualquier cosa encima.",
    fecha: "28 de julio de 2026",
    minutos: 5,
    emoji: "🐛",
    causa: "Araña roja, pulgón o mosquita del sustrato. Cada una se trata distinto, y usar el producto equivocado te hace perder tiempo mientras la plaga avanza.",
    cuerpo: [
      "Antes de comprar nada: **mirá bajo las hojas.** Ahí es donde vive casi todo.",
      "**Telarañitas finas y puntitos que se mueven** → araña roja. Aparece con calor y aire seco. Subir la humedad ya la frena bastante, porque odia el ambiente húmedo.",
      "**Bichitos verdes o negros amontonados en los brotes nuevos** → pulgón. Se ve a simple vista y suele venir en colonia.",
      "**Mosquitas chiquitas volando desde la tierra** → mosquita del sustrato. Casi siempre es señal de que estás regando de más: ponen huevos en tierra permanentemente húmeda.",
      "Esa última es la más fácil de resolver y la que más se confunde con «tengo plaga». Dejá secar bien el sustrato entre riegos y en dos semanas desaparecen solas.",
      "Si no estás seguro de lo que ves, escribinos con una foto. Es mucho más rápido diagnosticar mirando que describiendo.",
    ],
  },
  {
    slug: "que-es-el-inase-y-por-que-importa",
    tipo: "guia",
    titulo: "Qué es el INASE y por qué te conviene que tu semilla esté registrada",
    bajada: "Trazabilidad, respaldo legal y por qué no todas las semillas que se consiguen son iguales.",
    fecha: "22 de julio de 2026",
    minutos: 4,
    emoji: "📋",
    cuerpo: [
      "El INASE es el Instituto Nacional de Semillas, el organismo que registra y fiscaliza las semillas en Argentina. Que un banco esté inscripto ahí significa que sus genéticas están declaradas y son trazables.",
      "**¿Por qué te importa a vos como cultivador?** Porque sabés qué estás plantando. Una genética registrada tiene un obtentor identificable, características declaradas y consistencia entre lotes. No es «me dijeron que era tal cosa».",
      "En Crazy Lady Seeds trabajamos bajo las normativas de la ley 23750 y 27669, con licencias de INASE y ARICCAME vigentes para la distribución, comercialización y producción de semillas y esquejes de cannabis medicinal.",
      "En la tienda vas a ver el sello INASE en las fichas de los bancos registrados. Es información, no marketing: te sirve para decidir con qué trabajás.",
    ],
  },
  {
    slug: "cuando-cosechar",
    tipo: "guia",
    titulo: "Cómo saber cuándo cosechar (y por qué casi todos se apuran)",
    bajada: "Mirar el calendario es el peor método. Te contamos qué mirar en su lugar.",
    fecha: "15 de julio de 2026",
    minutos: 5,
    emoji: "✂️",
    cuerpo: [
      "El error clásico del primer cultivo es cosechar antes de tiempo, porque visualmente ya «parece listo» dos o tres semanas antes de estarlo.",
      "**El calendario es una referencia, no una regla.** Que el banco diga 75 días no significa que tu planta esté lista a los 75. Depende de la luz, la temperatura y de cómo la llevaste.",
      "**Mirá los pistilos primero.** Cuando la mayoría pasó de blancos y erguidos a anaranjados y curvados hacia adentro, estás cerca. No listo: cerca.",
      "**Y después mirá los tricomas**, que es el método real. Con una lupa de 60x (sale muy poco) vas a ver esas glándulas chiquitas. Transparentes: falta. Lechosas: punto óptimo. Ámbar: efecto más corporal y sedante.",
      "La proporción entre lechosas y ámbar define bastante el efecto final. Si buscás algo más activo, cosechás con mayoría lechosa. Si buscás algo más relajante, dejás que suba el ámbar.",
      "Y después viene el secado, que merece su propia nota — porque se puede arruinar un cultivo entero en esa última semana.",
    ],
  },
];

export function getNota(slug: string) {
  return NOTAS.find((n) => n.slug === slug);
}
