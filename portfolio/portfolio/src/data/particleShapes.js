/**
 * Particle shape definitions.
 * Each shape is an array of {x, y} normalized to roughly −1…1.
 * Scaled by SHAPE_SCALE and centered on the cursor in AmbientBackground.
 * All shapes have exactly N = 32 points sampled along their perimeter.
 */

const N = 32;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Evenly sample N points along a closed polygon defined by vertices. */
function samplePolygon(vertices, n = N) {
  const segs = vertices.map((v, i) => {
    const next = vertices[(i + 1) % vertices.length];
    return { x0: v.x, y0: v.y, dx: next.x - v.x, dy: next.y - v.y, len: Math.hypot(next.x - v.x, next.y - v.y) };
  });
  const total = segs.reduce((s, seg) => s + seg.len, 0);
  const step = total / n;
  const pts = [];
  let segI = 0, dist = 0;
  for (let k = 0; k < n; k++) {
    const target = k * step;
    while (dist + segs[segI].len < target && segI < segs.length - 1) {
      dist += segs[segI].len;
      segI++;
    }
    const t = segs[segI].len > 0 ? (target - dist) / segs[segI].len : 0;
    pts.push({ x: segs[segI].x0 + segs[segI].dx * t, y: segs[segI].y0 + segs[segI].dy * t });
  }
  return pts;
}

/** Sample N points from a parametric curve f(t), t ∈ [0, 1). */
function sampleCurve(f, n = N) {
  return Array.from({ length: n }, (_, i) => f(i / n));
}

/** Build a regular N-pointed star or polygon. */
function regularStar(outerR, innerR, points, n = N) {
  const verts = Array.from({ length: points * 2 }, (_, i) => {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  });
  return samplePolygon(verts, n);
}

/** Build a regular convex polygon with k sides. */
function regularPoly(k, n = N) {
  const verts = Array.from({ length: k }, (_, i) => {
    const a = (i / k) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(a), y: Math.sin(a) };
  });
  return samplePolygon(verts, n);
}

// ─── Original 12 shapes ───────────────────────────────────────────────────────

// 1. Circle
const circle = sampleCurve((t) => {
  const a = t * Math.PI * 2;
  return { x: Math.cos(a), y: Math.sin(a) };
});

// 2. Five-pointed star
const star5 = regularStar(1, 0.42, 5);

// 3. Heart (parametric)
const heart = sampleCurve((t) => {
  const a = t * Math.PI * 2;
  const rx = 16 * Math.pow(Math.sin(a), 3);
  const ry = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
  return { x: rx / 17, y: ry / 17 };
});

// 4. Square
const square = regularPoly(4);

// 5. Equilateral Triangle
const triangle = regularPoly(3);

// 6. Diamond (tall rhombus)
const diamond = samplePolygon([
  { x:  0,    y: -1.2 },
  { x:  0.75, y:  0   },
  { x:  0,    y:  1.2 },
  { x: -0.75, y:  0   },
]);

// 7. Hexagon
const hexagon = regularPoly(6);

// 8. Cross / Plus
const cross = samplePolygon([
  { x: -0.3, y: -1   }, { x:  0.3, y: -1   },
  { x:  0.3, y: -0.3 }, { x:  1,   y: -0.3 },
  { x:  1,   y:  0.3 }, { x:  0.3, y:  0.3 },
  { x:  0.3, y:  1   }, { x: -0.3, y:  1   },
  { x: -0.3, y:  0.3 }, { x: -1,   y:  0.3 },
  { x: -1,   y: -0.3 }, { x: -0.3, y: -0.3 },
]);

// 9. Arrow (→)
const arrow = samplePolygon([
  { x: -1,   y: -0.28 },
  { x:  0.2, y: -0.28 },
  { x:  0.2, y: -0.72 },
  { x:  1,   y:  0    },
  { x:  0.2, y:  0.72 },
  { x:  0.2, y:  0.28 },
  { x: -1,   y:  0.28 },
]);

// 10. Infinity / Lemniscate
const infinity = sampleCurve((t) => {
  const a = t * Math.PI * 2;
  const d = 1 + Math.sin(a) * Math.sin(a);
  return { x: (Math.cos(a) / d) * 1.1, y: (Math.sin(a) * Math.cos(a) / d) * 1.1 };
});

// 11. Spiral (2-turn Archimedean)
const spiral = sampleCurve((t) => {
  const a = t * Math.PI * 4;
  const r = 0.15 + t * 0.85;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
});

// 12. Zigzag wave (closed)
const zigzag = (() => {
  const peaks = 5;
  const verts = [];
  for (let i = 0; i <= peaks * 2; i++) {
    const x = (i / (peaks * 2)) * 2 - 1;
    const y = i % 2 === 0 ? -0.55 : 0.55;
    verts.push({ x, y });
  }
  verts.push({ x: 1, y: 0.55 }, { x: -1, y: 0.55 });
  return samplePolygon(verts);
})();

// ─── Additional 8 shapes ─────────────────────────────────────────────────────

// 13. Pentagon
const pentagon = regularPoly(5);

// 14. Octagon
const octagon = regularPoly(8);

// 15. Six-pointed star (Star of David)
const star6 = regularStar(1, 0.5, 6);

// 16. Eight-pointed star
const star8 = regularStar(1, 0.42, 8);

// 17. Three-pointed star (sharp/aggressive)
const star3 = regularStar(1, 0.25, 3);

// 18. Four-petal flower (rose curve r = |cos(2θ)|)
const flower4 = sampleCurve((t) => {
  const a = t * Math.PI * 2;
  const r = Math.abs(Math.cos(2 * a));
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
});

// 19. Lissajous figure-8 (x = cos(t), y = sin(2t))
const lissajous = sampleCurve((t) => {
  const a = t * Math.PI * 2;
  return { x: Math.cos(a), y: Math.sin(2 * a) * 0.55 };
});

// 20. Pac-man (open circle with mouth wedge on the right)
const pacman = sampleCurve((t) => {
  const MOUTH = Math.PI / 4; // 45° half-angle = 90° total mouth
  const arcSpan = Math.PI * 2 - MOUTH * 2;
  // Fractions: arc 82%, line-in 9%, line-out 9%
  if (t < 0.82) {
    const a = MOUTH + (t / 0.82) * arcSpan;
    return { x: Math.cos(a), y: Math.sin(a) };
  } else if (t < 0.91) {
    const r = 1 - (t - 0.82) / 0.09;
    const a = MOUTH + arcSpan; // = 2π - MOUTH (bottom of mouth)
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  } else {
    const r = (t - 0.91) / 0.09;
    return { x: Math.cos(MOUTH) * r, y: Math.sin(MOUTH) * r };
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────
export const shapes = [
  circle,
  star5,
  heart,
  square,
  triangle,
  diamond,
  hexagon,
  cross,
  arrow,
  infinity,
  spiral,
  zigzag,
  pentagon,
  octagon,
  star6,
  star8,
  star3,
  flower4,
  lissajous,
  pacman,
];
