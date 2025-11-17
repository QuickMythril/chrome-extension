import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import {
  AppTheme,
  ThemeDefinition,
  ThemeMode,
  createThemeFromDefinition,
  defaultThemeDefinition,
  normalizeThemeColors,
} from "../theme/themes";

type ThemeDefinitionInput = Omit<ThemeDefinition, "id"> & { id?: string };

type ThemeContextValue = {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  themes: ThemeDefinition[];
  currentThemeId: string;
  selectTheme: (themeId: string) => void;
  saveTheme: (theme: ThemeDefinitionInput) => void;
  deleteTheme: (themeId: string) => void;
};

const STORAGE_KEY = "qortal-theme-mode";
const THEME_SETTINGS_KEY = "qortal-theme-settings";

type StoredThemeSettings = {
  currentThemeId: string;
  themes: ThemeDefinition[];
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: createThemeFromDefinition(defaultThemeDefinition, "dark"),
  themeMode: "dark",
  setThemeMode: () => {},
  toggleTheme: () => {},
  themes: [defaultThemeDefinition],
  currentThemeId: defaultThemeDefinition.id,
  selectTheme: () => {},
  saveTheme: () => {},
  deleteTheme: () => {},
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

const getStoredThemeSettings = (): StoredThemeSettings | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(THEME_SETTINGS_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.currentThemeId === "string" &&
      Array.isArray(parsed.themes)
    ) {
      return parsed as StoredThemeSettings;
    }
  } catch (error) {
    console.error("Failed to parse stored theme settings", error);
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

const persistThemeSettings = (settings: StoredThemeSettings) => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.set({ themePreferences: settings });
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
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

const createThemeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `theme-${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeStoredTheme = (
  theme?: Partial<ThemeDefinition>
): ThemeDefinition | null => {
  if (!theme || typeof theme !== "object") {
    return null;
  }
  if (theme.id === defaultThemeDefinition.id) {
    return defaultThemeDefinition;
  }
  if (typeof theme.id !== "string") {
    return null;
  }
  const name =
    typeof theme.name === "string" && theme.name.trim().length > 0
      ? theme.name.trim()
      : "Custom Theme";
  return {
    id: theme.id,
    name,
    light: normalizeThemeColors(theme.light, defaultThemeDefinition.light),
    dark: normalizeThemeColors(theme.dark, defaultThemeDefinition.dark),
  };
};

const hydrateThemes = (themes?: ThemeDefinition[]): ThemeDefinition[] => {
  const hydrated = Array.isArray(themes)
    ? themes
        .map((theme) => sanitizeStoredTheme(theme))
        .filter((theme): theme is ThemeDefinition => Boolean(theme))
    : [];
  const uniqueThemes = new Map<string, ThemeDefinition>();
  uniqueThemes.set(defaultThemeDefinition.id, defaultThemeDefinition);
  hydrated.forEach((theme) => {
    if (theme.id === defaultThemeDefinition.id) {
      uniqueThemes.set(defaultThemeDefinition.id, defaultThemeDefinition);
      return;
    }
    uniqueThemes.set(theme.id, theme);
  });
  return Array.from(uniqueThemes.values());
};

const ensureDefaultTheme = (themes: ThemeDefinition[]) => {
  const filtered = themes.filter((theme) => theme.id !== defaultThemeDefinition.id);
  return [defaultThemeDefinition, ...filtered];
};

const prepareThemeInput = (theme: ThemeDefinitionInput): ThemeDefinition => {
  if (theme.id === defaultThemeDefinition.id) {
    return defaultThemeDefinition;
  }
  return {
    id: theme.id?.trim() || createThemeId(),
    name: theme.name?.trim() || "Custom Theme",
    light: normalizeThemeColors(theme.light, defaultThemeDefinition.light),
    dark: normalizeThemeColors(theme.dark, defaultThemeDefinition.dark),
  };
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const storedThemeMode = getStoredThemeMode();
  const storedThemeSettings = getStoredThemeSettings();
  const initialThemes = hydrateThemes(storedThemeSettings?.themes);
  const initialThemeId = storedThemeSettings?.currentThemeId;

  const [themes, setThemes] = useState<ThemeDefinition[]>(initialThemes);
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    if (initialThemeId && initialThemes.some((theme) => theme.id === initialThemeId)) {
      return initialThemeId;
    }
    return defaultThemeDefinition.id;
  });
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    storedThemeMode ?? getSystemThemeMode()
  );
  const [hasStoredPreference, setHasStoredPreference] = useState<boolean>(
    () => storedThemeMode !== null
  );

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return;
    }
    chrome.storage.local.get(["themeMode", "themePreferences"], (result) => {
      const stored = result?.themeMode;
      if (stored === "light" || stored === "dark") {
        setHasStoredPreference(true);
        setThemeModeState(stored);
      }
      const storedPreferences = result?.themePreferences as StoredThemeSettings | undefined;
      if (storedPreferences) {
        const hydrated = hydrateThemes(storedPreferences.themes);
        setThemes(hydrated);
        if (
          storedPreferences.currentThemeId &&
          hydrated.some((theme) => theme.id === storedPreferences.currentThemeId)
        ) {
          setCurrentThemeId(storedPreferences.currentThemeId);
        } else {
          setCurrentThemeId(defaultThemeDefinition.id);
        }
      }
    });
  }, []);

  useEffect(() => {
    persistThemeSettings({ currentThemeId, themes });
  }, [currentThemeId, themes]);

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

  const selectTheme = useCallback(
    (themeId: string) => {
      setCurrentThemeId((prev) => {
        if (themes.some((theme) => theme.id === themeId)) {
          return themeId;
        }
        return prev;
      });
    },
    [themes]
  );

  const saveTheme = useCallback((themeInput: ThemeDefinitionInput) => {
    const prepared = prepareThemeInput(themeInput);
    setThemes((prev) => {
      const exists = prev.some((theme) => theme.id === prepared.id);
      if (exists) {
        const updated = prev.map((theme) =>
          theme.id === prepared.id ? prepared : theme
        );
        return ensureDefaultTheme(updated);
      }
      return ensureDefaultTheme([...prev, prepared]);
    });
    setCurrentThemeId(prepared.id);
  }, []);

  const deleteTheme = useCallback((themeId: string) => {
    if (themeId === defaultThemeDefinition.id) {
      return;
    }
    setThemes((prev) => ensureDefaultTheme(prev.filter((theme) => theme.id !== themeId)));
    setCurrentThemeId((prev) =>
      prev === themeId ? defaultThemeDefinition.id : prev
    );
  }, []);

  const activeThemeDefinition = useMemo(() => {
    return themes.find((theme) => theme.id === currentThemeId) || defaultThemeDefinition;
  }, [themes, currentThemeId]);

  const theme = useMemo(
    () => createThemeFromDefinition(activeThemeDefinition, themeMode),
    [activeThemeDefinition, themeMode]
  );

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
          fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        },
      }),
    [theme]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        toggleTheme,
        themes,
        currentThemeId,
        selectTheme,
        saveTheme,
        deleteTheme,
      }}
    >
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
