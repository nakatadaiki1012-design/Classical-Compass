/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ViewMode } from './types';
import { COMPOSERS, getComposerById } from './data/composers';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { EuropeMapView } from './components/EuropeMapView';
import { CatalogView } from './components/CatalogView';
import { PeriodsView } from './components/PeriodsView';
import { ComposerModal } from './components/ComposerModal';
import { WikiPanel } from './components/WikiPanel';
import { setComposerOpener } from './utils/wikiStore';
import { pushBack, useBackClose } from './utils/backStack';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { hasAudio } from './utils/hasAudio';
import { useJapanLevel } from './utils/japanMode';
import { useWorldMode } from './utils/worldMode';

function ClassicalAppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('timeline');
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>(null);
  // 人物詳細を開いたときの「いま見ていた年」（年表の中心年・地図の年）。なければ null
  const [modalYear, setModalYear] = useState<number | null>(null);
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
        {currentView === 'timeline' && (
          <TimelineView key={`tl-${modeKey}`} onSelectComposer={handleSelectComposer} />
        )}

        {currentView === 'map' && (
          <EuropeMapView key={`map-${modeKey}`} onSelectComposer={handleSelectComposer} />
        )}

        {currentView === 'history' && (
          <PeriodsView key={`hist-${modeKey}`} onSelectComposer={handleSelectComposer} />
        )}

        {currentView === 'catalog' && (
          <CatalogView key={`cat-${modeKey}`} onSelectComposer={handleSelectComposer} />
        )}
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
