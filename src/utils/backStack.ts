import { useEffect, useRef } from 'react';

/**
 * スマホの「戻る」ボタン（ブラウザの戻る）で、アプリから出てしまわないようにする仕組み。
 * 画面に重ねて開いたもの（人物の詳細、曲の解説、用語集など）を、戻るボタンで1つずつ閉じる。
 * 何も開いていないときに戻るを押すと、「もう一度押すと閉じます」と出す。
 */
type Entry = { id: number; onBack: () => void };
const stack: Entry[] = [];
let seq = 0;
let ignorePops = 0;
let initialized = false;
let lastRootPress = 0;

const showToast = (text: string) => {
  const el = document.createElement('div');
  el.textContent = text;
  el.setAttribute('role', 'status');
  el.style.cssText =
    'position:fixed;left:50%;bottom:72px;transform:translateX(-50%);z-index:9999;background:#2b241c;color:#f5ebd9;' +
    'border:1px solid #c99738;border-radius:999px;padding:8px 16px;font-size:13px;font-weight:bold;box-shadow:0 6px 20px #0008;';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
};

const onPop = () => {
  if (ignorePops > 0) {
    ignorePops--;
    return;
  }
  const top = stack.pop();
  if (top) {
    top.onBack();
    return;
  }
  // 何も開いていない：1回目は知らせるだけ、2秒以内にもう一度で本当に戻る
  const now = Date.now();
  if (now - lastRootPress < 2000) {
    window.history.back();
    return;
  }
  lastRootPress = now;
  showToast('もう一度「戻る」を押すと、アプリを閉じます');
  window.history.pushState({ cc: 'guard' }, '');
};

const init = () => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  window.history.pushState({ cc: 'guard' }, '');
  window.addEventListener('popstate', onPop);
};
if (typeof window !== 'undefined') init();

/** 戻るボタンで閉じられるものを登録する。返す id は releaseBack に渡す */
export function pushBack(onBack: () => void): number {
  init();
  const id = ++seq;
  stack.push({ id, onBack });
  window.history.pushState({ cc: id }, '');
  return id;
}

/** 画面のボタンなどで閉じたとき、登録を取り消す（ブラウザの履歴も1つずつ戻す） */
export function releaseBack(ids: number[]) {
  const live = ids.filter(id => stack.some(e => e.id === id));
  if (live.length === 0) return;
  live.forEach(id => stack.splice(stack.findIndex(e => e.id === id), 1));
  ignorePops++;
  window.history.go(-live.length);
}

/** 開いている間だけ、戻るボタンで onClose を呼ぶ */
export function useBackClose(active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    let byBack = false;
    const id = pushBack(() => {
      byBack = true;
      closeRef.current();
    });
    return () => {
      if (!byBack) releaseBack([id]);
    };
  }, [active]);
}
