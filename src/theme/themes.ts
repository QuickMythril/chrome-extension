export type ThemeMode = "light" | "dark";

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    panel: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    borderSubtle: string;
    success: string;
    warning: string;
    error: string;
    unread: string;
    mailBackground: string;
    videoBackground: string;
  };
  cssVars: Record<string, string>;
}

export type ThemeColors = AppTheme["colors"];

export interface ThemeDefinition {
  id: string;
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

const MODE_SPECIFIC_VARS: Record<ThemeMode, Record<string, string>> = {
  light: {
    "--Mail-Background": "rgba(49, 51, 56, 1)",
    "--bg-primary": "rgba(250, 250, 250, 1)",
    "--bg-2": "rgb(240, 240, 240)",
    "--videoplayer-bg": "rgba(31, 32, 35, 1)",
    "--text-contrast": "rgba(0, 0, 0, 0.87)",
    "--text-contrast-muted": "rgba(0, 0, 0, 0.6)",
  },
  dark: {
    "--Mail-Background": "rgba(6, 10, 30, 1)",
    "--bg-primary": "rgb(49, 51, 56)",
    "--bg-2": "rgb(58, 60, 65)",
    "--videoplayer-bg": "rgba(31, 32, 35, 1)",
    "--text-contrast": "rgb(255, 255, 255)",
    "--text-contrast-muted": "rgb(179, 179, 179)",
  },
};

const createCssVars = (mode: ThemeMode, colors: ThemeColors) => ({
  "--Mail-Background": MODE_SPECIFIC_VARS[mode]["--Mail-Background"],
  "--bg-primary": MODE_SPECIFIC_VARS[mode]["--bg-primary"],
  "--bg-2": MODE_SPECIFIC_VARS[mode]["--bg-2"],
  "--bg-3": colors.borderSubtle,
  "--unread": colors.unread,
  "--danger": colors.error,
  "--apps-circle": colors.surface,
  "--green": colors.success,
  "--text-primary": colors.textPrimary,
  "--text-secondary": colors.textSecondary,
  "--text-contrast": MODE_SPECIFIC_VARS[mode]["--text-contrast"],
  "--text-contrast-muted": MODE_SPECIFIC_VARS[mode]["--text-contrast-muted"],
  "--primary-main": colors.primary,
  "--background-default": colors.background,
  "--background-paper": colors.panel,
  "--background-surface": colors.surface,
  "--videoplayer-bg": MODE_SPECIFIC_VARS[mode]["--videoplayer-bg"],
  "--new-message-text": colors.textPrimary,
  "--color-instance": colors.surface,
  "--color-instance-popover-bg": colors.panel,
  "--50-white": colors.borderSubtle,
  "--gray-2": colors.border,
  "--gray-3": colors.borderSubtle,
  "--code-block-text-color": colors.primary,
  "--sidebar-bg": colors.background,
  "--sidebar-border": colors.borderSubtle,
  "--sidebar-icon-default": colors.textSecondary,
  "--sidebar-icon-active": colors.textPrimary,
  "--chat-list-bg": colors.surface,
  "--chat-list-selected":
    mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
  "--chat-input-bg": colors.surface,
  "--chat-input-border": colors.borderSubtle,
  "--chat-input-placeholder": colors.textSecondary,
});

export const cloneThemeColors = (colors: ThemeColors): ThemeColors => ({
  ...colors,
});

const createThemeObject = (mode: ThemeMode, colors: ThemeColors): AppTheme => {
  const palette = cloneThemeColors(colors);
  return {
    mode,
    colors: palette,
    cssVars: createCssVars(mode, palette),
  };
};

const baseLightColors: ThemeColors = {
  background: "rgba(250, 250, 250, 1)",
  surface: "rgb(240, 240, 240)",
  panel: "rgb(220, 220, 220)",
  primary: "rgba(0, 133, 255, 1)",
  primaryDark: "rgb(113, 198, 212)",
  primaryLight: "rgb(180, 200, 235)",
  textPrimary: "rgba(0, 0, 0, 0.87)",
  textSecondary: "rgba(0, 0, 0, 0.6)",
  border: "rgba(0, 0, 0, 0.12)",
  borderSubtle: "rgba(0, 0, 0, 0.08)",
  success: "rgb(94, 176, 73)",
  warning: "rgb(242, 181, 68)",
  error: "rgb(177, 70, 70)",
  unread: "rgb(66, 151, 226)",
  mailBackground: "rgba(49, 51, 56, 1)",
  videoBackground: "rgba(31, 32, 35, 1)",
};

const baseDarkColors: ThemeColors = {
  background: "rgb(49, 51, 56)",
  surface: "rgb(58, 60, 65)",
  panel: "rgb(77, 80, 85)",
  primary: "rgb(100, 155, 240)",
  primaryDark: "rgb(45, 92, 201)",
  primaryLight: "rgb(130, 185, 255)",
  textPrimary: "rgb(255, 255, 255)",
  textSecondary: "rgb(179, 179, 179)",
  border: "rgba(255, 255, 255, 0.12)",
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  success: "rgb(94, 176, 73)",
  warning: "rgb(242, 181, 68)",
  error: "rgb(177, 70, 70)",
  unread: "rgb(66, 151, 226)",
  mailBackground: "rgba(6, 10, 30, 1)",
  videoBackground: "rgba(31, 32, 35, 1)",
};

export const THEME_COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "panel", label: "Panel" },
  { key: "primary", label: "Primary" },
  { key: "primaryDark", label: "Primary Dark" },
  { key: "primaryLight", label: "Primary Light" },
  { key: "textPrimary", label: "Text Primary" },
  { key: "textSecondary", label: "Text Secondary" },
  { key: "border", label: "Border" },
  { key: "borderSubtle", label: "Border Subtle" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
  { key: "unread", label: "Unread" },
  { key: "mailBackground", label: "Mail Background" },
  { key: "videoBackground", label: "Video Background" },
];

export const themeColorKeys = THEME_COLOR_FIELDS.map((field) => field.key);

export const lightTheme: AppTheme = createThemeObject("light", baseLightColors);
export const darkTheme: AppTheme = createThemeObject("dark", baseDarkColors);

export const defaultThemeDefinition: ThemeDefinition = {
  id: "qortal-default",
  name: "Qortal",
  light: cloneThemeColors(baseLightColors),
  dark: cloneThemeColors(baseDarkColors),
};

export const createThemeFromDefinition = (
  definition: ThemeDefinition,
  mode: ThemeMode
): AppTheme =>
  createThemeObject(mode, mode === "light" ? definition.light : definition.dark);

export const normalizeThemeColors = (
  colors: Partial<ThemeColors> | undefined,
  fallback: ThemeColors
): ThemeColors =>
  themeColorKeys.reduce((acc, key) => {
    acc[key] = colors?.[key] ?? fallback[key];
    return acc;
  }, {} as ThemeColors);

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
