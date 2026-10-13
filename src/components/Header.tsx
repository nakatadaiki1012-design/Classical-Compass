import React from 'react';
import { ViewMode } from '../types';
import { Compass } from 'lucide-react';
import { setJapanMode, useJapanMode } from '../utils/japanMode';
import { setWorldMode, useWorldMode } from '../utils/worldMode';
import { SettingsMenu } from './SettingsMenu';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRandomPlay?: () => void;
}

const NAV_ITEMS: { view: ViewMode; label: string }[] = [
  { view: 'timeline', label: '年表' },
  { view: 'map', label: '地図' },
  { view: 'catalog', label: '名鑑' },
  { view: 'history', label: '音楽史' }
];

/** ヘッダーの高さ（px）。年表の高さ計算もこの値に合わせている */
export const HEADER_HEIGHT = 45;

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const japanMode = useJapanMode();
  const worldMode = useWorldMode();
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
              className={`px-3 sm:px-4 py-1 rounded-md whitespace-nowrap transition-colors ${
                currentView === item.view
                  ? 'bg-[#c99738] text-[#161412]'
                  : 'text-[#bdb1a1] hover:text-[#f5ebd9]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 日本音楽史オプション（八橋検校など日本の伝統音楽の人物と、日本音楽史のトピックを加える） */}
        <button
          onClick={() => setJapanMode(!japanMode)}
          aria-pressed={japanMode}
          title="日本の伝統音楽の人物と、日本音楽史のトピックを表示します"
          className={`shrink-0 px-2 sm:px-2.5 py-1 rounded-md border text-[12px] font-bold whitespace-nowrap transition-colors ${
            japanMode
              ? 'bg-[#b83b3b] border-[#b83b3b] text-white'
              : 'bg-[#1e1a16] border-[#2e2924] text-[#bdb1a1] hover:text-[#f5ebd9]'
          }`}
        >
          <span className="sm:hidden emoji">🇯🇵</span>
          <span className="hidden sm:inline"><span className="emoji">🇯🇵</span> 日本音楽史{japanMode ? ' ON' : ''}</span>
        </button>
        <button
          onClick={() => setWorldMode(!worldMode)}
          aria-pressed={worldMode}
          title="クラシック・日本以外の地域の音楽（ハワイ、インド、中南米、アフリカ、ジャズなど）を表示します"
          className={`shrink-0 px-2 sm:px-2.5 py-1 rounded-md border text-[12px] font-bold whitespace-nowrap transition-colors ${
            worldMode
              ? 'bg-[#2563eb] border-[#2563eb] text-white'
              : 'bg-[#1e1a16] border-[#2e2924] text-[#bdb1a1] hover:text-[#f5ebd9]'
          }`}
        >
          <span className="sm:hidden emoji">🌍</span>
          <span className="hidden sm:inline"><span className="emoji">🌍</span> 世界の音楽{worldMode ? ' ON' : ''}</span>
        </button>
        <SettingsMenu />
      </div>
    </header>
  );
};
