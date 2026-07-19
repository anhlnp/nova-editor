/**
 * SOLID Interface definitions for Nova Builder I18n System.
 * Follows Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP).
 */

export type Locale = "en" | "vi";

export interface I18nNavDictionary {
  features: string;
  templates: string;
  tryDemo: string;
  pricing: string;
  docs: string;
  login: string;
  signup: string;
  openBuilder: string;
  projects: string;
  signOut: string;
}

export interface I18nAuthDictionary {
  signInTitle: string;
  signUpTitle: string;
  emailLabel: string;
  passwordLabel: string;
  continueBtn: string;
  signInWithEmail: string;
  termsNotice: string;
  continueWithGoogle: string;
  continueWithGithub: string;
  back: string;
  allMethodsGiveSameAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  forgotPassword: string;
  forgotTitle: string;
  forgotSubtitle: string;
  forgotSubmit: string;
  forgotSentTitle: string;
  forgotSentBody: string;
  resetTitle: string;
  resetSubtitle: string;
  newPasswordLabel: string;
  resetSubmit: string;
  resetSuccessTitle: string;
  resetSuccessBody: string;
  backToLogin: string;
  orSignInWithEmail: string;
  orSignUpWithEmail: string;
  nameOptionalLabel: string;
  namePlaceholder: string;
  passwordMinLabel: string;
  passwordMinPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  createAccount: string;
  passwordsNoMatch: string;
  passwordTooShort: string;
  registrationFailed: string;
  registrationSuccess: string;
  verifyingEmail: string;
  emailVerifiedTitle: string;
  emailVerifiedBody: string;
  verifyFailedTitle: string;
  continueToProjects: string;
}

export interface I18nCommonDictionary {
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  loading: string;
  saved: string;
  error: string;
}

export interface I18nBuilderDictionary {
  // Sync-status chip (M2 patch autosave)
  syncSaved: string;
  syncSaving: string;
  syncRecovering: string;
  syncError: string;
  syncConflict: string;
  syncConflictReload: string;
  canvas: string;
  navigator: string;
  style: string;
  props: string;
  settings: string;
  tokens: string;
  interact: string;
  data: string;
  cms: string;
  seo: string;
  cookie: string;
  exportHtml: string;
  exportReact: string;
  export: string;
  deploy: string;
  exportProject: string;
  importProject: string;
  publish: string;
  preview: string;
  exitPreview: string;
  save: string;
  saving: string;
  generate: string;
  copied: string;
  demoNotice: string;
  signUpFree: string;
  tools: string;
  aiContentFill: string;
  accessibility: string;
  performance: string;
  history: string;
  backToMySites: string;
  copyTooltip: string;
  pasteTooltip: string;
  duplicateTooltip: string;
  deleteTooltip: string;
  manageBreakpoints: string;
  components: string;
  symbols: string;
  pages: string;
  assets: string;
  cssVars: string;
  customCss: string;
  templates: string;
  comments: string;
  activity: string;
  noInstancesOnPage: string;
  noPageSelected: string;
  searchComponents: string;
  noComponentsRegistered: string;
  noComponentMatches: string;
  cascadeLocal: string;
  cascadeToken: string;
  cascadePreset: string;
  cascadeDefault: string;
  breakpointMinWidth: string;
  breakpointCondition: string;
  breakpointMigrateTitle: string;
  breakpointMigrateDesc: string;
  formatCommitHint: string;
  // M10 — content mode / guides / css preview
  gridGuides: string;
  cssPreview: string;
  safeModeTitle: string;
  safeModeBody: string;
  safeModeAction: string;
  // M13 — dashboard long tail
  cloneProject: string;
  cloneProjectSuccess: string;
  searchSites: string;
  notifications: string;
  noNotifications: string;
  shareTokens: string;
  shareTokensCopied: string;
  // M4 — data binding
  bindProp: string;
  bindBound: string;
  bindRemove: string;
  bindAdvanced: string;
  bindPickVariable: string;
  bindNoVariables: string;
  bindExpressionPlaceholder: string;
  bindUsageCount: string;
  // M5 — resources
  resourceLoad: string;
  // Data binding panel
  dbVariables: string;
  dbNoVariables: string;
  dbResources: string;
  dbNoResources: string;
  dbAddResource: string;
  dbNamePlaceholder: string;
  dbResourceNamePlaceholder: string;
  // M11 — marketplace / protocol bundle
  mktBuiltInTemplates: string;
  mktCommunity: string;
  mktInstall: string;
  mktInstalled: string;
  mktPublishPage: string;
  mktPublished: string;
  mktPublishName: string;
  mktPublishDesc: string;
  mktPublishCta: string;
  mktExport: string;
  mktImport: string;
  mktImportFailed: string;
  mktEmpty: string;
  mktSearch: string;
  mktInstalls: string;
}

