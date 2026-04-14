export type Language = 'en' | 'fr'

type TranslationValue = string

type TranslationMap = Record<string, TranslationValue>

const EN_OWNER_ONLY_MESSAGE =
  'Achievement management currently supports only the connected user channel. Moderator channels are not handled yet.'
const EN_OWNER_ONLY_DASHBOARD_MESSAGE =
  'Achievement management currently supports only the connected user channel. Channel metrics stay hidden for moderator channels, but your achievement progress remains visible.'

const FR_OWNER_ONLY_MESSAGE =
  'La gestion des succès ne prend actuellement en charge que la chaîne du compte connecté. Les chaînes modératrices ne sont pas encore gérées.'
const FR_OWNER_ONLY_DASHBOARD_MESSAGE =
  'La gestion des succès ne prend actuellement en charge que la chaîne du compte connecté. Les métriques de chaîne restent masquées pour les chaînes modératrices, mais la progression des succès reste visible.'

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
  'language.label': 'Language',
  'language.english': 'English',
  'language.french': 'French',
  'language.shortEnglish': 'EN',
  'language.shortFrench': 'FR',
  'language.switchToEnglish': 'Switch to English',
  'language.switchToFrench': 'Switch to French',
  'channel.owner': 'Owner',
  'channel.moderator': 'Moderator',
  'channel.manageChannels': 'Manage Channels',
  'channel.closeMenu': 'Close menu',
  'channel.addChannel': 'Add Channel',
  'channel.followers': '{count} followers',
  'nav.dashboard': 'Dashboard',
  'nav.creator': 'Create Achievement',
  'nav.management': 'Manage Achievements',
  'nav.marketplace': 'Marketplace',
  'nav.profile': 'User Profile',
  'nav.overlay': 'Twitch Panel',
  'achievements.error.invalidRequest': 'The achievements request is invalid.',
  'achievements.error.noProgress': 'No achievement progress was found for this channel.',
  'achievements.error.serviceUnavailable': 'The achievement service is currently unavailable.',
  'achievements.error.loadFailed': 'Unable to load achievements.',
  'achievements.error.signInNeeded': 'Sign in to load achievements.',
  'achievements.status.unlocked': 'Unlocked',
  'achievements.status.progress': '{current}/{goal}',
  'achievements.hidden.title': 'Hidden achievement',
  'achievements.hidden.description': 'Complete the objective to reveal this achievement.',
  'achievement.trigger.label': 'Unlock method',
  'achievement.trigger.helper':
    'Choose the rule that best matches how a viewer should unlock this achievement.',
  'achievement.trigger.dataLabel': 'Trigger details',
  'achievement.trigger.message.title': 'Messages sent',
  'achievement.trigger.message.description':
    'Unlock after the viewer sends a number of chat messages.',
  'achievement.trigger.message_content.title': 'Message content',
  'achievement.trigger.message_content.description':
    'Unlock when the viewer sends a specific word or phrase in chat.',
  'achievement.trigger.channel_point_cost.title': 'Channel point cost',
  'achievement.trigger.channel_point_cost.description':
    'Unlock after the viewer spends a fixed amount of channel points.',
  'achievement.trigger.redeem_channel_point.title': 'Channel point redemption',
  'achievement.trigger.redeem_channel_point.description':
    'Unlock when the viewer redeems a specific channel point reward.',
  'achievement.trigger.api_caller.title': 'API event',
  'achievement.trigger.api_caller.description':
    'Unlock from an external API call or automated event.',
  'achievement.ownerOnly.creator': EN_OWNER_ONLY_MESSAGE,
  'achievement.ownerOnly.channel': EN_OWNER_ONLY_MESSAGE,
  'achievement.ownerOnly.dashboard': EN_OWNER_ONLY_DASHBOARD_MESSAGE,
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
  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Welcome back, manage your gamification system',
  'dashboard.loading': 'Loading dashboard achievements...',
  'dashboard.stats.totalSuffix': '{count} total',
  'dashboard.stats.activeAchievements': 'Active Achievements',
  'dashboard.stats.channelReady': 'channel-ready',
  'dashboard.stats.publicTemplates': 'Public Templates',
  'dashboard.stats.yourProgress': 'your progress',
  'dashboard.stats.completedAchievements': 'Completed Achievements',
  'dashboard.stats.earned': 'earned',
  'dashboard.stats.achievementXp': 'Achievement XP',
  'dashboard.context.ownerOnly':
    'Achievement management currently supports only the connected user channel. Channel metrics stay hidden for moderator channels, but your achievement progress remains visible.',
  'dashboard.chart.title': 'Unlock Activity',
  'dashboard.chart.description': 'Your achievement unlocks over the last 7 days',
  'dashboard.activity.title': 'Recent Activity',
  'dashboard.activity.description': 'Your latest completed achievements',
  'dashboard.activity.empty': 'Complete an achievement to populate this activity feed.',
  'dashboard.quick.create.title': 'Create Achievement',
  'dashboard.quick.create.description': 'Design a new custom quest',
  'dashboard.quick.marketplace.title': 'Browse Marketplace',
  'dashboard.quick.marketplace.description': 'Discover community achievements',
  'dashboard.quick.management.title': 'Manage Achievements',
  'dashboard.quick.management.description': 'Edit and toggle your quests',
  'marketplace.title': 'Community Marketplace',
  'marketplace.subtitle': 'Discover and add achievements created by the community',
  'marketplace.search': 'Find new quests for your community...',
  'marketplace.categories': 'Categories',
  'marketplace.visibility': 'Visibility',
  'marketplace.sortBy': 'Sort By',
  'marketplace.filters.close': 'Close filters',
  'marketplace.visibility.activeOnly': 'Active only',
  'marketplace.visibility.secretOnly': 'Secret only',
  'marketplace.loading': 'Loading public achievements...',
  'marketplace.empty.title': 'No public achievements found',
  'marketplace.empty.description':
    'Adjust your filters or wait for new marketplace templates to be published.',
  'marketplace.secret': 'Secret',
  'marketplace.visible': 'Visible',
  'marketplace.active': 'Active',
  'marketplace.inactive': 'Inactive',
  'marketplace.useTemplate': 'Use as Template',
  'marketplace.category.all': 'All',
  'marketplace.sort.downloaded': 'Most Downloaded',
  'marketplace.sort.visited': 'Most Visited',
  'marketplace.sort.reward': 'Highest Reward',
  'marketplace.sort.newest': 'Newest Available',
  'profile.titleFallback': 'Profile',
  'profile.level': 'Level {level}',
  'profile.xpProgress': '{currentXp} / {nextLevelXp} XP',
  'profile.untilNextLevel': '{xp} XP until next level.',
  'profile.totalWatchTime': 'Total Watch Time',
  'profile.achievementsUnlocked': 'Achievements Unlocked',
  'profile.achievementXp': 'Achievement XP',
  'profile.section.badges': 'Achievement Badges',
  'profile.loading': 'Loading achievement progress...',
  'profile.empty': 'No profile achievements found yet.',
  'profile.unlocked': 'Unlocked',
  'profile.leaderboard': 'Leaderboard',
  'profile.leaderboardDescription':
    'Account ranking by level and XP. A global multi-account leaderboard will need a dedicated backend route.',
  'profile.leaderboardAction': 'Global ranking coming soon',
  'profile.leaderboardPending': 'Waiting for global leaderboard',
  'profile.leaderboardActivity': 'Your latest completed achievements',
  'profile.leaderboardActivityEmpty': 'Complete an achievement to populate this activity feed.',
  'overlay.title': 'Twitch Panel',
  'overlay.subtitle.channel': 'Live panel for {channel}',
  'overlay.subtitle.connected': 'Live panel for the connected channel',
  'overlay.liveBadge': 'Live panel',
  'overlay.metric.achievements': 'Achievements',
  'overlay.metric.hidden': 'Hidden',
  'overlay.metric.xp': 'Achievement XP',
  'overlay.metric.rank': 'Channel rank',
  'overlay.status.live': 'Live',
  'overlay.loading': 'Loading viewer achievements...',
  'overlay.empty': 'No achievements are available for this panel yet.',
  'overlay.section.viewerAchievements': 'Viewer Achievements',
  'overlay.section.viewerDescription':
    'Secret achievements stay hidden behind a question mark until they are unlocked.',
  'overlay.totalSuffix': '{count} total',
  'overlay.leaderboard': 'Leaderboard',
  'overlay.leaderboardDescription':
    'Ranked from the achievements currently available in the panel.',
  'overlay.hiddenFallback': 'Hidden achievement',
  'overlay.hiddenDescription': 'Complete the objective to reveal this achievement.',
  'overlay.public.badge': 'Public Twitch Panel',
  'overlay.public.title': 'Public panel link',
  'overlay.public.subtitle': 'Share this URL in a Twitch panel below your live stream.',
  'overlay.public.copyHint': 'Copy the public link',
  'overlay.public.linkSection': 'Public URL',
  'overlay.public.linkDescription':
    'Paste this link into a Twitch panel to display the public achievement board.',
  'overlay.public.copy': 'Copy link',
  'overlay.public.copied': 'Link copied',
  'overlay.public.empty': 'No public achievements are available for this channel yet.',
  'overlay.public.achievements': 'Channel Achievements',
  'overlay.public.achievementsDescription':
    'Secret achievements are hidden behind a question mark until they are published.',
  'overlay.public.howToTitle': 'How to add it to Twitch',
  'overlay.public.howToDescription':
    'Use the link below as a Twitch panel URL, then position it under your live player.',
  'overlay.public.step1': '1. Open your Twitch channel settings.',
  'overlay.public.step2': '2. Add a custom panel or iframe panel.',
  'overlay.public.step3': '3. Paste the public panel URL and save it.',
  'overlay.public.note':
    'This public panel currently shows the channel achievement board. Viewer-specific progress can be added later.',
  'overlay.viewer.title': 'Viewer Progress',
  'overlay.viewer.description':
    'When the viewer identity is available, the panel can show personal progress for the connected Twitch user.',
  'overlay.viewer.hint':
    'This browser panel needs a viewer id or Twitch extension context to personalize progress.',
  'overlay.viewer.empty': 'No viewer progress is available yet.',
}

