// Server-rendered SVG bar charts for the supervision report. Plain SVG (no
// client charting lib) so they print to PDF as-is and can be rasterised into
// the Word export. Hover shows a native tooltip via <title>.
import { fmt2 } from "@/lib/supervision-report";

export const SERIES_COLORS = ["#0d9488", "#4f46e5"]; // validated categorical pair (teal, indigo)

const W = 720;
const LABEL_W = 280;
const RIGHT_PAD = 56;
const PLOT_W = W - LABEL_W - RIGHT_PAD;
const INK = "#1e2a28";
const MUTED = "#6b7a77";
const GRID = "#e2e8e6";
const FONT = "'TH Sarabun New', Sarabun, Tahoma, sans-serif";

function Frame({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <figure style={{ margin: "8px 0 18px", breakInside: "avoid" }}>
      <figcaption style={{ fontWeight: "bold", fontSize: "15px", margin: "0 0 4px" }}>{title}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width={W}
        height={height}
        style={{ width: "100%", height: "auto", maxWidth: `${W}px`, display: "block" }}
        fontFamily={FONT}
        role="img"
        aria-label={title}
      >
        <rect width={W} height={height} fill="#ffffff" />
        {children}
      </svg>
    </figure>
  );
}

function Axis({ top, bottom, max, ticks, plotW = PLOT_W }: { top: number; bottom: number; max: number; ticks: number[]; plotW?: number }) {
  return (
    <g>
      {ticks.map((t) => {
        const x = LABEL_W + (t / max) * plotW;
        return (
          <g key={t}>
            <line x1={x} x2={x} y1={top} y2={bottom} stroke={GRID} strokeWidth={1} />
            <text x={x} y={bottom + 16} fontSize={13} fill={MUTED} textAnchor="middle">
              {t}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// Bar with a 4px rounded data-end, square at the baseline.
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h / 2);
  if (w <= 0) return "";
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

function ticksFor(max: number) {
  const step = max <= 5 ? 1 : max <= 20 ? 5 : Math.ceil(max / 5);
  const out: number[] = [];
  for (let t = 0; t <= max + 1e-9; t += step) out.push(t);
  return out;
}

/** Single-series horizontal bars (label → value), e.g. average by subject group. */
export function HBarChart({
  title,
  bars,
  max,
  valueLabel = (v: number) => fmt2(v),
  rightPad = RIGHT_PAD,
}: {
  title: string;
  bars: { label: string; value: number; color?: string; note?: string }[];
  max: number;
  valueLabel?: (v: number) => string;
  /** room for long value labels past the longest bar */
  rightPad?: number;
}) {
  const ROW = 30;
  const BAR = 18;
  const top = 6;
  const bottom = top + bars.length * ROW;
  const height = bottom + 26;
  const plotW = W - LABEL_W - rightPad;

  return (
    <Frame title={title} height={height}>
      <Axis top={top} bottom={bottom} max={max} ticks={ticksFor(max)} plotW={plotW} />
      {bars.map((b, i) => {
        const y = top + i * ROW + (ROW - BAR) / 2;
        const w = (Math.max(0, b.value) / max) * plotW;
        return (
          <g key={b.label}>
            <title>{`${b.label}: ${valueLabel(b.value)}${b.note ? ` (${b.note})` : ""}`}</title>
            <text x={LABEL_W - 8} y={y + BAR / 2} fontSize={14} fill={INK} textAnchor="end" dominantBaseline="central">
              {b.label}
            </text>
            <path d={barPath(LABEL_W, y, w, BAR)} fill={b.color ?? SERIES_COLORS[0]} />
            <text x={LABEL_W + w + 6} y={y + BAR / 2} fontSize={14} fill={INK} dominantBaseline="central">
              {valueLabel(b.value)}
            </text>
          </g>
        );
      })}
      <line x1={LABEL_W} x2={LABEL_W} y1={top} y2={bottom} stroke={MUTED} strokeWidth={1} />
    </Frame>
  );
}

/** Two-or-more series per category (e.g. domain averages per assessment form). */
export function GroupedHBarChart({
  title,
  categories,
  series,
  max,
}: {
  title: string;
  categories: string[];
  series: { name: string; values: Record<string, number | null> }[];
  max: number;
}) {
  const BAR = 14;
  const GAP = 2;
  const ROW = series.length * (BAR + GAP) + 12;
  const LEGEND = 24;
  const top = LEGEND + 6;
  const bottom = top + categories.length * ROW;
  const height = bottom + 26;

  return (
    <Frame title={title} height={height}>
      {series.map((s, si) => (
        <g key={s.name} transform={`translate(${LABEL_W + si * ((PLOT_W + RIGHT_PAD) / series.length)}, 4)`}>
          <rect width={12} height={12} rx={2} fill={SERIES_COLORS[si % SERIES_COLORS.length]} y={2} />
          <text x={18} y={8} fontSize={13} fill={INK} dominantBaseline="central">
            {s.name}
          </text>
        </g>
      ))}
      <Axis top={top} bottom={bottom} max={max} ticks={ticksFor(max)} />
      {categories.map((c, ci) => {
        const rowY = top + ci * ROW + 6;
        return (
          <g key={c}>
            <text
              x={LABEL_W - 8}
              y={rowY + (series.length * (BAR + GAP) - GAP) / 2}
              fontSize={14}
              fill={INK}
              textAnchor="end"
              dominantBaseline="central"
            >
              {c}
            </text>
            {series.map((s, si) => {
              const v = s.values[c];
              if (v == null) return null;
              const y = rowY + si * (BAR + GAP);
              const w = (v / max) * PLOT_W;
              return (
                <g key={s.name}>
                  <title>{`${c} — ${s.name}: ${fmt2(v)}`}</title>
                  <path d={barPath(LABEL_W, y, w, BAR)} fill={SERIES_COLORS[si % SERIES_COLORS.length]} />
                  <text x={LABEL_W + w + 6} y={y + BAR / 2} fontSize={13} fill={INK} dominantBaseline="central">
                    {fmt2(v)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <line x1={LABEL_W} x2={LABEL_W} y1={top} y2={bottom} stroke={MUTED} strokeWidth={1} />
    </Frame>
  );
}
