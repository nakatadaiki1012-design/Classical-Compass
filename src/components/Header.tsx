import React from 'react';
import { ViewMode } from '../types';
import { Compass } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRandomPlay?: () => void;
}

const NAV_ITEMS: { view: ViewMode; label: string }[] = [
  { view: 'timeline', label: '年表' },
  { view: 'map', label: '地図' },
  { view: 'catalog', label: '名鑑' }
];

/** ヘッダーの高さ（px）。年表の高さ計算もこの値に合わせている */
export const HEADER_HEIGHT = 45;

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header
      className="sticky top-0 z-40 bg-[#161412]/95 backdrop-blur-md border-b border-[#2e2924] px-3 md:px-6"
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* ロゴ（狭い画面ではアイコンだけ） */}
        <button
          onClick={() => onViewChange('timeline')}
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-90 shrink-0"
          aria-label="Classical Compass（年表へ）"
        >
          <div className="w-7 h-7 rounded-full border border-[#c99738]/50 flex items-center justify-center bg-[#241f19]">
            <Compass className="w-3.5 h-3.5 text-[#c99738]" />
          </div>
          <span className="hidden sm:inline font-classical-display tracking-widest text-base font-bold text-[#f5ebd9] whitespace-nowrap">
            CLASSICAL COMPASS
          </span>
        </button>

        {/* 切り替えボタン：年表・地図・名鑑（どの画面でも1行に収まる） */}
        <nav className="flex items-center gap-1 bg-[#1e1a16] border border-[#2e2924] rounded-lg p-0.5 text-[13px] font-bold">
          {NAV_ITEMS.map(item => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`px-4 py-1 rounded-md whitespace-nowrap transition-colors ${
                currentView === item.view
                  ? 'bg-[#c99738] text-[#161412]'
                  : 'text-[#bdb1a1] hover:text-[#f5ebd9]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
