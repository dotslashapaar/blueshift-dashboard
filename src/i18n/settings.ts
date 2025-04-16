export const defaultNS = 'translation'
export const fallbackLng = 'en'
export const languages = ['en'] as const
export const cookieName = 'i18next'

export const getOptions = (lng = fallbackLng, ns = defaultNS) => ({
  supportedLngs: languages,
  fallbackLng,
  lng,
  fallbackNS: defaultNS,
  defaultNS,
  ns
}) 