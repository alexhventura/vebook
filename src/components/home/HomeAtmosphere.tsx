import React, { useEffect, useState } from 'react';

/**
 * Atmosfera nacional do VEBOOK — não é bandeira.
 * Rede de nós (constelação técnica) com sugestão geográfica sutil à direita
 * e pontos de luz à esquerda, como um mapa de infraestrutura.
 */
export const HomeAtmosphere: React.FC = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setOffset(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const leftLights = Array.from({ length: 28 }, (_, i) => ({
    x: 4 + (i % 5) * 5.5 + (i % 3) * 1.2,
    y: 3 + i * 3.4,
    r: 0.25 + (i % 4) * 0.15,
  }));

  const mesh = [
    [62, 18], [72, 22], [80, 30], [86, 42], [88, 55], [85, 68], [78, 78],
    [68, 86], [55, 90], [44, 84], [36, 72], [32, 58], [34, 44], [40, 32],
    [50, 24], [58, 28], [66, 38], [74, 48], [76, 60], [70, 70], [58, 74],
    [48, 64], [46, 50], [52, 40], [60, 48], [68, 56],
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* Gradiente de profundidade contínuo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(107,158,196,0.08),transparent_45%),radial-gradient(ellipse_at_85%_40%,rgba(11,30,54,0.06),transparent_50%)]" />

      {/* Constelação esquerda */}
      <svg
        className="absolute inset-y-0 left-0 h-full w-[36%] opacity-[0.22] text-vebook-blue-muted"
        viewBox="0 0 40 100"
        preserveAspectRatio="none"
        style={{ transform: `translateY(${offset * 0.015}px)` }}
      >
        {leftLights.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={(d.y + offset * 0.008) % 100}
            r={d.r}
            fill="currentColor"
            className="vebook-star-pulse"
            style={{ animationDelay: `${(i % 7) * 0.4}s` }}
          />
        ))}
      </svg>

      {/* Rede nacional direita */}
      <svg
        className="absolute top-[2%] right-[-4%] h-[110%] w-[58%] sm:w-[52%] opacity-[0.09] sm:opacity-[0.12] text-vebook-navy"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMaxYMid meet"
        style={{ transform: `translateY(${offset * 0.025}px)` }}
      >
        {/* Contorno suave — sugestão do território, não mapa cartográfico */}
        <path
          d="M52 12 C64 14 76 22 82 34 C90 50 90 64 84 76 C76 90 62 96 48 94 C34 90 24 78 22 62 C20 46 28 30 40 20 C44 16 48 13 52 12 Z"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="0.35"
          className="text-vebook-blue"
        />
        {mesh.map(([x, y], i) => (
          <g key={i}>
            {i > 0 && (
              <line
                x1={mesh[i - 1][0]}
                y1={mesh[i - 1][1]}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                opacity="0.5"
              />
            )}
            {i % 3 === 0 && i + 5 < mesh.length && (
              <line
                x1={x}
                y1={y}
                x2={mesh[i + 5][0]}
                y2={mesh[i + 5][1]}
                stroke="currentColor"
                strokeWidth="0.15"
                opacity="0.3"
              />
            )}
            <circle cx={x} cy={y} r={i % 5 === 0 ? 0.55 : 0.32} fill="currentColor" opacity={i % 5 === 0 ? 0.85 : 0.45} />
          </g>
        ))}
      </svg>
    </div>
  );
};
