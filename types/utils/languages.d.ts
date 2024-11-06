import languages from '../../src/utils/languages';

export type LanguageName = (typeof languages)[number]['language'];
export type LanguageCode = (typeof languages)[number]['code'];
export type Language = (typeof languages)[number];
