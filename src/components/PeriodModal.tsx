import { createPortal } from 'react-dom';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MusicPeriod } from '../data/musicPeriods';
import { PeriodDetail, periodRange } from './PeriodDetail';

interface PeriodModalProps {
  period: MusicPeriod;
  onClose: () => void;
  onOpenComposer: (composerId: string) => void;
}

/** 時代の説明を、画面の上に重ねて出す */
export const PeriodModal: React.FC<PeriodModalProps> = ({ period, onClose, onOpenComposer }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 親の要素に隠れないよう、画面全体の一番上（body 直下）に出す
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#14100c] border border-[#c99738]/50 p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="閉じる" className="absolute right-3 top-3 text-[#b5aa9b] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="mb-3 pr-8">
          <div className="text-[11px] font-mono font-bold text-[#e6b95c]">{periodRange(period)}</div>
          <h3 className="font-classical-display font-bold text-lg text-[#f5ebd9]">{period.name}</h3>
        </div>
        <PeriodDetail
          period={period}
          onOpenComposer={id => {
            onClose();
            onOpenComposer(id);
          }}
        />
      </div>
    </div>
    ,
    document.body
  );
};
