import type { YearEventKind } from '../data/chronicle';

/** できごとの種類ごとの表示名と色（見出し・詳細・ポップアップで共通） */
export const KIND_LABEL: Record<YearEventKind, { label: string; className: string }> = {
  birth: { label: '誕生', className: 'bg-[#16301f] text-[#86efac] border-[#2c5a3b]' },
  death: { label: '没', className: 'bg-[#35202b] text-[#fbcfe8] border-[#5e3a4c]' },
  work: { label: '作品', className: 'bg-[#33280f] text-[#f0cd78] border-[#6b5420]' },
  episode: { label: 'できごと', className: 'bg-[#16263d] text-[#a9cdfb] border-[#2f4b73]' },
  world: { label: '世界', className: 'bg-[#2a2622] text-[#d1c6b6] border-[#4a4238]' }
};
