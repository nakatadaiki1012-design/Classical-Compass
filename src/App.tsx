/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { ViewMode } from './types';
import { COMPOSERS, getComposerById } from './data/composers';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Header } from './components/Header';
import { readUrlState, writeUrlState } from './utils/urlState';

// 画面ごとにプログラムを分けて読み込む（最初に開くときの待ち時間を短くする）
const TimelineView = lazy(() => import('./components/TimelineView').then(m => ({ default: m.TimelineView })));
const EuropeMapView = lazy(() => import('./components/EuropeMapView').then(m => ({ default: m.EuropeMapView })));
const CatalogView = lazy(() => import('./components/CatalogView').then(m => ({ default: m.CatalogView })));
const PeriodsView = lazy(() => import('./components/PeriodsView').then(m => ({ default: m.PeriodsView })));

/** 画面の読み込み中に出す表示 */
const ViewLoading = () => (
  <div className="flex-1 flex items-center justify-center text-sm text-[#a3978a]">読み込み中…</div>
);

// 開いたときのアドレス（#view=map&year=1787&composer=mozart など）から、最初の場面を決める
const initialUrl = readUrlState();
import { ComposerModal } from './components/ComposerModal';
import { WikiPanel } from './components/WikiPanel';
import { setComposerOpener } from './utils/wikiStore';
import { pushBack, useBackClose } from './utils/backStack';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { hasAudio } from './utils/hasAudio';
import { useJapanLevel } from './utils/japanMode';
import { useWorldMode } from './utils/worldMode';

function ClassicalAppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>(initialUrl.view ?? 'timeline');
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>(
    initialUrl.composer && getComposerById(initialUrl.composer) ? initialUrl.composer : null
  );
  // 人物詳細を開いたときの「いま見ていた年」（年表の中心年・地図の年）。なければ null
  const [modalYear, setModalYear] = useState<number | null>(initialUrl.year ?? null);
  const { playTrack } = useAudio();
  // 「日本音楽史」オプションを切り替えたら、画面を作り直して表示を入れ替える
  const japanMode = useJapanLevel();
  const worldMode = useWorldMode();
  const modeKey = `${japanMode}-${worldMode}`;

  const handleSelectComposer = useCallback((composerId: string, year?: number) => {
    setSelectedComposerId(composerId);
    setModalYear(year ?? null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedComposerId(null);
  }, []);
  useBackClose(!!selectedComposerId, handleCloseModal);

  // 画面（年表・地図・名鑑・音楽史）を切り替えたら、スマホの戻るボタンで前の画面に戻れるようにする
  const handleViewChange = useCallback(
    (v: ViewMode) => {
      if (v === currentView) return;
      const prev = currentView;
      setCurrentView(v);
      pushBack(() => setCurrentView(prev));
    },
    [currentView]
  );

  // Pick a random masterpiece across all composers
  const handleRandomPlay = useCallback(() => {
    const allWorks: { work: (typeof COMPOSERS)[0]['works'][0]; composer: (typeof COMPOSERS)[0] }[] = [];
    COMPOSERS.forEach(composer => {
      composer.works.forEach(work => {
        if (hasAudio(work)) allWorks.push({ work, composer });
      });
    });

    if (allWorks.length > 0) {
      const randomIndex = Math.floor(Math.random() * allWorks.length);
      const chosen = allWorks[randomIndex];
      playTrack(chosen.work, chosen.composer);
    }
  }, [playTrack]);

  useEffect(() => {
    setComposerOpener(id => handleSelectComposer(id));
  }, [handleSelectComposer]);

  // いま見ている画面と人物をアドレスに書いておく（コピーして送れば同じ場面が開く）
  useEffect(() => {
    writeUrlState({ view: currentView, composer: selectedComposerId ?? undefined });
  }, [currentView, selectedComposerId]);

  const selectedComposer = selectedComposerId ? getComposerById(selectedComposerId) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#121110] text-[#f4eee4] selection:bg-[#c99738]/30 selection:text-[#fbf7ee]">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        onRandomPlay={handleRandomPlay}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Suspense fallback={<ViewLoading />}>
          {currentView === 'timeline' && (
            <TimelineView key={`tl-${modeKey}`} onSelectComposer={handleSelectComposer} initialYear={initialUrl.year} />
          )}

          {currentView === 'map' && (
            <EuropeMapView key={`map-${modeKey}`} onSelectComposer={handleSelectComposer} initialYear={initialUrl.year} />
          )}

          {currentView === 'history' && (
            <PeriodsView key={`hist-${modeKey}`} onSelectComposer={handleSelectComposer} />
          )}

          {currentView === 'catalog' && (
            <CatalogView key={`cat-${modeKey}`} onSelectComposer={handleSelectComposer} />
          )}
        </Suspense>
      </main>

      {/* 用語・作曲家・時代のウィキ風ページ（行ったり来たりできる） */}
      <WikiPanel />

      {/* Composer Full Profile Modal */}
      <ComposerModal
        composer={selectedComposer}
        year={modalYear}
        onClose={handleCloseModal}
        onSelectComposer={handleSelectComposer}
      />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <ClassicalAppContent />
    </AudioProvider>
  );
}
