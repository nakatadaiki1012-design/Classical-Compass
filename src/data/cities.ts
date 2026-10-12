import { EuropeanCity } from '../types';

export const EUROPEAN_CITIES: Record<string, EuropeanCity> = {
  vienna: {
    id: 'vienna',
    name: 'Vienna',
    nameJa: 'ウィーン',
    countryJa: 'オーストリア',
    coordinates: [16.3738, 48.2082],
    description: '音楽の都。ハイドン、モーツァルト、ベートーヴェン、シューベルト、ブラームス、マーラーが活躍した欧州音楽の中心地。'
  },
  paris: {
    id: 'paris',
    name: 'Paris',
    nameJa: 'パリ',
    countryJa: 'フランス',
    coordinates: [2.3522, 48.8566],
    description: '文化と芸術の発信地。ショパン、リスト、ベルリオーズ、ドビュッシー、ラヴェル、ストラヴィンスキーが革新を生み出した。'
  },
  leipzig: {
    id: 'leipzig',
    name: 'Leipzig',
    nameJa: 'ライプツィヒ',
    countryJa: 'ドイツ',
    coordinates: [12.3731, 51.3397],
    description: 'トーマス教会カントルを務めたJ.S.バッハの地であり、メンデルスゾーンがゲヴァントハウス管弦楽団と音楽院を興した街。'
  },
  london: {
    id: 'london',
    name: 'London',
    nameJa: 'ロンドン',
    countryJa: 'イギリス',
    coordinates: [-0.1276, 51.5074],
    description: 'ヘンデルが定住し『メサイア』を生み、ハイドンがロンドン交響曲群を初演した国際的音楽市場。'
  },
  venice: {
    id: 'venice',
    name: 'Venice',
    nameJa: 'ヴェネツィア',
    countryJa: 'イタリア',
    coordinates: [12.3155, 45.4408],
    description: 'ヴィヴァルディがピエタ慈善院で協奏曲を量産し、モンテヴェルディがオペラを花開かせた水の都。'
  },
  rome: {
    id: 'rome',
    name: 'Rome',
    nameJa: 'ローマ',
    countryJa: 'イタリア',
    coordinates: [12.4964, 41.9028],
    description: 'カトリック教会音楽の中心地であり、ヘンデルやリスト、ドビュッシーが留学・滞在し霊感を得た永遠の都。'
  },
  salzburg: {
    id: 'salzburg',
    name: 'Salzburg',
    nameJa: 'ザルツブルク',
    countryJa: 'オーストリア',
    coordinates: [13.055, 47.8095],
    description: 'モーツァルトの生誕地。大司教領主宮廷のもとで数多くの初期傑作が生み出された。'
  },
  prague: {
    id: 'prague',
    name: 'Prague',
    nameJa: 'プラハ',
    countryJa: 'チェコ',
    coordinates: [14.4378, 50.0755],
    description: 'モーツァルトのオペラ『ドン・ジョヴァンニ』が初演され熱狂を呼び、ドヴォルザークやスメタナが国民楽派を築いた街。'
  },
  stpetersburg: {
    id: 'stpetersburg',
    name: 'St. Petersburg',
    nameJa: 'サンクトペテルブルク',
    countryJa: 'ロシア',
    coordinates: [30.3351, 59.9343],
    description: 'マリインスキー劇場と音楽院を擁し、チャイコフスキー、ロシア5人組、ストラヴィンスキーが煌めいた帝政ロシアの首都。'
  },
  moscow: {
    id: 'moscow',
    name: 'Moscow',
    nameJa: 'モスクワ',
    countryJa: 'ロシア',
    coordinates: [37.6173, 55.7558],
    description: 'モスクワ音楽院を中心にラフマニノフやチャイコフスキー、プロコフィエフが活動したロシア音楽の拠点。'
  },
  warsaw: {
    id: 'warsaw',
    name: 'Warsaw',
    nameJa: 'ワルシャワ',
    countryJa: 'ポーランド',
    coordinates: [21.0122, 52.2297],
    description: 'ショパンの故郷。ポロネーズやマズルカなど、祖国への深い愛情が育まれた地。'
  },
  weimar: {
    id: 'weimar',
    name: 'Weimar',
    nameJa: 'ヴァイマール',
    countryJa: 'ドイツ',
    coordinates: [11.3287, 50.9787],
    description: 'J.S.バッハが宮廷オルガニストとして活動し、後にリストが宮廷楽長として交響詩を創始した古典文化の中心。'
  },
  hamburg: {
    id: 'hamburg',
    name: 'Hamburg',
    nameJa: 'ハンブルク',
    countryJa: 'ドイツ',
    coordinates: [9.9937, 53.5511],
    description: 'メンデルスゾーンやブラームスの生誕地であり、北ドイツの音楽文化を牽引した港湾都市。'
  },
  bonn: {
    id: 'bonn',
    name: 'Bonn',
    nameJa: 'ボン',
    countryJa: 'ドイツ',
    coordinates: [7.0982, 50.7374],
    description: 'ベートーヴェンの生誕地。選帝侯宮廷の宮廷楽団で若きベートーヴェンが腕を磨いた。'
  },
  bayreuth: {
    id: 'bayreuth',
    name: 'Bayreuth',
    nameJa: 'バイロイト',
    countryJa: 'ドイツ',
    coordinates: [11.5786, 49.9456],
    description: 'リヒャルト・ワーグナーが自身の祝祭劇場の建設地として選んだ楽劇の聖地。'
  },
  milan: {
    id: 'milan',
    name: 'Milan',
    nameJa: 'ミラノ',
    countryJa: 'イタリア',
    coordinates: [9.19, 45.4642],
    description: 'スカラ座を擁するイタリア・オペラの最高峰都市。ヴェルディが数々の傑作を初演した。'
  },
  budapest: {
    id: 'budapest',
    name: 'Budapest',
    nameJa: 'ブダペスト',
    countryJa: 'ハンガリー',
    coordinates: [19.0402, 47.4979],
    description: 'リストやバルトークの故郷であり、ロマ音楽とマジャル人の民族旋律が息づく地。'
  },
  bergen: {
    id: 'bergen',
    name: 'Bergen',
    nameJa: 'ベルゲン',
    countryJa: 'ノルウェー',
    coordinates: [5.3221, 60.3913],
    description: 'エドヴァルド・グリーグの故郷。フィヨルドの雄大な自然とノルウェー民謡が昇華された地。'
  },
  helsinki: {
    id: 'helsinki',
    name: 'Helsinki',
    nameJa: 'ヘルシンキ',
    countryJa: 'フィンランド',
    coordinates: [24.9384, 60.1699],
    description: 'ジャン・シベリウスが愛国交響詩『フィンランディア』で国民を鼓舞した北欧の都。'
  },
  reims: {
    id: 'reims',
    name: 'Reims',
    nameJa: 'ランス',
    countryJa: 'フランス',
    coordinates: [4.0317, 49.2583],
    description: 'ノートルダム大聖堂で知られる中世フランス音楽の聖地。ギョーム・ド・マショーが聖歌隊長を務めた。'
  },
  tournai: {
    id: 'tournai',
    name: 'Condé / Tournai',
    nameJa: 'コンデ / トゥルネー',
    countryJa: 'フランコ・フランドル',
    coordinates: [3.3883, 50.6056],
    description: 'ルネサンス音楽の奇跡ジョスカン・デ・プレが活動し最期を迎えたフランドル楽派の拠点。'
  },
  dresden: {
    id: 'dresden',
    name: 'Dresden',
    nameJa: 'ドレスデン',
    countryJa: 'ドイツ',
    coordinates: [13.7373, 51.0504],
    description: 'ザクセン選帝侯宮廷の音楽の都。シューマンやワーグナー、ウェーバーが活躍したエルベ河畔の古都。'
  },
  madrid: {
    id: 'madrid',
    name: 'Madrid',
    nameJa: 'マドリード',
    countryJa: 'スペイン',
    coordinates: [-3.7038, 40.4168],
    description: 'スペイン王室宮廷を擁し、スカルラッティやボッケリーニが南欧の情熱を鍵盤と室内楽に注いだ都。'
  },
  eisenach: {
    id: 'eisenach',
    name: 'Eisenach',
    nameJa: 'アイゼナハ',
    countryJa: 'ドイツ',
    coordinates: [10.3204, 50.9753],
    description: 'バッハの生誕地であり、ヴァルトブルク城を臨むチューリンゲンの歴史的聖地。'
  }
};
