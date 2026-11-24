const INK = '#3b4a3f';

interface Props {
  size?: number;
  className?: string;
  label?: string;
  still?: boolean;
}

/** Moss: a calm old snail with a mossy shell. */
export function Moss({ size = 96, className, label, still }: Props) {
  return (
    <svg
      width={size}
      height={(size * 110) / 140}
      viewBox="0 0 140 110"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <ellipse cx="68" cy="101" rx="54" ry="6" fill={INK} opacity="0.13" />
      <g className={`char ${still ? '' : 'anim-breathe'}`}>
        {/* eye stalks */}
        <path d="M110 46 Q106 34 104 24 M119 46 Q122 36 126 27" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M110 46 Q106 34 104 24 M119 46 Q122 36 126 27" fill="none" stroke="#f3d9b8" strokeWidth="4" strokeLinecap="round" />

        {/* body */}
        <path
          d="M12 91 Q8 79 28 79 L92 79 Q100 79 102 68 L104 52 Q106 40 116 41 Q127 42 126 55 L122 82 Q120 97 104 97 L24 97 Q14 97 12 91 Z"
          fill="#f3d9b8"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M24 91 H96" stroke="#e2bf98" strokeWidth="3" strokeLinecap="round" />

        {/* shell */}
        <circle cx="56" cy="54" r="35" fill="#a9c59f" stroke={INK} strokeWidth="3.5" />
        <path
          d="M56 78 a24 24 0 1 1 24 -24 a16.5 16.5 0 1 1 -16.5 -16.5 a9 9 0 1 1 -9 9"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* moss on the shell */}
        <path
          d="M27 36 q2 -9 10 -8 q2 -9 11 -6 q5 -8 13 -3 q8 -4 12 3 q9 -1 10 8 q-6 -3 -11 1 q-5 -5 -11 -1 q-6 -5 -12 0 q-6 -4 -11 1 q-5 -2 -11 5 z"
          fill="#7fa37a"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* a sprout on top */}
        <path d="M58 20 V10" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M58 12 q-9 -1 -10 -9 q9 0 10 9 z M58 11 q8 -2 9 -10 q-9 1 -9 10 z" fill="#b7ceac" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

        {/* eyes */}
        <circle cx="104" cy="22" r="7.5" fill="#fffdf7" stroke={INK} strokeWidth="3" />
        <circle cx="126" cy="25" r="7.5" fill="#fffdf7" stroke={INK} strokeWidth="3" />
        <circle cx="105.5" cy="24" r="3" fill={INK} />
        <circle cx="127.5" cy="27" r="3" fill={INK} />
        <path d="M96.5 22 a7.5 7.5 0 0 1 15 0 z" fill="#f3d9b8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M118.5 25 a7.5 7.5 0 0 1 15 0 z" fill="#f3d9b8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />

        {/* face */}
        <circle cx="109" cy="68" r="4" fill="#f4b9a0" opacity="0.85" />
        <path d="M112 62 q5 3.5 9 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
