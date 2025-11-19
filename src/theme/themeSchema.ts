import {
  ThemeColors,
  ThemeDefinition,
  ThemeDefinitionInput,
  ThemeMode,
  cloneThemeColors,
  defaultThemeDefinition,
  themeColorKeys,
} from "./themes";

// Canonical theme schema (mirrors Hub's ThemeManager export):
// {
//   "name": string,
//   "light": {
//     "mode": "light",
//     "primary": { "main": string, "dark": string, "light": string },
//     "secondary": { "main": string },
//     "background": { "default": string, "surface": string, "paper": string },
//     "text": { "primary": string, "secondary": string },
//     "border": { "main": string, "subtle": string },
//     "other": { "positive": string, "danger": string, "unread": string }
//   },
//   "dark": { ...same keys with mode "dark"... }
// }
// Each palette can include additional keys, but the above structure is the shared contract.

export interface CanonicalThemePalette {
  mode?: ThemeMode;
  primary?: Partial<Record<"main" | "dark" | "light", string>>;
  secondary?: Partial<Record<"main", string>>;
  background?: Partial<Record<"default" | "surface" | "paper", string>>;
  text?: Partial<Record<"primary" | "secondary", string>>;
  border?: Partial<Record<"main" | "subtle", string>>;
  other?: Partial<Record<"positive" | "danger" | "unread" | "warning", string>>;
  [key: string]: unknown;
}

export interface CanonicalThemeFile {
  id?: string;
  name?: string;
  light?: CanonicalThemePalette;
  dark?: CanonicalThemePalette;
  [key: string]: unknown;
}

export class ThemeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThemeValidationError";
  }
}

const SECONDARY_COLOR = "rgb(69, 173, 255)";

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isColorString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const pickColor = (value: unknown, fallback: string) =>
  isColorString(value) ? value.trim() : fallback;

const sanitizeThemeName = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : "Imported Theme";

const sanitizeId = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const looksLikeCanonicalPalette = (palette: unknown) =>
  isRecord(palette) &&
  (isRecord(palette.primary) ||
    isRecord(palette.background) ||
    isRecord(palette.text) ||
    isRecord(palette.border) ||
    isRecord(palette.other) ||
    typeof palette.mode === "string");

const looksLikeCanonicalTheme = (payload: unknown): payload is CanonicalThemeFile =>
  isRecord(payload) &&
  looksLikeCanonicalPalette(payload.light) &&
  looksLikeCanonicalPalette(payload.dark);

type LegacyThemePayload = {
  id?: string;
  name?: string;
  light: Record<string, unknown>;
  dark: Record<string, unknown>;
};

const looksLikeLegacyTheme = (payload: unknown): payload is LegacyThemePayload =>
  isRecord(payload) &&
  isRecord(payload.light) &&
  isRecord(payload.dark) &&
  themeColorKeys.every(
    (key) => isColorString(payload.light?.[key]) && isColorString(payload.dark?.[key])
  );

const normalizeCanonicalPalette = (
  palette: CanonicalThemePalette | undefined,
  fallback: ThemeColors,
  mode: ThemeMode
): ThemeColors => {
  if (!palette || !isRecord(palette)) {
    throw new ThemeValidationError(`Theme JSON is missing the ${mode} palette.`);
  }

  const background = palette.background ?? {};
  const primary = palette.primary ?? {};
  const text = palette.text ?? {};
  const border = palette.border ?? {};
  const other = palette.other ?? {};

  return {
    background: pickColor(background.default, fallback.background),
    surface: pickColor(background.surface, fallback.surface),
    panel: pickColor(background.paper, fallback.panel),
    primary: pickColor(primary.main, fallback.primary),
    primaryDark: pickColor(primary.dark, fallback.primaryDark),
    primaryLight: pickColor(primary.light, fallback.primaryLight),
    textPrimary: pickColor(text.primary, fallback.textPrimary),
    textSecondary: pickColor(text.secondary, fallback.textSecondary),
    border: pickColor(border.main, fallback.border),
    borderSubtle: pickColor(border.subtle, fallback.borderSubtle),
    success: pickColor(other.positive, fallback.success),
    warning: pickColor(other.warning, fallback.warning),
    error: pickColor(other.danger, fallback.error),
    unread: pickColor(other.unread, fallback.unread),
    mailBackground: fallback.mailBackground,
    videoBackground: fallback.videoBackground,
  };
};

export const normalizeThemeImport = (
  payload: unknown,
  fallback: ThemeDefinition = defaultThemeDefinition
): ThemeDefinitionInput => {
  if (!isRecord(payload)) {
    throw new ThemeValidationError("Theme JSON must be an object.");
  }

  if (looksLikeCanonicalTheme(payload)) {
    return {
      id: sanitizeId(payload.id),
      name: sanitizeThemeName(payload.name),
      light: normalizeCanonicalPalette(payload.light, fallback.light, "light"),
      dark: normalizeCanonicalPalette(payload.dark, fallback.dark, "dark"),
    };
  }

  if (looksLikeLegacyTheme(payload)) {
    return {
      id: sanitizeId(payload.id),
      name: sanitizeThemeName(payload.name),
      light: cloneThemeColors(payload.light as ThemeColors),
      dark: cloneThemeColors(payload.dark as ThemeColors),
    };
  }

  throw new ThemeValidationError(
    "Theme JSON must include 'light' and 'dark' palettes with color definitions."
  );
};

const toCanonicalPalette = (mode: ThemeMode, colors: ThemeColors): CanonicalThemePalette => ({
  mode,
  primary: {
    main: colors.primary,
    dark: colors.primaryDark,
    light: colors.primaryLight,
  },
  secondary: { main: SECONDARY_COLOR },
  background: {
    default: colors.background,
    surface: colors.surface,
    paper: colors.panel,
  },
  text: {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
  },
  border: {
    main: colors.border,
    subtle: colors.borderSubtle,
  },
  other: {
    positive: colors.success,
    danger: colors.error,
    unread: colors.unread,
    warning: colors.warning,
  },
});

type SerializeOptions = {
  includeId?: boolean;
};

export const serializeThemeDefinition = (
  theme: ThemeDefinition,
  options?: SerializeOptions
): CanonicalThemeFile => {
  const payload: CanonicalThemeFile = {
    name: theme.name,
    light: toCanonicalPalette("light", theme.light),
    dark: toCanonicalPalette("dark", theme.dark),
  };

  if (options?.includeId && theme.id) {
    payload.id = theme.id;
  }

  return payload;
};
