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

const MODE_SPECIFIC_VARS: Record<ThemeMode, Record<string, string>> = {
  light: {
    "--Mail-Background": "rgba(49, 51, 56, 1)",
    "--bg-primary": "rgba(31, 32, 35, 1)",
    "--bg-2": "rgba(39, 40, 44, 1)",
    "--videoplayer-bg": "rgba(31, 32, 35, 1)",
    "--text-contrast": "rgba(255, 255, 255, 0.92)",
    "--text-contrast-muted": "rgba(255, 255, 255, 0.5)",
  },
  dark: {
    "--Mail-Background": "rgba(6, 10, 30, 1)",
    "--bg-primary": "rgba(6, 10, 30, 1)",
    "--bg-2": "rgb(39, 40, 44)",
    "--videoplayer-bg": "rgba(31, 32, 35, 1)",
    "--text-contrast": "rgba(255, 255, 255, 0.92)",
    "--text-contrast-muted": "rgba(255, 255, 255, 0.65)",
  },
};

const createCssVars = (mode: ThemeMode, colors: AppTheme["colors"]) => ({
  "--Mail-Background": MODE_SPECIFIC_VARS[mode]["--Mail-Background"],
  "--bg-primary": MODE_SPECIFIC_VARS[mode]["--bg-primary"],
  "--bg-2": MODE_SPECIFIC_VARS[mode]["--bg-2"],
  "--bg-3": mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
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
});

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
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
  },
  get cssVars() {
    return createCssVars(this.mode, this.colors);
  },
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
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
  },
  get cssVars() {
    return createCssVars(this.mode, this.colors);
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
