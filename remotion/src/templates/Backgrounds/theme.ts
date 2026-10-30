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
  buttonGlassBackground: string;
  buttonGlassBorder: string;
  trackBackground: string;
  cursorBackground: string;
  cursorGlow: string;
}

export function buildThemeFromHex(hexColor: string): GlassThemeTokens {
  const [r, g, b] = hexToRgb(hexColor);
  const lum = relativeLuminance(r, g, b);
  const isDark = lum >= 0.18;


  const glassBackground = isDark
    ? 'linear-gradient(145deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.06) 40%,rgba(255,255,255,0.10) 70%,rgba(255,255,255,0.04) 100%)'
    : 'linear-gradient(145deg,rgba(255,255,255,0.32) 0%,rgba(255,255,255,0.10) 40%,rgba(255,255,255,0.16) 70%,rgba(255,255,255,0.08) 100%)';

  const glassBorder = isDark
    ? '1px solid rgba(255,255,255,0.30)'
    : '1px solid rgba(255,255,255,0.58)';

  const glassHighlight = isDark
    ? 'inset 0 1.5px 0 0 rgba(255,255,255,0.55),inset 0 -1px 0 0 rgba(0,0,0,0.12),inset 1px 0 0 0 rgba(255,255,255,0.18),inset -1px 0 0 0 rgba(255,255,255,0.06)'
    : 'inset 0 1.5px 0 0 rgba(255,255,255,0.85),inset 0 -1px 0 0 rgba(0,0,0,0.06),inset 1px 0 0 0 rgba(255,255,255,0.38),inset -1px 0 0 0 rgba(255,255,255,0.14)';

  const glassDropShadow = isDark
    ? '0 32px 64px -16px rgba(0,0,0,0.45),0 12px 28px -6px rgba(0,0,0,0.28),0 2px 8px rgba(0,0,0,0.14)'
    : '0 28px 56px -14px rgba(15,23,42,0.22),0 10px 24px -4px rgba(15,23,42,0.12),0 2px 6px rgba(0,0,0,0.06)';

  const buttonGlassBackground = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.30)';
  const buttonGlassBorder = isDark
    ? '1px solid rgba(255,255,255,0.32)'
    : '1px solid rgba(255,255,255,0.62)';

  const secondaryText = 'rgba(' + r + ',' + g + ',' + b + ',' + (isDark ? 0.82 : 0.72) + ')';
  const textShadow = isDark
    ? '0 2px 10px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.30)'
    : '0 1px 4px rgba(0,0,0,0.20)';
  const trackBackground = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)';

  return {
    isDark,
    primaryText: hexColor,
    secondaryText,
    textShadow,
    glassBackground,
    glassBorder,
    glassHighlight,
    glassDropShadow,
    buttonGlassBackground,
    buttonGlassBorder,
    trackBackground,
    cursorBackground: hexColor,
    cursorGlow: '0 0 10px rgba(' + r + ',' + g + ',' + b + ',0.95),0 0 20px rgba(' + r + ',' + g + ',' + b + ',0.65)',
  };
}

export function useAdaptiveTheme(
  _imageName?: string,
  explicitColor?: string
): GlassThemeTokens {
  if (explicitColor && explicitColor.startsWith('#') && explicitColor.length >= 7) {
    return buildThemeFromHex(explicitColor);
  }
  if (explicitColor === 'black') return buildThemeFromHex('#0F172A');
  if (explicitColor === 'white') return buildThemeFromHex('#FFFFFF');
  return buildThemeFromHex('#FFFFFF');
}
