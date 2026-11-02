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

/** 作曲家の id ごとの、追加の作品（音の楽譜データはないので、空のまま） */
const ALL_RAW: Record<string, ExtraWork[]> = { ...RAW };
for (const [cid, works] of Object.entries(RAW2)) ALL_RAW[cid] = [...(ALL_RAW[cid] ?? []), ...works];

export const EXTRA_WORKS: Record<string, Composition[]> = Object.fromEntries(
  Object.entries(ALL_RAW).map(([cid, works]) => [
    cid,
    works.map(w => ({ ...w, audioSnippet: { type: 'audio' as const, notes: [], tempo: 0, instrument: 'orchestra' as const } }))
  ])
);
