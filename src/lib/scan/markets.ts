/**
 * Markets — the language a buyer asks in, and the country they ask from.
 *
 * ## Why this exists
 *
 * Until now every scan asked fifteen English questions and reported the answer
 * as though it were the brand's visibility. For a company selling in Bogotá or
 * São Paulo that number was measuring somebody else's market. The limitation
 * was written down honestly on the method page, which is not the same as fixing
 * it.
 *
 * ## Language and country are two different things
 *
 * They are kept separate on purpose. A Spanish-language question asked on
 * behalf of a buyer in Mexico is a different measurement from an English
 * question asking about vendors *for* Mexico, and both are different again from
 * Spanish-for-Spain. The language decides the words that go in the prompt; the
 * country goes into the system prompt as who is asking. A market is one pairing
 * of the two, and it is the unit a brand is tracked against — `es-CO` and
 * `en-US` are separate histories, because they are separate answers.
 *
 * ## Why the question sets are written out rather than translated at runtime
 *
 * Machine-translating the prompts on the way to the model would cost a call per
 * question, drift between runs, and make the audit trail unreproducible: two
 * scans a week apart could not be compared, because the questions themselves
 * would have moved. These are fixed strings, reviewed once, printed verbatim in
 * the audit trail. That is what makes a trend line mean anything.
 *
 * `wordpress-plugin/thallo-visibility/includes/class-thallo-questions.php` holds
 * the same tables and is the authoritative copy — the audit trail prints what
 * the server actually sent. This file mirrors it so the setup screen can say
 * what is coming before a scan starts. **Change one, change both.**
 */

export type ScanLanguage = 'en' | 'es' | 'pt';

export interface Market {
  /** BCP-47-shaped id. The key a history series is stored against. */
  id: string;
  language: ScanLanguage;
  /** Shown in the picker, e.g. "Colombia". */
  country: string;
  /** Shown in the picker, e.g. "Español". */
  languageLabel: string;
}

/**
 * The markets on offer.
 *
 * `en-US` is first and is the default, so a visitor who ignores the control
 * gets exactly what this tool did before markets existed. The Spanish and
 * Portuguese entries are the ones Thallo actually sells into; the list is a
 * catalogue to add to, not a claim about where the models are good.
 */
export const MARKETS: readonly Market[] = [
  { id: 'en-US', language: 'en', country: 'the United States', languageLabel: 'English' },
  { id: 'en-GB', language: 'en', country: 'the United Kingdom', languageLabel: 'English' },
  { id: 'es-ES', language: 'es', country: 'Spain', languageLabel: 'Español' },
  { id: 'es-MX', language: 'es', country: 'Mexico', languageLabel: 'Español' },
  { id: 'es-CO', language: 'es', country: 'Colombia', languageLabel: 'Español' },
  { id: 'es-AR', language: 'es', country: 'Argentina', languageLabel: 'Español' },
  { id: 'pt-BR', language: 'pt', country: 'Brazil', languageLabel: 'Português' },
];

export const DEFAULT_MARKET = 'en-US';

export function marketById(id: string): Market {
  return MARKETS.find((m) => m.id === id) ?? MARKETS[0];
}

/** "Español · Colombia" — the picker label and the report's dateline. */
export function marketLabel(id: string): string {
  const m = marketById(id);
  // The country names carry "the" so they read correctly in a sentence
  // ("a buyer in the United States"); a label is not a sentence.
  return `${m.languageLabel} · ${m.country.replace(/^the /, '')}`;
}

// ---------------------------------------------------------------------------
// The questions
// ---------------------------------------------------------------------------

/**
 * Fifteen per language: five angles, three phrasings each, because one phrasing
 * measures a phrasing rather than a market. The translations are not literal —
 * each one is what a buyer in that language would actually type, which is the
 * only property that matters here.
 */