export interface I18nSettingsDictionary {
  languageTitle: string;
  languageDesc: string;
  autoDetectIpLabel: string;
  autoDetectIpDesc: string;
  englishLabel: string;
  englishSublabel: string;
  vietnameseLabel: string;
  vietnameseSublabel: string;
  displayLanguage: string;
  backToProjects: string;
}

export interface I18nLegalSection {
  heading: string;
  body: string;
}

export interface I18nLegalDictionary {
  termsTitle: string;
  privacyTitle: string;
  lastUpdated: string;
  authoritativeNote: string;
  terms: I18nLegalSection[];
  privacy: I18nLegalSection[];
}

export interface I18nLandingExample {
  icon: string;
  label: string;
  prompt: string;
}

export interface I18nLandingFeature {
  icon: string;
  title: string;
  body: string;
}

export interface I18nLandingDictionary {
  badge: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  promptSrLabel: string;
  promptPlaceholder: string;
  pressEnter: string;
  startBuildingFree: string;
  building: string;
  tryLabel: string;
  examples: I18nLandingExample[];
  trustBadges: string[];
  features: I18nLandingFeature[];
  ctaTitle: string;
  ctaSubtitle: string;
  getStartedFree: string;
  tryDemo: string;
  simplifyDesignLead: string;
  simplifyDesignAccent: string;
  buildEverythingLead: string;
  buildEverythingAccent: string;
  buildEverythingDesc: string;
  deployAnythingLead: string;
  deployAnythingAccent: string;
  deployAnythingDesc: string;
  growProductTitle: string;
  growProductDesc: string;
  testimonialsTitle: string;
  testimonials: { name: string; quote: string; }[];
  newsEyebrow: string;
  newsTitle: string;
}

export interface I18nFaqItem {
  q: string;
  a: string;
}

export interface I18nPlanCopy {
  label: string;
  features: string[];
  cta: string;
}

export interface I18nPricingDictionary {
  title: string;
  subtitle: string;
  mostPopular: string;
  faqTitle: string;
  faq: I18nFaqItem[];
  // Localized plan-card copy keyed by tier. Price stays single-sourced in plans.ts.
  planCopy: Record<string, I18nPlanCopy>;
}

export interface I18nMetaDictionary {
  title: string;
  description: string;
}

export interface I18nWelcomeStep {
  title: string;
  body: string;
}

export interface I18nWelcomeDictionary {
  title: string;
  subtitle: string;
  tryDemo: string;
  dismiss: string;
  steps: I18nWelcomeStep[];
}

// Editor command labels (M1 command registry — shared by shortcuts, ⌘K, menus)
export interface I18nCommandsDictionary {
  undo: string;
  redo: string;
  copy: string;
  paste: string;
  duplicate: string;
  delete: string;
  wrapInBox: string;
  openAI: string;
  commandPalette: string;
  insertPrefix: string;
  cut: string;
  selectParent: string;
  rename: string;
}

export interface I18nCoachmarkItem {
  title: string;
  body: string;
}

export interface I18nCoachmarksDictionary {
  generate: I18nCoachmarkItem;
  canvas: I18nCoachmarkItem;
  publish: I18nCoachmarkItem;
  skip: string;
  next: string;
  done: string;
}

export interface I18nPanelsDictionary {
  analyticsTitle: string;
  submissionsTitle: string;
  billingTitle: string;
  brandingTitle: string;
  domainsTitle: string;
  notificationsTitle: string;
  subscriptionTitle: string;
  teamsTitle: string;
  apiKeysTitle: string;
  noSubmissions: string;
  noAssets: string;
  noSymbols: string;
  noVars: string;
  noComments: string;
  uploadBtn: string;
  saveBtn: string;
  addVariable: string;
  useTemplate: string;
  applied: string;
  loading: string;
}

export interface I18nDictionary {
  nav: I18nNavDictionary;
  auth: I18nAuthDictionary;
  common: I18nCommonDictionary;
  builder: I18nBuilderDictionary;
  commands: I18nCommandsDictionary;
  settings: I18nSettingsDictionary;
  legal: I18nLegalDictionary;
  landing: I18nLandingDictionary;
  pricing: I18nPricingDictionary;
  meta: I18nMetaDictionary;
  welcome: I18nWelcomeDictionary;
  coachmarks: I18nCoachmarksDictionary;
  panels: I18nPanelsDictionary;
}

export interface ILanguageDetector {
  detectLocaleFromCountry(countryCode?: string | null): Locale;
  getStoredLocale(): Locale | null;
  getStoredAutoDetectPref(): boolean;
  storePreferences(locale: Locale, autoDetect: boolean): void;
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  autoDetectByIp: boolean;
  setAutoDetectByIp: (enabled: boolean) => void;
  t: I18nDictionary;
  isLoadingIp: boolean;
}
