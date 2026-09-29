export const LANGUAGE_CURRENCY_MAP: Record<string, string> = {
  ar: "SAR",
  bg: "BGN",
  cs: "CZK",
  da: "DKK",
  de: "EUR",
  el: "EUR",
  en: "USD",
  es: "EUR",
  et: "EUR",
  fi: "EUR",
  fr: "EUR",
  hu: "HUF",
  id: "IDR",
  it: "EUR",
  ja: "JPY",
  ko: "KRW",
  lt: "EUR",
  lv: "EUR",
  nb: "NOK",
  nl: "EUR",
  pl: "PLN",
  pt: "BRL",
  ro: "RON",
  ru: "RUB",
  sk: "EUR",
  sl: "EUR",
  sv: "SEK",
  tr: "TRY",
  uk: "UAH",
  zh: "CNY",
};

export const LANGUAGE_NAMES: Record<string, string> = {
  ar: "Arabic",
  bg: "Bulgarian",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fi: "Finnish",
  fr: "French",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  nb: "Norwegian",
  nl: "Dutch",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sv: "Swedish",
  tr: "Turkish",
  uk: "Ukrainian",
  zh: "Chinese",
};

export const CURRENCIES = [...new Set(Object.values(LANGUAGE_CURRENCY_MAP))].sort();

export type Cover = "navy" | "burgundy" | "red" | "green";

const COVERS: Record<string, Cover> = {
  en: "navy", ko: "navy", uk: "navy", pt: "navy",
  zh: "red", ja: "red", nb: "red",
  ar: "green", id: "green",
};

export function coverFor(language: string, currency?: string): Cover {
  if ((language === "en" || language === "pt") && currency === "EUR") return "burgundy";
  return COVERS[language] ?? "burgundy";
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}
