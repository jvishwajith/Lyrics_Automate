export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}

export function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function resolveIntroTextColor(color: string | undefined): "white" | "black" {
  if (!color || color === "white") return "white";
  if (color === "black") return "black";
  if (color.startsWith("#") && color.length >= 7) {
    const [r, g, b] = hexToRgb(color);
    const lum = relativeLuminance(r, g, b);
    return lum >= 0.18 ? "white" : "black";
  }
  return "white";
}

