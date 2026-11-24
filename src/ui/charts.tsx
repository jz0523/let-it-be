/** Hand-drawn SVG charts. One ink colour throughout: no good or bad shading. */

const INK = '#3b4a3f';
const SOFT = '#5a685b';
const W = 520;
const H = 220;
const PAD = { l: 40, r: 16, t: 14, b: 34 };
const font = { fontFamily: "'Nunito Variable', sans-serif", fontWeight: 700, fontSize: 13, fill: SOFT };

function Frame({ max, ticks, children, label }: { max: number; ticks: number[]; children: React.ReactNode; label: string }) {
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ display: 'block', width: '100%', height: 'auto' }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke={INK} strokeOpacity="0.14" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
          <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" {...font}>
            {t}
          </text>
        </g>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {children}
    </svg>
  );
}

const xAt = (i: number, n: number) => (n <= 1 ? (PAD.l + W - PAD.r) / 2 : PAD.l + 18 + (i / (n - 1)) * (W - PAD.l - PAD.r - 36));
const yAt = (v: number, max: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);

export interface Point {
  label: string;
  value: number;
}

export function LineChart({ points, max, ticks, label }: { points: Point[]; max: number; ticks: number[]; label: string }) {
  const n = points.length;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i, n).toFixed(1)} ${yAt(p.value, max).toFixed(1)}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  return (
    <Frame max={max} ticks={ticks} label={label}>
      {n > 1 && <path d={d} fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={xAt(i, n)} cy={yAt(p.value, max)} r="6" fill="#fffdf7" stroke={INK} strokeWidth="3" />
          {(n - 1 - i) % labelEvery === 0 && (
            <text x={xAt(i, n)} y={H - 10} textAnchor="middle" {...font}>
              {p.label}
            </text>
          )}
        </g>
      ))}
    </Frame>
  );
}

export function BarChart({ points, max, ticks, label }: { points: Point[]; max: number; ticks: number[]; label: string }) {
  const n = points.length;
  const slot = (W - PAD.l - PAD.r) / Math.max(n, 1);
  const bw = Math.min(38, slot * 0.6);
  const labelEvery = Math.max(1, Math.ceil(n / 8));
  return (
    <Frame max={max} ticks={ticks} label={label}>
      {points.map((p, i) => {
        const cx = PAD.l + slot * (i + 0.5);
        const top = yAt(p.value, max);
        const h = yAt(0, max) - top;
        return (
          <g key={i}>
            {p.value > 0 && <rect x={cx - bw / 2} y={top} width={bw} height={h} rx={Math.min(9, bw / 2, h / 2)} fill="#d3c7ea" stroke={INK} strokeWidth="2.5" />}
            {(n - 1 - i) % labelEvery === 0 && (
              <text x={cx} y={H - 10} textAnchor="middle" {...font}>
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </Frame>
  );
}

/** Before and after ratings joined by a line. Open dot is before, filled dot is after. */
export function PairChart({ pairs, label }: { pairs: { label: string; before: number; after: number }[]; label: string }) {
  const n = pairs.length;
  const slot = (W - PAD.l - PAD.r) / Math.max(n, 1);
  const labelEvery = Math.max(1, Math.ceil(n / 8));
  return (
    <Frame max={10} ticks={[5, 10]} label={label}>
      {pairs.map((p, i) => {
        const cx = PAD.l + slot * (i + 0.5);
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={yAt(p.before, 10)} y2={yAt(p.after, 10)} stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy={yAt(p.before, 10)} r="6" fill="#fffdf7" stroke={INK} strokeWidth="3" />
            <circle cx={cx} cy={yAt(p.after, 10)} r="6" fill={INK} stroke={INK} strokeWidth="3" />
            {(n - 1 - i) % labelEvery === 0 && (
              <text x={cx} y={H - 10} textAnchor="middle" {...font}>
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </Frame>
  );
}

export function LegendDot({ filled, children }: { filled?: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <span className={`inline-block h-3.5 w-3.5 rounded-full border-[2.5px] border-ink ${filled ? 'bg-ink' : 'bg-paper'}`} />
      {children}
    </span>
  );
}
