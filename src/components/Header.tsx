import React from 'react';
import { ViewMode } from '../types';
import { Compass, Music2 } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRandomPlay: () => void;
}

const NAV_ITEMS: { view: ViewMode; label: string; shortLabel: string }[] = [
  { view: 'timeline', label: '年表タイムライン', shortLabel: '年表' },
  { view: 'map', label: 'ヨーロッパ音楽地図', shortLabel: '地図' },
  { view: 'catalog', label: '作曲家名鑑', shortLabel: '名鑑' }
];

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onRandomPlay }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#161412]/95 backdrop-blur-md border-b border-[#2e2924] px-4 md:px-8 py-3">
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
          {NAV_ITEMS.map(item => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                currentView === item.view
                  ? 'border-[#c99738] text-[#f5ebd9]'
                  : 'border-transparent text-[#b5aa9b] hover:text-[#e8dec8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={() => onViewChange('map')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/40 hover:border-[#c99738] text-[#e8dec8] hover:text-[#fff] text-xs font-medium transition-all shadow-sm whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-[#c99738]" />
            <span>音楽地図を開く</span>
          </button>
        </div>
      </div>

      {/* Mobile nav: tabs below the brand so views can be switched on phones */}
      <nav className="sm:hidden mt-3 grid grid-cols-3 gap-1 bg-[#1e1a16] border border-[#2e2924] rounded-lg p-1 text-xs font-bold">
        {NAV_ITEMS.map(item => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`py-2 rounded-md transition-colors ${
              currentView === item.view
                ? 'bg-[#c99738] text-[#161412]'
                : 'text-[#bdb1a1] hover:text-[#f5ebd9]'
            }`}
          >
            {item.shortLabel}
          </button>
        ))}
      </nav>
    </header>
  );
};
