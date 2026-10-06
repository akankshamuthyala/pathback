import React from 'react';

interface SethuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const SethuLogo: React.FC<SethuLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Bridge/Path Icon SVG with Peach to Plum gradient */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FB923C] to-[#844377] p-1.5 shadow-sm shadow-[#844377]/20 ring-1 ring-[#FDD8CD]`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Bridge Arch */}
          <path
            d="M3 23 C9 13, 23 13, 29 23"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Bridge Pier Pillars */}
          <path
            d="M7 21 L7 27 M25 21 L25 27 M16 15 L16 27"
            stroke="#FED7AA"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Central Beacon of Hope / AI Core */}
          <circle cx="16" cy="9" r="3" fill="#FED7AA" />
          <circle cx="16" cy="9" r="5" stroke="#FFF7ED" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-slate-800 ${textSizes[size]} font-sans flex items-center gap-1`}>
          PathBack
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-plum-600"></span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] tracking-normal text-plum-700 font-medium">
            Finding a safer path back home.
          </span>
        )}
      </div>
    </div>
  );
};
export const PathBackLogo = SethuLogo;
