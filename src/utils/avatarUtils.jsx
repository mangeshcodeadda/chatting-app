/**
 * avatarUtils.js
 * Generates deterministic SVG geometric avatars (GitHub-identicon style).
 * Pure functions — no side effects, no randomness.
 */

// 12 carefully chosen pastel-to-vivid pairs [bg, shape color]
const PALETTE = [
  ["#FDE8F0", "#E8609A"],
  ["#E8F4FD", "#3B9EDB"],
  ["#E9FAF1", "#2EAA72"],
  ["#FEF3E2", "#F09A36"],
  ["#EDE9FE", "#7C3AED"],
  ["#FDE8E8", "#E05252"],
  ["#E8F8F5", "#1ABC9C"],
  ["#FDF2FF", "#A855F7"],
  ["#FFF8E1", "#F59E0B"],
  ["#E8EAF6", "#5C6BC0"],
  ["#FCE4EC", "#E91E87"],
  ["#E8F5E9", "#43A047"],
];

// Hash a string to a stable integer
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

// Generate a 5x5 symmetric grid (like GitHub identicons)
function makeGrid(seed) {
  const cells = [];
  // Only generate left half + center (15 cells), mirror for symmetry
  for (let i = 0; i < 15; i++) {
    const on = ((seed >> i) & 1) === 1;
    cells.push(on);
  }
  // Build full 5x5 grid with left-right symmetry
  const grid = [];
  for (let row = 0; row < 5; row++) {
    grid.push([
      cells[row * 3 + 0],
      cells[row * 3 + 1],
      cells[row * 3 + 2],
      cells[row * 3 + 1], // mirror
      cells[row * 3 + 0], // mirror
    ]);
  }
  return grid;
}

/**
 * Returns an SVG string for a given name.
 * size: pixel size of the square SVG
 */
export function generateAvatarSVG(name, size = 40) {
  if (!name) name = "?";
  const hash = hashStr(name);
  const [bg, fg] = PALETTE[hash % PALETTE.length];
  const grid = makeGrid(hash >>> 4); // shift to get different bits than palette selection

  const padding = size * 0.15;
  const cellSize = (size - padding * 2) / 5;

  const cells = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (grid[r][c]) {
        cells.push(
          `<rect x="${padding + c * cellSize}" y="${padding + r * cellSize}" width="${cellSize}" height="${cellSize}" rx="${cellSize * 0.15}" fill="${fg}"/>`
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>
  ${cells.join("\n  ")}
</svg>`;
}

/**
 * Returns a data URI for use in <img src=...> or CSS background
 */
export function generateAvatarDataURI(name, size = 40) {
  const svg = generateAvatarSVG(name, size);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * React component — inline SVG avatar
 * Usage: <Avatar name="Rahul" size={40} style={{...}} />
 */
export function Avatar({ name, size = 40, style = {}, className = "" }) {
  if (!name) name = "?";
  const hash = hashStr(name);
  const [bg, fg] = PALETTE[hash % PALETTE.length];
  const grid = makeGrid(hash >>> 4);

  const padding = size * 0.15;
  const cellSize = (size - padding * 2) / 5;
  const rx = size * 0.22;
  const cellRx = cellSize * 0.15;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, display: "block", ...style }}
      className={className}
      aria-label={`Avatar for ${name}`}
    >
      <rect width={size} height={size} rx={rx} fill={bg} />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={padding + c * cellSize}
              y={padding + r * cellSize}
              width={cellSize}
              height={cellSize}
              rx={cellRx}
              fill={fg}
            />
          ) : null
        )
      )}
    </svg>
  );
}