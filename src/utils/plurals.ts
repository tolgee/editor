export const allPlurals = [
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
] satisfies Intl.LDMLPluralRule[];

export const getPluralRules = (locale: string) => {
  try {
    return new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
  } catch (e) {
    return allPlurals;
  }
};

export const selectPluralRule = (locale: string, value: number) => {
  try {
    return new Intl.PluralRules(locale).select(value);
  } catch (e) {
    return "other";
  }
};
