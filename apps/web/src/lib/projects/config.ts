export interface ProjectConfig {
  id: string;
  name: string;
  url: string;
  niche: string;
  description: string;
  audience: string;
  tone: string;
  voice: string;
  cta: string[];
  hashtags: string[];
  contentRules: string[];
  videoTopics: string[];
  contact: { whatsapp: string; email: string };
}

export const PROJECTS: Record<string, ProjectConfig> = {
  'trabajocerca.site': {
    id: 'trabajocerca.site',
    name: 'TrabajaCerca',
    url: 'https://trabajocerca.site',
    niche: 'empleo',
    description: 'Plataforma de empleo cercano y oficios por zona en Argentina. Conecta personas que buscan trabajo con empleadores y clientes locales.',
    audience: 'Personas que buscan trabajo, empleadores pymes, trabajadores de oficios (plomeros, electricistas, gasistas, albañiles, etc.)',
    tone: 'cercano, directo, esperanzador, práctico',
    voice: 'amigable y motivacional, como un amigo que te ayuda a conseguir trabajo',
    cta: ['Publicá tu aviso gratis', 'Buscá trabajo cerca tuyo', 'Encontrá un oficio en tu zona', 'Registrate y empezá hoy'],
    hashtags: ['#trabajocerca', '#empleo', '#trabajo', '#ofertalaboral', '#oficios', '#argentina', '#empleoargentina', '#busquedatrabajo'],
    contentRules: [
      'No inventar salarios ni condiciones laborales',
      'No prometer trabajo garantizado',
      'Enfocarse en la cercanía y facilidad de uso',
      'Respetar todas las profesiones por igual',
    ],
    videoTopics: [
      'Cómo encontrar trabajo cerca de tu casa',
      'Los oficios más buscados en Argentina',
      'Cómo publicar tu aviso laboral gratis',
      'Consejos para tu CV',
      'Trabajos part-time en tu zona',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'madsjeez.com.ar': {
    id: 'madsjeez.com.ar',
    name: 'MadsJeez Marketplace',
    url: 'https://madsjeez.com.ar',
    niche: 'marketplace',
    description: 'Marketplace argentino para comprar y vender. Plataforma para vendedores, emprendedores y compradores en Argentina.',
    audience: 'Emprendedores, comercios, vendedores individuales, compradores que quieren encontrar productos locales',
    tone: 'emprendedor, confiante, argentino, dinámico',
    voice: 'energético y motivador como emprendedor exitoso',
    cta: ['Publicá y vendé hoy', 'Empezá a vender gratis', 'Encontrá lo que buscás', 'Unite a MadsJeez', 'Hacete vendedor'],
    hashtags: ['#madsjeez', '#marketplace', '#argentina', '#emprendedor', '#vender', '#negocio', '#ecommerce', '#emprendimiento'],
    contentRules: [
      'No inventar precios ni descuentos',
      'No garantizar ventas mínimas',
      'Enfocarse en la facilidad para empezar a vender',
      'Destacar la comunidad argentina',
    ],
    videoTopics: [
      'Por qué vender en MadsJeez',
      'Cómo crear tu tienda en minutos',
      'Historias de vendedores exitosos',
      'Cómo captar más compradores',
      'El marketplace argentino que crece',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'mellimelos.site': {
    id: 'mellimelos.site',
    name: 'Mellimelos',
    url: 'https://mellimelos.site',
    niche: 'moda bebés',
    description: 'Tienda online de ropa para bebés. Prendas de calidad, diseños adorables, perfectas para regalar o vestir a tu bebé.',
    audience: 'Mamás, papás, futuros padres, abuelas, personas que quieren regalar',
    tone: 'tierno, cálido, amoroso, confiable',
    voice: 'como una mamá que recomienda con amor y experiencia',
    cta: ['Vestí a tu bebé con amor', 'Regalá ternura', 'Shoppeá ahora', 'Ver colección', 'El regalo perfecto para bebés'],
    hashtags: ['#mellimelos', '#ropabebe', '#bebe', '#regalobebe', '#mama', '#babababy', '#embarazo', '#modainfantil'],
    contentRules: [
      'No prometer tallas exactas sin tabla de medidas',
      'No inventar materiales sin confirmar',
      'Enfocarse en ternura, calidad y amor',
      'Contenido familiar seguro',
    ],
    videoTopics: [
      'Las prendas más lindas para bebés',
      'El regalo perfecto para baby shower',
      'Cómo vestir a tu recién nacido',
      'Colección de verano/invierno para bebés',
      'Por qué la calidad importa en ropa de bebé',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'bravura.site': {
    id: 'bravura.site',
    name: 'Bravura Empanadas',
    url: 'https://bravura.site',
    niche: 'gastronomía',
    description: 'Venta de empanadas artesanales. Sabor casero, ingredientes frescos, pedidos anticipados para reuniones, eventos y consumo diario.',
    audience: 'Familias, grupos de amigos, personas que buscan comida casera y rica, organizadores de eventos',
    tone: 'cálido, familiar, sabroso, argentino auténtico',
    voice: 'como una abuela que cocina con amor y orgullo',
    cta: ['Pedí tus empanadas', 'Encargá para tu reunión', 'Sabor casero garantizado', 'Pedido anticipado', 'Probá las mejores empanadas'],
    hashtags: ['#bravura', '#empanadas', '#empanadascaseras', '#argentina', '#comidacasera', '#empanadasartesanales', '#reunion', '#foodargentina'],
    contentRules: [
      'No inventar precios ni combos sin confirmar',
      'No prometer entregas a domicilio si no está confirmado',
      'Enfocarse en sabor casero y calidad',
      'No exagerar con claims de "las mejores del mundo"',
    ],
    videoTopics: [
      'Las empanadas que te van a conquistar',
      'Por qué Bravura tiene el mejor sabor casero',
      'Pedí para tu próxima reunión',
      'El secreto de nuestras empanadas artesanales',
      'Cuántas empanadas necesito para mi evento',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'appjeezpro.com': {
    id: 'appjeezpro.com',
    name: 'AppJeez Pro',
    url: 'https://appjeezpro.com',
    niche: 'SaaS / Mercado Libre',
    description: 'App para vendedores de Mercado Libre. Gestión de ventas, automatización, organización y mejora de rendimiento para sellers online.',
    audience: 'Vendedores de Mercado Libre, emprendedores de e-commerce, tiendas que quieren escalar',
    tone: 'profesional, eficiente, orientado a resultados',
    voice: 'como un mentor de e-commerce que conoce todos los secretos de MercadoLibre',
    cta: ['Probá AppJeez Pro', 'Gestioná tus ventas mejor', 'Automatizá tu tienda', 'Crecer con AppJeez', 'Descargá la app'],
    hashtags: ['#appjeezpro', '#mercadolibre', '#vendedores', '#ecommerce', '#seller', '#ventas', '#automatizacion', '#emprendedor'],
    contentRules: [
      'No prometer ingresos específicos',
      'No garantizar posicionamiento en MercadoLibre',
      'Enfocarse en ahorro de tiempo y organización',
      'No inventar features que no existen',
    ],
    videoTopics: [
      'Cómo organizar tus ventas en MercadoLibre',
      'Errores comunes de los vendedores online',
      'Automatizá tu tienda y ahorrá tiempo',
      'Por qué los mejores sellers usan AppJeez Pro',
      'Gestión de stock simplificada',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'materianatural.site': {
    id: 'materianatural.site',
    name: 'Materia Natural',
    url: 'https://materianatural.site',
    niche: 'salud natural / dietética',
    description: 'Sitio informativo sobre productos naturales, dietética y medicina alternativa. Solo contenido educativo, sin diagnósticos ni promesas médicas.',
    audience: 'Personas interesadas en salud natural, bienestar, hábitos saludables, medicina alternativa',
    tone: 'informativo, natural, equilibrado, empático',
    voice: 'como un educador de salud que informa sin diagnosticar',
    cta: ['Descubrí más', 'Leé la guía completa', 'Explorar recetas naturales', 'Ver propiedades', 'Más info aquí'],
    hashtags: ['#materianatural', '#saludnatural', '#bienestars', '#natural', '#dietética', '#plantasmedicinales', '#holistico', '#vidasana'],
    contentRules: [
      'NUNCA decir que cura enfermedades',
      'NUNCA diagnosticar condiciones médicas',
      'NUNCA recomendar reemplazar tratamientos médicos',
      'SIEMPRE agregar "consultar con profesional de salud"',
      'SOLO hablar de usos tradicionales o propiedades generalmente reconocidas',
      'NO hacer promesas de resultados específicos',
      'El contenido es solo educativo e informativo',
    ],
    videoTopics: [
      'Propiedades del jengibre según la tradición',
      'Hábitos saludables de la mañana',
      'Plantas aromáticas para el hogar',
      'Alimentos nutritivos para el bienestar',
      'Historia del uso del ajo en la tradición',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'madsjeezdesign.com': {
    id: 'madsjeezdesign.com',
    name: 'MadsJeez Design',
    url: 'https://madsjeezdesign.com',
    niche: 'agencia digital',
    description: 'Agencia de servicios digitales: desarrollo web, apps, automatizaciones, sistemas a medida, landing pages, SEO, diseño.',
    audience: 'Empresas, emprendedores, pymes que necesitan presencia digital o automatizaciones',
    tone: 'profesional, moderno, confiable, innovador',
    voice: 'como un CTO experimentado que habla el idioma del negocio',
    cta: ['Cotizá tu proyecto', 'Hablá con un experto', 'Transformá tu negocio', 'Empezá tu proyecto digital', 'Ver portfolio'],
    hashtags: ['#madsjeezdesign', '#desarrolloweb', '#agenciadigital', '#argentina', '#seo', '#app', '#programacion', '#automatizacion'],
    contentRules: [
      'No inventar precios sin cotización',
      'No garantizar posicionamiento SEO específico',
      'No prometer plazos sin evaluación del proyecto',
      'Enfocarse en transformación digital real',
    ],
    videoTopics: [
      'Por qué tu empresa necesita una web profesional',
      'Cuánto cuesta una app mobile en 2025',
      'Automatizá procesos y ahorrá tiempo',
      'Diferencia entre landing page y sitio web',
      'El SEO que sí funciona para pymes',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },

  'appjeezpro.store': {
    id: 'appjeezpro.store',
    name: 'AppJeez Store — Repuestos',
    url: 'https://appjeezpro.store',
    niche: 'repuestos / maquinaria',
    description: 'Catálogo de repuestos para desmalezadoras, motosierras, grupos electrógenos, motobombas y máquinas similares.',
    audience: 'Técnicos, mecánicos, agricultores, personas con maquinaria de jardín o campo',
    tone: 'técnico, directo, confiable, práctico',
    voice: 'como un técnico con años de experiencia que sabe exactamente qué necesitás',
    cta: ['Encontrá tu repuesto', 'Consultá compatibilidad', 'Ver catálogo', 'Pedí tu repuesto', 'Consulta técnica gratis'],
    hashtags: ['#appjeezstore', '#repuestos', '#desmalezadora', '#motosierra', '#maquinaria', '#mantenimiento', '#tecnico', '#campo'],
    contentRules: [
      'No confirmar compatibilidades sin verificar',
      'Aclarar siempre que la compatibilidad puede variar según modelo/año',
      'No inventar precios ni stock',
      'Enfocarse en utilidad y solución técnica',
    ],
    videoTopics: [
      'Cómo cambiar el carburador de una desmalezadora',
      'Repuestos esenciales para mantenimiento preventivo',
      'Diferencia entre repuesto original y compatible',
      'Cómo diagnosticar tu máquina antes de comprar',
      'Los repuestos más buscados del catálogo',
    ],
    contact: { whatsapp: '1121816064', email: 'soporte@madsjeez.com' },
  },
};

export const PROJECT_IDS = Object.keys(PROJECTS);

export function getProject(id: string): ProjectConfig | undefined {
  return PROJECTS[id];
}

export function getProjectContext(id: string): string {
  const p = PROJECTS[id];
  if (!p) return '';
  return `PROYECTO: ${p.name} (${p.url})
NICHO: ${p.niche}
DESCRIPCION: ${p.description}
AUDIENCIA: ${p.audience}
TONO: ${p.tone}
VOZ: ${p.voice}
CTA SUGERIDOS: ${p.cta.slice(0, 3).join(' | ')}
REGLAS: ${p.contentRules.join('. ')}`;
}
