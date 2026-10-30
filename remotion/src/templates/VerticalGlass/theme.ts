
import { hexToRgb, relativeLuminance } from "../../shared/utils";

export interface GlassThemeTokens {
  isDark: boolean;
  primaryText: string;
  secondaryText: string;
  textShadow: string;
  glassBackground: string;
  glassBorder: string;
  glassHighlight: string;
  glassDropShadow: string;
  trackBackground: string;
  cursorBackground: string;
  cursorGlow: string;
  playButtonBg: string;
  playButtonShadow: string;
}

export function buildThemeFromHex(hexColor: string): GlassThemeTokens {
  const [r, g, b] = hexToRgb(hexColor);
  const lum = relativeLuminance(r, g, b);
  const isDark = lum >= 0.18;


  const glassBackground = isDark
    ? "linear-gradient(160deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.14) 100%)"
    : "linear-gradient(160deg,rgba(255,255,255,0.38) 0%,rgba(255,255,255,0.14) 50%,rgba(255,255,255,0.22) 100%)";

  const glassBorder = isDark
    ? "1px solid rgba(255,255,255,0.35)"
    : "1px solid rgba(255,255,255,0.62)";

  const glassHighlight = isDark
    ? "inset 0 1.5px 0 0 rgba(255,255,255,0.60),inset 0 -1px 0 0 rgba(0,0,0,0.10),inset 1px 0 0 0 rgba(255,255,255,0.20),inset -1px 0 0 0 rgba(255,255,255,0.08)"
    : "inset 0 1.5px 0 0 rgba(255,255,255,0.90),inset 0 -1px 0 0 rgba(0,0,0,0.04),inset 1px 0 0 0 rgba(255,255,255,0.45),inset -1px 0 0 0 rgba(255,255,255,0.18)";

  const glassDropShadow = isDark
    ? "0 28px 60px -12px rgba(0,0,0,0.42),0 10px 24px -4px rgba(0,0,0,0.24),0 2px 6px rgba(0,0,0,0.12)"
    : "0 24px 52px -12px rgba(15,23,42,0.20),0 8px 20px -4px rgba(15,23,42,0.10),0 2px 6px rgba(0,0,0,0.05)";

  const secondaryText =
    "rgba(" + r + "," + g + "," + b + "," + (isDark ? 0.82 : 0.72) + ")";
  const textShadow = isDark
    ? "0 2px 10px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.30)"
    : "0 1px 4px rgba(0,0,0,0.20)";
  const trackBackground = isDark
    ? "rgba(255,255,255,0.22)"
    : "rgba(0,0,0,0.16)";

  const playButtonBg = isDark
    ? "rgba(0,0,0,0.72)"
    : "rgba(20,20,20,0.80)";
  const playButtonShadow = isDark
    ? "0 4px 18px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.30)"
    : "0 4px 18px rgba(0,0,0,0.38), 0 2px 6px rgba(0,0,0,0.18)";

  return {
    isDark,
    primaryText: hexColor,
    secondaryText,
    textShadow,
    glassBackground,
    glassBorder,
    glassHighlight,
    glassDropShadow,
    trackBackground,
    cursorBackground: hexColor,
    cursorGlow:
      "0 0 10px rgba(" +
      r +
      "," +
      g +
      "," +
      b +
      ",0.95),0 0 20px rgba(" +
      r +
      "," +
      g +
      "," +
      b +
      ",0.65)",
    playButtonBg,
    playButtonShadow,
  };
}

export function useVerticalGlassTheme(
  _imageName?: string,
  explicitColor?: string
): GlassThemeTokens {
  if (
    explicitColor &&
    explicitColor.startsWith("#") &&
    explicitColor.length >= 7
  ) {
    return buildThemeFromHex(explicitColor);
  }
  if (explicitColor === "black") return buildThemeFromHex("#0F172A");
  if (explicitColor === "white") return buildThemeFromHex("#FFFFFF");
  return buildThemeFromHex("#FFFFFF");
}
