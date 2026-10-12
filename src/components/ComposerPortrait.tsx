import React, { useState } from 'react';
import { Composer } from '../types';
import { getEraById } from '../data/eras';
import { getAssetUrl } from '../utils/assets';

interface ComposerPortraitProps {
  composer: Composer;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOrnateBorder?: boolean;
}

export const ComposerPortrait: React.FC<ComposerPortraitProps> = ({
  composer,
  size = 'md',
  className = '',
  showOrnateBorder = true
}) => {
  const [hasError, setHasError] = useState(false);
  const era = getEraById(composer.era);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24 md:w-28 md:h-28',
    xl: 'w-36 h-36 md:w-44 md:h-44'
  }[size];

  // If external portrait fails or image loading is restricted in sandbox, render exquisite classical medallion silhouette
  if (hasError || !composer.portraitUrl) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center select-none ${sizeClasses} ${
          showOrnateBorder ? 'ring-2 ring-[#c99738]/50 ring-offset-2 ring-offset-[#121110]' : ''
        } ${className}`}
        style={{
          background: `radial-gradient(circle at 40% 30%, ${era.color}44, #1a1714)`
        }}
      >
        <div className="absolute inset-0 bg-[#0d0b09]/40 backdrop-blur-[1px]" />
        <div className="relative text-center px-1">
          <span className="font-classical-display font-bold text-[#f5ebd9] text-xs md:text-sm block">
            {composer.shortName.slice(0, 2)}
          </span>
          <span className="text-[11px] text-[#c99738] block font-mono">
            {composer.birthYear}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 bg-[#1e1b18] ${sizeClasses} ${
        showOrnateBorder ? 'ring-2 ring-[#c99738]/50 ring-offset-2 ring-offset-[#121110]' : ''
      } ${className}`}
    >
      <img
        src={getAssetUrl(composer.portraitUrl)}
        alt={composer.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-top filter contrast-[1.04] transition-transform duration-500 hover:scale-105"
      />
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/30 pointer-events-none" />
    </div>
  );
};
