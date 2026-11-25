interface BeltSvgProps {
  color: string;
  graus: number;
  max: number;
  small?: boolean;
}

export function BeltSvg({ color, graus, max, small = false }: BeltSvgProps) {
  const light = color === '#f6f5f0' || color === '#ffd200';
  const stitch = light ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.22)';
  const tip = color === '#151515' ? '#c8102e' : '#111';
  const gradId = `sh${small ? 1 : 0}`;

  return (
    <svg viewBox="0 0 700 120" role="img" aria-label={`Faixa com ${graus} grau(s)`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".25" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <rect
        x="10"
        y="20"
        width="670"
        height="80"
        rx="8"
        fill={color}
        stroke={light ? '#cfcab9' : undefined}
        strokeWidth={light ? 2 : undefined}
      />
      <g stroke={stitch} strokeWidth="2" strokeDasharray="6 6" fill="none">
        <path d="M18 34H672M18 48H672M18 72H672M18 86H672" />
      </g>
      <rect x={560 - max * 30} y="20" width={max * 30 + 46} height="80" fill={tip} />
      {Array.from({ length: max }, (_, i) => {
        const x = 560 - i * 30;
        const on = i < graus;
        return (
          <rect
            key={i}
            className={on ? 'st' : undefined}
            x={x}
            y="22"
            width="16"
            height="76"
            rx="2"
            fill={on ? '#f8f8f4' : 'rgba(255,255,255,.07)'}
            style={on ? { animationDelay: `${i * 90}ms` } : undefined}
          />
        );
      })}
      <rect x="10" y="20" width="670" height="80" rx="8" fill={`url(#${gradId})`} />
    </svg>
  );
}
