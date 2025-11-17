import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

const DEFAULT_ACCENT = "#4297e2";
const LOW_CONTRAST_COLORS = ["#232428", "#27282c", "#1d1d1d"];

const getAccentColor = (theme: Theme) => {
  const primary = theme?.palette?.primary?.main?.toLowerCase?.();
  if (!primary || LOW_CONTRAST_COLORS.includes(primary)) {
    return DEFAULT_ACCENT;
  }
  return theme.palette.primary.main;
};

export const getClickableAvatarSx = (
  theme: Theme,
  isInteractive: boolean
): SxProps<Theme> => {
  const base: SxProps<Theme> = {
    cursor: isInteractive ? "pointer" : "default",
    transition: "box-shadow 150ms ease, transform 150ms ease",
  };

  if (!isInteractive) {
    return base;
  }

  const accentColor = getAccentColor(theme);
  const glowColor = alpha(accentColor, 0.9);
  const fillColor = alpha(accentColor, 0.25);

  return {
    ...base,
    boxShadow: `0 0 0 1px ${alpha(accentColor, 0.45)}`,
    "&:hover": {
      boxShadow: `0 0 0 4px ${glowColor}`,
      backgroundColor: fillColor,
      transform: "translateZ(0)",
    },
  };
};
