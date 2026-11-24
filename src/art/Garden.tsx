import { useMemo } from 'react';
import { mulberry32 } from '../lib/rng';
import { Whatif } from './Whatif';
import { Moss } from './Moss';

const INK = '#3b4a3f';
const LEAF = '#8fb489';
const LEAF_LIGHT = '#b7ceac';

/** Eighteen planting spots in three rows. Scale grows toward the front. */
const SLOTS: { x: number; y: number; s: number }[] = [
  ...[28, 76, 124, 172, 220, 268].map((x) => ({ x, y: 200, s: 0.78 })),
  ...[48, 108, 168, 228, 288, 356].map((x) => ({ x, y: 242, s: 0.98 })),
  ...[30, 98, 166, 234, 302, 368].map((x) => ({ x, y: 290, s: 1.2 })),
];

/** The order in which spots come to life, spread across the rows. */
const ORDER = [8, 2, 14, 10, 4, 16, 0, 12, 7, 17, 5, 13, 1, 9, 15, 3, 11, 6];

const SPROUTS_PER_STEP = 2;

function stageOf(rank: number, sprouts: number): number {
  const steps = Math.floor(sprouts / SPROUTS_PER_STEP);
  return Math.max(0, Math.min(3, steps - rank * 2));
}

function Seedling() {
  return (
    <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M0 0 V-9" fill="none" />
      <path d="M0 -8 q-9 -1 -10 -9 q9 0 10 9 z" fill={LEAF_LIGHT} />
      <path d="M0 -8 q9 -1 10 -9 q-9 0 -10 9 z" fill={LEAF} />
    </g>
  );
}

const BLOOM = ['#f2b596', '#fff3dc', '#b9a6e0', LEAF, '#d9cdf0', '#fbe0cb'];

export function Plant({ type, stage }: { type: number; stage: number }) {
  if (stage <= 0) return null;
  if (stage === 1) return <Seedling />;
  const common = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  if (stage === 2) {
    return (
      <g {...common}>
        <path d="M0 0 V-22" fill="none" />
        <path d="M0 -8 q-11 -2 -12 -12 q10 1 12 12 z" fill={LEAF_LIGHT} />
        <path d="M0 -11 q11 -2 12 -12 q-10 1 -12 12 z" fill={LEAF} />
        <ellipse cx="0" cy="-26" rx="5" ry="6" fill={BLOOM[type]} />
      </g>
    );
  }
  switch (type) {
    case 0: // tulip
      return (
        <g {...common}>
          <path d="M0 0 V-30" fill="none" />
          <path d="M0 -3 q-13 -6 -12 -22 q10 7 12 22 z" fill={LEAF_LIGHT} />
          <path d="M0 -3 q13 -6 12 -22 q-10 7 -12 22 z" fill={LEAF} />
          <path d="M-9.5 -45 q0 17 9.5 17 q9.5 0 9.5 -17 l-4.7 6 l-4.8 -7 l-4.8 7 z" fill={BLOOM[0]} />
        </g>
      );
    case 1: // daisy
      return (
        <g {...common}>
          <path d="M0 0 V-30" fill="none" />
          <path d="M0 -6 q-11 -2 -12 -12 q10 1 12 12 z" fill={LEAF} />
          <path d="M0 -12 q11 -2 12 -12 q-10 1 -12 12 z" fill={LEAF_LIGHT} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-46" rx="4.4" ry="7" fill={BLOOM[1]} transform={`rotate(${a} 0 -37)`} />
          ))}
          <circle cx="0" cy="-37" r="4.6" fill="#e9a77f" />
        </g>
      );
    case 2: // lavender
      return (
        <g {...common}>
          {[-16, 0, 16].map((rot) => (
            <g key={rot} transform={`rotate(${rot})`}>
              <path d="M0 0 V-40" fill="none" />
              {[-22, -27, -32, -37, -42].map((y, i) => (
                <ellipse key={y} cx={i % 2 ? 2.5 : -2.5} cy={y} rx="4.2" ry="3.2" fill={BLOOM[2]} strokeWidth="2" />
              ))}
            </g>
          ))}
          <path d="M0 -2 q-9 -2 -11 -9 q9 0 11 9 z" fill={LEAF} />
        </g>
      );
    case 3: // fern
      return (
        <g {...common}>
          <path d="M0 0 q-24 -9 -21 -32 q16 8 21 32 z" fill={LEAF_LIGHT} />
          <path d="M0 0 q24 -9 21 -32 q-16 8 -21 32 z" fill={LEAF_LIGHT} />
          <path d="M0 0 q-10 -22 0 -44 q10 22 0 44 z" fill={LEAF} />
          <path d="M0 -6 V-30" fill="none" strokeWidth="2" />
        </g>
      );
    case 4: // bellflower
      return (
        <g {...common}>
          <path d="M0 0 q0 -32 11 -39" fill="none" />
          <path d="M0 -4 q-12 -3 -13 -14 q11 2 13 14 z" fill={LEAF} />
          {[
            [2, -24],
            [7, -33],
            [13, -38],
          ].map(([x, y]) => (
            <path key={x} d={`M${x - 5} ${y + 9} q0 -9 5 -9 q5 0 5 9 q-5 3 -10 0 z`} fill={BLOOM[4]} />
          ))}
        </g>
      );
    default: // puff
      return (
        <g {...common}>
          <path d="M0 0 V-30" fill="none" />
          <path d="M0 -5 q-11 -2 -12 -12 q10 1 12 12 z" fill={LEAF_LIGHT} />
          <path d="M0 -9 q11 -2 12 -12 q-10 1 -12 12 z" fill={LEAF} />
          <circle cx="0" cy="-39" r="11" fill={BLOOM[5]} />
          <circle cx="0" cy="-39" r="5.5" fill="none" strokeWidth="2" strokeDasharray="1 5" />
        </g>
      );
  }
}

