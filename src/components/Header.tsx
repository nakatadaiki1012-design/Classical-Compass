import React from 'react';
import { ViewMode } from '../types';
import { Compass, Music2 } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRandomPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onRandomPlay }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#161412]/95 backdrop-blur-md border-b border-[#2e2924] px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (Single text element) */}
        <button
          onClick={() => onViewChange('timeline')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="w-8 h-8 rounded-full border border-[#c99738]/50 flex items-center justify-center bg-[#241f19] text-[#c99738]">
            <Compass className="w-4 h-4 text-[#c99738]" />
          </div>
          <span className="font-classical-display tracking-widest text-lg md:text-xl font-bold text-[#f5ebd9] whitespace-nowrap">
            CLASSICAL COMPASS
          </span>
        </button>

        {/* Zone 2: 3-4 single-line text nav links */}
        <nav className="hidden sm:flex items-center gap-6 md:gap-8 text-sm font-medium">
          <button
            onClick={() => onViewChange('timeline')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
              currentView === 'timeline'
                ? 'border-[#c99738] text-[#f5ebd9]'
                : 'border-transparent text-[#9c9388] hover:text-[#e8dec8]'
            }`}
          >
            年表タイムライン
          </button>
          <button
            onClick={() => onViewChange('map')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
              currentView === 'map'
                ? 'border-[#c99738] text-[#f5ebd9]'
                : 'border-transparent text-[#9c9388] hover:text-[#e8dec8]'
            }`}
          >
            ヨーロッパ音楽地図
          </button>
          <button
            onClick={() => onViewChange('catalog')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
              currentView === 'catalog'
                ? 'border-[#c99738] text-[#f5ebd9]'
                : 'border-transparent text-[#9c9388] hover:text-[#e8dec8]'
            }`}
          >
            作曲家名鑑
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRandomPlay}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/40 hover:border-[#c99738] text-[#e8dec8] hover:text-[#fff] text-xs font-medium transition-all shadow-sm whitespace-nowrap"
          >
            <Music2 className="w-3.5 h-3.5 text-[#c99738]" />
            <span>名曲をランダム試聴</span>
          </button>
        </div>
      </div>
    </header>
  );
};
