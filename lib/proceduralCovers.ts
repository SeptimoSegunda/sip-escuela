export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function coverSVG(seed: number, palette: [string, string, string]): string {
  const rnd = mulberry32(seed);
  const [bg, a, b] = palette;
  const W = 240,
    H = 360;
  let shapes = "";
  const kind = Math.floor(rnd() * 3);

  if (kind === 0) {
    const cy = H * (0.3 + rnd() * 0.4);
    shapes += `<circle cx="${W * (0.3 + rnd() * 0.4)}" cy="${cy}" r="${70 + rnd() * 50}" fill="${a}" opacity="0.9"/>`;
    shapes += `<rect x="0" y="${H * 0.72}" width="${W}" height="${H * 0.3}" fill="${b}" opacity="0.85"/>`;
  } else if (kind === 1) {
    shapes += `<path d="M0 ${H * 0.15} L${W} ${H * 0.05} L${W} ${H * 0.4} L0 ${H * 0.5} Z" fill="${a}" opacity="0.85"/>`;
    shapes += `<circle cx="${W * 0.75}" cy="${H * 0.78}" r="60" fill="${b}" opacity="0.9"/>`;
  } else {
    for (let i = 0; i < 4; i++) {
      const x = rnd() * W,
        y = rnd() * H,
        r = 20 + rnd() * 40;
      shapes += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 === 0 ? a : b}" opacity="${0.55 + rnd() * 0.35}"/>`;
    }
  }

  shapes += `<line x1="0" y1="${H * (0.55 + rnd() * 0.2)}" x2="${W}" y2="${H * (0.5 + rnd() * 0.25)}" stroke="${a}" stroke-width="2" opacity="0.5"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${bg}"/>${shapes}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
