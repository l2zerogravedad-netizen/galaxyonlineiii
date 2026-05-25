/**
 * SISTEMA DE LOCALIZACIÓN - GALAXY ONLINE II
 * Idiomas, traducciones, culturas, RTL
 */

// ============================================
// IDIOMAS SOPORTADOS
// ============================================
export type SupportedLanguage = 
  | 'en'    // English
  | 'es'    // Español
  | 'de'    // Deutsch
  | 'fr'    // Français
  | 'it'    // Italiano
  | 'pt'    // Português
  | 'ru'    // Русский
  | 'zh'    // 中文
  | 'ja'    // 日本語
  | 'ko'    // 한국어
  | 'ar'    // العربية
  | 'tr'    // Türkçe
  | 'pl'    // Polski
  | 'nl'    // Nederlands
  | 'sv'    // Svenska
  | 'no'    // Norsk
  | 'da'    // Dansk
  | 'fi'    // Suomi
  | 'cs'    // Čeština
  | 'hu'    // Magyar
  | 'ro'    // Română
  | 'el'    // Ελληνικά
  | 'he'    // עברית
  | 'th'    // ไทย
  | 'vi'    // Tiếng Việt
  | 'id';   // Bahasa Indonesia

// ============================================
// CONFIGURACIÓN DE IDIOMA
// ============================================
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  
  // Propiedades
  rtl: boolean;
  script: 'latin' | 'cyrillic' | 'cjk' | 'arabic' | 'hebrew' | 'greek' | 'thai' | 'other';
  
  // Regiones
  regions: {
    code: string;
    name: string;
    defaultTimezone: string;
    defaultCurrency: string;
  }[];
  
  // Disponibilidad
  availability: {
    ui: boolean;
    audio: boolean;
    subtitles: boolean;
    support: 'full' | 'partial' | 'community';
    completion: number; // 0-100
  };
  
  // Metadatos
  metadata: {
    flag: string;
    locale: string;
    pluralForms: number;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    numberFormat: {
      decimalSeparator: string;
      thousandsSeparator: string;
      currencySymbol: string;
      currencyPosition: 'prefix' | 'suffix';
    };
  };
}

// ============================================
// TRADUCCIÓN
// ============================================
export interface Translation {
  key: string;
  source: string;
  
  // Traducciones
  translations: Partial<Record<SupportedLanguage, string>>;
  
  // Contexto
  context: {
    category: string;
    description: string;
    screenshot?: string;
    maxLength?: number;
    placeholders?: string[];
  };
  
  // Estado
  status: {
    approved: SupportedLanguage[];
    pending: SupportedLanguage[];
    needsReview: SupportedLanguage[];
    outdated: SupportedLanguage[];
    missing: SupportedLanguage[];
  };
  
  // Variantes
  variants: {
    gender?: Record<SupportedLanguage, { male: string; female: string; neutral: string }>;
    plural?: Record<SupportedLanguage, string[]>;
    formality?: Record<SupportedLanguage, { formal: string; informal: string }>;
  };
}

// ============================================
// CATEGORÍA DE TRADUCCIÓN
// ============================================
export interface TranslationCategory {
  id: string;
  name: string;
  description: string;
  
  // Prioridad
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Contenido
  translations: Translation[];
  
  // Progreso
  progress: Partial<Record<SupportedLanguage, {
    total: number;
    translated: number;
    approved: number;
    percentage: number;
  }>>;
}

// ============================================
// SISTEMA DE TEXTO EN JUEGO
// ============================================
export interface GameText {
  id: string;
  
  // Contenido localizado
  text: Partial<Record<SupportedLanguage, string>>;
  
  // Formateo
  formatting: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    size?: 'small' | 'normal' | 'large' | 'huge';
    font?: string;
  };
  
  // Soporte RTL
  rtl: {
    enabled: boolean;
    alignment: 'left' | 'right' | 'center' | 'justify';
    direction: 'ltr' | 'rtl';
  };
  
  // Audio
  audio: {
    narration: Partial<Record<SupportedLanguage, string>>;
    subtitles: boolean;
    subtitleDelay: number;
  };
}

// ============================================
// RECURSOS CULTURALES
// ============================================
export interface CulturalAdaptation {
  // Región
  region: string;
  
