/**
 * Brand rang generatsiyasi
 * Bitta hex rang asosida to'liq Tailwind palette yaratadi.
 * Ochroq ranglar oq bilan, to'qroqlar qora bilan aralashtiriladi.
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return [83, 74, 183]; // fallback: default purple
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function mixWhite(rgb: [number, number, number], t: number): string {
  const r = Math.round(rgb[0] + (255 - rgb[0]) * t);
  const g = Math.round(rgb[1] + (255 - rgb[1]) * t);
  const b = Math.round(rgb[2] + (255 - rgb[2]) * t);
  return `${r} ${g} ${b}`;
}

function mixBlack(rgb: [number, number, number], t: number): string {
  const r = Math.round(rgb[0] * (1 - t));
  const g = Math.round(rgb[1] * (1 - t));
  const b = Math.round(rgb[2] * (1 - t));
  return `${r} ${g} ${b}`;
}

/** Hex rangdan :root CSS o'zgaruvchilarini yaratadi */
export function generateBrandCssVars(hex: string): string {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb;

  return `
    --brand-50: ${mixWhite(rgb, 0.95)};
    --brand-100: ${mixWhite(rgb, 0.88)};
    --brand-200: ${mixWhite(rgb, 0.75)};
    --brand-400: ${mixWhite(rgb, 0.35)};
    --brand-600: ${r} ${g} ${b};
    --brand-700: ${mixBlack(rgb, 0.14)};
    --brand-800: ${mixBlack(rgb, 0.28)};
    --brand-900: ${mixBlack(rgb, 0.48)};
  `.trim();
}