const FR_TRANSLATION_OVERRIDES: Partial<TranslationMap> = {
  'app.loading': 'Chargement...',
  'common.settings': 'Paramètres',
  'common.signOut': 'Déconnexion',
  'common.darkMode': 'Mode sombre',
  'common.lightMode': 'Mode clair',
  'language.label': 'Langue',
  'language.english': 'Anglais',
  'language.french': 'Français',
  'language.shortEnglish': 'EN',
  'language.shortFrench': 'FR',
  'language.switchToEnglish': 'Passer à l’anglais',
  'language.switchToFrench': 'Passer au français',
  'channel.owner': 'Propriétaire',
  'channel.moderator': 'Modérateur',
  'channel.manageChannels': 'Gérer les chaînes',
  'channel.closeMenu': 'Fermer le menu',
  'channel.addChannel': 'Ajouter une chaîne',
  'channel.followers': '{count} abonnés',
  'nav.dashboard': 'Tableau de bord',
  'nav.creator': 'Créer un succès',
  'nav.management': 'Gérer les succès',
  'nav.profile': 'Profil utilisateur',
  'nav.overlay': 'Panneau Twitch',
  'achievements.error.invalidRequest': 'La requête sur les succès est invalide.',
  'achievements.error.noProgress':
    'Aucune progression de succès n’a été trouvée pour cette chaîne.',
  'achievements.error.serviceUnavailable': 'Le service de succès est actuellement indisponible.',
  'achievements.error.loadFailed': 'Impossible de charger les succès.',
  'achievements.error.signInNeeded': 'Connecte-toi pour charger les succès.',
  'achievements.status.unlocked': 'Débloqué',
  'achievements.status.progress': '{current}/{goal}',
  'achievements.hidden.title': 'Succès caché',
  'achievements.hidden.description': 'Complète l’objectif pour révéler ce succès.',
  'achievement.trigger.label': 'Méthode de déblocage',
  'achievement.trigger.helper':
    'Choisis la règle qui correspond le mieux à la manière dont le viewer débloque ce succès.',
  'achievement.trigger.dataLabel': 'Détails du déclencheur',
  'achievement.trigger.message.title': 'Messages envoyés',
  'achievement.trigger.message.description':
    'Débloqué après qu’un viewer a envoyé un certain nombre de messages dans le chat.',
  'achievement.trigger.message_content.title': 'Contenu du message',
  'achievement.trigger.message_content.description':
    'Débloqué quand le viewer envoie un mot ou une phrase précise dans le chat.',
  'achievement.trigger.channel_point_cost.title': 'Coût en points de chaîne',
  'achievement.trigger.channel_point_cost.description':
    'Débloqué après qu’un viewer a dépensé une quantité fixe de points de chaîne.',
  'achievement.trigger.redeem_channel_point.title': 'Récompense points de chaîne',
  'achievement.trigger.redeem_channel_point.description':
    'Débloqué quand le viewer échange une récompense précise de points de chaîne.',
  'achievement.trigger.api_caller.title': 'Événement API',
  'achievement.trigger.api_caller.description':
    'Débloqué via un appel API externe ou un événement automatisé.',
  'achievement.ownerOnly.creator': FR_OWNER_ONLY_MESSAGE,
  'achievement.ownerOnly.channel': FR_OWNER_ONLY_MESSAGE,
  'achievement.ownerOnly.dashboard': FR_OWNER_ONLY_DASHBOARD_MESSAGE,
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
  'dashboard.title': 'Tableau de bord',
  'dashboard.subtitle': 'Bon retour, gérez votre système de gamification',
  'dashboard.loading': 'Chargement des succès du dashboard...',
  'dashboard.stats.totalSuffix': '{count} au total',
  'dashboard.stats.activeAchievements': 'Succès actifs',
  'dashboard.stats.channelReady': 'prêt pour la chaîne',
  'dashboard.stats.publicTemplates': 'Modèles publics',
  'dashboard.stats.yourProgress': 'votre progression',
  'dashboard.stats.completedAchievements': 'Succès terminés',
  'dashboard.stats.earned': 'gagnés',
  'dashboard.stats.achievementXp': 'XP de succès',
  'dashboard.context.ownerOnly':
    'La gestion des succès ne prend actuellement en charge que la chaîne du compte connecté. Les métriques de chaîne restent masquées pour les chaînes modératrices, mais la progression des succès reste visible.',
  'dashboard.chart.title': 'Activité des déblocages',
  'dashboard.chart.description': 'Vos succès débloqués sur les 7 derniers jours',
  'dashboard.activity.title': 'Activité récente',
  'dashboard.activity.description': 'Vos derniers succès terminés',
  'dashboard.activity.empty': 'Terminez un succès pour alimenter ce flux d’activité.',
  'dashboard.quick.create.title': 'Créer un succès',
  'dashboard.quick.create.description': 'Concevez une nouvelle quête personnalisée',
  'dashboard.quick.marketplace.title': 'Parcourir la marketplace',
  'dashboard.quick.marketplace.description': 'Découvrez les succès de la communauté',
  'dashboard.quick.management.title': 'Gérer les succès',
  'dashboard.quick.management.description': 'Modifiez et activez vos quêtes',
  'marketplace.title': 'Marketplace communautaire',
  'marketplace.subtitle': 'Découvrez et ajoutez des succès créés par la communauté',
  'marketplace.search': 'Trouver de nouvelles quêtes pour votre communauté...',
  'marketplace.categories': 'Catégories',
  'marketplace.visibility': 'Visibilité',
  'marketplace.sortBy': 'Trier par',
  'marketplace.filters.close': 'Fermer les filtres',
  'marketplace.visibility.activeOnly': 'Actifs uniquement',
  'marketplace.visibility.secretOnly': 'Secrets uniquement',
  'marketplace.loading': 'Chargement des succès publics...',
  'marketplace.empty.title': 'Aucun succès public trouvé',
  'marketplace.empty.description':
    'Ajustez vos filtres ou attendez la publication de nouveaux modèles.',
  'marketplace.secret': 'Secret',
  'marketplace.visible': 'Visible',
  'marketplace.active': 'Actif',
  'marketplace.inactive': 'Inactif',
  'marketplace.useTemplate': 'Utiliser comme modèle',
  'marketplace.category.all': 'Tous',
  'marketplace.sort.downloaded': 'Les plus téléchargés',
  'marketplace.sort.visited': 'Les plus visités',
  'marketplace.sort.reward': 'Meilleure récompense',
  'marketplace.sort.newest': 'Les plus récents',
  'profile.titleFallback': 'Profil',
  'profile.level': 'Niveau {level}',
  'profile.xpProgress': '{currentXp} / {nextLevelXp} XP',
  'profile.untilNextLevel': '{xp} XP avant le prochain niveau.',
  'profile.totalWatchTime': 'Temps de visionnage total',
  'profile.achievementsUnlocked': 'Succès débloqués',
  'profile.achievementXp': 'XP de succès',
  'profile.section.badges': 'Badges de succès',
  'profile.loading': 'Chargement de la progression des succès...',
  'profile.empty': 'Aucun succès de profil trouvé pour le moment.',
  'profile.unlocked': 'Débloqué',
  'profile.leaderboard': 'Classement',
  'profile.leaderboardDescription':
    'Classement des comptes par niveau et XP. Un leaderboard global multi-comptes nécessitera une route backend dédiée.',
  'profile.leaderboardAction': 'Classement global à venir',
  'profile.leaderboardPending': 'En attente du classement global',
  'profile.leaderboardActivity': 'Vos derniers succès terminés',
  'profile.leaderboardActivityEmpty': 'Terminez un succès pour alimenter ce flux d’activité.',
  'overlay.title': 'Panneau Twitch',
  'overlay.subtitle.channel': 'Panneau en direct pour {channel}',
  'overlay.subtitle.connected': 'Panneau en direct pour la chaîne connectée',
  'overlay.liveBadge': 'Panneau en direct',
  'overlay.metric.achievements': 'Succès',
  'overlay.metric.hidden': 'Cachés',
  'overlay.metric.xp': 'XP de succès',
  'overlay.metric.rank': 'Rang de la chaîne',
  'overlay.status.live': 'En direct',
  'overlay.loading': 'Chargement des succès du viewer...',
  'overlay.empty': 'Aucun succès disponible pour ce panneau pour le moment.',
  'overlay.section.viewerAchievements': 'Succès du viewer',
  'overlay.section.viewerDescription':
    'Les succès secrets restent cachés derrière un point d’interrogation jusqu’à leur déblocage.',
  'overlay.totalSuffix': '{count} au total',
  'overlay.leaderboard': 'Classement',
  'overlay.leaderboardDescription':
    'Classé à partir des succès actuellement disponibles dans le panneau.',
  'overlay.hiddenFallback': 'Succès caché',
  'overlay.hiddenDescription': 'Complète l’objectif pour révéler ce succès.',
  'overlay.public.badge': 'Panneau Twitch public',
  'overlay.public.title': 'Lien public du panneau',
  'overlay.public.subtitle': 'Partage cette URL dans un panneau Twitch sous ton live.',
  'overlay.public.copyHint': 'Copier le lien public',
  'overlay.public.linkSection': 'URL publique',
  'overlay.public.linkDescription':
    'Colle ce lien dans un panneau Twitch pour afficher le tableau des succès.',
  'overlay.public.copy': 'Copier le lien',
  'overlay.public.copied': 'Lien copié',
  'overlay.public.empty': 'Aucun succès public n’est disponible pour cette chaîne pour le moment.',
  'overlay.public.achievements': 'Succès de la chaîne',
  'overlay.public.achievementsDescription':
    'Les succès secrets restent cachés derrière un point d’interrogation jusqu’à leur publication.',
  'overlay.public.howToTitle': 'Comment l’ajouter sur Twitch',
  'overlay.public.howToDescription':
    'Utilise le lien ci-dessous comme URL de panneau Twitch, puis place-le sous le lecteur du live.',
  'overlay.public.step1': '1. Ouvre les paramètres de ta chaîne Twitch.',
  'overlay.public.step2': '2. Ajoute un panneau personnalisé ou un panneau iframe.',
  'overlay.public.step3': '3. Colle l’URL publique du panneau puis enregistre.',
  'overlay.public.note':
    'Ce panneau public affiche pour le moment le tableau des succès de la chaîne. La progression spécifique au viewer pourra être ajoutée ensuite.',
  'overlay.viewer.title': 'Progression du viewer',
  'overlay.viewer.description':
    'Quand l’identité du viewer est disponible, le panneau peut afficher sa progression personnelle.',
  'overlay.viewer.hint':
    'Ce panneau a besoin d’un viewerId ou d’un contexte d’extension Twitch pour personnaliser la progression.',
  'overlay.viewer.empty': 'Aucune progression de viewer n’est disponible pour le moment.',
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
      accumulator
        .replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue))
        .replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
    template
  )
}
