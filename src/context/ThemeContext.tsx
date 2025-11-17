import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { AppTheme, ThemeMode, darkTheme, lightTheme } from "../theme/themes";

type ThemeContextValue = {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "qortal-theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  themeMode: "dark",
  setThemeMode: () => {},
  toggleTheme: () => {},
});

const getStoredThemeMode = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return null;
};

const getSystemThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "dark";
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
};

const persistMode = (mode: ThemeMode) => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.set({ themeMode: mode });
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
};

const applyCssVariables = (theme: AppTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  document.body.style.backgroundColor = theme.colors.background;
  document.body.style.color = theme.colors.textPrimary;
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const storedTheme = getStoredThemeMode();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    storedTheme ?? getSystemThemeMode()
  );
  const [hasStoredPreference, setHasStoredPreference] = useState<boolean>(() => storedTheme !== null);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return;
    }
    chrome.storage.local.get(["themeMode"], (result) => {
      const stored = result?.themeMode;
      if (stored === "light" || stored === "dark") {
        setHasStoredPreference(true);
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setHasStoredPreference(true);
    persistMode(mode);
    setThemeModeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setHasStoredPreference(true);
    setThemeModeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      persistMode(next);
      return next;
    });
  }, []);

  const theme = themeMode === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    applyCssVariables(theme);
  }, [theme]);

  useEffect(() => {
    if (hasStoredPreference) {
      return;
    }
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setThemeModeState(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [hasStoredPreference]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme.mode,
          primary: {
            main: theme.colors.primary,
            dark: theme.colors.primaryDark,
            light: theme.colors.primaryLight,
          },
          secondary: {
            main: "rgb(69, 173, 255)",
          },
          background: {
            default: theme.colors.background,
            paper: theme.colors.panel,
          },
          text: {
            primary: theme.colors.textPrimary,
            secondary: theme.colors.textSecondary,
          },
          divider: theme.colors.border,
          success: { main: theme.colors.success },
          warning: { main: theme.colors.warning },
          error: { main: theme.colors.error },
        },
        typography: {
          fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
        },
      }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
