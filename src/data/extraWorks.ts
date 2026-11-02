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

/** 2回目の追加分（録音で聴ける有名曲） */
const RAW2: Record<string, ExtraWork[]> = {
  bach: [
    w('bach-brandenburg3', 'ブランデンブルク協奏曲 第3番 第1楽章', 'Brandenburg Concerto No. 3 in G major, BWV 1048 (Allegro)', 1721, 'Concerto', '協奏曲', 'Köthen', [11.9708, 51.7516],
      '3つずつのヴァイオリン・ヴィオラ・チェロが、追いかけ合いながら弾む。ソロ楽器を立てず、弦楽器みんなが主役になる明るい協奏曲。'),
    w('bach-cello1', '無伴奏チェロ組曲 第1番 プレリュード', 'Cello Suite No. 1 in G major, BWV 1007: Prélude', 1720, 'Solo', '独奏曲', 'Köthen', [11.9708, 51.7516],
      'チェロ1本で和音の流れを描く、チェロ奏者にとっての「聖典」の冒頭。長く忘れられていたが、カザルスが再発見して広まった。'),
    w('bach-jesu', 'カンタータ第147番より「主よ、人の望みの喜びよ」', 'Cantata BWV 147: Jesus bleibet meine Freude', 1723, 'Choral', '宗教曲・合唱', 'Leipzig', [12.3731, 51.3397],
      '流れるような3連符の伴奏の上に、穏やかなコラール（賛美歌）が重なる。結婚式などでも親しまれるバッハの代表曲。'),
    w('bach-goldberg', '『ゴルトベルク変奏曲』よりアリア', 'Goldberg Variations, BWV 988: Aria', 1741, 'Keyboard', '鍵盤曲', 'Leipzig', [12.3731, 51.3397],
      '30の変奏の土台になる、静かで装飾の美しいアリア。眠れない伯爵のために弾かれたという逸話がある。'),
    w('bach-minuet', 'メヌエット ト長調（『アンナ・マクダレーナ・バッハの音楽帳』より）', 'Minuet in G major, BWV Anh. 114', 1725, 'Keyboard', '鍵盤曲', 'Leipzig', [12.3731, 51.3397],
      'ピアノを習う人の多くが最初に弾く、愛らしいメヌエット。じつはバッハではなく、ペツォールトという作曲家の作品とわかっている。')
  ],
  handel: [
    w('handel-water', '『水上の音楽』より「ホーンパイプ」', 'Water Music, HWV 349: Alla Hornpipe', 1717, 'Orchestral', '管弦楽組曲', 'London', LONDON,
      'テムズ川を下る国王の船遊びのために書かれた音楽。ホルンとトランペットが晴れやかに鳴る、いちばん有名な曲。'),
    w('handel-largo', '歌劇『セルセ』より「オンブラ・マイ・フ（ラルゴ）」', 'Serse, HWV 40: Ombra mai fu', 1738, 'Opera', 'オペラ', 'London', LONDON,
      'ペルシャ王が木陰の心地よさをたたえて歌う、ゆったりとした美しいアリア。「ヘンデルのラルゴ」として器楽でも親しまれる。'),
    w('handel-sarabande', '鍵盤組曲 ニ短調 HWV 437より「サラバンド」', 'Keyboard Suite in D minor, HWV 437: Sarabande', 1733, 'Keyboard', '鍵盤曲', 'London', LONDON,
      '重々しく、厳かな舞曲の主題と変奏。映画『バリー・リンドン』で使われて広く知られるようになった。')
  ],
  vivaldi: [
    w('vivaldi-winter2', '協奏曲集『四季』より「冬」第2楽章', "Le quattro stagioni: L'inverno (Largo)", 1725, 'Concerto', '協奏曲', 'Venice', VENICE,
      '外は冷たい雨、暖炉のそばでくつろぐ時間。雨だれのようなピッツィカートの上で、ヴァイオリンがのどかに歌う。')
  ],
  mozart: [
    w('mozart-k545', 'ピアノソナタ第16番 ハ長調 K.545 第1楽章', 'Piano Sonata No. 16 in C major, K. 545 (Allegro)', 1788, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      '「初心者のための小さなソナタ」と作曲者自身が書いた、明るく親しみやすい曲。ピアノの発表会でもおなじみ。'),
    w('mozart-figaro', '歌劇『フィガロの結婚』序曲', 'Le nozze di Figaro, K. 492: Overture', 1786, 'Opera', 'オペラ', 'Vienna', VIENNA,
      'ささやくような弦楽器の駆け足で始まり、一気に華やかに盛り上がる。「狂おしい一日」を描く喜劇の幕開けにぴったりの序曲。'),
    w('mozart-queen', '歌劇『魔笛』より「夜の女王のアリア（復讐の炎は地獄のように）」', 'Die Zauberflöte, K. 620: Der Hölle Rache kocht in meinem Herzen', 1791, 'Opera', 'オペラ', 'Vienna', VIENNA,
      '怒りに燃える夜の女王が、娘に復讐を命じる。ソプラノの最高音域を何度も跳ねる超絶技巧のアリア。'),
    w('mozart-jupiter', '交響曲第41番 ハ長調『ジュピター』第4楽章', 'Symphony No. 41 in C major, K. 551 "Jupiter" (Molto allegro)', 1788, 'Symphony', '交響曲', 'Vienna', VIENNA,
      'モーツァルト最後の交響曲の終楽章。4つの音の主題を中心に、5つの旋律が同時に組み合わさる圧巻のフィナーレ。'),
    w('mozart-clarinet', 'クラリネット協奏曲 イ長調 K.622 第2楽章', 'Clarinet Concerto in A major, K. 622 (Adagio)', 1791, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      '亡くなる2か月前に書かれた、澄みきった祈りのような緩徐楽章。映画『愛と哀しみの果て』でも使われた。')
  ],
  beethoven: [
    w('beethoven-elise', '「エリーゼのために」', 'Für Elise, WoO 59', 1810, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      '誰もが知るピアノ小品。「エリーゼ」が誰なのかはわかっておらず、「テレーゼ」の読み間違いという説もある。'),
    w('beethoven-pathetique', 'ピアノソナタ第8番『悲愴』第2楽章', 'Klaviersonate Nr. 8 c-Moll, Op. 13 "Pathétique" (Adagio cantabile)', 1798, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      '激しい第1楽章のあとに置かれた、深く穏やかな歌。のちに多くの歌やポップスにも旋律が使われた。'),
    w('beethoven-pastoral', '交響曲第6番 ヘ長調『田園』第1楽章', 'Symphonie Nr. 6 F-Dur, Op. 68 "Pastorale" (Allegro ma non troppo)', 1808, 'Symphony', '交響曲', 'Vienna', VIENNA,
      '「田舎に着いたときの晴れやかな気分」と題された楽章。小さな動機をくり返しながら、のどかな風景が広がっていく。'),
    w('beethoven-emperor', 'ピアノ協奏曲第5番『皇帝』第2楽章', 'Klavierkonzert Nr. 5 Es-Dur, Op. 73 "Emperor" (Adagio un poco mosso)', 1809, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      'ナポレオン軍のウィーン占領のさなかに書かれた協奏曲の、静かで夢のような楽章。終わり近くで切れ目なく終楽章へつながる。')
  ],
  haydn: [
    w('haydn-trumpet', 'トランペット協奏曲 変ホ長調 第3楽章', 'Trumpet Concerto in E-flat major, Hob. VIIe:1 (Allegro)', 1796, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      '新しく発明された「キー付きトランペット」のために書かれ、それまで吹けなかった音階を軽やかに吹きこなす。トランペット奏者の定番曲。')
  ],
  schubert: [
    w('schubert-unfinished', '交響曲第7（8）番 ロ短調『未完成』第1楽章', "Symphony No. 8 in B minor, D 759 'Unfinished' (Allegro moderato)", 1822, 'Symphony', '交響曲', 'Vienna', VIENNA,
      '2つの楽章だけで残された交響曲。低い弦の不安げな主題のあと、チェロが歌う美しい第2主題が現れる。'),
    w('schubert-erlkonig', '歌曲『魔王』', 'Erlkönig, D 328', 1815, 'Choral', '歌曲', 'Vienna', VIENNA,
      '嵐の夜、病気の子を抱いて馬を走らせる父親。ひとりの歌手が父・子・魔王・語り手を歌い分ける。シューベルト18歳の作品。')
  ],
  chopin: [
    w('chopin-minute', 'ワルツ第6番 変ニ長調『小犬のワルツ』', "Waltz in D-flat major, Op. 64 No. 1 'Minute Waltz'", 1847, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '自分のしっぽを追いかけてくるくる回る小犬を描いたといわれる、軽やかなワルツ。'),
    w('chopin-raindrop', '前奏曲 第15番 変ニ長調『雨だれ』', "Prélude in D-flat major, Op. 28 No. 15 'Raindrop'", 1838, 'Piano', 'ピアノ独奏', 'Mallorca', [2.65, 39.57],
      'マヨルカ島の修道院で書かれた前奏曲。曲のあいだずっと、雨だれのように同じ音が静かに打たれ続ける。'),
    w('chopin-heroic', 'ポロネーズ第6番 変イ長調『英雄』', "Polonaise in A-flat major, Op. 53 'Héroïque'", 1842, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '祖国ポーランドの誇りを込めた、堂々とした舞曲。左手のオクターブが騎馬隊の行進のように鳴り響く中間部も有名。'),
    w('chopin-revolutionary', '練習曲 ハ短調 作品10-12『革命』', "Étude in C minor, Op. 10 No. 12 'Revolutionary'", 1831, 'Piano', 'ピアノ独奏', 'Stuttgart', [9.1829, 48.7758],
      'ワルシャワがロシア軍に占領されたと聞いたショパンの怒りと悲しみが込められたといわれる。左手が嵐のように駆けめぐる。'),
    w('chopin-funeral', 'ピアノソナタ第2番 変ロ短調より 第3楽章「葬送行進曲」', 'Piano Sonata No. 2 in B-flat minor, Op. 35: III. Marche funèbre', 1839, 'Piano', 'ピアノ独奏', 'Nohant', [1.9798, 46.5836],
      '重い足どりの葬送行進曲と、その間にはさまれた天国のように穏やかな中間部。ショパン自身の葬儀でも演奏された。'),
    w('chopin-ballade', 'バラード第1番 ト短調', 'Ballade No. 1 in G minor, Op. 23', 1835, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '物語を語るように始まり、哀しい旋律と激しい盛り上がりをくり返して劇的な結末へ向かう。ピアノの名曲中の名曲。')
  ],
  liszt: [
    w('liszt-hungarian2', 'ハンガリー狂詩曲 第2番', 'Hungarian Rhapsody No. 2 in C-sharp minor, S. 244/2', 1847, 'Piano', 'ピアノ独奏', 'Weimar', [11.3287, 50.9787],
      'ゆっくりと重々しい前半「ラッサン」から、目まぐるしく速い後半「フリスカ」へ。アニメやCMでもよく使われる。のちに管弦楽にも編曲された。')
  ],
  mendelssohn: [
    w('mendelssohn-violin', 'ヴァイオリン協奏曲 ホ短調 第1楽章', 'Violin Concerto in E minor, Op. 64 (Allegro molto appassionato)', 1844, 'Concerto', '協奏曲', 'Leipzig', [12.3731, 51.3397],
      '前置きなしにすぐヴァイオリンが切ない主題を歌い出す。「メンコン」の愛称で親しまれる、ロマン派ヴァイオリン協奏曲の代表。')
  ],
  tchaikovsky: [
    w('tchaikovsky-1812', '大序曲『1812年』', '1812 Overture, Op. 49', 1880, 'Orchestral', '管弦楽曲', 'Moscow', MOSCOW,
      'ナポレオン軍のモスクワ侵攻と撤退を描いた序曲。フランス国歌とロシアの聖歌がぶつかり合い、最後は大砲と鐘が鳴り響く。'),
    w('tchaikovsky-pc1', 'ピアノ協奏曲第1番 変ロ短調 第1楽章', 'Piano Concerto No. 1 in B-flat minor, Op. 23 (Allegro non troppo e molto maestoso)', 1875, 'Concerto', '協奏曲', 'Moscow', MOSCOW,
      'ホルンの合図と、ピアノの力強い和音にのって弦楽器が歌う雄大な序奏。はじめは「弾けない」と酷評されたが、今では最も人気のある協奏曲のひとつ。'),
    w('tchaikovsky-pathetique', '交響曲第6番 ロ短調『悲愴』第4楽章', "Symphony No. 6 in B minor, Op. 74 'Pathétique' (Adagio lamentoso)", 1893, 'Symphony', '交響曲', 'Saint Petersburg', ST_PETERSBURG,
      '交響曲の終わりとしては珍しい、ゆっくりと沈んでいく嘆きの音楽。初演の9日後にチャイコフスキーは世を去った。')
  ],
  brahms: [
    w('brahms-lullaby', '「子守歌（ブラームスの子守歌）」', 'Wiegenlied, Op. 49 No. 4', 1868, 'Choral', '歌曲', 'Vienna', VIENNA,
      '友人の子どもの誕生祝いに贈られた、やさしい子守歌。オルゴールやベビー用品のメロディーとして世界中で親しまれる。')
  ],
  dvorak: [
    w('dvorak-humoresque', 'ユーモレスク 第7番 変ト長調', 'Humoresque in G-flat major, Op. 101 No. 7', 1894, 'Piano', 'ピアノ曲', 'Vysoká', [13.9, 49.65],
      '軽く跳ねるリズムが楽しいピアノ小品。もとはピアノ曲だが、ヴァイオリンなどに編曲されて世界中に広まった。')
  ],
  grieg: [
    w('grieg-concerto', 'ピアノ協奏曲 イ短調 第1楽章', 'Piano Concerto in A minor, Op. 16 (Allegro molto moderato)', 1868, 'Concerto', '協奏曲', 'Copenhagen', [12.5683, 55.6761],
      'ティンパニの一打ちのあと、ピアノが滝のように駆け下りる劇的な冒頭で有名。ノルウェーの民俗音楽の香りが漂う、グリーグ唯一の協奏曲。')
  ],
  verdi: [
    w('verdi-donna', '歌劇『リゴレット』より「女心の歌」', 'Rigoletto: La donna è mobile', 1851, 'Opera', 'オペラ', 'Venice', VENICE,
      '「女は気まぐれ、風の中の羽のよう」と浮気な公爵が歌う。初演前は旋律がもれないよう、歌手にも直前まで楽譜が渡されなかった。'),
    w('verdi-aida', '歌劇『アイーダ』より「凱旋行進曲」', 'Aida: Triumphal March', 1871, 'Opera', 'オペラ', 'Cairo', [31.2357, 30.0444],
      'エジプト軍の勝利を祝う、トランペットが高らかに鳴り響く行進曲。サッカーの応援歌としても世界中で歌われる。'),
    w('verdi-nabucco', '歌劇『ナブッコ』より「行け、わが思いよ、金色の翼に乗って」', 'Nabucco: Va, pensiero', 1842, 'Opera', 'オペラ', 'Milan', [9.19, 45.4642],
      '捕らわれのヘブライ人たちが故郷を思って歌う合唱。イタリア統一運動の時代に人々の心を励まし、「第二の国歌」とも呼ばれる。')
  ],
  puccini: [
    w('puccini-babbino', '歌劇『ジャンニ・スキッキ』より「私のお父さん」', 'Gianni Schicchi: O mio babbino caro', 1918, 'Opera', 'オペラ', 'Milan', [9.19, 45.4642],
      '恋人との結婚を許してほしいと、娘が父に甘えて歌う。短い喜劇の中のアリアだが、プッチーニの旋律の中でも特に愛されている。')
  ],
  debussy: [
    w('debussy-arabesque', 'アラベスク 第1番', 'Première Arabesque', 1891, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '流れるような3連符の分散和音が、唐草模様（アラベスク）のように絡み合う。若いドビュッシーの、やさしく明るいピアノ曲。'),
    w('debussy-faune', '『牧神の午後への前奏曲』', "Prélude à l'après-midi d'un faune", 1894, 'Orchestral', '管弦楽曲', 'Paris', PARIS,
      'フルートのけだるい独奏で始まる、夢とうつつの境のような音楽。「近代音楽はここから始まった」とも言われる。')
  ],
  'strauss-jr': [
    w('strauss-emperor', 'ワルツ『皇帝円舞曲』', 'Kaiser-Walzer, Op. 437', 1889, 'Orchestral', 'ワルツ', 'Vienna', VIENNA,
      '行進曲風の序奏から始まる、堂々として気品のあるワルツ。オーストリアとドイツの皇帝の友好を祝って書かれた。')
  ],
  'saint-saens': [
    w('saint-saens-macabre', '交響詩『死の舞踏』', 'Danse macabre, Op. 40', 1874, 'Symphonic Poem', '交響詩', 'パリ', [2.35, 48.86],
      '真夜中の鐘が12回鳴ると、死神のヴァイオリンに合わせて骸骨たちが踊り出す。シロフォン（木琴）が骨の鳴る音を表す。')
  ],
  mussorgsky: [
    w('mussorgsky-kiev', '組曲『展覧会の絵』より「キエフの大門」', 'Pictures at an Exhibition: The Great Gate of Kiev', 1874, 'Piano', 'ピアノ曲', 'サンクト・ペテルブルク', [30.32, 59.93],
      '組曲を締めくくる、壮大な門と鐘の響きを描いた終曲。冒頭の「プロムナード」の旋律が堂々と回想される。')
  ],
  wagner: [
    w('wagner-tristan', '楽劇『トリスタンとイゾルデ』前奏曲', 'Tristan und Isolde: Vorspiel', 1859, 'Opera', '楽劇・管弦楽', 'Venice', VENICE,
      'チェロの憧れに満ちた旋律と、解決しないまま次へ次へと進む和音（トリスタン和音）。のちの音楽の和声を大きく変えた。')
  ],
  paganini: [
    w('paganini-moto', '「無窮動（モト・ペルペトゥオ）」', 'Moto perpetuo, Op. 11', 1835, 'Solo', 'ヴァイオリン曲', 'Genoa', [8.9463, 44.4056],
      '最初から最後まで、休みなく速い音符が続くヴァイオリンの技巧曲。止まらない機械のような音の流れに圧倒される。')
  ]
};

