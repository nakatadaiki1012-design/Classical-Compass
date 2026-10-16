import { Composer, Composition } from '../types';

export interface FreeLink {
  label: string;
  note: string;
  url: string;
}

/** 検索に使う言葉：作曲者の姓 ＋ 原題（かっこ以降は省く） */
function searchWords(composer: Composer, work: Composition): string {
  const surname = composer.originalName.split(/\s+/).pop() ?? composer.originalName;
  const title = (work.originalTitle || work.title).split(/[（(]/)[0].trim();
  return `${surname} ${title}`.trim();
}

/**
 * 著作権フリー（パブリックドメインやクリエイティブ・コモンズ）の音源・動画・楽譜が集まっている
 * 公共のサイトの「検索結果ページ」へのリンクを作る。個別の動画は載せない
 * （消えたり、権利が変わったりするため）。
 */
export function getFreeMediaLinks(composer: Composer, work: Composition): FreeLink[] {
  const q = encodeURIComponent(searchWords(composer, work));
  const jaTitle = encodeURIComponent(work.title.split(/[（(]/)[0].trim());
  return [
    {
      label: 'ウィキメディア・コモンズで音源を探す',
      note: '演奏の録音',
      url: `https://commons.wikimedia.org/w/index.php?search=${q}&title=Special%3AMediaSearch&type=audio`
    },
    {
      label: 'ウィキメディア・コモンズで動画を探す',
      note: '演奏の映像',
      url: `https://commons.wikimedia.org/w/index.php?search=${q}&title=Special%3AMediaSearch&type=video`
    },
    {
      label: 'インターネット・アーカイブで音源を探す',
      note: '古い録音など',
      url: `https://archive.org/search?query=${q}&and%5B%5D=mediatype%3A%22audio%22`
    },
    {
      label: 'IMSLP（楽譜ライブラリ）で探す',
      note: '楽譜と録音',
      url: `https://imslp.org/index.php?search=${q}&title=Special%3ASearch`
    },
    {
      label: 'ウィキペディアで解説を読む',
      note: '曲についてのくわしい記事',
      url: `https://ja.wikipedia.org/w/index.php?search=${jaTitle}`
    }
  ];
}

/** 比較的新しい作品（作曲者の没後70年以内）は、録音に権利がある場合が多い */
export function mayBeCopyrighted(composer: Composer): boolean {
  return composer.deathYear > new Date().getFullYear() - 70;
}
