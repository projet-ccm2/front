export type Language = 'en' | 'fr'

type TranslationValue = string

type TranslationMap = Record<string, TranslationValue>

function mergeTranslations(
  baseTranslations: TranslationMap,
  overrides: Partial<TranslationMap>
): TranslationMap {
  const mergedTranslations: TranslationMap = { ...baseTranslations }

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      mergedTranslations[key] = value
    }
  }

  return mergedTranslations
}

const EN_TRANSLATIONS: TranslationMap = {
  'app.name': 'Stream Quest',
  'app.loading': 'Loading...',
  'common.settings': 'Settings',
  'common.signOut': 'Sign Out',
  'common.darkMode': 'Dark Mode',
  'common.lightMode': 'Light Mode',
  'language.english': 'English',
  'language.french': 'French',
  'nav.dashboard': 'Dashboard',
  'nav.creator': 'Create Achievement',
  'nav.management': 'Manage Achievements',
  'nav.marketplace': 'Marketplace',
  'nav.profile': 'User Profile',
  'nav.overlay': 'Twitch Overlay',
  'landing.connect': 'Connect with Twitch',
  'landing.getStarted': 'Get Started Free',
  'landing.heroTitle': 'Gamify Your Stream',
  'landing.heroDescription':
    'Transform viewer engagement with achievements, quests, and rewards. Keep your community active and invested with Stream Quest.',
  'landing.featureAchievementTitle': 'Achievement System',
  'landing.featureAchievementDescription':
    'Create custom achievements for your viewers. Reward chat participation, watch time, and more.',
  'landing.featureRetentionTitle': 'Boost Retention',
  'landing.featureRetentionDescription':
    'Keep viewers engaged longer with progression systems and exclusive rewards for loyal fans.',
  'landing.featureAnalyticsTitle': 'Analytics Dashboard',
  'landing.featureAnalyticsDescription':
    'Track engagement metrics and see how gamification impacts your community growth.',
  'landing.completeEcosystem': 'Complete Ecosystem',
  'landing.completeEcosystemDescription': 'Everything you need to gamify your stream',
  'landing.extensionTitle': 'Twitch Extension',
  'landing.extensionDescription':
    'Real-time overlay that displays active quests and achievements directly on your stream. Viewers can track their progress without leaving the video.',
  'landing.extensionPoint1': 'Real-time progress tracking',
  'landing.extensionPoint2': 'Instant notifications',
  'landing.extensionPoint3': 'Customizable appearance',
  'landing.mobileTitle': 'Web Dashboard',
  'landing.mobileDescription':
    'Powerful creator dashboard to design achievements, manage your community, and analyze engagement metrics from anywhere.',
  'landing.mobilePoint1': 'AI-assisted achievement builder',
  'landing.mobilePoint2': 'Community marketplace',
  'landing.mobilePoint3': 'Advanced analytics',
  'landing.ctaTitle': 'Ready to Level Up?',
  'landing.ctaDescription':
    'Join thousands of streamers using Stream Quest to build stronger communities',
  'landing.levelUp': 'Level Up',
}

const FR_TRANSLATION_OVERRIDES: Partial<TranslationMap> = {
  'app.loading': 'Chargement...',
  'common.settings': 'Paramètres',
  'common.signOut': 'Déconnexion',
  'common.darkMode': 'Mode sombre',
  'common.lightMode': 'Mode clair',
  'language.english': 'Anglais',
  'language.french': 'Français',
  'nav.dashboard': 'Tableau de bord',
  'nav.creator': 'Créer un succès',
  'nav.management': 'Gérer les succès',
  'nav.profile': 'Profil utilisateur',
  'nav.overlay': 'Overlay Twitch',
  'landing.connect': 'Se connecter avec Twitch',
  'landing.getStarted': 'Commencer gratuitement',
  'landing.heroTitle': 'Gamifiez votre stream',
  'landing.heroDescription':
    "Transformez l'engagement des viewers avec des succès, des quêtes et des récompenses. Gardez votre communauté active avec Stream Quest.",
  'landing.featureAchievementTitle': 'Système de succès',
  'landing.featureAchievementDescription':
    'Créez des succès personnalisés pour vos viewers. Récompensez la participation au chat, le temps de visionnage et plus encore.',
  'landing.featureRetentionTitle': 'Renforcer la rétention',
  'landing.featureRetentionDescription':
    'Gardez vos viewers engagés plus longtemps avec des systèmes de progression et des récompenses exclusives.',
  'landing.featureAnalyticsTitle': 'Tableau analytique',
  'landing.featureAnalyticsDescription':
    "Suivez les métriques d'engagement et voyez l'impact de la gamification sur votre communauté.",
  'landing.completeEcosystem': 'Écosystème complet',
  'landing.completeEcosystemDescription':
    'Tout ce dont vous avez besoin pour gamifier votre stream',
  'landing.extensionTitle': 'Extension Twitch',
  'landing.extensionDescription':
    'Un overlay en temps réel qui affiche les quêtes et succès directement sur votre stream. Les viewers suivent leur progression sans quitter la vidéo.',
  'landing.extensionPoint1': 'Suivi de progression en temps réel',
  'landing.extensionPoint2': 'Notifications instantanées',
  'landing.extensionPoint3': 'Apparence personnalisable',
  'landing.mobileTitle': 'Dashboard web',
  'landing.mobileDescription':
    "Un dashboard puissant pour créer des succès, gérer votre communauté et analyser l'engagement depuis n'importe où.",
  'landing.mobilePoint1': 'Générateur de succès assisté par IA',
  'landing.mobilePoint2': 'Marketplace communautaire',
  'landing.mobilePoint3': 'Analytique avancée',
  'landing.ctaTitle': 'Prêt à passer au niveau supérieur ?',
  'landing.ctaDescription':
    'Rejoignez des milliers de streamers qui utilisent Stream Quest pour renforcer leur communauté',
  'landing.levelUp': 'Monter de niveau',
}

export const TRANSLATIONS: Record<Language, TranslationMap> = {
  en: EN_TRANSLATIONS,
  fr: mergeTranslations(EN_TRANSLATIONS, FR_TRANSLATION_OVERRIDES),
}

export function resolveTranslation(
  language: Language,
  key: string,
  params?: Record<string, string | number>
) {
  const template = TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key] ?? key

  if (!params) {
    return template
  }

  return Object.entries(params).reduce(
    (accumulator, [paramKey, paramValue]) =>
      accumulator.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue)),
    template
  )
}