function w(
  id: string,
  title: string,
  originalTitle: string,
  year: number,
  genre: Composition['genre'],
  genreJa: string,
  city: string,
  cityCoordinates: [number, number],
  description: string
): ExtraWork {
  return { id, title, originalTitle, year, genre, genreJa, city, cityCoordinates, description };
}

/** 3回目の追加分（なるべく新しい録音があるもの） */
const RAW3: Record<string, ExtraWork[]> = {
  bach: [
    w('bach-wtc1', '『平均律クラヴィーア曲集』第1巻より 前奏曲 第1番 ハ長調', 'Well-Tempered Clavier, Book 1: Prelude No. 1 in C major, BWV 846', 1722, 'Keyboard', '鍵盤曲', 'Köthen', [11.9708, 51.7516],
      '分散和音だけで静かに流れていく、平均律曲集の最初の曲。のちにグノーがこの上に旋律をのせて「アヴェ・マリア」を作った。'),
    w('bach-double', '2つのヴァイオリンのための協奏曲 ニ短調 第1楽章', 'Concerto for Two Violins in D minor, BWV 1043 (Vivace)', 1730, 'Concerto', '協奏曲', 'Leipzig', [12.3731, 51.3397],
      '2人のヴァイオリン独奏者が、同じ旋律を少しずらして追いかけ合う。対等な二人の対話のような協奏曲。'),
    w('bach-badinerie', '管弦楽組曲 第2番より「バディヌリー」', 'Orchestral Suite No. 2 in B minor, BWV 1067: Badinerie', 1739, 'Orchestral', '管弦楽組曲', 'Leipzig', [12.3731, 51.3397],
      '「冗談」という意味の、フルートが軽やかに駆け回る短い終曲。フルート奏者の腕の見せどころ。')
  ],
  handel: [
    w('handel-sheba', 'オラトリオ『ソロモン』より「シバの女王の到着」', 'Solomon, HWV 67: The Arrival of the Queen of Sheba', 1749, 'Choral', 'オラトリオ', 'London', LONDON,
      '2本のオーボエと弦楽器が華やかに掛け合う、女王の到着を告げる器楽曲。ロンドン五輪の開会式でも使われた。'),
    w('handel-zadok', '戴冠式アンセム『司祭ザドク』', 'Zadok the Priest, HWV 258', 1727, 'Choral', '宗教曲・合唱', 'London', LONDON,
      'ジョージ2世の戴冠式のために書かれ、以来すべての英国王の戴冠式で歌われてきた。静かな序奏から合唱が一気に爆発する。')
  ],
  mozart: [
    w('mozart-aveverum', 'モテット『アヴェ・ヴェルム・コルプス』', 'Ave verum corpus, K. 618', 1791, 'Choral', '宗教曲・合唱', 'Baden', [16.2341, 48.0049],
      '亡くなる半年前、療養中の妻のいる町の合唱指揮者のために書いた、わずか46小節の祈りの歌。'),
  ],
  beethoven: [
    w('beethoven-egmont', '劇音楽『エグモント』序曲', 'Egmont Overture, Op. 84', 1810, 'Orchestral', '管弦楽曲', 'Vienna', VIENNA,
      '圧政に立ち向かって処刑される英雄を描いたゲーテの劇のための序曲。重苦しい序奏から、最後は勝利の歓声のように輝かしく終わる。'),
    w('beethoven-violin', 'ヴァイオリン協奏曲 ニ長調 第3楽章', 'Violin Concerto in D major, Op. 61 (Rondo. Allegro)', 1806, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      'ヴァイオリンが狩りの歌のような主題を弾ませる、明るいロンドの終楽章。ベートーヴェン唯一のヴァイオリン協奏曲。')
  ],
  mendelssohn: [
    w('mendelssohn-hebrides', '序曲『フィンガルの洞窟（ヘブリディーズ諸島）』', 'The Hebrides (Fingal\'s Cave) Overture, Op. 26', 1830, 'Orchestral', '管弦楽曲', 'London', LONDON,
      'スコットランドの島の洞窟を訪れた感動から生まれた序曲。寄せては返す波と、海の広がりが目に浮かぶ。')
  ],
  chopin: [
    w('chopin-nocturne20', '夜想曲 第20番 嬰ハ短調（遺作）', 'Nocturne in C-sharp minor, Op. posth.', 1830, 'Piano', 'ピアノ独奏', 'Warsaw', [21.0122, 52.2297],
      '20歳のショパンが姉に贈った、哀しく美しいノクターン。映画『戦場のピアニスト』で印象的に使われた。'),
    w('chopin-prelude4', '前奏曲 第4番 ホ短調', 'Prélude in E minor, Op. 28 No. 4', 1839, 'Piano', 'ピアノ独奏', 'Mallorca', [2.65, 39.57],
      '右手が同じ音を静かにくり返し、左手の和音がゆっくりと沈んでいく、わずか2分ほどの曲。ショパンの葬儀でもオルガンで演奏された。')
  ],
  schumann: [
    w('schumann-concerto', 'ピアノ協奏曲 イ短調 第1楽章', 'Piano Concerto in A minor, Op. 54 (Allegro affettuoso)', 1845, 'Concerto', '協奏曲', 'Dresden', [13.7373, 51.0504],
      'オーケストラの一撃とピアノの劇的な下降で始まり、オーボエが憧れに満ちた主題を歌う。妻クララが初演した。')
  ],
  grieg: [
    w('grieg-holberg', '『ホルベアの時代から』より「前奏曲」', 'Holberg Suite, Op. 40: Praeludium', 1884, 'Orchestral', '弦楽合奏', 'Bergen', [5.3221, 60.3913],
      '劇作家ホルベアの生誕200年を記念して、バロック時代の組曲の形で書いた弦楽合奏曲。きらめくような刻みの上に、低音の旋律が力強く歌う。'),
    w('grieg-troldhaugen', '『抒情小曲集』より「トロルドハウゲンの婚礼の日」', 'Lyric Pieces, Op. 65 No. 6: Wedding Day at Troldhaugen', 1896, 'Piano', 'ピアノ独奏', 'Bergen', [5.3221, 60.3913],
      '自分たちの銀婚式を祝って書いた、晴れやかな行進曲風のピアノ曲。トロルドハウゲンはグリーグの住んだ家の名前。')
  ],
  dvorak: [
    w('dvorak-moon', '歌劇『ルサルカ』より「月に寄せる歌」', 'Rusalka, Op. 114: Song to the Moon', 1900, 'Opera', 'オペラ', 'Prague', [14.4378, 50.0755],
      '人間の王子に恋をした水の精ルサルカが、月に思いを託して歌う。ドヴォルザークのオペラで最も愛されるアリア。')
  ],
  tchaikovsky: [
    w('tchaikovsky-andante', 'アンダンテ・カンタービレ（弦楽四重奏曲第1番より）', 'String Quartet No. 1, Op. 11: Andante cantabile', 1871, 'Chamber', '室内楽', 'Moscow', MOSCOW,
      'ウクライナで聞いた民謡をもとにした、素朴で美しい旋律。演奏会で聴いた文豪トルストイが涙を流したと伝わる。')
  ],
  'saint-saens': [
    w('saint-saens-rondo', '序奏とロンド・カプリチオーソ', 'Introduction et Rondo capriccioso, Op. 28', 1863, 'Concerto', 'ヴァイオリンと管弦楽', 'パリ', [2.35, 48.86],
      'スペインの名ヴァイオリニスト、サラサーテのために書かれた。物憂げな序奏から、情熱的で技巧的なロンドへ。')
  ],
  elgar: [
    w('elgar-serenade', '弦楽セレナード ホ短調 第1楽章', 'Serenade for Strings in E minor, Op. 20 (Allegro piacevole)', 1892, 'Orchestral', '弦楽合奏', 'Malvern', [-2.3255, 52.1112],
      '結婚3周年の贈り物として妻に捧げた、やさしい弦楽合奏曲。エルガー自身が「とても気に入っている」と語った作品。')
  ],
  puccini: [
    w('puccini-butterfly', '歌劇『蝶々夫人』より「ある晴れた日に」', 'Madama Butterfly: Un bel dì vedremo', 1904, 'Opera', 'オペラ', 'Milan', [9.19, 45.4642],
      '長崎を舞台にしたオペラで、アメリカに帰った夫の帰りを信じて待つ蝶々さんが、船が港に入る日を夢見て歌う。')
  ]
};

