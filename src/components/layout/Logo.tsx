import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showSubtitle = false,
}) => {
  const isLight = variant === 'light';

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* 
        Symbol: V inside a circle, evoking an approval tick, wheel rim, and digital stamp
      */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Subtle glow / inner background on dark mode */}
          {isLight && (
            <circle
              cx="22"
              cy="22"
              r="17"
              fill="#0F284E"
              opacity="0.6"
            />
          )}

          {/* Outer circle rim */}
          <circle
            cx="22"
            cy="22"
            r="16.5"
            stroke={isLight ? '#FFFFFF' : '#0B1E36'}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Inner tick / V stylized symbol */}
          <path
            d="M 13.5 21.5 L 20 28.5 L 31.5 13"
            stroke={isLight ? '#FFFFFF' : '#0B1E36'}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Subtle cyan/blue accent dot on the top corner */}
          <circle
            cx="31.5"
            cy="13"
            r="1.8"
            fill={isLight ? '#38BDF8' : '#2563EB'}
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight font-['Plus_Jakarta_Sans',sans-serif] ${textClasses[size]} ${
            isLight ? 'text-white' : 'text-[#0B1E36]'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          VEBOOK
        </span>
        {showSubtitle && (
          <span
            className={`text-[9px] font-semibold tracking-widest uppercase -mt-1 ${
              isLight ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            O Livro Digital do seu Veículo
          </span>
        )}
      </div>
    </div>
  );
};
