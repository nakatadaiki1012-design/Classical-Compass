import { Composition } from '../types';

/**
 * 録音（ウィキメディア・コモンズ）で聴ける名曲を、作曲家の作品一覧に追加するためのデータ。
 * キーは作曲家の id。composers.ts で、もとの作品のうしろにつなげる。
 * 録音そのものは recordings.ts（作品の id で結びつける）。
 */
type ExtraWork = Omit<Composition, 'audioSnippet'>;

const VIENNA: [number, number] = [16.3738, 48.2082];
const PARIS: [number, number] = [2.3522, 48.8566];
const VENICE: [number, number] = [12.3155, 45.4408];
const MOSCOW: [number, number] = [37.6173, 55.7558];
const ST_PETERSBURG: [number, number] = [30.32, 59.93];
const LONDON: [number, number] = [-0.1276, 51.5074];

const RAW: Record<string, ExtraWork[]> = {
  vivaldi: [
    {
      id: 'vivaldi-summer',
      title: '協奏曲集『四季』より「夏」第3楽章',
      originalTitle: "Le quattro stagioni: L'estate (Presto)",
      year: 1725,
      genre: 'Concerto',
      genreJa: '協奏曲',
      city: 'Venice',
      cityCoordinates: VENICE,
      description: '激しい夏の嵐を描いた楽章。稲妻のように駆け上がる音階と、叩きつける雨のような連打が続く、四季の中でもっとも劇的な場面。'
    },
    {
      id: 'vivaldi-autumn',
      title: '協奏曲集『四季』より「秋」第1楽章',
      originalTitle: "Le quattro stagioni: L'autunno (Allegro)",
      year: 1725,
      genre: 'Concerto',
      genreJa: '協奏曲',
      city: 'Venice',
      cityCoordinates: VENICE,
      description: '収穫を祝う村人たちの踊りと歌。お酒に酔ってふらつく様子まで、ヴァイオリンがユーモラスに描き出す。'
    }
  ],
  mozart: [
    {
      id: 'mozart-requiem-lacrimosa',
      title: '『レクイエム』より「ラクリモーサ（涙の日）」',
      originalTitle: 'Requiem in D minor, K. 626: Lacrimosa',
      year: 1791,
      genre: 'Choral',
      genreJa: '宗教曲・合唱',
      city: 'Vienna',
      cityCoordinates: VIENNA,
      description: 'モーツァルトが死の床で書き進め、最初の8小節で筆が止まったと伝わる楽章。弟子ジュースマイヤーが完成させた、悲しみに満ちた合唱。'
    }
  ],
  beethoven: [
    {
      id: 'beethoven-eroica',
      title: '交響曲第3番 変ホ長調『英雄』第1楽章',
      originalTitle: 'Symphonie Nr. 3 Es-Dur, Op. 55 "Eroica" (Allegro con brio)',
      year: 1804,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'Vienna',
      cityCoordinates: VIENNA,
      description: '2つの力強い和音で始まる、それまでの交響曲の常識を超えた大作。はじめナポレオンに捧げるつもりだったが、皇帝即位を知って献辞を破り捨てたという逸話がある。'
    },
    {
      id: 'beethoven-moonlight3',
      title: 'ピアノソナタ第14番『月光』第3楽章',
      originalTitle: 'Klaviersonate Nr. 14 cis-Moll, Op. 27-2 (Presto agitato)',
      year: 1801,
      genre: 'Piano',
      genreJa: 'ピアノ独奏',
      city: 'Vienna',
      cityCoordinates: VIENNA,
      description: '静かな第1楽章とは正反対の、嵐のように激しい終楽章。荒々しく駆け上がる分散和音が、若きベートーヴェンの情熱をそのまま伝える。'
    }
  ],
  brahms: [
    {
      id: 'brahms-sym3-3',
      title: '交響曲第3番 ヘ長調 第3楽章',
      originalTitle: 'Symphonie Nr. 3 F-Dur, Op. 90 (Poco allegretto)',
      year: 1883,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'Vienna',
      cityCoordinates: VIENNA,
      description: 'チェロが歌い出す、ため息のように切ない旋律で知られる楽章。映画やドラマにもたびたび使われてきた。'
    },
    {
      id: 'brahms-sym1-4',
      title: '交響曲第1番 ハ短調 第4楽章',
      originalTitle: 'Symphonie Nr. 1 c-Moll, Op. 68 (Adagio – Allegro non troppo, ma con brio)',
      year: 1876,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'Vienna',
      cityCoordinates: VIENNA,
      description: '構想から完成まで20年以上かけた最初の交響曲の終楽章。暗い序奏から、アルプホルンの調べを経て、ベートーヴェンの「歓喜の歌」を思わせる堂々とした主題へ至る。'
    }
  ],
  grieg: [
    {
      id: 'grieg-mountainking',
      title: '劇音楽『ペール・ギュント』より「山の魔王の宮殿にて」',
      originalTitle: 'Peer Gynt Suite No. 1, Op. 46: In the Hall of the Mountain King',
      year: 1875,
      genre: 'Orchestral',
      genreJa: '管弦楽組曲',
      city: 'Bergen',
      cityCoordinates: [5.3221, 60.3913],
      description: '低い楽器がこっそり歩くような主題を、だんだん速く、大きく繰り返していく。最後は魔物たちが大騒ぎで主人公を追いかける、ゲームやCMでもおなじみの曲。'
    }
  ],
  tchaikovsky: [
    {
      id: 'tchaikovsky-flowers',
      title: 'バレエ『くるみ割り人形』より「花のワルツ」',
      originalTitle: 'The Nutcracker Suite, Op. 71a: Waltz of the Flowers',
      year: 1892,
      genre: 'Ballet',
      genreJa: 'バレエ音楽',
      city: 'サンクト・ペテルブルク',
      cityCoordinates: ST_PETERSBURG,
      description: 'ハープの華やかな序奏に続き、ホルンと弦楽器が優雅なワルツを踊る。お菓子の国の花たちが舞う、バレエの終盤を彩る名曲。'
    },
    {
      id: 'tchaikovsky-swan-waltz',
      title: 'バレエ『白鳥の湖』より「ワルツ」',
      originalTitle: 'Swan Lake, Op. 20: No. 2 Waltz',
      year: 1876,
      genre: 'Ballet',
      genreJa: 'バレエ音楽',
      city: 'Moscow',
      cityCoordinates: MOSCOW,
      description: '第1幕、王子の成人を祝う宴で踊られる華やかなワルツ。白鳥の物語が始まる前の、明るくきらびやかな場面。'
    },
    {
      id: 'tchaikovsky-sym5',
      title: '交響曲第5番 ホ短調 第1楽章',
      originalTitle: 'Symphony No. 5 in E minor, Op. 64 (Andante – Allegro con anima)',
      year: 1888,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'Moscow',
      cityCoordinates: MOSCOW,
      description: 'クラリネットが低く奏でる「運命の主題」で始まる。この主題が全楽章に姿を変えて現れ、最後には勝利の行進へと変わっていく。'
    },
    {
      id: 'tchaikovsky-romeo',
      title: '幻想序曲『ロメオとジュリエット』',
      originalTitle: 'Romeo and Juliet, Fantasy-Overture',
      year: 1880,
      genre: 'Symphonic Poem',
      genreJa: '管弦楽曲',
      city: 'Moscow',
      cityCoordinates: MOSCOW,
      description: 'シェイクスピアの悲恋を描いた管弦楽曲。両家の争いを表す激しい部分と、ふたりの愛を歌う甘く大きな旋律が交互に現れる。'
    }
  ],
  mendelssohn: [
    {
      id: 'mendelssohn-italian',
      title: '交響曲第4番 イ長調『イタリア』第1楽章',
      originalTitle: "Symphony No. 4 in A major, Op. 90 'Italian' (Allegro vivace)",
      year: 1833,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'Berlin',
      cityCoordinates: [13.405, 52.52],
      description: 'イタリア旅行の明るい日差しを思わせる、弾むような第1楽章。きざむ木管の上で、ヴァイオリンが喜びいっぱいに駆け出す。'
    }
  ],
  dvorak: [
    {
      id: 'dvorak-nw4',
      title: '交響曲第9番『新世界より』第4楽章',
      originalTitle: "Symphony No. 9 in E minor 'From the New World', Op. 95 (Allegro con fuoco)",
      year: 1893,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'New York',
      cityCoordinates: [-74.006, 40.7128],
      description: '列車が走り出すような序奏から、金管が力強い主題を鳴らす終楽章。ニューヨーク滞在中に書かれ、それまでの楽章の主題が次々と回想される。'
    }
  ],
  schubert: [
    {
      id: 'schubert-impromptu',
      title: '即興曲 変ロ長調 D 935-3（主題と変奏）',
      originalTitle: 'Impromptu in B-flat major, D 935 No. 3',
      year: 1827,
      genre: 'Piano',
      genreJa: 'ピアノ独奏',
      city: 'Vienna',
      cityCoordinates: VIENNA,
      description: '劇音楽『ロザムンデ』にも使われた素朴な旋律を主題にした変奏曲。主題が5つの変奏で次々に表情を変えていく。'
    }
  ],
  chopin: [
    {
      id: 'chopin-waltz-brillante',
      title: 'ワルツ第2番 変イ長調 作品34-1『華麗なる円舞曲』',
      originalTitle: 'Valse brillante in A-flat major, Op. 34 No. 1',
      year: 1835,
      genre: 'Piano',
      genreJa: 'ピアノ独奏',
      city: 'Paris',
      cityCoordinates: PARIS,
      description: '華やかなファンファーレで始まる、舞踏会のきらめきそのもののようなワルツ。軽やかに回る旋律が次々と現れる。'
    }
  ],
  'saint-saens': [
    {
      id: 'saint-saens-swan',
      title: '組曲『動物の謝肉祭』より「白鳥」',
      originalTitle: 'Le Carnaval des animaux: Le Cygne',
      year: 1886,
      genre: 'Orchestral',
      genreJa: '組曲',
      city: 'パリ',
      cityCoordinates: [2.35, 48.86],
      description: '水面を静かにすべる白鳥を、チェロがなめらかに歌う。冗談の多い組曲の中で、作曲者が生前に出版を許した唯一の曲。'
    }
  ],
  holst: [
    {
      id: 'holst-mars',
      title: '組曲『惑星』より「火星（戦争をもたらす者）」',
      originalTitle: 'The Planets, Op. 32: I. Mars, the Bringer of War',
      year: 1914,
      genre: 'Orchestral',
      genreJa: '管弦楽組曲',
      city: 'ロンドン',
      cityCoordinates: [-0.13, 51.51],
      description: '5拍子の容赦ないリズムが刻まれ続ける、戦争の恐ろしさを描いた楽章。第一次世界大戦の始まる年に書かれ、のちの映画音楽にも大きな影響を与えた。'
    }
  ],
  wagner: [
    {
      id: 'wagner-meistersinger',
      title: '楽劇『ニュルンベルクのマイスタージンガー』第1幕への前奏曲',
      originalTitle: 'Die Meistersinger von Nürnberg: Vorspiel',
      year: 1867,
      genre: 'Opera',
      genreJa: '楽劇・管弦楽',
      city: 'Munich',
      cityCoordinates: [11.582, 48.1351],
      description: 'ワーグナーの作品では珍しい明るい喜劇の幕開け。堂々としたマーチ風の主題に、いくつもの旋律が重なり合って輝かしく盛り上がる。'
    }
  ],
  mahler: [
    {
      id: 'mahler-urlicht',
      title: '交響曲第2番『復活』より 第4楽章「原光」',
      originalTitle: 'Symphonie Nr. 2 "Auferstehung": IV. Urlicht',
      year: 1894,
      genre: 'Symphony',
      genreJa: '交響曲',
      city: 'Hamburg',
      cityCoordinates: [9.9937, 53.5511],
      description: 'アルトの独唱が「人間は大きな苦しみの中にいる」と静かに歌う、祈りのような短い楽章。続く壮大な終楽章への入り口となる。'
    }
  ],
  bizet: [
    {
      id: 'bizet-toreador',
      title: '歌劇『カルメン』より「闘牛士の歌」',
      originalTitle: 'Carmen: Votre toast, je peux vous le rendre (Toreador Song)',
      year: 1875,
      genre: 'Opera',
      genreJa: 'オペラ',
      city: 'パリ',
      cityCoordinates: [2.35, 48.86],
      description: '人気の闘牛士エスカミーリョが、酒場の人々に闘牛の興奮を歌って聞かせる。威勢のいい行進曲風の旋律は、運動会でもおなじみ。'
    }
  ],
  liszt: [
    {
      id: 'liszt-campanella',
      title: 'ラ・カンパネッラ（『パガニーニによる大練習曲』第3番）',
      originalTitle: 'Grandes études de Paganini, S. 141: No. 3 La campanella',
      year: 1851,
      genre: 'Piano',
      genreJa: 'ピアノ独奏',
      city: 'Weimar',
      cityCoordinates: [11.3287, 50.9787],
      description: 'パガニーニのヴァイオリン協奏曲の「鐘」の旋律を、ピアノの超絶技巧で描き直した曲。高音で鳴り続ける鐘の音を、右手が大きく跳びながら打ち鳴らす。'
    }
  ]
};

/** 作曲家の id ごとの、追加の作品（音の楽譜データはないので、空のまま） */
export const EXTRA_WORKS: Record<string, Composition[]> = Object.fromEntries(
  Object.entries(RAW).map(([cid, works]) => [
    cid,
    works.map(w => ({ ...w, audioSnippet: { type: 'audio' as const, notes: [], tempo: 0, instrument: 'orchestra' as const } }))
  ])
);
