import { Platform, type ViewStyle } from 'react-native';

/** Plus Jakarta Sans, loaded in src/app/_layout.tsx. One family per weight (required on Android). */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  /** Editorial accent (Instrument Serif italic) for a word or two in headlines. */
  serif: 'InstrumentSerif_400Regular_Italic',
} as const;

export const colors = {
  // Light app surfaces
  background: '#F3F5F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F9FB',
  border: '#E5E9F0',
  borderStrong: '#CDD5E0',
  text: '#0B1220',
  textMuted: '#556070',
  textSubtle: '#8A94A6',

  // Brand
  primary: '#059669',
  primaryHover: '#047857',
  primarySoft: '#E6F6EF',
  mint: '#6EE7B7',
  teal: '#2DD4BF',
  violet: '#8B5CF6',

  // Dark brand surfaces (login, hero)
  ink: '#060A13',
  ink2: '#0B1322',
  inkBorder: 'rgba(255,255,255,0.10)',
  inkText: '#F8FAFC',
  inkMuted: 'rgba(226,232,240,0.68)',
  inkSubtle: 'rgba(226,232,240,0.45)',
  glass: 'rgba(255,255,255,0.055)',

  // Status
  danger: '#E11D48',
  dangerSoft: '#FFF1F3',
  dangerBorder: '#FECDD6',
  success: '#059669',
  successSoft: '#E6F6EF',
  warning: '#B45309',
  warningSoft: '#FFF7E6',
  admin: '#7C3AED',
  adminSoft: '#F3EEFF',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const font = {
  display: { fontFamily: fonts.extrabold, fontSize: 52, lineHeight: 58, letterSpacing: -1.6 },
  h1: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  smallMedium: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  smallBold: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
};

export const shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  lifted: {
    shadowColor: '#020617',
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
    elevation: 12,
  },
} as const;

/** Frosted-glass blur on web; plain translucent fill on native. */
export const glassBlur: ViewStyle =
  Platform.OS === 'web' ? ({ backdropFilter: 'blur(18px)' } as unknown as ViewStyle) : {};

/** Breakpoints used with useWindowDimensions(). */
export const breakpoints = { tablet: 768, desktop: 1024 } as const;

export const useNativeDriver = Platform.OS !== 'web';
