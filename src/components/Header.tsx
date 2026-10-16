import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, Compass } from 'lucide-react';
import { openWiki } from '../utils/wikiStore';
import { setJapanLevel, useJapanLevel } from '../utils/japanMode';
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
  const japanLevel = useJapanLevel();
  const worldMode = useWorldMode();
  return (
    <header
      className="sticky top-0 z-40 bg-[#161412]/95 backdrop-blur-md border-b border-[#2e2924] px-3 md:px-6"
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* ロゴ（狭い画面ではアイコンだけ） */}
        <button
          onClick={() => onViewChange('timeline')}
          className="hidden min-[400px]:flex items-center gap-2 text-left transition-opacity hover:opacity-90 shrink-0"
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
              className={`px-2 sm:px-4 py-1 rounded-md whitespace-nowrap transition-colors ${
                currentView === item.view
                  ? 'bg-[#c99738] text-[#161412]'
                  : 'text-[#bdb1a1] hover:text-[#f5ebd9]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 日本音楽史オプション：押すたびに「オフ → 加える → 日本のみ → オフ」と切り替わる */}
        <button
          onClick={() => setJapanLevel(japanLevel === 'off' ? 'on' : japanLevel === 'on' ? 'only' : 'off')}
          aria-pressed={japanLevel !== 'off'}
          title={
            japanLevel === 'off'
              ? '押すと、日本の伝統音楽の人物とトピックを加えます'
              : japanLevel === 'on'
              ? 'もう一度押すと、日本の音楽だけを表示します'
              : 'もう一度押すと、元（西洋音楽）に戻ります'
          }
          className={`shrink-0 px-1.5 sm:px-2.5 py-1 rounded-md border text-[12px] font-bold whitespace-nowrap transition-colors ${
            japanLevel === 'only'
              ? 'bg-[#7f1d1d] border-[#fca5a5] text-white ring-1 ring-[#fca5a5]'
              : japanLevel === 'on'
              ? 'bg-[#b83b3b] border-[#b83b3b] text-white'
              : 'bg-[#1e1a16] border-[#2e2924] text-[#bdb1a1] hover:text-[#f5ebd9]'
          }`}
        >
          <span className="sm:hidden">
            <span className="emoji">🇯🇵</span>
            {japanLevel === 'only' && <span className="ml-0.5 text-[10px]">のみ</span>}
          </span>
          <span className="hidden sm:inline">
            <span className="emoji">🇯🇵</span> 日本音楽史{japanLevel === 'on' ? ' ON' : japanLevel === 'only' ? 'のみ' : ''}
          </span>
        </button>
        <button
          onClick={() => setWorldMode(!worldMode)}
          aria-pressed={worldMode}
          title="クラシック・日本以外の地域の音楽（ハワイ、インド、中南米、アフリカ、ジャズなど）を表示します"
          className={`${japanLevel === 'only' ? 'hidden' : ''} shrink-0 px-1.5 sm:px-2.5 py-1 rounded-md border text-[12px] font-bold whitespace-nowrap transition-colors ${
            worldMode
              ? 'bg-[#2563eb] border-[#2563eb] text-white'
              : 'bg-[#1e1a16] border-[#2e2924] text-[#bdb1a1] hover:text-[#f5ebd9]'
          }`}
        >
          <span className="sm:hidden emoji">🌍</span>
          <span className="hidden sm:inline"><span className="emoji">🌍</span> 世界の音楽{worldMode ? ' ON' : ''}</span>
        </button>
        <button
          onClick={() => openWiki({ kind: 'home' })}
          title="用語集（用語・作曲家・時代をリンクでたどる）"
          aria-label="用語集を開く"
          className="shrink-0 px-1.5 sm:px-2.5 py-1 rounded-md border border-[#2e2924] bg-[#1e1a16] text-[#bdb1a1] hover:text-[#f5ebd9] text-[12px] font-bold whitespace-nowrap flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">用語集</span>
        </button>
        <SettingsMenu />
      </div>
    </header>
  );
};
