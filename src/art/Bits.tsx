const INK = '#3b4a3f';

export function SproutIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden style={{ display: 'block' }}>
      <path d="M16 29 V15" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 17 Q4 16 3 5 Q15 5 16 17 Z" fill="#b7ceac" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 14 Q27 13 29 3 Q17 3 16 14 Z" fill="#8fb489" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

/** A wide leaf used as the card in Thought Sorter. */
export function LeafShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 240" className={className} aria-hidden preserveAspectRatio="none" style={{ display: 'block' }}>
      <path
        d="M14 128 C40 40 150 6 250 22 C292 28 318 48 328 70 C322 150 240 222 130 226 C78 228 34 196 14 128 Z"
        fill="#dce8d3"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M4 150 C60 120 190 80 328 70"
        fill="none"
        stroke="#c3d7b9"
        strokeWidth="3.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M70 122 q14 -34 44 -52 M132 102 q14 -34 46 -52 M196 86 q14 -28 44 -42 M92 118 q30 30 34 70 M158 98 q36 28 44 74 M224 82 q34 20 46 56"
        fill="none"
        stroke="#cfe0c6"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The parcel from Sealed Box, closed or open. */
export function BoxArt({ open = false, size = 96, className }: { open?: boolean; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      <ellipse cx="50" cy="90" rx="38" ry="5" fill={INK} opacity="0.13" />
      <g stroke={INK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
        {open ? (
          <>
            <path d="M16 44 L4 28 L38 24 L50 40 Z" fill="#f3d2b0" />
            <path d="M84 44 L96 28 L62 24 L50 40 Z" fill="#f3d2b0" />
            <path d="M16 44 H84 V86 H16 Z" fill="#f6cdb0" />
            <path d="M22 44 q28 -10 56 0" fill="#e2b48c" />
          </>
        ) : (
          <>
            <path d="M16 40 H84 V86 H16 Z" fill="#f6cdb0" />
            <path d="M12 30 H88 V42 H12 Z" fill="#f3d2b0" />
            <path d="M44 30 h12 v22 l-6 -4 l-6 4 z" fill="#d3c7ea" />
            <path d="M24 70 h18 M24 77 h12" stroke="#c99a74" strokeWidth="3" />
          </>
        )}
      </g>
    </svg>
  );
}

export function ArrowIcon({ dir = 'left', size = 22 }: { dir?: 'left' | 'right' | 'up' | 'down'; size?: number }) {
  const rot = { left: 0, up: 90, right: 180, down: 270 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ transform: `rotate(${rot}deg)`, display: 'block' }}>
      <path d="M14 5 L7 12 L14 19 M7 12 H19" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