  // Adaptaciones
  adaptations: {
    // Contenido sensible
    censorship: {
      removeBlood: boolean;
      removeViolence: boolean;
      removeReligiousRefs: boolean;
      removePoliticalRefs: boolean;
      customModels: boolean;
      customTextures: boolean;
    };
    
    // Eventos
    events: {
      skipEvents: string[];
      customEvents: string[];
      holidayMapping: Record<string, string>;
    };
    
    // Económico
    economy: {
      priceMultiplier: number;
      currency: string;
      paymentMethods: string[];
      legalText: string;
    };
    
    // Social
    social: {
      chatModeration: 'standard' | 'strict' | 'relaxed';
      nameRestrictions: string[];
      contentFilters: string[];
    };
  };
  
  // Legal
  legal: {
    privacyPolicy: string;
    termsOfService: string;
    ageRating: string;
    requiredDisclaimers: string[];
    gamblingRestrictions: boolean;
    lootBoxRestrictions: boolean;
  };
}

// ============================================
// CONFIGURACIONES DE IDIOMA
// ============================================
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
    script: 'latin',
    regions: [
      { code: 'US', name: 'United States', defaultTimezone: 'America/New_York', defaultCurrency: 'USD' },
      { code: 'GB', name: 'United Kingdom', defaultTimezone: 'Europe/London', defaultCurrency: 'GBP' },
      { code: 'AU', name: 'Australia', defaultTimezone: 'Australia/Sydney', defaultCurrency: 'AUD' },
      { code: 'CA', name: 'Canada', defaultTimezone: 'America/Toronto', defaultCurrency: 'CAD' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 100 },
    metadata: {
      flag: '🇺🇸',
      locale: 'en-US',
      pluralForms: 2,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: { decimalSeparator: '.', thousandsSeparator: ',', currencySymbol: '$', currencyPosition: 'prefix' }
    }
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    rtl: false,
    script: 'latin',
    regions: [
      { code: 'ES', name: 'España', defaultTimezone: 'Europe/Madrid', defaultCurrency: 'EUR' },
      { code: 'MX', name: 'México', defaultTimezone: 'America/Mexico_City', defaultCurrency: 'MXN' },
      { code: 'AR', name: 'Argentina', defaultTimezone: 'America/Argentina/Buenos_Aires', defaultCurrency: 'ARS' },
      { code: 'CO', name: 'Colombia', defaultTimezone: 'America/Bogota', defaultCurrency: 'COP' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 100 },
    metadata: {
      flag: '🇪🇸',
      locale: 'es-ES',
      pluralForms: 2,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '€', currencyPosition: 'suffix' }
    }
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    rtl: false,
    script: 'latin',
    regions: [
      { code: 'DE', name: 'Deutschland', defaultTimezone: 'Europe/Berlin', defaultCurrency: 'EUR' },
      { code: 'AT', name: 'Österreich', defaultTimezone: 'Europe/Vienna', defaultCurrency: 'EUR' },
      { code: 'CH', name: 'Schweiz', defaultTimezone: 'Europe/Zurich', defaultCurrency: 'CHF' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 95 },
    metadata: {
      flag: '🇩🇪',
      locale: 'de-DE',
      pluralForms: 2,
      dateFormat: 'DD.MM.YYYY',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '€', currencyPosition: 'suffix' }
    }
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    rtl: false,
    script: 'latin',
    regions: [
      { code: 'FR', name: 'France', defaultTimezone: 'Europe/Paris', defaultCurrency: 'EUR' },
      { code: 'CA', name: 'Canada', defaultTimezone: 'America/Montreal', defaultCurrency: 'CAD' },
      { code: 'BE', name: 'Belgique', defaultTimezone: 'Europe/Brussels', defaultCurrency: 'EUR' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 95 },
    metadata: {
      flag: '🇫🇷',
      locale: 'fr-FR',
      pluralForms: 2,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: '€', currencyPosition: 'suffix' }
    }
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    script: 'arabic',
    regions: [
      { code: 'SA', name: 'المملكة العربية السعودية', defaultTimezone: 'Asia/Riyadh', defaultCurrency: 'SAR' },
      { code: 'AE', name: 'الإمارات العربية المتحدة', defaultTimezone: 'Asia/Dubai', defaultCurrency: 'AED' },
      { code: 'EG', name: 'مصر', defaultTimezone: 'Africa/Cairo', defaultCurrency: 'EGP' }
    ],
    availability: { ui: true, audio: false, subtitles: true, support: 'partial', completion: 75 },
    metadata: {
      flag: '🇸🇦',
      locale: 'ar-SA',
      pluralForms: 6,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: '٫', thousandsSeparator: '٬', currencySymbol: 'ر.س', currencyPosition: 'suffix' }
    }
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    rtl: false,
    script: 'cjk',
    regions: [
      { code: 'CN', name: '中国', defaultTimezone: 'Asia/Shanghai', defaultCurrency: 'CNY' },
      { code: 'TW', name: '台灣', defaultTimezone: 'Asia/Taipei', defaultCurrency: 'TWD' },
      { code: 'HK', name: '香港', defaultTimezone: 'Asia/Hong_Kong', defaultCurrency: 'HKD' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 90 },
    metadata: {
      flag: '🇨🇳',
      locale: 'zh-CN',
      pluralForms: 1,
      dateFormat: 'YYYY/MM/DD',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: '.', thousandsSeparator: ',', currencySymbol: '¥', currencyPosition: 'prefix' }
    }
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    rtl: false,
    script: 'cjk',
    regions: [
      { code: 'JP', name: '日本', defaultTimezone: 'Asia/Tokyo', defaultCurrency: 'JPY' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 85 },
    metadata: {
      flag: '🇯🇵',
      locale: 'ja-JP',
      pluralForms: 1,
      dateFormat: 'YYYY/MM/DD',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: '.', thousandsSeparator: ',', currencySymbol: '¥', currencyPosition: 'prefix' }
    }
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    rtl: false,
    script: 'cjk',
    regions: [
      { code: 'KR', name: '대한민국', defaultTimezone: 'Asia/Seoul', defaultCurrency: 'KRW' }
    ],
    availability: { ui: true, audio: true, subtitles: true, support: 'full', completion: 85 },
    metadata: {
      flag: '🇰🇷',
      locale: 'ko-KR',
      pluralForms: 1,
      dateFormat: 'YYYY.MM.DD',
      timeFormat: '24h',
      numberFormat: { decimalSeparator: '.', thousandsSeparator: ',', currencySymbol: '₩', currencyPosition: 'prefix' }
    }
  },
  // Simplified entries for remaining languages
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, script: 'latin', regions: [{ code: 'IT', name: 'Italia', defaultTimezone: 'Europe/Rome', defaultCurrency: 'EUR' }], availability: { ui: true, audio: false, subtitles: true, support: 'full', completion: 90 }, metadata: { flag: '🇮🇹', locale: 'it-IT', pluralForms: 2, dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '€', currencyPosition: 'suffix' } } },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, script: 'latin', regions: [{ code: 'BR', name: 'Brasil', defaultTimezone: 'America/Sao_Paulo', defaultCurrency: 'BRL' }, { code: 'PT', name: 'Portugal', defaultTimezone: 'Europe/Lisbon', defaultCurrency: 'EUR' }], availability: { ui: true, audio: false, subtitles: true, support: 'full', completion: 90 }, metadata: { flag: '🇧🇷', locale: 'pt-BR', pluralForms: 2, dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: 'R$', currencyPosition: 'prefix' } } },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, script: 'cyrillic', regions: [{ code: 'RU', name: 'Россия', defaultTimezone: 'Europe/Moscow', defaultCurrency: 'RUB' }], availability: { ui: true, audio: false, subtitles: true, support: 'partial', completion: 80 }, metadata: { flag: '🇷🇺', locale: 'ru-RU', pluralForms: 3, dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: '₽', currencyPosition: 'suffix' } } },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false, script: 'latin', regions: [{ code: 'TR', name: 'Türkiye', defaultTimezone: 'Europe/Istanbul', defaultCurrency: 'TRY' }], availability: { ui: true, audio: false, subtitles: true, support: 'partial', completion: 70 }, metadata: { flag: '🇹🇷', locale: 'tr-TR', pluralForms: 2, dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '₺', currencyPosition: 'prefix' } } },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false, script: 'latin', regions: [{ code: 'PL', name: 'Polska', defaultTimezone: 'Europe/Warsaw', defaultCurrency: 'PLN' }], availability: { ui: true, audio: false, subtitles: true, support: 'partial', completion: 70 }, metadata: { flag: '🇵🇱', locale: 'pl-PL', pluralForms: 3, dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: 'zł', currencyPosition: 'suffix' } } },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false, script: 'latin', regions: [{ code: 'NL', name: 'Nederland', defaultTimezone: 'Europe/Amsterdam', defaultCurrency: 'EUR' }], availability: { ui: true, audio: false, subtitles: true, support: 'partial', completion: 65 }, metadata: { flag: '🇳🇱', locale: 'nl-NL', pluralForms: 2, dateFormat: 'DD-MM-YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '€', currencyPosition: 'prefix' } } },
  // Remaining languages with minimal config
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false, script: 'latin', regions: [{ code: 'SE', name: 'Sverige', defaultTimezone: 'Europe/Stockholm', defaultCurrency: 'SEK' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 40 }, metadata: { flag: '🇸🇪', locale: 'sv-SE', pluralForms: 2, dateFormat: 'YYYY-MM-DD', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: 'kr', currencyPosition: 'suffix' } } },
  no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', rtl: false, script: 'latin', regions: [{ code: 'NO', name: 'Norge', defaultTimezone: 'Europe/Oslo', defaultCurrency: 'NOK' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 35 }, metadata: { flag: '🇳🇴', locale: 'no-NO', pluralForms: 2, dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: 'kr', currencyPosition: 'suffix' } } },
  da: { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false, script: 'latin', regions: [{ code: 'DK', name: 'Danmark', defaultTimezone: 'Europe/Copenhagen', defaultCurrency: 'DKK' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 35 }, metadata: { flag: '🇩🇰', locale: 'da-DK', pluralForms: 2, dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: 'kr', currencyPosition: 'suffix' } } },
  fi: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', rtl: false, script: 'latin', regions: [{ code: 'FI', name: 'Suomi', defaultTimezone: 'Europe/Helsinki', defaultCurrency: 'EUR' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 35 }, metadata: { flag: '🇫🇮', locale: 'fi-FI', pluralForms: 2, dateFormat: 'D.M.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: '€', currencyPosition: 'suffix' } } },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', rtl: false, script: 'latin', regions: [{ code: 'CZ', name: 'Česká republika', defaultTimezone: 'Europe/Prague', defaultCurrency: 'CZK' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 35 }, metadata: { flag: '🇨🇿', locale: 'cs-CZ', pluralForms: 3, dateFormat: 'D. M. YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: 'Kč', currencyPosition: 'suffix' } } },
  hu: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', rtl: false, script: 'latin', regions: [{ code: 'HU', name: 'Magyarország', defaultTimezone: 'Europe/Budapest', defaultCurrency: 'HUF' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 30 }, metadata: { flag: '🇭🇺', locale: 'hu-HU', pluralForms: 2, dateFormat: 'YYYY. MM. DD.', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ', currencySymbol: 'Ft', currencyPosition: 'suffix' } } },
  ro: { code: 'ro', name: 'Romanian', nativeName: 'Română', rtl: false, script: 'latin', regions: [{ code: 'RO', name: 'România', defaultTimezone: 'Europe/Bucharest', defaultCurrency: 'RON' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 30 }, metadata: { flag: '🇷🇴', locale: 'ro-RO', pluralForms: 3, dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: 'lei', currencyPosition: 'suffix' } } },
  el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', rtl: false, script: 'greek', regions: [{ code: 'GR', name: 'Ελλάδα', defaultTimezone: 'Europe/Athens', defaultCurrency: 'EUR' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 30 }, metadata: { flag: '🇬🇷', locale: 'el-GR', pluralForms: 2, dateFormat: 'D/M/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '€', currencyPosition: 'suffix' } } },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true, script: 'hebrew', regions: [{ code: 'IL', name: 'ישראל', defaultTimezone: 'Asia/Jerusalem', defaultCurrency: 'ILS' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 25 }, metadata: { flag: '🇮🇱', locale: 'he-IL', pluralForms: 4, dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: '.', thousandsSeparator: ',', currencySymbol: '₪', currencyPosition: 'prefix' } } },
  th: { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false, script: 'thai', regions: [{ code: 'TH', name: 'ไทย', defaultTimezone: 'Asia/Bangkok', defaultCurrency: 'THB' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 25 }, metadata: { flag: '🇹🇭', locale: 'th-TH', pluralForms: 1, dateFormat: 'D/M/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: '.', thousandsSeparator: ',', currencySymbol: '฿', currencyPosition: 'prefix' } } },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false, script: 'latin', regions: [{ code: 'VN', name: 'Việt Nam', defaultTimezone: 'Asia/Ho_Chi_Minh', defaultCurrency: 'VND' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 25 }, metadata: { flag: '🇻🇳', locale: 'vi-VN', pluralForms: 1, dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: '₫', currencyPosition: 'suffix' } } },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false, script: 'latin', regions: [{ code: 'ID', name: 'Indonesia', defaultTimezone: 'Asia/Jakarta', defaultCurrency: 'IDR' }], availability: { ui: false, audio: false, subtitles: true, support: 'community', completion: 25 }, metadata: { flag: '🇮🇩', locale: 'id-ID', pluralForms: 1, dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimalSeparator: ',', thousandsSeparator: '.', currencySymbol: 'Rp', currencyPosition: 'prefix' } } }
};

// ============================================
// HELPERS
// ============================================
export function getLanguageConfig(code: SupportedLanguage): LanguageConfig {
  return LANGUAGE_CONFIGS[code];
}

export function getSupportedLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGE_CONFIGS);
}

