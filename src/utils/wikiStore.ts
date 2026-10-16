import { useSyncExternalStore } from 'react';
import { WikiTarget, targetKey } from '../data/glossary';

/**
 * ウィキペディアのように、ページを行ったり来たりするための「履歴」。
 * stack = 開いたページの並び、index = いま見ているページの位置。
 */
interface WikiState {
  open: boolean;
  stack: WikiTarget[];
  index: number;
}

let state: WikiState = { open: false, stack: [], index: -1 };
const listeners = new Set<() => void>();
const set = (s: WikiState) => {
  state = s;
  listeners.forEach(l => l());
};

/** 人物の「くわしい名鑑」を開く処理（App から登録する） */
let composerOpener: ((id: string) => void) | null = null;
export const setComposerOpener = (fn: (id: string) => void) => {
  composerOpener = fn;
};
export const openComposerDetail = (id: string) => {
  closeWiki();
  composerOpener?.(id);
};

export const openWiki = (target: WikiTarget) => {
  const cur = state.stack[state.index];
  if (state.open && cur && targetKey(cur) === targetKey(target)) return;
  const stack = [...state.stack.slice(0, state.index + 1), target];
  set({ open: true, stack, index: stack.length - 1 });
};
export const closeWiki = () => set({ open: false, stack: [], index: -1 });
export const wikiBack = () => state.index > 0 && set({ ...state, index: state.index - 1 });
export const wikiForward = () => state.index < state.stack.length - 1 && set({ ...state, index: state.index + 1 });
export const wikiJump = (i: number) => i >= 0 && i < state.stack.length && set({ ...state, index: i });

export const useWikiState = (): WikiState =>
  useSyncExternalStore(
    cb => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
