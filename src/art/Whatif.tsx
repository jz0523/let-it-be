export type WhatifMood = 'alert' | 'loud' | 'sitting' | 'yawn' | 'asleep';

const INK = '#3b4a3f';
const FUR = '#cfc0ea';
const FUR_LIGHT = '#e7dff6';
const FUR_DARK = '#a995d4';

/** A scalloped circle: the fuzzy outline of the creature. */
function fuzz(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number): string {
  let d = '';
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / bumps) * Math.PI * 2 - Math.PI / 2;
    const am = (a0 + a1) / 2;
    const p0 = [cx + rx * Math.cos(a0), cy + ry * Math.sin(a0)];
    const p1 = [cx + rx * Math.cos(a1), cy + ry * Math.sin(a1)];
    const c = [cx + (rx + depth) * Math.cos(am), cy + (ry + depth) * Math.sin(am)];
    if (i === 0) d += `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`;
    d += `Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  }
  return d + 'Z';
}

const BODY_UP = fuzz(60, 62, 35, 34, 15, 9);
const BODY_SIT = fuzz(60, 68, 38, 29, 15, 8);

const ANIM: Record<WhatifMood, string> = {
  alert: 'anim-bob',
  loud: 'anim-fuss',
  sitting: 'anim-breathe',
  yawn: 'anim-breathe',
  asleep: 'anim-breathe',
};

interface Props {
  mood?: WhatifMood;
  size?: number;
  className?: string;
  /** Accessible name. Omit when the creature is decoration. */
  label?: string;
  still?: boolean;
}

export function Whatif({ mood = 'alert', size = 96, className, label, still }: Props) {
  const low = mood === 'sitting' || mood === 'yawn' || mood === 'asleep';
  const eyeY = low ? 64 : 56;
  const browY = low ? 0 : mood === 'loud' ? -2 : 0;
  // The sleep marks stay readable when the creature is drawn small.
  const zScale = Math.max(1, Math.min(2.2, 72 / size));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <ellipse cx="60" cy="108" rx={low ? 34 : 28} ry="5.5" fill={INK} opacity="0.13" />
      <g className={`char ${still ? '' : ANIM[mood]}`}>
        {/* feet */}
        {!low && (
          <>
            <ellipse cx="46" cy="101" rx="9" ry="6" fill={FUR_DARK} stroke={INK} strokeWidth="3" />
            <ellipse cx="74" cy="101" rx="9" ry="6" fill={FUR_DARK} stroke={INK} strokeWidth="3" />
          </>
        )}
        {low && (
          <>
            <ellipse cx="38" cy="101" rx="10" ry="5.5" fill={FUR_DARK} stroke={INK} strokeWidth="3" />
            <ellipse cx="82" cy="101" rx="10" ry="5.5" fill={FUR_DARK} stroke={INK} strokeWidth="3" />
          </>
        )}

        {/* tuft */}
        <path
          d={low ? 'M54 36 q-3 -9 2 -13 M60 35 q0 -10 4 -14 M66 36 q4 -7 9 -8' : 'M54 26 q-4 -10 1 -15 M60 25 q0 -12 5 -16 M66 26 q5 -8 10 -9'}
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* body */}
        <path d={low ? BODY_SIT : BODY_UP} fill={FUR} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="60" cy={low ? 80 : 76} rx="19" ry={low ? 12 : 14} fill={FUR_LIGHT} />

        {/* cheeks */}
        <circle cx="31" cy={eyeY + 13} r="5.5" fill="#f4b9a0" opacity="0.85" />
        <circle cx="89" cy={eyeY + 13} r="5.5" fill="#f4b9a0" opacity="0.85" />

        {/* eyes */}
        {(mood === 'alert' || mood === 'loud') && (
          <>
            <circle cx="45" cy={eyeY} r="11" fill="#fffdf7" stroke={INK} strokeWidth="3" />
            <circle cx="75" cy={eyeY} r="11" fill="#fffdf7" stroke={INK} strokeWidth="3" />
            <circle cx="46.5" cy={eyeY + 1.5} r={mood === 'loud' ? 4.2 : 5.4} fill={INK} />
            <circle cx="73.5" cy={eyeY + 1.5} r={mood === 'loud' ? 4.2 : 5.4} fill={INK} />
            <circle cx="48.4" cy={eyeY - 0.8} r="1.8" fill="#fffdf7" />
            <circle cx="75.4" cy={eyeY - 0.8} r="1.8" fill="#fffdf7" />
            {/* worried brows */}
            <path
              d={`M34 ${eyeY - 14 + browY} L50 ${eyeY - 19 + browY} M70 ${eyeY - 19 + browY} L86 ${eyeY - 14 + browY}`}
              stroke={INK}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {mood === 'sitting' && (
          <>
            <circle cx="45" cy={eyeY} r="10" fill="#fffdf7" stroke={INK} strokeWidth="3" />
            <circle cx="75" cy={eyeY} r="10" fill="#fffdf7" stroke={INK} strokeWidth="3" />
            <circle cx="46" cy={eyeY + 3.5} r="4.4" fill={INK} />
            <circle cx="74" cy={eyeY + 3.5} r="4.4" fill={INK} />
            {/* heavy lids */}
            <path d={`M35 ${eyeY} a10 10 0 0 1 20 0 z`} fill={FUR} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d={`M65 ${eyeY} a10 10 0 0 1 20 0 z`} fill={FUR} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          </>
        )}
        {mood === 'yawn' && (
          <path
            d={`M36 ${eyeY + 1} q9 -7 18 0 M66 ${eyeY + 1} q9 -7 18 0`}
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {mood === 'asleep' && (
          <path
            d={`M36 ${eyeY - 1} q9 7 18 0 M66 ${eyeY - 1} q9 7 18 0`}
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* mouth */}
        {mood === 'alert' && (
          <path d="M54 75 q3 -3.5 6 0 t6 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        )}
        {mood === 'loud' && (
          <>
            <ellipse cx="60" cy="78" rx="8" ry="9" fill="#5e4a63" stroke={INK} strokeWidth="3" />
            <ellipse cx="60" cy="83" rx="4.5" ry="3.2" fill="#f4b9a0" />
          </>
        )}
        {mood === 'sitting' && (
          <path d="M55 82 h10" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        )}
        {mood === 'yawn' && (
          <>
            <ellipse cx="60" cy="83" rx="7" ry="8" fill="#5e4a63" stroke={INK} strokeWidth="3" />
            <ellipse cx="60" cy="87.5" rx="3.8" ry="2.6" fill="#f4b9a0" />
          </>
        )}
        {mood === 'asleep' && (
          <path d="M56 81 q4 3 8 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        )}
      </g>

      {mood === 'asleep' && (
        <g fill={INK} fontFamily="'Baloo 2 Variable', sans-serif" fontWeight="700">
          <text x="90" y="34" fontSize={15 * zScale} className="zzz">
            z
          </text>
          <text x={99 + (zScale - 1) * 6} y={22 - (zScale - 1) * 8} fontSize={19 * zScale} className="zzz" style={{ animationDelay: '1.1s' }}>
            z
          </text>
        </g>
      )}
    </svg>
  );
}
