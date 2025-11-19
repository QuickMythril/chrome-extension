import { describe, expect, it } from "vitest";
import {
  CanonicalThemeFile,
  ThemeValidationError,
  normalizeThemeImport,
  serializeThemeDefinition,
} from "../themeSchema";
import { ThemeDefinition, defaultThemeDefinition } from "../themes";

const createCanonicalTheme = (): CanonicalThemeFile => ({
  name: "Hub Export",
  light: {
    mode: "light",
    primary: {
      main: "rgba(0, 133, 255, 1)",
      dark: "rgb(113, 198, 212)",
      light: "rgb(180, 200, 235)",
    },
    secondary: { main: "rgb(69, 173, 255)" },
    background: {
      default: "rgba(250, 250, 250, 1)",
      surface: "rgb(240, 240, 240)",
      paper: "rgb(220, 220, 220)",
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.6)",
    },
    border: {
      main: "rgba(0, 0, 0, 0.12)",
      subtle: "rgba(0, 0, 0, 0.08)",
    },
    other: {
      positive: "rgb(94, 176, 73)",
      danger: "rgb(177, 70, 70)",
      unread: "rgb(66, 151, 226)",
    },
    metadata: { version: 1 },
  },
  dark: {
    mode: "dark",
    primary: {
      main: "rgb(100, 155, 240)",
      dark: "rgb(45, 92, 201)",
      light: "rgb(130, 185, 255)",
    },
    background: {
      default: "rgb(49, 51, 56)",
    },
    text: {
      primary: "rgb(255, 255, 255)",
      secondary: "rgb(179, 179, 179)",
    },
    border: {
      main: "rgba(255, 255, 255, 0.12)",
    },
    other: {
      positive: "rgb(94, 176, 73)",
      danger: "rgb(177, 70, 70)",
      unread: "rgb(66, 151, 226)",
    },
  },
});

const createLegacyTheme = (): ThemeDefinition => ({
  ...defaultThemeDefinition,
});

describe("normalizeThemeImport", () => {
  it("accepts canonical Hub themes", () => {
    const normalized = normalizeThemeImport(createCanonicalTheme());
    expect(normalized.name).toBe("Hub Export");
    expect(normalized.light.primary).toBe("rgba(0, 133, 255, 1)");
    expect(normalized.dark.textPrimary).toBe("rgb(255, 255, 255)");
    // warning is not provided by Hub, so we should default to the base palette
    expect(normalized.light.warning).toBe(defaultThemeDefinition.light.warning);
  });

  it("accepts legacy Extension themes", () => {
    const legacy = createLegacyTheme();
    const normalized = normalizeThemeImport(legacy);
    expect(normalized.light.primary).toBe(legacy.light.primary);
    expect(normalized.dark.background).toBe(legacy.dark.background);
  });

  it("throws a descriptive error when the palette is missing", () => {
    expect(() =>
      normalizeThemeImport({
        name: "Broken",
        light: null,
        dark: null,
      })
    ).toThrow(ThemeValidationError);
  });

  it("fills in missing color keys with defaults", () => {
    const canonical = createCanonicalTheme();
    canonical.light = {
      mode: "light",
      background: { default: "#fff" },
    };
    const normalized = normalizeThemeImport(canonical);
    expect(normalized.light.background).toBe("#fff");
    expect(normalized.light.panel).toBe(defaultThemeDefinition.light.panel);
  });
});

describe("serializeThemeDefinition", () => {
  it("exports canonical schema without ids by default", () => {
    const canonical = serializeThemeDefinition(defaultThemeDefinition);
    expect(canonical.name).toBe(defaultThemeDefinition.name);
    expect(canonical.light?.mode).toBe("light");
    expect(canonical.dark?.primary?.main).toBe(defaultThemeDefinition.dark.primary);
    expect(canonical).not.toHaveProperty("id");
  });
});
