import React, { useEffect, useState } from 'react';

/**
 * Atmosfera institucional da home:
 * esquerda — campo de estrelas discreto (referência à bandeira, sem copiá-la)
 * direita — silhueta do Brasil em malha tecnológica (decorativa, não interativa)
 */
export const HomeAtmosphere: React.FC = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.04);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stars = [
    { x: 8, y: 6, s: 1.2 },
    { x: 18, y: 14, s: 0.8 },
    { x: 5, y: 22, s: 1.5 },
    { x: 14, y: 28, s: 0.7 },
    { x: 22, y: 34, s: 1.1 },
    { x: 7, y: 42, s: 0.9 },
    { x: 16, y: 48, s: 1.3 },
    { x: 3, y: 56, s: 0.6 },
    { x: 20, y: 62, s: 1.0 },
    { x: 11, y: 70, s: 0.8 },
    { x: 6, y: 78, s: 1.4 },
    { x: 17, y: 84, s: 0.7 },
    { x: 9, y: 92, s: 1.0 },
    { x: 24, y: 18, s: 0.5 },
    { x: 12, y: 38, s: 0.6 },
    { x: 2, y: 65, s: 0.9 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* Campo de estrelas — lado esquerdo */}
      <div className="absolute inset-y-0 left-0 w-[38%] sm:w-[32%] lg:w-[28%]">
        <svg className="h-full w-full opacity-[0.18] sm:opacity-[0.22]" viewBox="0 0 100 100" preserveAspectRatio="none">
          {stars.map((star, i) => (
            <circle
              key={i}
              cx={star.x}
              cy={(star.y + offset * 0.02) % 100}
              r={star.s * 0.35}
              fill="currentColor"
              className="text-vebook-white vebook-star-pulse"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Silhueta do Brasil — lado direito */}
      <div
        className="absolute top-0 right-0 h-full w-[62%] sm:w-[55%] lg:w-[48%] flex items-start justify-end pr-0 pt-[4vh]"
        style={{ transform: `translateY(${offset * 0.35}px)` }}
      >
        <svg
          viewBox="0 0 420 440"
          className="h-[92%] w-auto max-w-full opacity-[0.07] sm:opacity-[0.10] lg:opacity-[0.12] text-vebook-blue-muted"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Contorno simplificado do Brasil */}
          <path
            d="M210 28 C250 30 290 48 318 78 C348 112 368 150 378 188 C390 232 392 278 378 318 C362 362 330 398 286 418 C252 434 214 438 178 428 C142 416 112 388 92 352 C72 314 58 268 62 222 C66 178 86 138 118 108 C148 80 176 52 210 28 Z"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Malha de nós (rede) */}
          {[
            [180, 90],
            [230, 100],
            [270, 130],
            [300, 170],
            [320, 220],
            [310, 270],
            [280, 320],
            [240, 360],
            [190, 380],
            [150, 350],
            [120, 300],
            [110, 240],
            [130, 180],
            [160, 140],
            [200, 160],
            [240, 190],
            [260, 240],
            [220, 280],
            [180, 260],
            [160, 210],
          ].map(([x, y], i, arr) => (
            <g key={`n-${i}`}>
              {i > 0 && (
                <line
                  x1={arr[i - 1][0]}
                  y1={arr[i - 1][1]}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.55"
                />
              )}
              {i % 3 === 0 && i + 4 < arr.length && (
                <line
                  x1={x}
                  y1={y}
                  x2={arr[i + 4][0]}
                  y2={arr[i + 4][1]}
                  stroke="currentColor"
                  strokeWidth="0.6"
                  opacity="0.35"
                />
              )}
              <circle cx={x} cy={y} r={i % 4 === 0 ? 2.4 : 1.5} fill="currentColor" opacity={i % 4 === 0 ? 0.9 : 0.55} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