interface Props {
  sprouts: number;
  /** Show Moss and the dozing Whatif. */
  characters?: boolean;
  label?: string;
  className?: string;
}

export function Garden({ sprouts, characters = true, label, className }: Props) {
  const wild = useMemo(() => {
    const rng = mulberry32(20261124);
    // Loose flowers keep off the desk, the dozing Whatif and Moss.
    const taken = (x: number, y: number) => (x > 280 && y < 222) || (x > 372 && y > 214);
    const out: { x: number; y: number; c: string; r: number }[] = [];
    while (out.length < 48) {
      const x = 8 + rng() * 464;
      const y = 186 + rng() * 126;
      const c = ['#f2b596', '#d9cdf0', '#fff3dc'][Math.floor(rng() * 3)];
      const r = 2.2 + rng() * 1.4;
      if (!taken(x, y)) out.push({ x, y, c, r });
    }
    return out;
  }, []);
  const tufts = useMemo(() => {
    const rng = mulberry32(77);
    return Array.from({ length: 22 }, () => ({ x: 6 + rng() * 468, y: 190 + rng() * 122 }));
  }, []);

  const wildCount = Math.min(wild.length, Math.floor(sprouts / 4));
  const has = (n: number) => sprouts >= n;

  return (
    <svg
      viewBox="0 0 480 320"
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde6cc" />
          <stop offset="0.6" stopColor="#fbf2de" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" fill="url(#g-sky)" />

      {/* sun and clouds */}
      <circle cx="398" cy="56" r="46" fill="#f9d4ae" opacity="0.35" />
      <circle cx="398" cy="56" r="30" fill="#f9d4ae" />
      <g fill="#fffdf7" opacity="0.92">
        <g style={{ animation: 'drift 26s ease-in-out infinite alternate' }}>
          <ellipse cx="96" cy="52" rx="34" ry="12" />
          <ellipse cx="74" cy="46" rx="18" ry="11" />
          <ellipse cx="112" cy="42" rx="20" ry="13" />
        </g>
        <g style={{ animation: 'drift 34s ease-in-out infinite alternate-reverse' }}>
          <ellipse cx="270" cy="84" rx="28" ry="9" />
          <ellipse cx="256" cy="78" rx="15" ry="9" />
        </g>
      </g>

      {/* hills */}
      <path d="M0 150 Q70 96 150 132 T300 120 T480 128 V320 H0Z" fill="#dce8d3" />
      <path d="M0 168 Q90 132 190 160 T380 150 T480 158 V320 H0Z" fill="#c9dcbd" />

      {/* bunting */}
      {has(80) && (
        <g>
          <path d="M0 112 Q120 142 240 118 T352 112" fill="none" stroke={INK} strokeWidth="2" />
          {[24, 62, 100, 138, 176, 214, 252, 290, 326].map((x, i) => {
            const y = 116 + Math.sin((x / 352) * Math.PI) * 12 + (x > 240 ? -4 : 2);
            return (
              <path
                key={x}
                d={`M${x - 7} ${y} h14 l-7 13 z`}
                fill={['#f6cdb0', '#d3c7ea', '#fff3dc'][i % 3]}
                stroke={INK}
                strokeWidth="2"
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      )}

      {/* fence */}
      <g>
        <rect x="-4" y="155" width="352" height="5" rx="2.5" fill="#f3e9d2" stroke={INK} strokeWidth="2" />
        <rect x="-4" y="167" width="352" height="5" rx="2.5" fill="#f3e9d2" stroke={INK} strokeWidth="2" />
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M${4 + i * 26} 180 v-28 q5 -8 10 0 v28 z`}
            fill="#fffdf7"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* birdhouse */}
      {has(50) && (
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M318 176 V120" strokeLinecap="round" />
          <path d="M304 120 h28 v-20 h-28 z" fill="#f6cdb0" />
          <path d="M300 102 l18 -14 l18 14 z" fill="#d3c7ea" />
          <circle cx="318" cy="110" r="4.5" fill={INK} stroke="none" />
        </g>
      )}

      {/* a visitor on the birdhouse roof */}
      {has(140) && (
        <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <ellipse cx="319" cy="79" rx="9" ry="7.5" fill="#fff3dc" />
          <path d="M326 78 l7 -2 l-6 5" fill="#f2b596" />
          <path d="M312 80 q-7 1 -9 -4 q6 -1 9 4 z" fill="#d3c7ea" />
          <circle cx="322" cy="76" r="1.3" fill={INK} stroke="none" />
        </g>
      )}

      {/* lawn */}
      <path d="M0 178 Q120 166 240 174 T480 170 V320 H0Z" fill="#b7ceac" />
      <path d="M0 266 Q160 248 300 260 T480 252 V320 H0Z" fill="#a9c59f" />

      {/* grass tufts and wildflowers */}
      <g stroke="#7fa37a" strokeWidth="2" strokeLinecap="round" fill="none">
        {tufts.map((t, i) => (
          <path key={i} d={`M${t.x} ${t.y} q-2 -6 -4 -7 M${t.x} ${t.y} v-8 M${t.x} ${t.y} q2 -6 4 -7`} />
        ))}
      </g>
      {wild.slice(0, wildCount).map((w, i) => (
        <g key={i}>
          <circle cx={w.x} cy={w.y} r={w.r + 1.6} fill={w.c} stroke={INK} strokeWidth="1.4" />
          <circle cx={w.x} cy={w.y} r={w.r * 0.45} fill="#e9a77f" />
        </g>
      ))}

      {/* stepping stones */}
      {has(15) && (
        <g fill="#f3e9d2" stroke={INK} strokeWidth="2">
          <ellipse cx="384" cy="224" rx="11" ry="4.2" />
          <ellipse cx="410" cy="216" rx="9" ry="3.6" />
          <ellipse cx="364" cy="214" rx="8" ry="3.2" />
        </g>
      )}

      {/* desk */}
      <g transform="translate(366 136)" stroke={INK} strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="46" cy="70" rx="52" ry="6" fill={INK} opacity="0.12" stroke="none" />
        <rect x="6" y="36" width="9" height="32" rx="3" fill="#dcaa80" strokeWidth="2.5" />
        <rect x="78" y="36" width="9" height="32" rx="3" fill="#dcaa80" strokeWidth="2.5" />
        <rect x="50" y="36" width="34" height="17" rx="3" fill="#f0cba6" strokeWidth="2.5" />
        <circle cx="67" cy="45" r="2.2" fill={INK} stroke="none" />
        <rect x="-2" y="27" width="96" height="11" rx="5" fill="#e8bd96" strokeWidth="3" />
        {/* lamp */}
        <path d="M74 27 v-14 q0 -8 -9 -9" fill="none" strokeWidth="2.5" />
        <path d="M52 8 q8 -12 18 -6 l-4 12 z" fill="#d3c7ea" strokeWidth="2.5" />
        <ellipse cx="74" cy="27" rx="7" ry="2.5" fill="#d3c7ea" strokeWidth="2.5" />
        {/* notebook and mug */}
        <path d="M12 26 l22 -5 l3 5 z" fill="#fffdf7" strokeWidth="2.5" />
        <path d="M38 27 v-10 h11 v10 z" fill="#f6cdb0" strokeWidth="2.5" />
        <path d="M49 20 q5 1 0 5" fill="none" strokeWidth="2" />
        {/* stool */}
        <path d="M-22 70 l3 -16 M-4 70 l-3 -16" fill="none" strokeWidth="2.5" />
        <ellipse cx="-13" cy="53" rx="13" ry="4.5" fill="#b7ceac" strokeWidth="2.5" />
      </g>

      {/* lantern */}
      {has(30) && (
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M470 214 V150 q0 -8 -10 -8" fill="none" />
          <rect x="452" y="146" width="16" height="20" rx="4" fill="#fbe0b0" />
          <path d="M450 146 h20" />
          <circle cx="460" cy="156" r="14" fill="#fbe0b0" opacity="0.35" stroke="none" className="anim-glow" />
        </g>
      )}

      {/* watering can */}
      {has(6) && (
        <g transform="translate(436 198)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M0 0 h18 l-2 16 h-14 z" fill="#d3c7ea" />
          <path d="M18 5 l10 -6" fill="none" />
          <path d="M26 -4 l5 5" />
          <path d="M0 3 q-9 2 -1 10" fill="none" />
        </g>
      )}

      {/* the dozing Whatif */}
      {characters && (
        <g transform="translate(298 160)">
          <Whatif mood="asleep" size={40} />
        </g>
      )}

      {/* planting spots, back row first */}
      {SLOTS.map((slot, i) => {
        const rank = ORDER.indexOf(i);
        const stage = stageOf(rank, sprouts);
        return (
          <g key={i} transform={`translate(${slot.x} ${slot.y}) scale(${slot.s})`}>
            <ellipse cx="0" cy="1" rx="15" ry="5" fill="#d9b796" stroke={INK} strokeWidth="2" opacity={stage ? 1 : 0.75} />
            <g className={stage >= 2 ? 'anim-sway' : undefined} style={{ animationDelay: `${-(i * 0.7)}s` }}>
              <Plant type={i % 6} stage={stage} />
            </g>
          </g>
        );
      })}

      {/* mushrooms */}
      {has(170) && (
        <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M132 308 v-8 M144 311 v-6" strokeLinecap="round" />
          <path d="M124 300 q8 -12 16 0 z" fill="#f6cdb0" />
          <path d="M138 305 q6 -9 12 0 z" fill="#d3c7ea" />
        </g>
      )}

      {/* butterflies */}
      {has(110) && (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round" className="anim-wander">
          <path d="M150 140 q-9 -10 -10 0 q1 8 10 0 q9 -10 10 0 q-1 8 -10 0 z" fill="#d3c7ea" />
          <path d="M214 104 q-7 -8 -8 0 q1 6 8 0 q7 -8 8 0 q-1 6 -8 0 z" fill="#f6cdb0" />
        </g>
      )}

      {/* Moss */}
      {characters && (
        <g transform="translate(392 232)">
          <Moss size={84} />
        </g>
      )}
    </svg>
  );
}