/** 4回目の追加分 */
const RAW4: Record<string, ExtraWork[]> = {
  bach: [
    w('bach-chaconne', '無伴奏ヴァイオリン・パルティータ第2番より「シャコンヌ」', 'Partita No. 2 in D minor, BWV 1004: Chaconne', 1720, 'Solo', '独奏曲', 'Köthen', [11.9708, 51.7516],
      'ヴァイオリン1本で、15分にわたって64の変奏をくり広げる大作。ブラームスは「一つの譜表に、深い思想と力強い感情の世界を書いた」と称えた。'),
    w('bach-violin-a', 'ヴァイオリン協奏曲 第1番 イ短調 第1楽章', 'Violin Concerto in A minor, BWV 1041 (Allegro moderato)', 1730, 'Concerto', '協奏曲', 'Leipzig', [12.3731, 51.3397],
      '力強い主題がくり返し戻ってくる、きりっとした短調の協奏曲。ヴァイオリンを学ぶ人が必ず通る名曲。'),
    w('bach-italian', 'イタリア協奏曲 ヘ長調 第1楽章', 'Italian Concerto, BWV 971', 1735, 'Keyboard', '鍵盤曲', 'Leipzig', [12.3731, 51.3397],
      'イタリアの合奏協奏曲の、独奏とオーケストラの掛け合いを、チェンバロ1台で再現した明るい曲。'),
    w('bach-invention', '2声のインヴェンション 第1番 ハ長調', 'Invention No. 1 in C major, BWV 772', 1723, 'Keyboard', '鍵盤曲', 'Köthen', [11.9708, 51.7516],
      '息子の練習のために書いた、右手と左手が同じ主題を追いかけ合う短い曲。ピアノ学習の定番。'),
    w('bach-fugue-little', '小フーガ ト短調', 'Fugue in G minor, BWV 578 "Little"', 1707, 'Keyboard', 'オルガン曲', 'Arnstadt', [10.9466, 50.8343],
      '覚えやすい主題が、声部を変えて次々と現れるオルガン曲。『トッカータとフーガ』の大フーガに対して「小フーガ」と呼ばれる。')
  ],
  handel: [
    w('handel-forunto', 'オラトリオ『メサイア』より「ひとりのみどりごが生まれた」', 'Messiah, HWV 56: For unto us a child is born', 1741, 'Choral', 'オラトリオ', 'London', LONDON,
      '救い主の誕生を告げる、軽やかで喜びに満ちた合唱。「その名は、驚くべき、指導者」の一節で力強く盛り上がる。')
  ],
  haydn: [
    w('haydn-cello', 'チェロ協奏曲 第1番 ハ長調 第1楽章', 'Cello Concerto No. 1 in C major, Hob. VIIb:1 (Moderato)', 1762, 'Concerto', '協奏曲', 'Eisenstadt', [16.5232, 47.8456],
      '200年近く楽譜が失われ、1961年にプラハで再発見された協奏曲。明るく堂々としたチェロの歌が楽しめる。')
  ],
  mozart: [
    w('mozart-flute-harp', 'フルートとハープのための協奏曲 第2楽章', 'Concerto for Flute and Harp in C major, K. 299 (Andantino)', 1778, 'Concerto', '協奏曲', 'Paris', PARIS,
      'パリの貴族の父娘のために書いた、フルートとハープという珍しい組み合わせの協奏曲。やさしく夢のような緩徐楽章。'),
    w('mozart-pc20', 'ピアノ協奏曲 第20番 ニ短調 第2楽章「ロマンツェ」', 'Piano Concerto No. 20 in D minor, K. 466 (Romanze)', 1785, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      'モーツァルトには珍しい短調の協奏曲の、穏やかな中間楽章。途中で嵐のような部分が現れる。ベートーヴェンが愛した曲でもある。'),
    w('mozart-dongiovanni', '歌劇『ドン・ジョヴァンニ』序曲', 'Don Giovanni, K. 527: Overture', 1787, 'Opera', 'オペラ', 'Prague', [14.4378, 50.0755],
      '石像の騎士が現れる最後の場面を予告する、重々しい和音で始まる序曲。初演の前夜に一晩で書き上げたという伝説がある。'),
    w('mozart-magicflute', '歌劇『魔笛』序曲', 'Die Zauberflöte, K. 620: Overture', 1791, 'Opera', 'オペラ', 'Vienna', VIENNA,
      '3つの重々しい和音のあと、細かい音符が追いかけっこをするように駆け回る。最晩年のオペラの序曲。'),
    w('mozart-laudate', '『証聖者の荘厳晩課』より「ラウダーテ・ドミヌム」', 'Vesperae solennes de confessore, K. 339: Laudate Dominum', 1780, 'Choral', '宗教曲・合唱', 'Salzburg', [13.055, 47.8095],
      'ソプラノ独唱がゆったりと歌い、合唱がやさしく包みこむ、モーツァルトの宗教曲で最も美しいといわれる1曲。')
  ],
  beethoven: [
    w('beethoven-spring', 'ヴァイオリン・ソナタ第5番『春』第1楽章', 'Violin Sonata No. 5 in F major, Op. 24 "Spring" (Allegro)', 1801, 'Chamber', '室内楽', 'Vienna', VIENNA,
      'ヴァイオリンがのびやかに歌い出す、春の日差しのように明るいソナタ。「春」の名前はのちに付けられた。'),
    w('beethoven-tempest', 'ピアノソナタ第17番『テンペスト』第3楽章', 'Klaviersonate Nr. 17 d-Moll, Op. 31-2 "Tempest" (Allegretto)', 1802, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      '同じ音型が風のように止まらずに流れ続ける終楽章。「この曲を理解するにはシェイクスピアの『テンペスト』を読め」と語ったという逸話から名がついた。')
  ],
  schubert: [
    w('schubert-rosamunde', '劇音楽『ロザムンデ』序曲', 'Rosamunde Overture, D 797', 1823, 'Orchestral', '管弦楽曲', 'Vienna', VIENNA,
      '劇そのものはすぐに忘れられたが、音楽は愛され続けた。厳かな序奏から、軽やかで明るい主部へ。'),
    w('schubert-impromptu3', '即興曲 変ト長調 D 899-3', 'Impromptu in G-flat major, D 899 No. 3', 1827, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      'さざ波のような伴奏の上を、歌うような旋律がゆっくりと流れていく。シューベルトのピアノ曲で最も愛される1曲。'),
    w('schubert-arpeggione', 'アルペジオーネ・ソナタ イ短調 第1楽章', 'Arpeggione Sonata in A minor, D 821 (Allegro moderato)', 1824, 'Chamber', '室内楽', 'Vienna', VIENNA,
      'すぐに廃れてしまった楽器「アルペジオーネ」のために書かれたソナタ。今はチェロやヴィオラで弾かれる、哀愁ただよう名曲。')
  ],
  chopin: [
    w('chopin-op27-2', '夜想曲 第8番 変ニ長調 作品27-2', 'Nocturne in D-flat major, Op. 27 No. 2', 1835, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '甘く装飾的な旋律が、2つの声部の二重唱のように絡み合う。ショパンの夜想曲の中でも特に美しい1曲。'),
    w('chopin-tristesse', '練習曲 ホ長調 作品10-3『別れの曲』', 'Étude in E major, Op. 10 No. 3', 1832, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '「これほど美しい旋律を書いたことはない」とショパン自身が言った練習曲。日本では「別れの曲」として親しまれている。'),
    w('chopin-fantaisie-f', '幻想曲 ヘ短調 作品49', 'Fantaisie in F minor, Op. 49', 1841, 'Piano', 'ピアノ独奏', 'Nohant', [1.9798, 46.5836],
      '葬送行進曲のような重い歩みから始まり、情熱的な嵐を経て、静かな祈りへ。自由な形式で書かれた大作。'),
    w('chopin-scherzo2', 'スケルツォ 第2番 変ロ短調', 'Scherzo No. 2 in B-flat minor, Op. 31', 1837, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      'ささやくような問いかけと、強烈な和音の答えで始まる。歌うような部分と激しい部分が交互に現れる、華やかな大曲。'),
    w('chopin-berceuse', '子守歌（ベルスーズ）変ニ長調', 'Berceuse in D-flat major, Op. 57', 1844, 'Piano', 'ピアノ独奏', 'Nohant', [1.9798, 46.5836],
      '左手は最後まで同じゆりかごのリズムをくり返し、右手がきらめく装飾を次々と織りなしていく。')
  ],
  liszt: [
    w('liszt-consolation', '『慰め』第3番 変ニ長調', 'Consolation No. 3 in D-flat major, S. 172', 1850, 'Piano', 'ピアノ独奏', 'Weimar', [11.3287, 50.9787],
      '超絶技巧で知られるリストの、静かで心にしみる小品。ショパンの夜想曲を思わせる。'),
    w('liszt-sospiro', '演奏会用練習曲『ため息』', 'Trois études de concert, S. 144: No. 3 "Un sospiro"', 1848, 'Piano', 'ピアノ独奏', 'Weimar', [11.3287, 50.9787],
      '左右の手が交差しながら、流れるアルペジオの中に旋律を浮かび上がらせる。ため息のように美しい練習曲。')
  ],
  mendelssohn: [
    w('mendelssohn-spinner', '『無言歌集』より「紡ぎ歌」', 'Songs without Words, Op. 67 No. 4 "Spinning Song"', 1845, 'Piano', 'ピアノ独奏', 'Leipzig', [12.3731, 51.3397],
      '糸車がくるくる回る様子を思わせる、軽やかで速いピアノ小品。言葉のない歌の短い曲集の中の1曲。'),
    w('mendelssohn-scottish', '交響曲第3番 イ短調『スコットランド』第1楽章', "Symphony No. 3 in A minor, Op. 56 'Scottish'", 1842, 'Symphony', '交響曲', 'Leipzig', [12.3731, 51.3397],
      'スコットランドの古城ホリールード宮殿を訪れたとき浮かんだ旋律から生まれた。霧に包まれたような、ほの暗く雄大な序奏。')
  ],
  schumann: [
    w('schumann-carnaval', 'ピアノ曲集『謝肉祭』', 'Carnaval, Op. 9', 1835, 'Piano', 'ピアノ独奏', 'Leipzig', [12.3731, 51.3397],
      '仮面舞踏会に集まった人物たちを、20の小品で描いた曲集。ショパンやパガニーニ、恋人クララまで登場する。')
  ],
  brahms: [
    w('brahms-sym4', '交響曲第4番 ホ短調 第1楽章', 'Symphony No. 4 in E minor, Op. 98 (Allegro non troppo)', 1885, 'Symphony', '交響曲', 'Mürzzuschlag', [15.6827, 47.6077],
      'ため息のような2つの音の動機で始まる、哀愁に満ちた最後の交響曲。秋の深まりを感じさせる響き。'),
    w('brahms-academic', '大学祝典序曲', 'Academic Festival Overture, Op. 80', 1880, 'Orchestral', '管弦楽曲', 'Vienna', VIENNA,
      '名誉博士号のお礼に書いた序曲。ドイツの学生歌をいくつも取り入れ、最後は学生歌「ガウデアームス」で華やかに終わる。'),
    w('brahms-waltz15', 'ワルツ 変イ長調 作品39-15', 'Waltz in A-flat major, Op. 39 No. 15', 1865, 'Piano', 'ピアノ曲', 'Vienna', VIENNA,
      '16曲のワルツ集の中で最も有名な、愛らしく優雅な1曲。「ブラームスのワルツ」として親しまれる。')
  ],
  tchaikovsky: [
    w('tchaikovsky-capriccio', '『イタリア奇想曲』', 'Capriccio italien, Op. 45', 1880, 'Orchestral', '管弦楽曲', 'Rome', [12.4964, 41.9028],
      'ローマ滞在中に聞いた軍隊ラッパや民謡、カーニバルの音楽をもとにした、明るく華やかな管弦楽曲。')
  ],
  dvorak: [
    w('dvorak-cello', 'チェロ協奏曲 ロ短調 第1楽章', 'Cello Concerto in B minor, Op. 104 (Allegro)', 1895, 'Concerto', '協奏曲', 'New York', [-74.006, 40.7128],
      'チェロ協奏曲の最高傑作と言われる作品。ホルンが奏でる第2主題は、ドヴォルザーク自身が最も美しいと考えた旋律のひとつ。'),
    w('dvorak-american', '弦楽四重奏曲 第12番『アメリカ』第2楽章', "String Quartet No. 12 in F major, Op. 96 'American' (Lento)", 1893, 'Chamber', '室内楽', 'Spillville', [-91.95, 43.2],
      'アメリカのチェコ移民の村で、夏休みに書いた四重奏曲。ヴァイオリンが歌う郷愁に満ちた旋律が心にしみる。'),
    w('dvorak-sym8', '交響曲第8番 ト長調 第1楽章', 'Symphony No. 8 in G major, Op. 88 (Allegro con brio)', 1889, 'Symphony', '交響曲', 'Vysoká', [13.9, 49.65],
      'ボヘミアの自然の中で書かれた、鳥のさえずりや田園の風景を感じさせる明るい交響曲。')
  ],
  grieg: [
    w('grieg-anitra', '劇音楽『ペール・ギュント』より「アニトラの踊り」', 'Peer Gynt Suite No. 1, Op. 46: Anitra\'s Dance', 1875, 'Orchestral', '管弦楽組曲', 'Bergen', [5.3221, 60.3913],
      'アラビアの族長の娘アニトラが、ペールを誘惑して踊るマズルカ風の曲。弦楽器とトライアングルだけの軽やかな響き。'),
    w('grieg-aase', '劇音楽『ペール・ギュント』より「オーセの死」', 'Peer Gynt Suite No. 1, Op. 46: The Death of Åse', 1875, 'Orchestral', '管弦楽組曲', 'Bergen', [5.3221, 60.3913],
      '主人公ペールの母オーセが息を引き取る場面の音楽。弦楽器だけで静かに奏でられる、深い悲しみの曲。')
  ],
  verdi: [
    w('verdi-anvil', '歌劇『イル・トロヴァトーレ』より「アンヴィル・コーラス（鍛冶屋の合唱）」', 'Il trovatore: Anvil Chorus (Vedi! le fosche notturne spoglie)', 1853, 'Opera', 'オペラ', 'Rome', [12.4964, 41.9028],
      'ジプシーたちが金床（かなとこ）を叩きながら朝を迎える力強い合唱。本物の金床の音が楽器として使われる。')
  ],
  puccini: [
    w('puccini-tosca', '歌劇『トスカ』より「歌に生き、愛に生き」', "Tosca: Vissi d'arte", 1900, 'Opera', 'オペラ', 'Rome', [12.4964, 41.9028],
      '恋人の命と引きかえに身を差し出すよう迫られたトスカが、「芸術と愛に生きてきたのに、なぜ神はこんな報いを」と祈るアリア。'),
    w('puccini-stelle', '歌劇『トスカ』より「星は光りぬ」', 'Tosca: E lucevan le stelle', 1900, 'Opera', 'オペラ', 'Rome', [12.4964, 41.9028],
      '処刑を待つ画家カヴァラドッシが、星空の下でトスカとの思い出をしのぶテノールのアリア。')
  ],
  debussy: [
    w('debussy-fille', '前奏曲集 第1巻より「亜麻色の髪の乙女」', 'Préludes, Book 1: La fille aux cheveux de lin', 1910, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      'スコットランドの詩から生まれた、素朴でやさしい旋律の小品。ドビュッシーのピアノ曲で最も親しまれる1曲。'),
    w('debussy-cathedrale', '前奏曲集 第1巻より「沈める寺」', 'Préludes, Book 1: La cathédrale engloutie', 1910, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '海に沈んだ伝説の大聖堂が、霧の中から姿を現し、鐘を鳴らしてまた沈んでいく。ピアノで描いた壮大な情景。')
  ],
  ravel: [
    w('ravel-jeux', '水の戯れ', "Jeux d'eau", 1901, 'Piano', 'ピアノ独奏', 'Paris', [2.35, 48.86],
      '噴水や水しぶきのきらめきを、ピアノの細かい音の粒で描いた曲。のちのドビュッシーにも影響を与えた。'),
    w('ravel-tombeau', '『クープランの墓』より「前奏曲」', 'Le Tombeau de Couperin: Prélude', 1917, 'Piano', 'ピアノ独奏', 'Paris', [2.35, 48.86],
      '第一次世界大戦で亡くなった友人たちに捧げた、バロック風の組曲の第1曲。悲しみを込めながらも、軽やかで透明な響き。')
  ],
  satie: [
    w('satie-jetveux', 'ジュ・トゥ・ヴ（あなたが欲しい）', 'Je te veux', 1897, 'Choral', '歌曲', 'パリ', [2.35, 48.86],
      'パリのキャバレーのために書かれた、甘く軽やかなワルツの歌。ピアノ独奏でもよく演奏される。')
  ],
  'saint-saens': [
    w('saint-saens-pc2', 'ピアノ協奏曲 第2番 ト短調 第1楽章', 'Piano Concerto No. 2 in G minor, Op. 22 (Andante sostenuto)', 1868, 'Concerto', '協奏曲', 'パリ', [2.35, 48.86],
      'バッハのような重々しいピアノの独奏で始まる。「バッハに始まりオッフェンバックに終わる」と評された、変化に富んだ協奏曲。'),
    w('saint-saens-samson', '歌劇『サムソンとデリラ』より「あなたの声に私の心は開く」', "Samson et Dalila: Mon cœur s'ouvre à ta voix", 1877, 'Opera', 'オペラ', 'Weimar', [11.3287, 50.9787],
      '怪力の英雄サムソンを誘惑するデリラが歌う、官能的なメゾソプラノのアリア。')
  ],
  faure: [
    w('faure-elegie', 'エレジー ハ短調（チェロとピアノ）', 'Élégie in C minor, Op. 24', 1880, 'Chamber', '室内楽', 'パリ', [2.35, 48.86],
      'チェロが深い悲しみを語るように歌い、途中で一度だけ激しく高まる。フォーレの室内楽で最も知られた曲。')
  ],
  elgar: [
    w('elgar-cello', 'チェロ協奏曲 ホ短調 第4楽章', 'Cello Concerto in E minor, Op. 85 (Allegro)', 1919, 'Concerto', '協奏曲', 'London', [-0.13, 51.51],
      '第一次世界大戦のあとに書かれた、哀しみと回想に満ちた協奏曲の終楽章。チェリストのジャクリーヌ・デュ・プレの演奏で有名になった。')
  ],
  'rimsky-korsakov': [
    w('rimsky-easter', '序曲『ロシアの復活祭』', 'Russian Easter Festival Overture, Op. 36', 1888, 'Orchestral', '管弦楽曲', 'サンクト・ペテルブルク', [30.32, 59.93],
      'ロシア正教の聖歌をもとに、静かな祈りから復活祭の鐘が鳴り響くお祭り騒ぎまでを描いた序曲。')
  ],
  'strauss-jr': [
    w('strauss-vienna', 'ワルツ『ウィーンの森の物語』', "G'schichten aus dem Wienerwald, Op. 325", 1868, 'Orchestral', 'ワルツ', 'Vienna', VIENNA,
      'ウィーン郊外の森ののどかな情景を描いたワルツ。民族楽器ツィターの独奏が、素朴な田舎の雰囲気を伝える。'),
    w('strauss-thunder', 'ポルカ『雷鳴と電光』', 'Unter Donner und Blitz, Op. 324', 1868, 'Orchestral', 'ポルカ', 'Vienna', VIENNA,
      '大太鼓の雷鳴とシンバルの稲妻が鳴り響く、にぎやかで速いポルカ。運動会でもおなじみ。')
  ],
  berlioz: [
    w('berlioz-carnival', '序曲『ローマの謝肉祭』', 'Le carnaval romain, Op. 9', 1844, 'Orchestral', '管弦楽曲', 'パリ', [2.35, 48.86],
      'イングリッシュホルンの甘い歌と、ローマのカーニバルで踊られるサルタレッロの熱狂。ベルリオーズの序曲で最も人気がある。')
  ],
  gershwin: [
    w('gershwin-prelude1', '3つの前奏曲より 第1番', 'Three Preludes: No. 1 (Allegro ben ritmato e deciso)', 1926, 'Piano', 'ピアノ独奏', 'New York', [-74.006, 40.7128],
      'ブルースの音階とジャズのリズムが弾ける、わずか1分半ほどのピアノ曲。'),
  ],
  weber: [
    w('weber-clarinet2', 'クラリネット協奏曲 第2番 変ホ長調 第3楽章', 'Clarinet Concerto No. 2 in E-flat major, Op. 74 (Alla polacca)', 1811, 'Concerto', '協奏曲', 'Munich', [11.582, 48.1351],
      '名クラリネット奏者ベールマンのために書いた協奏曲の終楽章。ポーランドの舞曲のリズムにのって、クラリネットが華麗に駆け回る。')
  ],
  rachmaninoff: [
    w('rachmaninoff-prelude', '前奏曲 嬰ハ短調 作品3-2『鐘』', 'Prelude in C-sharp minor, Op. 3 No. 2', 1892, 'Piano', 'ピアノ独奏', 'Moscow', MOSCOW,
      '19歳で書いた、重々しい鐘の響きで始まる前奏曲。あまりに人気が出て、本人は演奏会のたびにアンコールで弾かされることにうんざりしていたという。'),
    w('rachmaninoff-vocalise', 'ヴォカリーズ', 'Vocalise, Op. 34 No. 14', 1915, 'Choral', '歌曲', 'Moscow', MOSCOW,
      '歌詞のない、母音だけで歌う歌曲。息の長いメランコリックな旋律が、ヴァイオリンなどでもよく演奏される。')
  ]
};