export const QUESTION_TEMPLATES: Record<ScanLanguage, readonly string[]> = {
  en: [
    // Open recommendation
    'What are the best {industry} companies right now?',
    'Which {industry} companies would you recommend?',
    'Who are the leading providers in {industry}?',

    // Shortlist / procurement
    'I need to shortlist {industry} partners. Who should I be looking at?',
    'Which {industry} vendors would you recommend to a mid-market B2B buyer?',
    'We are running a procurement process for {industry}. Which suppliers should be on the list?',

    // Trust and reputation
    'Who are the most trusted providers in {industry}?',
    'Which {industry} companies have the strongest reputation with enterprise clients?',
    'Which {industry} providers have the best reviews from their customers?',

    // Segment fit
    'Which {industry} companies are best for a startup on a limited budget?',
    'Which {industry} providers work best with large enterprises?',
    'Which {industry} companies are best for a business expanding internationally?',

    // Alternatives and switching
    'What are the main alternatives in {industry} worth comparing?',
    'Who competes with the biggest names in {industry}?',
    'If I am unhappy with my current {industry} provider, who should I move to?',
  ],

  es: [
    // Recomendación abierta
    '¿Cuáles son las mejores empresas de {industry} ahora mismo?',
    '¿Qué empresas de {industry} recomendarías?',
    '¿Quiénes son los proveedores líderes en {industry}?',

    // Lista corta / compras
    'Necesito armar una lista corta de socios de {industry}. ¿A quiénes debería mirar?',
    '¿Qué proveedores de {industry} le recomendarías a una empresa B2B de tamaño medio?',
    'Estamos abriendo un proceso de compra de {industry}. ¿Qué proveedores deberían estar en la lista?',

    // Confianza y reputación
    '¿Cuáles son los proveedores más confiables en {industry}?',
    '¿Qué empresas de {industry} tienen mejor reputación entre clientes corporativos?',
    '¿Qué proveedores de {industry} tienen las mejores reseñas de sus clientes?',

    // Ajuste por segmento
    '¿Qué empresas de {industry} son mejores para una startup con presupuesto ajustado?',
    '¿Qué proveedores de {industry} funcionan mejor con grandes empresas?',
    '¿Qué empresas de {industry} son mejores para un negocio que se expande internacionalmente?',

    // Alternativas y cambio de proveedor
    '¿Cuáles son las principales alternativas en {industry} que vale la pena comparar?',
    '¿Quién compite con los nombres más grandes en {industry}?',
    'Si no estoy conforme con mi proveedor actual de {industry}, ¿a quién debería cambiarme?',
  ],

  pt: [
    // Recomendação aberta
    'Quais são as melhores empresas de {industry} hoje?',
    'Que empresas de {industry} você recomendaria?',
    'Quem são os principais fornecedores em {industry}?',

    // Lista curta / compras
    'Preciso montar uma lista curta de parceiros de {industry}. Quem eu deveria considerar?',
    'Que fornecedores de {industry} você recomendaria para uma empresa B2B de médio porte?',
    'Estamos abrindo um processo de compra de {industry}. Que fornecedores deveriam estar na lista?',

    // Confiança e reputação
    'Quem são os fornecedores mais confiáveis em {industry}?',
    'Que empresas de {industry} têm a melhor reputação entre clientes corporativos?',
    'Que fornecedores de {industry} têm as melhores avaliações dos seus clientes?',

    // Ajuste por segmento
    'Que empresas de {industry} são melhores para uma startup com orçamento limitado?',
    'Que fornecedores de {industry} funcionam melhor com grandes empresas?',
    'Que empresas de {industry} são melhores para um negócio que está se expandindo internacionalmente?',

    // Alternativas e troca de fornecedor
    'Quais são as principais alternativas em {industry} que valem a pena comparar?',
    'Quem compete com os maiores nomes em {industry}?',
    'Se eu não estiver satisfeito com meu fornecedor atual de {industry}, para quem eu deveria migrar?',
  ],
};

/**
 * The category labels, in each language.
 *
 * The picker on the site is in English because the site is, but a Spanish
 * question with `enterprise software / SaaS` dropped into the middle of it is
 * not a question anybody types. Keyed on the English label the UI already
 * sends, so an industry that is not in this table — the field accepts free text
 * — falls through unchanged rather than failing.
 */
export const INDUSTRY_LABELS: Record<string, Partial<Record<ScanLanguage, string>>> = {
  'Fintech & payments': { es: 'fintech y pagos', pt: 'fintech e pagamentos' },
  'Health tech & recovery': {
    es: 'tecnología de la salud y recuperación',
    pt: 'tecnologia da saúde e recuperação',
  },
  'Enterprise software / SaaS': { es: 'software empresarial / SaaS', pt: 'software empresarial / SaaS' },
  'Professional services': { es: 'servicios profesionales', pt: 'serviços profissionais' },
  'Legal tech': { es: 'tecnología legal', pt: 'tecnologia jurídica' },
  'Logistics & supply chain': {
    es: 'logística y cadena de suministro',
    pt: 'logística e cadeia de suprimentos',
  },
  'E-commerce & retail': { es: 'comercio electrónico y retail', pt: 'e-commerce e varejo' },
  'Marketing & advertising': { es: 'marketing y publicidad', pt: 'marketing e publicidade' },
};

export function industryInLanguage(industry: string, language: ScanLanguage): string {
  if (language === 'en') return industry.toLowerCase();
  return (INDUSTRY_LABELS[industry]?.[language] ?? industry).toLowerCase();
}

/** The exact prompts a scan will send, for the setup screen's preview. */
export function buildQuestionsFor(industry: string, marketId: string): string[] {
  const market = marketById(marketId);
  const label = industryInLanguage(industry, market.language);
  return QUESTION_TEMPLATES[market.language].map((q) => q.replace(/\{industry\}/g, label));
}
