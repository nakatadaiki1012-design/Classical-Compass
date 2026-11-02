import { ViewMode } from '../types';

/**
 * 「いま見ている画面・年・人物」をアドレス（URL の # 以降）に書いておく仕組み。
 * 例: …/#view=map&year=1787&composer=mozart
 * これで、アドレスをコピーして送れば、相手も同じ場面をそのまま開ける。
 *
 * 書き換えには replaceState を使う（履歴を増やさないので、戻るボタンの仕組み backStack の邪魔をしない）。
 */
export interface UrlState {
  view?: ViewMode;
  year?: number;
  composer?: string;
}

const VIEWS: ViewMode[] = ['timeline', 'map', 'catalog', 'history'];

const parse = (hash: string): UrlState => {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const out: UrlState = {};
  const view = p.get('view') as ViewMode | null;
  if (view && VIEWS.includes(view)) out.view = view;
  const year = parseInt(p.get('year') ?? '', 10);
  if (Number.isFinite(year) && year >= -600 && year <= 2030) out.year = year;
  const composer = p.get('composer');
  if (composer && /^[\w-]+$/.test(composer)) out.composer = composer;
  return out;
};

/** 開いたときのアドレスから読み取る（最初の1回だけ使う） */
export const readUrlState = (): UrlState =>
  typeof window === 'undefined' ? {} : parse(window.location.hash);

let current: UrlState = typeof window === 'undefined' ? {} : parse(window.location.hash);

const apply = () => {
  const p = new URLSearchParams();
  if (current.view) p.set('view', current.view);
  if (current.year !== undefined) p.set('year', String(current.year));
  if (current.composer) p.set('composer', current.composer);
  const q = p.toString();
  const url = `${window.location.pathname}${window.location.search}${q ? `#${q}` : ''}`;
  try {
    // state に印を付けておく（印のない履歴は「外から開かれた」と判断するため）
    window.history.replaceState(window.history.state ?? { ccUrl: 1 }, '', url);
  } catch {
    /* 書き換えられなくても動く */
  }
};

// 同じタブで別のリンク（#view=…）を開いたときに知らせる関数たち
const externalListeners = new Set<(s: UrlState) => void>();

const isSame = (a: UrlState, b: UrlState) =>
  a.view === b.view && a.year === b.year && a.composer === b.composer;

if (typeof window !== 'undefined') {
  // 最初の履歴にも印を付けておく（backStack より先に読み込まれる必要がある：main.tsx を参照）
  if (window.history.state === null || window.history.state === undefined) {
    try {
      window.history.replaceState({ ccUrl: 1 }, '');
    } catch {
      /* 付けられなくても動く */
    }
  }
  // 履歴が1つ戻ったとき（戻るボタン、または backStack の仕組み）に呼ばれる。
  // capture: true で、backStack より先に受け取る。
  window.addEventListener(
    'popstate',
    e => {
      const next = parse(window.location.hash);
      // このアプリが作った履歴（state に印がある）へ戻っただけなら、場面は変えない。
      // 印のない履歴は、アドレスバーにリンクを貼り付けるなどして新しくできたもの
      const ours = e.state !== null && e.state !== undefined;
      if (ours || isSame(next, current)) {
        // 戻るボタンの仕組み（backStack）が履歴を1つ戻すと古いアドレスが復活してしまうので、いまの状態を書き直す
        apply();
        return;
      }
      // アドレスが別の場面に変わった＝同じタブで別のリンクを開いた。戻るボタンとしては扱わない
      e.stopImmediatePropagation();
      current = next;
      apply(); // この履歴にも印を付ける（次に戻ってきたとき「外から」と誤解しないように）
      externalListeners.forEach(l => l(next));
    },
    true
  );
}
/** 外から（リンクの貼り付けなどで）アドレスが変わったときに呼ばれる関数を登録する */
export const onExternalUrlChange = (l: (s: UrlState) => void) => {
  externalListeners.add(l);
  return () => {
    externalListeners.delete(l);
  };
};

/** いまアドレスに書いてある状態 */
export const getUrlState = (): UrlState => current;

/** アドレスを更新する。undefined を渡した項目は消える */
export const writeUrlState = (patch: UrlState) => {
  if (typeof window === 'undefined') return;
  const next: UrlState = { ...current, ...patch };
  (Object.keys(next) as (keyof UrlState)[]).forEach(k => next[k] === undefined && delete next[k]);
  current = next;
  apply();
};

/** いまの場面を開けるアドレス（共有用） */
export const getShareUrl = (): string =>
  typeof window === 'undefined' ? '' : window.location.href;

/** アドレスをクリップボードにコピーする。成功したら true */
export const copyShareUrl = async (): Promise<boolean> => {
  const url = getShareUrl();
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
};