/** 第5弾：録音（実演）が見つかった名曲を追加 */
const LEIPZIG: [number, number] = [12.3731, 51.3397];
const KOTHEN: [number, number] = [11.9708, 51.7516];
const WEIMAR: [number, number] = [11.3287, 50.9787];
const WARSAW: [number, number] = [21.0122, 52.2297];
const RAW5: Record<string, ExtraWork[]> = {
  bach: [
    w('bach-brandenburg2', 'ブランデンブルク協奏曲 第2番 第1楽章', 'Brandenburg Concerto No. 2 in F major, BWV 1047 (Allegro)', 1721, 'Concerto', '協奏曲', 'Köthen', KOTHEN,
      '高音のトランペットが、リコーダー・オーボエ・ヴァイオリンと並んで輝かしく歌う協奏曲。トランペット奏者泣かせの難曲として知られる。'),
    w('bach-brandenburg5', 'ブランデンブルク協奏曲 第5番 第1楽章', 'Brandenburg Concerto No. 5 in D major, BWV 1050 (Allegro)', 1721, 'Concerto', '協奏曲', 'Köthen', KOTHEN,
      '伴奏役だったチェンバロが、楽章の終わりで長い独奏（カデンツァ）を弾きまくる。鍵盤楽器が主役になった最初期の協奏曲。'),
    w('bach-magnificat', 'マニフィカト ニ長調より「グローリア」', 'Magnificat, BWV 243: Gloria Patri', 1733, 'Choral', '合唱曲', 'Leipzig', LEIPZIG,
      '聖母マリアの賛歌に付けた、華やかな合唱曲。トランペットとティンパニが加わる祝祭的な響きで、クリスマスにもよく歌われる。'),
    w('bach-stmatthew', 'マタイ受難曲より「憐れみたまえ、わが神よ」', 'St Matthew Passion, BWV 244: Erbarme dich', 1727, 'Choral', '受難曲', 'Leipzig', LEIPZIG,
      'イエスを3度知らないと言ってしまったペテロの後悔を歌う、アルトのアリア。独奏ヴァイオリンが涙のように寄り添う。メンデルスゾーンの復活上演で、バッハ再評価のきっかけとなった大作。'),
    w('bach-mass-b', 'ミサ曲 ロ短調より「アニュス・デイ」', 'Mass in B minor, BWV 232: Agnus Dei', 1749, 'Choral', 'ミサ曲', 'Leipzig', LEIPZIG,
      '晩年のバッハが、生涯の作品から集大成としてまとめた大ミサ曲。終わり近くの「アニュス・デイ」は、アルトが静かに祈る美しいアリア。'),
    w('bach-french5', 'フランス組曲 第5番より「ガヴォット」', 'French Suite No. 5 in G major, BWV 816: Gavotte', 1722, 'Keyboard', '鍵盤曲', 'Köthen', KOTHEN,
      '妻アンナ・マクダレーナのための曲集に書かれた、親しみやすい鍵盤の組曲。軽やかなガヴォットはピアノ発表会の定番。'),
    w('bach-violin-sonata1', '無伴奏ヴァイオリン・ソナタ 第1番より「アダージョ」', 'Violin Sonata No. 1 in G minor, BWV 1001: Adagio', 1720, 'Solo', '独奏曲', 'Köthen', KOTHEN,
      'ヴァイオリン1本で和音と旋律を同時に鳴らす、無伴奏曲集の幕開け。即興のように自由に揺れる、重厚な序奏。')
  ],
  handel: [
    w('handel-organ', 'オルガン協奏曲 作品7-1 第1楽章', 'Organ Concerto Op. 7 No. 1, HWV 306', 1740, 'Concerto', '協奏曲', 'London', LONDON,
      'オラトリオの幕間に、ヘンデル自身がオルガンを弾いて聴衆を楽しませるために書いた協奏曲。足鍵盤を使う珍しい作品。'),
    w('handel-fireworks', '王宮の花火の音楽より「歓喜（レジュイッサンス）」', 'Music for the Royal Fireworks, HWV 351: La Réjouissance', 1749, 'Orchestral', '管弦楽曲', 'London', LONDON,
      '戦争の終結を祝うロンドンの花火大会のための音楽。公開リハーサルには1万2千人が押し寄せ、橋が大渋滞になったという。'),
    w('handel-harmonious', '「調子の良い鍛冶屋」', 'Suite No. 5 in E major, HWV 430: Air and Variations "The Harmonious Blacksmith"', 1720, 'Keyboard', '鍵盤曲', 'London', LONDON,
      'チェンバロ組曲の最後の変奏曲。鍛冶屋の槌の音から思いついたという俗説から、このあだ名で親しまれている。')
  ],
  vivaldi: [
    w('vivaldi-mandolin', 'マンドリン協奏曲 ハ長調 RV 425', 'Mandolin Concerto in C major, RV 425', 1725, 'Concerto', '協奏曲', 'Venice', VENICE,
      '粒のそろったマンドリンのトレモロが、弦楽合奏の上で軽やかに歌う。マンドリンのための協奏曲として最も有名な曲。'),
    w('vivaldi-cello', 'チェロ協奏曲 ト長調 RV 413 第1楽章', 'Cello Concerto in G major, RV 413 (Allegro)', 1720, 'Concerto', '協奏曲', 'Venice', VENICE,
      'チェロを独奏楽器として活躍させた、早い時期の協奏曲の一つ。ヴィヴァルディはチェロ協奏曲を25曲以上も書いた。')
  ],
  telemann: [
    w('telemann-fantasia', '無伴奏フルートのための12のファンタジア より第8番', 'Fantasia No. 8 for solo flute, TWV 40:9', 1732, 'Solo', '独奏曲', 'Hamburg', [9.9937, 53.5511],
      '伴奏なしのフルート1本で、和音や対話まで感じさせる小品集。（録音はサクソフォンでの演奏）')
  ],
  haydn: [
    w('haydn-sym100', '交響曲 第100番「軍隊」第2楽章', 'Symphony No. 100 in G major "Military" (Allegretto)', 1794, 'Symphony', '交響曲', 'London', LONDON,
      'ロンドンのために書いた交響曲。第2楽章で突然、トライアングル・シンバル・大太鼓の「トルコ風」軍楽隊が鳴り響き、聴衆を沸かせた。'),
    w('haydn-sym101', '交響曲 第101番「時計」第2楽章', 'Symphony No. 101 in D major "The Clock" (Andante)', 1794, 'Symphony', '交響曲', 'London', LONDON,
      'ファゴットと弦のピツィカートが、振り子時計のように「チクタク」と規則正しく刻む。そこからこのあだ名が付いた。'),
    w('haydn-creation', 'オラトリオ『天地創造』より「はじめに神は」', 'The Creation: In the beginning', 1798, 'Choral', 'オラトリオ', 'Vienna', VIENNA,
      '暗くさまよう「混沌」の音楽のあと、合唱が「光あれ！」と歌う瞬間、オーケストラ全体がハ長調で爆発する。初演では聴衆が総立ちになった。')
  ],
  mozart: [
    w('mozart-sym35', '交響曲 第35番「ハフナー」第1楽章', 'Symphony No. 35 in D major "Haffner", K. 385 (Allegro con spirito)', 1782, 'Symphony', '交響曲', 'Vienna', VIENNA,
      'ザルツブルクの名家ハフナー家のために急いで書いたセレナードを、のちに交響曲に作り直したもの。冒頭の大きな跳躍が力強い。'),
    w('mozart-sym38', '交響曲 第38番「プラハ」第3楽章', 'Symphony No. 38 in D major "Prague", K. 504 (Presto)', 1786, 'Symphony', '交響曲', 'Prague', [14.4378, 50.0755],
      '『フィガロの結婚』が大ヒットしていたプラハで初演された交響曲。メヌエットのない3楽章形式で、終楽章は息もつかせぬ速さ。'),
    w('mozart-sym29', '交響曲 第29番 イ長調 第1楽章', 'Symphony No. 29 in A major, K. 201 (Allegro moderato)', 1774, 'Symphony', '交響曲', 'Salzburg', [13.055, 47.8095],
      '18歳のモーツァルトがザルツブルクで書いた、室内楽のように繊細な交響曲。若い時期の傑作として人気が高い。'),
    w('mozart-pc23', 'ピアノ協奏曲 第23番 イ長調 第2楽章', 'Piano Concerto No. 23 in A major, K. 488 (Adagio)', 1786, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      'モーツァルトの協奏曲で唯一の嬰ヘ短調の楽章。シチリアーノのリズムにのって、ピアノがしみじみと悲しみを歌う。'),
    w('mozart-vc5', 'ヴァイオリン協奏曲 第5番「トルコ風」第1楽章', 'Violin Concerto No. 5 in A major, K. 219 (Allegro aperto)', 1775, 'Concerto', '協奏曲', 'Salzburg', [13.055, 47.8095],
      '19歳のときの協奏曲。独奏ヴァイオリンがゆったりした序奏で入ってきてから、急に快活な主題を弾き始める意外な仕掛けがある。'),
    w('mozart-oboe', 'オーボエ協奏曲 ハ長調 第1楽章', 'Oboe Concerto in C major, K. 314 (Allegro aperto)', 1777, 'Concerto', '協奏曲', 'Salzburg', [13.055, 47.8095],
      'オーボエの明るく伸びやかな音色を生かした協奏曲。のちにフルート協奏曲第2番としても編曲された。'),
    w('mozart-bassoon', 'ファゴット協奏曲 変ロ長調 第1楽章', 'Bassoon Concerto in B-flat major, K. 191 (Allegro)', 1774, 'Concerto', '協奏曲', 'Salzburg', [13.055, 47.8095],
      '18歳で書いた、ファゴットのための協奏曲。低音から高音まで跳び回る、ユーモラスで愛らしい独奏が楽しい。')
  ],
  beethoven: [
    w('beethoven-sym1', '交響曲 第1番 ハ長調 第1楽章', 'Symphony No. 1 in C major, Op. 21 (Adagio molto – Allegro con brio)', 1800, 'Symphony', '交響曲', 'Vienna', VIENNA,
      '29歳のベートーヴェンがウィーンで発表した最初の交響曲。いきなり「よその調」の和音で始まる冒頭に、当時の聴衆は驚いた。'),
    w('beethoven-sym2', '交響曲 第2番 ニ長調 第1楽章', 'Symphony No. 2 in D major, Op. 36 (Adagio molto – Allegro con brio)', 1802, 'Symphony', '交響曲', 'Vienna', VIENNA,
      '耳の病に絶望して「ハイリゲンシュタットの遺書」を書いたのと同じ年の作品。それなのに音楽は明るく、エネルギーに満ちている。'),
    w('beethoven-sym4', '交響曲 第4番 変ロ長調 第1楽章', 'Symphony No. 4 in B-flat major, Op. 60 (Adagio – Allegro vivace)', 1806, 'Symphony', '交響曲', 'Vienna', VIENNA,
      '「英雄」と「運命」の間にはさまれた、明るくのびやかな交響曲。シューマンは「2人の北欧の巨人の間の、ギリシアの乙女」と呼んだ。'),
    w('beethoven-sym8', '交響曲 第8番 ヘ長調 第1楽章', 'Symphony No. 8 in F major, Op. 93 (Allegro vivace e con brio)', 1812, 'Symphony', '交響曲', 'Vienna', VIENNA,
      'ユーモアたっぷりの小ぶりな交響曲。本人は「第7番より人気がないのは、こちらのほうが優れているからだ」と言ったという。'),
    w('beethoven-waldstein', 'ピアノ・ソナタ 第21番「ワルトシュタイン」第1楽章', 'Piano Sonata No. 21 in C major "Waldstein", Op. 53 (Allegro con brio)', 1804, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      '若いころの恩人ワルトシュタイン伯爵に捧げたソナタ。和音の連打が駆け出す冒頭から、新しいピアノの性能を存分に引き出している。'),
    w('beethoven-pc3', 'ピアノ協奏曲 第3番 ハ短調 第1楽章', 'Piano Concerto No. 3 in C minor, Op. 37 (Allegro con brio)', 1803, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      'モーツァルトの短調の協奏曲を手本にしつつ、ベートーヴェンらしい劇的な力強さが加わった協奏曲。初演では楽譜がほぼ白紙で、本人が記憶で弾いたという。'),
    w('beethoven-pc4', 'ピアノ協奏曲 第4番 ト長調 第1楽章', 'Piano Concerto No. 4 in G major, Op. 58 (Allegro moderato)', 1806, 'Concerto', '協奏曲', 'Vienna', VIENNA,
      'オーケストラより先に、ピアノが独りで静かに語り始める——当時としては型破りな幕開け。ベートーヴェンが独奏者として出た最後の協奏曲。'),
    w('beethoven-coriolan', '序曲『コリオラン』', 'Coriolan Overture, Op. 62', 1807, 'Orchestral', '管弦楽曲', 'Vienna', VIENNA,
      '祖国ローマに弓を引こうとした英雄コリオラヌスの悲劇を描く序曲。激しい和音の一撃と、母の願いを表す優しい旋律が対立する。')
  ],
  schubert: [
    w('schubert-death', '弦楽四重奏曲 第14番「死と乙女」第2楽章', 'String Quartet No. 14 in D minor "Death and the Maiden", D 810 (Andante con moto)', 1824, 'Chamber', '室内楽', 'Vienna', VIENNA,
      '自作の歌曲『死と乙女』の、死神が静かに語りかける旋律をもとにした変奏曲。重い病の中で書かれた、深い陰影をもつ四重奏曲。'),
    w('schubert-wanderer', '幻想曲「さすらい人」第1楽章', 'Wanderer Fantasy in C major, D 760 (Allegro con fuoco)', 1822, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      '歌曲『さすらい人』の旋律から全曲を組み立てた、シューベルトで最も技巧的なピアノ曲。本人も弾きこなせず「悪魔にでも弾かせろ」と言ったという。')
  ],
  chopin: [
    w('chopin-military', 'ポロネーズ 第3番「軍隊」', 'Polonaise in A major, Op. 40 No. 1 "Military"', 1838, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '祖国ポーランドの栄光を思わせる、堂々とした行進のようなポロネーズ。第二次世界大戦中、ポーランドのラジオで抵抗の象徴として流された。'),
    w('chopin-mazurka', 'マズルカ 変ロ長調 作品7-1', 'Mazurka in B-flat major, Op. 7 No. 1', 1831, 'Piano', 'ピアノ独奏', 'Warsaw', WARSAW,
      'ポーランドの田舎の踊り「マズルカ」を、ショパンが芸術作品にまで高めた。生涯に約60曲を書いた中で、最も親しまれている一曲。'),
    w('chopin-waltz7', 'ワルツ 第7番 嬰ハ短調', 'Waltz in C-sharp minor, Op. 64 No. 2', 1847, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '「子犬のワルツ」と同じ年に出版された、憂いをたたえたワルツ。ゆったりした部分と、くるくる回るような速い部分が交互に現れる。'),
    w('chopin-winter', '練習曲 作品25-11「木枯らし」', 'Étude in A minor, Op. 25 No. 11 "Winter Wind"', 1836, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '静かな4小節の序奏のあと、右手の細かい音の嵐が吹き荒れる。ショパンの練習曲の中でも最難関の一つ。'),
    w('chopin-blackkey', '練習曲 作品10-5「黒鍵」', 'Étude in G-flat major, Op. 10 No. 5 "Black Keys"', 1830, 'Piano', 'ピアノ独奏', 'Warsaw', WARSAW,
      '右手がほとんど黒鍵だけを弾く、きらきらと軽快な練習曲。わずか2分足らずの中に遊び心が詰まっている。'),
    w('chopin-ballade4', 'バラード 第4番 ヘ短調', 'Ballade No. 4 in F minor, Op. 52', 1842, 'Piano', 'ピアノ独奏', 'Nohant', [1.9764, 46.5833],
      '夏を過ごしたノアンで書いた、ショパン円熟期の最高傑作の一つ。素朴な旋律が変奏されながら、激しい終結へと高まっていく。'),
    w('chopin-pc2', 'ピアノ協奏曲 第2番 ヘ短調 第2楽章', 'Piano Concerto No. 2 in F minor, Op. 21 (Larghetto)', 1830, 'Concerto', '協奏曲', 'Warsaw', WARSAW,
      '実は第1番より先に書かれた協奏曲。初恋の人コンスタンツィアへの思いを込めたという、夢見るような緩徐楽章。'),
    w('chopin-nocturne-op48', 'ノクターン 第13番 ハ短調', 'Nocturne in C minor, Op. 48 No. 1', 1841, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '葬送行進曲のような重い歌に始まり、中間部では祈りのようなコラールが嵐へと膨れ上がる。ショパンのノクターンで最も劇的な一曲。'),
    w('chopin-prelude7', '前奏曲 作品28-7 イ長調', 'Prélude in A major, Op. 28 No. 7', 1839, 'Piano', 'ピアノ独奏', 'Valldemossa', [2.6222, 39.7106],
      'わずか16小節、1分足らずのマズルカ風の小品。日本では胃腸薬「太田胃散」のCMの曲としておなじみ。')
  ],
  liszt: [
    w('liszt-rhapsody6', 'ハンガリー狂詩曲 第6番', 'Hungarian Rhapsody No. 6 in D-flat major, S. 244/6', 1853, 'Piano', 'ピアノ独奏', 'Weimar', WEIMAR,
      '堂々とした序奏、軽快な踊り、哀愁の歌、そして右手のオクターブ連打で突き進む終盤。ハンガリーのロマ（ジプシー）音楽の魅力が詰まっている。'),
    w('liszt-mephisto', 'メフィスト・ワルツ 第1番', 'Mephisto Waltz No. 1, S. 514', 1860, 'Piano', 'ピアノ独奏', 'Weimar', WEIMAR,
      '悪魔メフィストが村の酒場でヴァイオリンを奪い、人々を狂乱の踊りに巻き込む——ファウスト伝説の一場面を描いた悪魔的な名曲。'),
    w('liszt-pc1', 'ピアノ協奏曲 第1番 変ホ長調', 'Piano Concerto No. 1 in E-flat major, S. 124', 1855, 'Concerto', '協奏曲', 'Weimar', WEIMAR,
      '4つの楽章を切れ目なく続けた協奏曲。トライアングルが活躍するので「トライアングル協奏曲」とからかわれた。初演はリスト自身の独奏、ベルリオーズの指揮。')
  ],
  mendelssohn: [
    w('mendelssohn-pc1', 'ピアノ協奏曲 第1番 ト短調 第1楽章', 'Piano Concerto No. 1 in G minor, Op. 25 (Molto allegro con fuoco)', 1831, 'Concerto', '協奏曲', 'Munich', [11.582, 48.1351],
      'イタリア旅行の途中、ミュンヘンで書きあげて自ら初演した協奏曲。短い序奏のあと、すぐにピアノが嵐のように飛び込んでくる。'),
    w('mendelssohn-octet', '弦楽八重奏曲 変ホ長調 第4楽章', 'String Octet in E-flat major, Op. 20 (Presto)', 1825, 'Chamber', '室内楽', 'Berlin', [13.405, 52.52],
      'わずか16歳で書いた、室内楽史上の奇跡と呼ばれる作品。8人の弦楽器が、チェロから順に次々と駆け上がっていく終楽章。')
  ],
  schumann: [
    w('schumann-kreisleriana', '『クライスレリアーナ』より第1曲', 'Kreisleriana, Op. 16: No. 1 Äußerst bewegt', 1838, 'Piano', 'ピアノ独奏', 'Leipzig', LEIPZIG,
      'E.T.A.ホフマンの小説の、風変わりな楽長クライスラーをもとにしたピアノ曲集。結婚を反対されていたクララへの思いがあふれている。'),
    w('schumann-arabeske', 'アラベスク ハ長調', 'Arabeske in C major, Op. 18', 1839, 'Piano', 'ピアノ独奏', 'Vienna', VIENNA,
      'ウィーン滞在中に書いた、唐草模様のように流れる優美な小品。最後のしみじみとした後奏が印象深い。')
  ],
  brahms: [
    w('brahms-sym2', '交響曲 第2番 ニ長調 第3楽章', 'Symphony No. 2 in D major, Op. 73 (Allegretto grazioso)', 1877, 'Symphony', '交響曲', 'Pörtschach', [14.1667, 46.6333],
      'オーストリアの湖畔の避暑地で書かれた、明るくのどかな交響曲。オーボエが素朴な踊りの歌を奏でる楽章。'),
    w('brahms-requiem', '『ドイツ・レクイエム』より「なんと愛すべきはあなたの住まい」', 'Ein deutsches Requiem, Op. 45: Wie lieblich sind deine Wohnungen', 1868, 'Choral', '合唱曲', 'Bremen', [8.8017, 53.0793],
      'ラテン語でなくドイツ語の聖書から言葉を選び、死者よりも残された人々を慰めるために書いたレクイエム。中心にあたる第4曲は、天の住まいを歌う穏やかな合唱。'),
    w('brahms-clarinet', 'クラリネット五重奏曲 ロ短調 第1楽章', 'Clarinet Quintet in B minor, Op. 115 (Allegro)', 1891, 'Chamber', '室内楽', 'Bad Ischl', [13.6194, 47.7114],
      '創作をやめるつもりだった晩年のブラームスが、名クラリネット奏者ミュールフェルトの演奏に心を動かされて書いた。秋の夕暮れのような哀愁に満ちた室内楽。')
  ],
  tchaikovsky: [
    w('tchaikovsky-sym4', '交響曲 第4番 ヘ短調 第4楽章', 'Symphony No. 4 in F minor, Op. 36 (Finale: Allegro con fuoco)', 1878, 'Symphony', '交響曲', 'Moscow', MOSCOW,
      '支援者フォン・メック夫人に捧げた交響曲。ロシア民謡『野に立つ白樺』が現れる、お祭り騒ぎのような終楽章。'),
    w('tchaikovsky-trepak', 'バレエ『くるみ割り人形』より「トレパック（ロシアの踊り）」', 'The Nutcracker, Op. 71: Russian Dance (Trepak)', 1892, 'Ballet', 'バレエ音楽', 'Saint Petersburg', ST_PETERSBURG,
      'お菓子の国で踊られる、ロシアのコサック風の踊り。1分ほどの中で、どんどん速くなって一気に駆け抜ける。')
  ],
  'saint-saens': [
    w('saint-saens-cello1', 'チェロ協奏曲 第1番 イ短調 第1楽章', 'Cello Concerto No. 1 in A minor, Op. 33 (Allegro non troppo)', 1872, 'Concerto', '協奏曲', 'Paris', PARIS,
      'オーケストラの一撃の直後、すぐにチェロが激しく駆け出す協奏曲。ラフマニノフやカザルスも絶賛した、チェロ協奏曲の代表作。')
  ],
  faure: [
    w('faure-berceuse', '組曲『ドリー』より「子守歌」', 'Dolly Suite, Op. 56: Berceuse', 1894, 'Piano', 'ピアノ連弾', 'Paris', PARIS,
      '友人の幼い娘ドリーのために、誕生日ごとに書き足していったピアノ連弾の組曲。その冒頭の、優しく揺れる子守歌。'),
  ],
  debussy: [
    w('debussy-quartet', '弦楽四重奏曲 ト短調 第1楽章', 'String Quartet in G minor, Op. 10 (Animé et très décidé)', 1893, 'Chamber', '室内楽', 'Paris', PARIS,
      'ドビュッシーが残した唯一の弦楽四重奏曲。冒頭の主題が姿を変えながら全曲に現れる。ジャワのガムランの響きの影響も感じられる。'),
    w('debussy-syrinx', 'シランクス（無伴奏フルート）', 'Syrinx, L. 129', 1913, 'Solo', '独奏曲', 'Paris', PARIS,
      '牧神パンが、葦に姿を変えた妖精シュリンクスを想って笛を吹く——その笛の音を描いた、無伴奏フルートの名曲。')
  ],
  ravel: [
    w('ravel-quartet', '弦楽四重奏曲 ヘ長調 第2楽章', 'String Quartet in F major (Assez vif – Très rythmé)', 1903, 'Chamber', '室内楽', 'Paris', PARIS,
      '20代のラヴェルが書いた唯一の弦楽四重奏曲。第2楽章では、全員のピツィカート（指ではじく奏法）がギターのように鳴り響く。'),
    w('ravel-sonatine', 'ソナチネ 第1楽章', 'Sonatine, M. 40 (Modéré)', 1905, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '雑誌の作曲コンクールのために書いた、小さく透明なソナタ。古典的な形の中に、ラヴェルらしい繊細な和音が光る。'),
    w('ravel-introduction', '序奏とアレグロ（ハープと室内アンサンブル）', 'Introduction and Allegro for Harp, Flute, Clarinet and String Quartet', 1905, 'Chamber', '室内楽', 'Paris', PARIS,
      'ハープ製造会社が、新型ハープの宣伝のために依頼した作品。ハープが主役となって、きらめくような響きを聴かせる。')
  ],
  satie: [
    w('satie-gnossienne3', 'グノシエンヌ 第3番', 'Gnossienne No. 3', 1890, 'Piano', 'ピアノ独奏', 'Paris', PARIS,
      '小節線のない楽譜に「ずっと遠くからのように」「頭を開いて」などの奇妙な指示が書かれた、不思議な雰囲気のピアノ曲。')
  ],
  elgar: [
    w('elgar-introduction', '序奏とアレグロ（弦楽のための）', 'Introduction and Allegro for Strings, Op. 47', 1905, 'Orchestral', '弦楽合奏', 'London', LONDON,
      '弦楽四重奏と弦楽合奏を組み合わせた作品。ウェールズで聞いた民謡の歌声から生まれた「ウェールズの旋律」が登場する。')
  ],
  holst: [
    w('holst-suite1', '吹奏楽のための第1組曲 第1楽章「シャコンヌ」', 'First Suite in E-flat for Military Band, Op. 28 No. 1: Chaconne', 1909, 'Orchestral', '吹奏楽', 'London', LONDON,
      '吹奏楽のために最初から書かれた、本格的な芸術作品の先駆け。低音で始まる短い主題が、次々と楽器を変えて積み重なっていく。今も世界中の吹奏楽団の定番。')
  ],
  verdi: [
    w('verdi-forza', '歌劇『運命の力』序曲', 'La forza del destino: Overture', 1862, 'Opera', 'オペラ', 'Saint Petersburg', ST_PETERSBURG,
      'ロシア皇帝の劇場のために書かれたオペラに、のちの改訂で加えられた序曲。金管の3つの音のあと、弦が「運命の動機」を不安げに奏でる。'),
    w('verdi-rigoletto-quartet', '歌劇『リゴレット』より四重唱「美しい恋の乙女よ」', 'Rigoletto: Bella figlia dell\'amore', 1851, 'Opera', 'オペラ', 'Venice', VENICE,
      '女性を口説く公爵、軽くあしらう娘、嘆くジルダ、復讐を誓う父——4人がそれぞれ違う気持ちを同時に歌う、オペラ史上屈指の四重唱。')
  ],
  puccini: [
    w('puccini-tedeum', '歌劇『トスカ』より「テ・デウム」', 'Tosca: Te Deum', 1900, 'Opera', 'オペラ', 'Rome', [12.4964, 41.9028],
      '教会で合唱が神をたたえる中、悪役スカルピアがトスカを手に入れる欲望を独白する。鐘と大砲が鳴り響く、第1幕の壮大な幕切れ。')
  ],
  donizetti: [
    w('donizetti-pasquale', '歌劇『ドン・パスクワーレ』序曲', 'Don Pasquale: Overture', 1843, 'Opera', 'オペラ', 'Paris', PARIS,
      'けちな老人が若い娘との結婚をたくらんで痛い目にあう喜劇オペラの序曲。チェロが歌う甘いセレナードの旋律が印象的。')
  ],
  wagner: [
    w('wagner-tannhauser', '歌劇『タンホイザー』序曲', 'Tannhäuser: Overture', 1845, 'Opera', 'オペラ', 'Dresden', [13.7373, 51.0504],
      '巡礼者たちの厳かな合唱と、愛の女神ヴェーヌスの官能的な世界がぶつかり合う序曲。最後は巡礼の歌が圧倒的な力で戻ってくる。')
  ],
  mahler: [
    w('mahler-sym4', '交響曲 第4番 ト長調 第4楽章', 'Symphony No. 4 in G major (Sehr behaglich)', 1900, 'Symphony', '交響曲', 'Vienna', VIENNA,
      '子どもの見た天国の楽しい暮らしを、ソプラノが無邪気に歌う終楽章。マーラーの交響曲の中で最も小ぶりで親しみやすい。')
  ],
  paganini: [
    w('paganini-caprice5', '24の奇想曲より 第5番', '24 Caprices, Op. 1: No. 5 in A minor', 1817, 'Solo', '独奏曲', 'Genoa', [8.9463, 44.4056],
      '弓を弦の上で跳ねさせながら、高音から低音まで猛スピードで駆け下りる超絶技巧の曲。（録音はサクソフォンでの演奏）')
  ],
  weber: [
    w('weber-oberon', '歌劇『オベロン』序曲', 'Oberon: Overture', 1826, 'Opera', 'オペラ', 'London', LONDON,
      '妖精の王オベロンの物語。ホルンの呼び声で始まる幻想的な序曲。ウェーバーはロンドンでの初演の直後、その地で亡くなった。')
  ],
  sibelius: [
    w('sibelius-valse', '『悲しきワルツ』', 'Valse triste, Op. 44 No. 1', 1904, 'Orchestral', '管弦楽曲', 'Helsinki', [24.9384, 60.1699],
      '病床の母が、死神を亡き夫と思い込んで夢の中で踊る——劇の付随音楽として書かれた、幻想的で物悲しいワルツ。')
  ],
  rachmaninoff: [
    w('rachmaninoff-pc2-2', 'ピアノ協奏曲 第2番 第2楽章', 'Piano Concerto No. 2 in C minor, Op. 18 (Adagio sostenuto)', 1901, 'Concerto', '協奏曲', 'Moscow', MOSCOW,
      'フルートとクラリネットが歌い出す、夢見るように甘い緩徐楽章。のちにポップスの名曲『オール・バイ・マイセルフ』の元にもなった。')
  ],
  pachelbel: [
    w('pachelbel-chaconne', 'シャコンヌ ヘ短調（オルガン）', 'Chaconne in F minor', 1699, 'Keyboard', 'オルガン曲', 'Nuremberg', [11.0767, 49.4521],
      '『カノン』と同じく、短い低音のくり返しの上で変奏を重ねていくオルガン曲。重々しく、しだいに熱を帯びていく。')
  ],
  corelli: [
    w('corelli-op6-4', '合奏協奏曲 作品6-4 ニ長調 第1楽章', 'Concerto Grosso in D major, Op. 6 No. 4 (Adagio – Allegro)', 1712, 'Concerto', '協奏曲', 'Rome', [12.4964, 41.9028],
      '小さな独奏グループと大きな合奏が掛け合う「合奏協奏曲」の手本となった曲集から。輝かしいニ長調の響き。')
  ],
  couperin: [
    w('couperin-tic', '「ティク・トク・ショク、またはオリーブ搾り機」', 'Le Tic-Toc-Choc, ou Les Maillotins', 1722, 'Keyboard', '鍵盤曲', 'Paris', PARIS,
      '左右の手が同じ音域で交互にすばやく打ち合い、機械がカタカタ動くような音を生む、チェンバロの名人芸の曲。')
  ]
};

/** 作曲家の id ごとの、追加の作品（音の楽譜データはないので、空のまま） */
const ALL_RAW: Record<string, ExtraWork[]> = { ...RAW };
for (const extra of [RAW2, RAW3, RAW4, RAW5])
  for (const [cid, works] of Object.entries(extra)) ALL_RAW[cid] = [...(ALL_RAW[cid] ?? []), ...works];

export const EXTRA_WORKS: Record<string, Composition[]> = Object.fromEntries(
  Object.entries(ALL_RAW).map(([cid, works]) => [
    cid,
    works.map(w => ({ ...w, audioSnippet: { type: 'audio' as const, notes: [], tempo: 0, instrument: 'orchestra' as const } }))
  ])
);