export function getFullySupportedLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGE_CONFIGS).filter(
    lang => lang.availability.support === 'full' && lang.availability.completion >= 90
  );
}

export function getRTLLanguages(): SupportedLanguage[] {
  return Object.values(LANGUAGE_CONFIGS)
    .filter(lang => lang.rtl)
    .map(lang => lang.code);
}

export function formatNumber(
  num: number,
  language: SupportedLanguage,
  options?: { decimals?: number; currency?: boolean; currencyCode?: string }
): string {
  const config = LANGUAGE_CONFIGS[language];
  const { decimalSeparator, thousandsSeparator } = config.metadata.numberFormat;
  
  let formatted = num.toFixed(options?.decimals ?? 0);
  
  // Separador de miles
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  formatted = parts.join(decimalSeparator);
  
  // Símbolo de moneda
  if (options?.currency) {
    const symbol = config.metadata.numberFormat.currencySymbol;
    if (config.metadata.numberFormat.currencyPosition === 'prefix') {
      formatted = `${symbol}${formatted}`;
    } else {
      formatted = `${formatted} ${symbol}`;
    }
  }
  
  return formatted;
}

export function formatDate(
  date: Date,
  language: SupportedLanguage,
  options?: { time?: boolean }
): string {
  const config = LANGUAGE_CONFIGS[language];
  const { dateFormat, timeFormat } = config.metadata;
  
  let formatted = dateFormat;
  formatted = formatted.replace('YYYY', date.getFullYear().toString());
  formatted = formatted.replace('MM', String(date.getMonth() + 1).padStart(2, '0'));
  formatted = formatted.replace('DD', String(date.getDate()).padStart(2, '0'));
  formatted = formatted.replace('D', String(date.getDate()));
  formatted = formatted.replace('M', String(date.getMonth() + 1));
  
  if (options?.time) {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      formatted += ` ${displayHours}:${minutes} ${period}`;
    } else {
      formatted += ` ${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }
  
  return formatted;
}

export function getTextDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
  return LANGUAGE_CONFIGS[language].rtl ? 'rtl' : 'ltr';
}

export function translate(
  key: string,
  language: SupportedLanguage,
  translations: Record<string, Partial<Record<SupportedLanguage, string>>>,
  params?: Record<string, string>
): string {
  // Obtener traducción
  let text = translations[key]?.[language] || translations[key]?.['en'] || key;
  
  // Reemplazar placeholders
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      text = text.replace(`{{${key}}}`, value);
    });
  }
  
  return text;
}

export function pluralize(
  count: number,
  language: SupportedLanguage,
  forms: string[]
): string {
  const config = LANGUAGE_CONFIGS[language];
  const pluralForms = config.metadata.pluralForms;
  
  // Reglas simples de pluralización
  if (pluralForms === 1) {
    return forms[0];
  } else if (pluralForms === 2) {
    return count === 1 ? forms[0] : forms[1];
  } else {
    // Reglas más complejas para ruso, polaco, etc.
    return forms[Math.min(count, forms.length - 1)];
  }
}

export const LocalizationSystem = {
  LANGUAGE_CONFIGS,
  getLanguageConfig,
  getSupportedLanguages,
  getFullySupportedLanguages,
  getRTLLanguages,
  formatNumber,
  formatDate,
  getTextDirection,
  translate,
  pluralize
};
