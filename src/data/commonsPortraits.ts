/**
 * 肖像画の画像ファイルを持っていない作曲家の、ウィキメディア・コモンズ上のファイル名。
 * 表示のときに https://commons.wikimedia.org/wiki/Special:FilePath/<ファイル名> から読み込む。
 * 読み込めなかったときは、ウィキペディアの記事の代表画像を探し、それも無ければ頭文字のマークになる。
 * 権利が不明確なものは含めていない。
 */
export const COMMONS_PORTRAITS: Record<string, string> = {
  'hildegard': 'Hildegard_von_Bingen.jpg',
  'dufay': 'DufayBinchois.jpg',
  'schutz': 'Schutz.jpg',
  'lully': 'Jean-Baptiste_Lully.jpeg',
  'corelli': 'Arcangelo_Corelli.jpg',
  'purcell': 'Henry_Purcell_by_John_Closterman.jpg',
  'couperin': 'François_Couperin.jpg',
  'pergolesi': 'GB_Pergolesi.jpg',
  'cpe-bach': 'CarlPhEmBach.jpg',
  'boccherini': 'LBoccherini.jpg',
  'salieri': 'Antonio_Salieri_painted_by_Joseph_Willibrord_Mähler.jpg',
  'weber': 'Caroline_Bardua_-_Bildnis_des_Komponisten_Carl_Maria_von_Weber.jpg',
  'bruckner': 'Anton_bruckner.jpg',
  'smetana': 'Smetana.jpg',
  'mussorgsky': 'Modest_Musorgskiy_1876_(cropped).jpg',
  'saint-saens': 'Camille_Saint-Saëns_in_1900_by_Pierre_Petit.jpg',
  'faure': 'Gabriel_Fauré_by_Pierre_Petit_1905_-_Gallica_2010_(adjusted).jpg',
  'clara-schumann': 'Franz_Hanfstaengl_-_Clara_Schumann_(1857).jpg',
  'donizetti': 'Gaetano_Donizetti_(portrait_by_Giuseppe_Rillosi).jpg',
  'elgar': 'Edward_Elgar.jpg'
};

export const commonsPortraitUrl = (composerId: string): string => {
  const name = COMMONS_PORTRAITS[composerId];
  return name ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=400` : '';
};
