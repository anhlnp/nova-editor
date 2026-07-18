// Gradient CSS parsing, serialization, and color helpers.

export type GradientType = "linear" | "radial";

export type ColorStop = {
  color: string;
  position: number; // 0–100
};

export type GradientLayer = {
  type: GradientType;
  angle: number;
  radialShape: "ellipse" | "circle";
  stops: ColorStop[];
};

export function splitAtDepthZero(css: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "(") depth++;
    else if (css[i] === ")") depth--;
    else if (css[i] === sep && depth === 0) {
      out.push(css.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(css.slice(start).trim());
  return out.filter(Boolean);
}

export function parseGradientLayer(css: string): GradientLayer | null {
  const isLinear = /^linear-gradient\s*\(/i.test(css);
  const isRadial = /^radial-gradient\s*\(/i.test(css);
  if (!isLinear && !isRadial) return null;

  const inner = css
    .replace(/^(?:linear|radial)-gradient\s*\(\s*/i, "")
    .replace(/\s*\)$/, "");

  const tokens = splitAtDepthZero(inner, ",");

  let angle = 135;
  let radialShape: "ellipse" | "circle" = "ellipse";
  let stopStart = 0;

  if (isLinear) {
    const first = tokens[0] ?? "";
    const degMatch = first.match(/^(-?\d+(?:\.\d+)?)deg$/i);
    if (degMatch) {
      angle = parseFloat(degMatch[1]);
      stopStart = 1;
    } else if (/^to\s/i.test(first)) {
      if (/right/i.test(first) && /top/i.test(first)) angle = 45;
      else if (/right/i.test(first) && /bottom/i.test(first)) angle = 135;
      else if (/left/i.test(first) && /top/i.test(first)) angle = 315;
      else if (/left/i.test(first) && /bottom/i.test(first)) angle = 225;
      else if (/right/i.test(first)) angle = 90;
      else if (/left/i.test(first)) angle = 270;
      else if (/top/i.test(first)) angle = 0;
      else angle = 180;
      stopStart = 1;
    }
  } else {
    const first = tokens[0] ?? "";
    if (/^(circle|ellipse)/i.test(first) || /\bat\b/i.test(first)) {
      radialShape = /circle/i.test(first) ? "circle" : "ellipse";
      stopStart = 1;
    }
  }

  const stops: ColorStop[] = tokens.slice(stopStart).map((token, idx, arr) => {
    const posMatch = token.match(/\s+([\d.]+)%\s*$/);
    const defaultPos = arr.length <= 1 ? 0 : (idx / (arr.length - 1)) * 100;
    let position = defaultPos;
    let colorPart = token.trim();
    if (posMatch) {
      position = parseFloat(posMatch[1]);
      colorPart = token.slice(0, token.length - posMatch[0].length).trim();
    }
    return { color: colorPart || "#ffffff", position };
  });

  if (stops.length < 2) {
    return {
      type: isLinear ? "linear" : "radial",
      angle,
      radialShape,
      stops: [{ color: "#000000", position: 0 }, { color: "#ffffff", position: 100 }],
    };
  }

  return { type: isLinear ? "linear" : "radial", angle, radialShape, stops };
}

export function extractGradients(css: string): string[] {
  if (!css || css === "none") return [];
  return splitAtDepthZero(css, ",")
    .filter(s => /^(?:linear|radial)-gradient\s*\(/i.test(s));
}

export function serializeGradient(g: GradientLayer): string {
  const stops = g.stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(s => `${s.color} ${Math.round(s.position)}%`)
    .join(", ");
  if (g.type === "linear") return `linear-gradient(${g.angle}deg, ${stops})`;
  return `radial-gradient(${g.radialShape} at center, ${stops})`;
}

export function colorToHex(css: string): string {
  if (/^#[0-9a-f]{3,8}$/i.test(css)) {
    if (css.length === 4)
      return "#" + css.slice(1).split("").map(c => c + c).join("");
    return css.slice(0, 7);
  }
  const m = css.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (m) return "#" + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, "0")).join("");
  return "#000000";
}
