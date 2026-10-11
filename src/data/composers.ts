import { Composer } from '../types';
import { LIFE_EPISODES } from './lifeEpisodes';

const BASE_COMPOSERS: Composer[] = [
  // --- BAROQUE ---
  {
    id: 'vivaldi',
    name: 'アントニオ・ヴィヴァルディ',
    originalName: 'Antonio Lucio Vivaldi',
    shortName: 'ヴィヴァルディ',
    birthYear: 1678,
    deathYear: 1741,
    era: 'baroque',
    country: 'イタリア',
    nationalityJa: 'イタリア',
    flag: '🇮🇹',
    portraitUrl: '/portraits/vivaldi.jpg',
    portraitPainter: 'ボローニャ音楽博物館所蔵（1723年頃、ヴァイオリンと楽譜を手にする肖像）',
    portraitAttribution: 'パブリックドメイン（公有財産）',
    biography: 'ヴェネツィア生まれの「赤毛の司祭」。ピエタ慈善院の少女合奏団のために500曲を超える協奏曲を作曲し、急-緩-急の3楽章形式による独奏協奏曲のスタイルを確立。生前はヨーロッパ全土で絶大な人気を誇ったが、晩年はウィーンで困窮のうちに没した。後にJ.S.バッハがその技法を熱心に研究・編曲したことで、西洋器楽史の礎としての重要性が再評価された。',
    musicalStyle: '躍動的なリトルネッロ形式、鮮やかな音画描写（標題音楽の先駆）、バイオリンの華麗な名人芸的技巧、明快な和声感。',
    keyFeatures: ['独奏協奏曲（ソロ・コンチェルト）の形式確立', '標題音楽の先駆『四季』', '急-緩-急の3楽章制の普及'],
    historicalQuote: '「私は鉛筆で書くよりも速く協奏曲の全パートを書き上げることができる」',
    contemporaries: ['J.S.バッハ', 'ヘンデル', 'トレッリ'],
    cities: [
      {
        cityName: 'Venice',
        cityNameJa: 'ヴェネツィア',
        country: 'イタリア',
        coordinates: [12.3155, 45.4408],
        startYear: 1678,
        endYear: 1740,
        role: 'ピエタ慈善院 音楽教師・楽長',
        notableEvent: '『調和の霊感』および協奏曲集『四季』の作曲と発表'
      },
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1740,
        endYear: 1741,
        role: '晩年の滞在地',
        notableEvent: '皇帝カール6世の庇護を求め移住するも皇帝の急死により困窮して没する'
      }
    ],
    milestones: [
    {
        "year": 1703,
        "event": "司祭叙階、ピエタ慈善院ヴァイオリン教師就任"
    },
    {
        "year": 1711,
        "event": "協奏曲集『調和の霊感』作品3 出版、欧州で旋風"
    },
    {
        "year": 1723,
        "event": "協奏曲集『四季』完成"
    },
    {
        "year": 1740,
        "event": "皇帝カール6世の庇護を求めウィーンへ移住"
    }
],
    works: [
      {
        id: 'bach',
        title: '協奏曲集『四季』より「春」第1楽章',
        originalTitle: 'Le quattro stagioni: La primavera (Allegro)',
        year: 1723,
        genre: 'Concerto',
        genreJa: '協奏曲',
        city: 'Venice',
        cityCoordinates: [12.3155, 45.4408],
        description: '小鳥のさえずり、そよ風、春の訪れを告げる雷鳴をヴァイオリンソロと弦楽合奏で生き生きと描写した西洋音楽屈指の名曲。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 104,
          notes: [
            { note: 'E5', duration: 1 },
            { note: 'G#5', duration: 0.5 },
            { note: 'G#5', duration: 0.5 },
            { note: 'G#5', duration: 1 },
            { note: 'F#5', duration: 0.5 },
            { note: 'E5', duration: 0.5 },
            { note: 'B5', duration: 2 },
            { note: 'B5', duration: 1 },
            { note: 'A5', duration: 0.5 },
            { note: 'G#5', duration: 0.5 },
            { note: 'F#5', duration: 1 },
            { note: 'E5', duration: 1 }
          ]
        }
      },
      {
        id: 'vivaldi-winter',
        title: '協奏曲集『四季』より「冬」第1楽章',
        originalTitle: 'Le quattro stagioni: L’inverno (Allegro non molto)',
        year: 1723,
        genre: 'Concerto',
        genreJa: '協奏曲',
        city: 'Venice',
        cityCoordinates: [12.3155, 45.4408],
        description: '寒風に震える身体、足踏みをして暖をとる人々の姿を刻む弦の不協和音と超絶技巧のアルペジオで描いた名作。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 110,
          notes: [
            { note: 'F4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'Ab4', duration: 1 },
            { note: 'G4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'C5', duration: 1 },
            { note: 'Bb4', duration: 0.5 },
            { note: 'Ab4', duration: 0.5 }
          ]
        }
      }
    ]
  },
  {
    id: 'bach',
    name: 'ヨハン・ゼバスティアン・バッハ',
    originalName: 'Johann Sebastian Bach',
    shortName: 'J.S.バッハ',
    birthYear: 1685,
    deathYear: 1750,
    era: 'baroque',
    country: 'ドイツ',
    nationalityJa: 'ドイツ',
    flag: '🇩🇪',
    portraitUrl: '/portraits/bach.jpg',
    biography: '「音楽の父」と仰がれる大バッハ。テューリンゲンの音楽一族に生まれ、アルンシュタット、ミュールハウゼン、ヴァイマール、ケーテンを経て、ライプツィヒの聖トーマス教会カントルとして27年間教会の音楽監督を務めた。厳格なプロテスタント信仰に根ざした教会カンタータや受難曲、そして対位法の頂点を極めた『平均律クラヴィーア曲集』『フーガの技法』を遺した。',
    musicalStyle: 'ポリフォニー（多声音楽）と対位法の至高の完成、緻密な数理的構成、調性音楽の体系化、敬虔な神への祈りと人間的深情の調和。',
    keyFeatures: ['平均律クラヴィーア曲集による調性体系の確立', '対位法・フーガの究極的昇華', '教会カンタータ・受難曲の宗教的頂点'],
    historicalQuote: '「バッハ（小川）ではなく、海（メール）と呼ぶべきだ」― ルートヴィヒ・ヴァン・ベートーヴェン',
    contemporaries: ['ヘンデル', 'テレマン', 'ヴィヴァルディ'],
    cities: [
      {
        cityName: 'Weimar',
        cityNameJa: 'ヴァイマール',
        country: 'ドイツ',
        coordinates: [11.3287, 50.9787],
        startYear: 1708,
        endYear: 1717,
        role: '宮廷オルガニスト・楽師',
        notableEvent: 'オルガン用トッカータとフーガ、多数のコラール前奏曲を作曲'
      },
      {
        cityName: 'Leipzig',
        cityNameJa: 'ライプツィヒ',
        country: 'ドイツ',
        coordinates: [12.3731, 51.3397],
        startYear: 1723,
        endYear: 1750,
        role: '聖トーマス教会カントル（音楽監督）',
        notableEvent: '『マタイ受難曲』『ロ短調ミサ』『フーガの技法』の完成'
      }
    ],
    milestones: [
    {
        "year": 1708,
        "event": "ヴァイマール宮廷オルガニスト就任、トッカータ作曲"
    },
    {
        "year": 1717,
        "event": "ケーテン宮廷楽長就任、ブランデンブルク協奏曲"
    },
    {
        "year": 1722,
        "event": "『平均律クラヴィーア曲集第1巻』完成"
    },
    {
        "year": 1723,
        "event": "ライプツィヒ・トーマスカントル（音楽監督）就任"
    },
    {
        "year": 1727,
        "event": "『マタイ受難曲』初演"
    },
    {
        "year": 1749,
        "event": "『ロ短調ミサ』完成"
    }
],
    works: [
      {
        id: 'handel',
        title: '管弦楽組曲第3番より「G線上のアリア」',
        originalTitle: 'Air aus der Orchestersuite Nr. 3 D-Dur, BWV 1068',
        year: 1730,
        genre: 'Chamber',
        genreJa: '室内楽・管弦楽',
        city: 'Leipzig',
        cityCoordinates: [12.3731, 51.3397],
        description: '穏やかに下降する通奏低音のウォーキングベースの上を、息の長い天上の旋律が静かに漂うバロック音楽の最高傑作。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 58,
          notes: [
            { note: 'F#5', duration: 2 },
            { note: 'E5', duration: 1 },
            { note: 'D5', duration: 1 },
            { note: 'C#5', duration: 1 },
            { note: 'B4', duration: 1 },
            { note: 'A4', duration: 2 },
            { note: 'G#4', duration: 1 },
            { note: 'A4', duration: 3 }
          ]
        }
      },
      {
        id: 'bach-toccata',
        title: 'トッカータとフーガ ニ短調',
        originalTitle: 'Toccata und Fuge d-Moll, BWV 565',
        year: 1704,
        genre: 'Solo',
        genreJa: 'オルガン独奏',
        city: 'Weimar',
        cityCoordinates: [11.3287, 50.9787],
        description: '劇的なオルガンの咆哮で始まる、西洋器楽史において最も有名で畏怖に満ちた名旋律。',
        audioSnippet: {
          type: 'synth',
          instrument: 'organ',
          tempo: 76,
          notes: [
            { note: 'A4', duration: 0.5 },
            { note: 'G4', duration: 0.25 },
            { note: 'A4', duration: 1.5 },
            { note: 'R', duration: 0.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'F4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'D4', duration: 0.5 },
            { note: 'C#4', duration: 1 },
            { note: 'D4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'handel',
    name: 'ゲオルク・フリードリヒ・ヘンデル',
    originalName: 'Georg Friedrich Händel',
    shortName: 'ヘンデル',
    birthYear: 1685,
    deathYear: 1759,
    era: 'baroque',
    country: 'ドイツ / イギリス',
    nationalityJa: 'ドイツ / イギリス',
    flag: '🇬🇧',
    portraitUrl: '/portraits/handel.jpg',
    biography: 'ドイツのハレに生まれ、イタリアでオペラ修業を積んだ後、ロンドンに渡り英国に帰化した国際派の大家。イタリア・オペラの興行主として成功と破産を繰り返した後、英語のオラトリオ（聖譚曲）という新たなジャンルを開拓し『メサイア』で絶大な名声を得た。ジョージ1世に捧げた『水上の音楽』や『王宮の花火の音楽』など祝祭的壮麗さでも知られる。',
    musicalStyle: '堂々たる旋律美、劇的で力強い合唱技法、国際色豊かな様式の統合、明快で壮大な祝祭感。',
    keyFeatures: ['英語オラトリオの完成', '大衆を熱狂させた劇的合唱書法', '管弦楽組曲『水上の音楽』'],
    historicalQuote: '「私は彼らの頭を喜ばせるのではなく、彼らの心をより善きものにしたいのだ」',
    contemporaries: ['J.S.バッハ', 'テレマン', 'スカルラッティ'],
    cities: [
      {
        cityName: 'London',
        cityNameJa: 'ロンドン',
        country: 'イギリス',
        coordinates: [-0.1276, 51.5074],
        startYear: 1712,
        endYear: 1759,
        role: 'ロイヤル・アカデミー・オブ・ミュージック主宰・宮廷作曲家',
        notableEvent: 'オラトリオ『メサイア』『水上の音楽』の作曲と英国への帰化'
      }
    ],
    milestones: [
    {
        "year": 1710,
        "event": "ロンドンへ初渡航、アン女王の宮廷で名声"
    },
    {
        "year": 1717,
        "event": "テムズ川の舟遊びで『水上の音楽』初演"
    },
    {
        "year": 1727,
        "event": "イギリスへ帰化、戴冠式アンセム『司祭ザドク』"
    },
    {
        "year": 1741,
        "event": "不朽のオラトリオ『メサイア』完成"
    }
],
    works: [
      {
        id: 'haydn',
        title: 'オラトリオ『メサイア』より「ハレルヤ・コーラス」',
        originalTitle: 'Messiah: Hallelujah Chorus, HWV 56',
        year: 1741,
        genre: 'Choral',
        genreJa: '声楽・合唱',
        city: 'London',
        cityCoordinates: [-0.1276, 51.5074],
        description: '国王ジョージ2世が思わず立ち上がったという伝説を持つ、神への賛美と歓喜に満ちた合唱の金字塔。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 104,
          notes: [
            { note: 'G4', duration: 1 },
            { note: 'D5', duration: 1 },
            { note: 'B4', duration: 0.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'D5', duration: 1 },
            { note: 'G4', duration: 1 },
            { note: 'D5', duration: 1 },
            { note: 'B4', duration: 0.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'D5', duration: 1 }
          ]
        }
      }
    ]
  },

  // --- CLASSICAL ---
  {
    id: 'haydn',
    name: 'フランツ・ヨーゼフ・ハイドン',
    originalName: 'Franz Joseph Haydn',
    shortName: 'ハイドン',
    birthYear: 1732,
    deathYear: 1809,
    era: 'classical',
    country: 'オーストリア',
    nationalityJa: 'オーストリア',
    flag: '🇦🇹',
    portraitUrl: '/portraits/haydn.jpg',
    biography: '「交響曲の父」「弦楽四重奏の父」と讃えられる古典派の創始者。ハンガリー貴族エステルハージ家に約30年間仕え、孤立した宮廷環境のなかで「独創的にならざるを得なかった」と語る通り、104曲以上の交響曲と68曲の弦楽四重奏曲を体系化。晩年にはロンドンに招かれ名声を極めた。モーツァルトと深い友情を結び、若きベートーヴェンの師でもあった。',
    musicalStyle: 'モチーフ展開の緻密さ、ソナタ形式の構造的均整、機知とユーモア（休符や突然の強音）、温厚で明朗な人間性。',
    keyFeatures: ['交響曲形式と弦楽四重奏形式の確立', '動機労作（主題展開）の開拓', '古典派ソナタ形式の祖'],
    historicalQuote: '「私は世界から切り離されていた。そのため、私は独創的にならざるを得なかったのだ」',
    contemporaries: ['モーツァルト', 'ベートーヴェン', 'C.P.E.バッハ'],
    cities: [
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1790,
        endYear: 1809,
        role: '名誉楽長・巨匠',
        notableEvent: 'オラトリオ『天地創造』『四季』の作曲とベートーヴェンへの指導'
      },
      {
        cityName: 'London',
        cityNameJa: 'ロンドン',
        country: 'イギリス',
        coordinates: [-0.1276, 51.5074],
        startYear: 1791,
        endYear: 1795,
        role: '客演指揮者・作曲家',
        notableEvent: '『驚愕』『時計』を含む12曲の「ロンドン交響曲集」の初演とオックスフォード大名誉博士号授与'
      }
    ],
    milestones: [
    {
        "year": 1761,
        "event": "エステルハージ家副楽長に就任（後に楽長）"
    },
    {
        "year": 1781,
        "event": "ウィーンで若きモーツァルトと運命的な出会い"
    },
    {
        "year": 1791,
        "event": "ロンドンへ渡航、交響曲第94番『驚愕』初演"
    },
    {
        "year": 1798,
        "event": "オラトリオ『天地創造』初演、全欧で大絶賛"
    }
],
    works: [
      {
        id: 'mozart',
        title: '交響曲第94番 ト長調『驚愕』第2楽章',
        originalTitle: 'Symphonie Nr. 94 G-Dur "Mit dem Paukenschlag" (Andante)',
        year: 1791,
        genre: 'Symphony',
        genreJa: '交響曲',
        city: 'London',
        cityCoordinates: [-0.1276, 51.5074],
        description: '静かな主題がピアノで奏でられた直後、居眠りしている聴衆を起こすかのように突如ティンパニとともに全奏（フォルティッシモ）が鳴り響くユーモアの結晶。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 84,
          notes: [
            { note: 'C4', duration: 1 },
            { note: 'C4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'G4', duration: 1 },
            { note: 'G4', duration: 1 },
            { note: 'E4', duration: 2 },
            { note: 'F4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'B3', duration: 1 },
            { note: 'B3', duration: 1 },
            { note: 'G3', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'mozart',
    name: 'ヴォルフガング・アマデウス・モーツァルト',
    originalName: 'Wolfgang Amadeus Mozart',
    shortName: 'モーツァルト',
    birthYear: 1756,
    deathYear: 1791,
    era: 'classical',
    country: 'オーストリア',
    nationalityJa: 'オーストリア',
    flag: '🇦🇹',
    portraitUrl: '/portraits/mozart.jpg',
    biography: 'ザルツブルクに生まれた人類史上屈指の神童。父レオポルトに伴われ幼少期から欧州各地を演奏旅行し、あらゆる音楽様式を吸収。ザルツブルク宮廷大司教との確執の末、自立した音楽家としてウィーンに移住。『フィガロの結婚』『ドン・ジョヴァンニ』『魔笛』などのオペラ、ピアノ協奏曲、最後の3大交響曲など、わずか35年の生涯で600曲以上の奇跡的傑作を遺した。',
    musicalStyle: '天衣無縫の流麗な旋律美、光と影（長調のなかに忍び寄る深い哀愁）、オペラ的な登場人物の心理描写、完璧な形式美。',
    keyFeatures: ['古典派ピアノ協奏曲形式の完成', 'ダ・ポンテ3部作によるオペラ・ブッファの極致', '哀愁と歓喜が交錯する究極の旋律美'],
    historicalQuote: '「私は神の手の中にある。私の音楽は、私の心から直接湧き出ているのだ」',
    contemporaries: ['ハイドン', 'サリエリ', 'ベートーヴェン'],
    cities: [
      {
        cityName: 'Salzburg',
        cityNameJa: 'ザルツブルク',
        country: 'オーストリア',
        coordinates: [13.055, 47.8095],
        startYear: 1756,
        endYear: 1781,
        role: '宮廷オルガニスト・宮廷楽団員',
        notableEvent: '神童としての成長、ヴァイオリン協奏曲群や初期交響曲の作曲'
      },
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1781,
        endYear: 1791,
        role: 'フリーランスの演奏家・宮廷室内作曲家',
        notableEvent: '『フィガロの結婚』『魔笛』『三大交響曲』『レクイエム（絶筆）』の作曲'
      },
      {
        cityName: 'Prague',
        cityNameJa: 'プラハ',
        country: 'チェコ',
        coordinates: [14.4378, 50.0755],
        startYear: 1787,
        endYear: 1787,
        role: '客演オペラ作曲家',
        notableEvent: 'オペラ『ドン・ジョヴァンニ』の歴史的初演と市民の熱狂的歓迎'
      }
    ],
    milestones: [
    {
        "year": 1762,
        "event": "6歳で神童としてウィーン宮廷御前演奏"
    },
    {
        "year": 1781,
        "event": "ザルツブルク大司教と決別、ウィーンで自立"
    },
    {
        "year": 1786,
        "event": "オペラ『フィガロの結婚』ウィーン初演"
    },
    {
        "year": 1787,
        "event": "プラハで『ドン・ジョヴァンニ』初演・アイネクライネ"
    },
    {
        "year": 1788,
        "event": "三大交響曲（39・40・41番ジュピター）完成"
    },
    {
        "year": 1791,
        "event": "『魔笛』初演、レクイエム未完のまま35歳で急逝"
    }
],
    works: [
      {
        id: 'beethoven',
        title: 'アイネ・クライネ・ナハトムジーク 第1楽章',
        originalTitle: 'Eine kleine Nachtmusik, K. 525 (Allegro)',
        year: 1787,
        genre: 'Chamber',
        genreJa: 'セレナード・室内楽',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: '誰もが口ずさめる弦楽合奏の代名詞。疾走感あふれる分散和音のロケット主題から始まる古典派均整美のシンボル。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 126,
          notes: [
            { note: 'G4', duration: 1.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'G4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'G4', duration: 0.5 },
            { note: 'B4', duration: 0.5 },
            { note: 'D5', duration: 1 },
            { note: 'R', duration: 1 },
            { note: 'C5', duration: 1.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'C5', duration: 1 },
            { note: 'A4', duration: 1 },
            { note: 'C5', duration: 0.5 },
            { note: 'F#4', duration: 0.5 },
            { note: 'A4', duration: 1 },
            { note: 'D4', duration: 1 }
          ]
        }
      },
      {
        id: 'mozart-sym40',
        title: '交響曲第40番 ト短調 第1楽章',
        originalTitle: 'Symphonie Nr. 40 g-Moll, K. 550 (Molto allegro)',
        year: 1788,
        genre: 'Symphony',
        genreJa: '交響曲',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: 'モーツァルトが遺したわずか2つの短調交響曲の一つ。悲愴と切迫感に満ちた小刻みなヴィオラの刻みから始まる哀愁の極致。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 116,
          notes: [
            { note: 'Eb4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'D4', duration: 1 },
            { note: 'Eb4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'D4', duration: 1 },
            { note: 'Eb4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'Bb4', duration: 1.5 }
          ]
        }
      }
    ]
  },
  {
    id: 'beethoven',
    name: 'ルートヴィヒ・ヴァン・ベートーヴェン',
    originalName: 'Ludwig van Beethoven',
    shortName: 'ベートーヴェン',
    birthYear: 1770,
    deathYear: 1827,
    era: 'classical',
    country: 'ドイツ / オーストリア',
    nationalityJa: 'ドイツ / オーストリア',
    flag: '🇩🇪',
    portraitUrl: '/portraits/beethoven.jpg',
    biography: 'ボンに生まれ、ウィーンで活躍した「楽聖」。音楽家にとって致命的な聴覚喪失という過酷な悲運に直面しながらも「ハイリゲンシュタットの遺書」の絶望を克服。『英雄』『運命』『田園』『合唱付き（第9）』など、苦悩を突き抜けて歓喜に至る劇的な精神性を音楽に刻み、音楽を貴族の娯楽から人類普遍の芸術へと高め、ロマン派への巨大な橋渡しを果たした。',
    musicalStyle: '不屈の推進力と劇的緊張感、ソナタ形式の極限的拡大、動機の徹底的変容、苦悩から歓喜への哲学的弁証法。',
    keyFeatures: ['交響曲の精神的・構造的革命', 'ピアノソナタ32曲による「新約聖書」', '声楽と管弦楽の融合（第九「歓喜の歌」）'],
    historicalQuote: '「私は運命の喉首を締め上げてやる。決して運命に屈服などしない！」',
    contemporaries: ['ハイドン', 'シューベルト', 'ゲーテ'],
    cities: [
      {
        cityName: 'Bonn',
        cityNameJa: 'ボン',
        country: 'ドイツ',
        coordinates: [7.0982, 50.7374],
        startYear: 1770,
        endYear: 1792,
        role: '選帝侯宮廷楽団員・ピアニスト',
        notableEvent: 'ネーフェに師事し、青年期を過ごす。ハイドンに才能を認められウィーン行きを決意'
      },
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1792,
        endYear: 1827,
        role: '孤高の巨匠',
        notableEvent: '『ハイリゲンシュタットの遺書』、全9曲の交響曲、後期弦楽四重奏曲群の完成'
      }
    ],
    milestones: [
    {
        "year": 1792,
        "event": "ボンからウィーンへ移住、ハイドンに師事"
    },
    {
        "year": 1802,
        "event": "難聴の絶望から『ハイリゲンシュタットの遺書』"
    },
    {
        "year": 1804,
        "event": "交響曲第3番『英雄（エロイカ）』完成"
    },
    {
        "year": 1808,
        "event": "交響曲第5番『運命』＆第6番『田園』同時初演"
    },
    {
        "year": 1824,
        "event": "全聾の中で交響曲第9番『合唱付き』初演、歓喜の歌"
    }
],
    works: [
      {
        id: 'schubert',
        title: '交響曲第5番 ハ短調『運命』第1楽章',
        originalTitle: 'Symphonie Nr. 5 c-Moll, Op. 67 (Allegro con brio)',
        year: 1808,
        genre: 'Symphony',
        genreJa: '交響曲',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: '「このように運命は扉を叩く」と語られたという4つの音（ダダダダーン）の動機が全曲を支配する、西洋音楽史上最も有名な劇的オープニング。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 108,
          notes: [
            { note: 'R', duration: 0.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'Eb4', duration: 3 },
            { note: 'R', duration: 1 },
            { note: 'F4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'D4', duration: 3.5 }
          ]
        }
      },
      {
        id: 'beethoven-ode-to-joy',
        title: '交響曲第9番 ニ短調『合唱付き』より「歓喜の歌」',
        originalTitle: 'Symphonie Nr. 9 d-Moll, Op. 125 "Ode an die Freude"',
        year: 1824,
        genre: 'Symphony',
        genreJa: '交響曲',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: 'シラーの詩に基づき「すべての人々は兄弟となる」という人類の友愛と融和を全霊で歌い上げる祈りのアンセム。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 112,
          notes: [
            { note: 'E4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'G4', duration: 1 },
            { note: 'G4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'C4', duration: 1 },
            { note: 'C4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'E4', duration: 1.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'D4', duration: 2 }
          ]
        }
      },
      {
        id: 'beethoven-moonlight',
        title: 'ピアノソナタ第14番 嬰ハ短調『月光』第1楽章',
        originalTitle: 'Klaviersonate Nr. 14 cis-Moll, Op. 27-2 (Adagio sostenuto)',
        year: 1801,
        genre: 'Piano',
        genreJa: 'ピアノソナタ',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: 'ルツェルン湖の月光の波に例えられた幻想的な三連符の波に乗って、静謐で切ない旋律が奏でられる名品。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 60,
          notes: [
            { note: 'G#3', duration: 0.33 },
            { note: 'C#4', duration: 0.33 },
            { note: 'E4', duration: 0.33 },
            { note: 'G#3', duration: 0.33 },
            { note: 'C#4', duration: 0.33 },
            { note: 'E4', duration: 0.33 },
            { note: 'G#3', duration: 0.33 },
            { note: 'C#4', duration: 0.33 },
            { note: 'E4', duration: 0.33 },
            { note: 'G#4', duration: 1.5 },
            { note: 'G#4', duration: 0.5 },
            { note: 'F#4', duration: 1 },
            { note: 'E4', duration: 1 }
          ]
        }
      }
    ]
  },

  // --- EARLY & HIGH ROMANTIC ---
  {
    id: 'schubert',
    name: 'フランツ・シューベルト',
    originalName: 'Franz Peter Schubert',
    shortName: 'シューベルト',
    birthYear: 1797,
    deathYear: 1828,
    era: 'romantic',
    country: 'オーストリア',
    nationalityJa: 'オーストリア',
    flag: '🇦🇹',
    portraitUrl: '/portraits/schubert.jpg',
    biography: 'ウィーン近郊に生まれた「歌曲の王」。わずか31年の短い生涯の中で『魔王』『野ばら』『冬の旅』など600曲を超えるドイツ・リートを作曲し、詩と音楽を不可分に一体化させた。生涯定職に就かず、「シューベルティアーデ」と呼ばれる親しい友人たちの集まりで曲を披露した。交響曲『未完成』やピアノ五重奏曲『ます』など、親密で哀愁に満ちた旋律で愛される。',
    musicalStyle: '天賦の無尽蔵な旋律美、繊細で移ろいやすい調性移動（同主調転調）、ピアノ伴奏部の劇的心理描写。',
    keyFeatures: ['ドイツ歌曲（リート）を芸術の最高峰へと昇華', '交響曲『未完成』によるロマン的抒情', '親密な室内楽の至宝'],
    historicalQuote: '「私は作曲するために生まれてきた。私の作品は音楽への理解と苦悩の所産である」',
    contemporaries: ['ベートーヴェン', 'ウェーバー', 'マイアベーア'],
    cities: [
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1797,
        endYear: 1828,
        role: '作曲家・自由人',
        notableEvent: '『魔王』『野ばら』連作歌曲集『冬の旅』交響曲『未完成』の作曲'
      }
    ],
    milestones: [
    {
        "year": 1814,
        "event": "ゲーテの詩による傑作歌曲『糸を紡ぐグレートヒェン』"
    },
    {
        "year": 1815,
        "event": "わずか18歳で1日で作った『魔王』が誕生"
    },
    {
        "year": 1822,
        "event": "交響曲第7(8)番『未完成』作曲"
    },
    {
        "year": 1827,
        "event": "死の前年に連作歌曲集『冬の旅』完成"
    }
],
    works: [
      {
        id: 'chopin',
        title: 'エレンの歌第3番（アヴェ・マリア）',
        originalTitle: 'Ellens Gesang III (Ave Maria), Op. 52-6, D 839',
        year: 1825,
        genre: 'Choral',
        genreJa: '歌曲',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: '祈りと敬虔な愛に満ちた、世界中で最も親しまれている純白の祈りのカンティレーナ。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 60,
          notes: [
            { note: 'C4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'Ab4', duration: 1 },
            { note: 'C5', duration: 2 },
            { note: 'Bb4', duration: 0.5 },
            { note: 'Ab4', duration: 0.5 },
            { note: 'G4', duration: 1 },
            { note: 'F4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'chopin',
    name: 'フレデリック・ショパン',
    originalName: 'Frédéric François Chopin',
    shortName: 'ショパン',
    birthYear: 1810,
    deathYear: 1849,
    era: 'romantic',
    country: 'ポーランド / フランス',
    nationalityJa: 'ポーランド / フランス',
    flag: '🇵🇱',
    portraitUrl: '/portraits/chopin.jpg',
    biography: 'ワルシャワ郊外に生まれた「ピアノの詩人」。ポーランド蜂起の挫折を受け故国を離れパリに定住。生涯の作品のほぼ全てをピアノのために捧げ、ノクターン、ワルツ、マズルカ、ポロネーズ、バラード、練習曲などを通じてピアノの音響可能性を飛躍的に拡張した。繊細な肺患を抱えながら、ジョルジュ・サンドとの生活やマヨルカ島滞在を経て珠玉の傑作を遺した。',
    musicalStyle: 'ベル・カント唱法に着想を得た歌うようなレガート、ルバート奏法、繊細なペダリング、祖国ポーランドへの郷愁。',
    keyFeatures: ['ピアノという楽器の完全なる美学的解放', 'サロン文化と内省的詩情の極致', '民族舞踊（マズルカ・ポロネーズ）の芸術化'],
    historicalQuote: '「私はピアノという楽器にだけ私の魂の秘密を語りかけることができる」',
    contemporaries: ['リスト', 'シューマン', 'メンデルスゾーン', 'ベルリオーズ'],
    cities: [
      {
        cityName: 'Warsaw',
        cityNameJa: 'ワルシャワ',
        country: 'ポーランド',
        coordinates: [21.0122, 52.2297],
        startYear: 1810,
        endYear: 1830,
        role: '青年期のピアニスト・作曲家',
        notableEvent: 'ピアノ協奏曲第1番・第2番の作曲と祖国への訣別'
      },
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1831,
        endYear: 1849,
        role: '貴族サロンの寵児・作曲家',
        notableEvent: 'ノクターン群、バラード4曲、前奏曲集、スケルツォの完成'
      }
    ],
    milestones: [
    {
        "year": 1830,
        "event": "ワルシャワ蜂起直前、祖国ポーランドを永遠に離れる"
    },
    {
        "year": 1831,
        "event": "パリに到着、サロンの貴公子として名声"
    },
    {
        "year": 1838,
        "event": "ジョルジュ・サンドとマヨルカ島へ滞在、前奏曲集"
    },
    {
        "year": 1842,
        "event": "英雄ポロネーズ（作品53）完成"
    }
],
    works: [
      {
        id: 'mendelssohn',
        title: '夜想曲（ノクターン）変ホ長調 作品9の2',
        originalTitle: 'Nocturne in E-flat major, Op. 9, No. 2',
        year: 1832,
        genre: 'Piano',
        genreJa: 'ピアノ独奏',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: 'ショパンの代名詞ともいえる夢見るような美しいカンタービレの旋律と、装飾音のきらめきが心を溶かす名曲。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 68,
          notes: [
            { note: 'Bb4', duration: 1.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'Eb4', duration: 0.5 },
            { note: 'Bb4', duration: 2 },
            { note: 'C5', duration: 0.5 },
            { note: 'D5', duration: 0.5 },
            { note: 'Eb5', duration: 1.5 },
            { note: 'D5', duration: 0.5 },
            { note: 'C5', duration: 1 }
          ]
        }
      },
      {
        id: 'chopin-fantaisie',
        title: '幻想即興曲 嬰ハ短調 作品66',
        originalTitle: 'Fantaisie-Impromptu in C-sharp minor, Op. 66',
        year: 1834,
        genre: 'Piano',
        genreJa: 'ピアノ独奏',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: '右手の16分音符と左手の3連符（4対3のポリリズム）が織りなす疾風怒濤のパッセージと、中間部の甘美な愛の旋律。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 132,
          notes: [
            { note: 'G#4', duration: 0.25 },
            { note: 'A4', duration: 0.25 },
            { note: 'B4', duration: 0.25 },
            { note: 'C#5', duration: 0.25 },
            { note: 'D#5', duration: 0.25 },
            { note: 'E5', duration: 0.25 },
            { note: 'F#5', duration: 0.25 },
            { note: 'G#5', duration: 0.5 },
            { note: 'C#5', duration: 0.5 },
            { note: 'B4', duration: 0.5 },
            { note: 'A4', duration: 0.5 }
          ]
        }
      }
    ]
  },
  {
    id: 'mendelssohn',
    name: 'フェリックス・メンデルスゾーン',
    originalName: 'Felix Mendelssohn Bartholdy',
    shortName: 'メンデルスゾーン',
    birthYear: 1809,
    deathYear: 1847,
    era: 'romantic',
    country: 'ドイツ',
    nationalityJa: 'ドイツ',
    flag: '🇩🇪',
    portraitUrl: '/portraits/mendelssohn.jpg',
    biography: 'ハンブルクの名門銀行家・哲学者一族に生まれた早熟の天才。モーツァルトに匹敵する神童として17歳で『夏の夜の夢』序曲を作曲。20歳の時に忘却されていたJ.S.バッハの『マタイ受難曲』を100年ぶりに復活蘇演し歴史的バッハ復興の契機を作った。ライプツィヒ・ゲヴァントハウス管弦楽団の楽長やドイツ初の音楽院創設など、音楽文化の指導者としても不朽の功績を残した。',
    musicalStyle: '古典的均衡とロマン的幻想性の見事な調和、軽やかで妖精的な管弦楽書法、明澄な旋律美。',
    keyFeatures: ['バッハ『マタイ受難曲』歴史的復活上演', 'ヴァイオリン協奏曲 ホ短調の革新（第1楽章から独奏突入）', '劇音楽『夏の夜の夢』'],
    historicalQuote: '「言葉はあまりに曖昧だが、音楽はあまりにも確かな意味を持っている」',
    contemporaries: ['シューマン', 'ショパン', 'リスト'],
    cities: [
      {
        cityName: 'Hamburg',
        cityNameJa: 'ハンブルク',
        country: 'ドイツ',
        coordinates: [9.9937, 53.5511],
        startYear: 1809,
        endYear: 1811,
        role: '生誕地',
        notableEvent: '名門一族のもとに誕生'
      },
      {
        cityName: 'Leipzig',
        cityNameJa: 'ライプツィヒ',
        country: 'ドイツ',
        coordinates: [12.3731, 51.3397],
        startYear: 1835,
        endYear: 1847,
        role: 'ゲヴァントハウス管弦楽団楽長・音楽院院長',
        notableEvent: 'ヴァイオリン協奏曲ホ短調、交響曲第3番『スコットランド』の完成'
      }
    ],
    milestones: [
    {
        "year": 1826,
        "event": "17歳で劇音楽『夏の夜の夢』序曲を作曲"
    },
    {
        "year": 1829,
        "event": "バッハの『マタイ受難曲』を100年ぶりに歴史的蘇演"
    },
    {
        "year": 1835,
        "event": "ライプツィヒ・ゲヴァントハウス管弦楽団常任指揮者"
    },
    {
        "year": 1844,
        "event": "ヴァイオリン協奏曲ホ短調完成"
    }
],
    works: [
      {
        id: 'schumann',
        title: '劇音楽『夏の夜の夢』より「結婚行進曲」',
        originalTitle: 'Ein Sommernachtstraum: Hochzeitsmarsch, Op. 61-9',
        year: 1842,
        genre: 'Chamber',
        genreJa: '劇音楽・管弦楽',
        city: 'Leipzig',
        cityCoordinates: [12.3731, 51.3397],
        description: '世界中の婚礼で鳴り響く、ファンファーレに続く華やかで喜びに満ちた栄光のマーチ。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 108,
          notes: [
            { note: 'C4', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'F4', duration: 2 },
            { note: 'A4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'C5', duration: 3 }
          ]
        }
      }
    ]
  },
  {
    id: 'schumann',
    name: 'ロベルト・シューマン',
    originalName: 'Robert Schumann',
    shortName: 'シューマン',
    birthYear: 1810,
    deathYear: 1856,
    era: 'romantic',
    country: 'ドイツ',
    nationalityJa: 'ドイツ',
    flag: '🇩🇪',
    portraitUrl: '/portraits/schumann.jpg',
    biography: 'ツヴィッカウに生まれたロマン主義の闘士。『新音楽時報』を創刊しフロレスタン（情熱）とエウゼビウス（瞑想）という架空の分身を用いて進歩的音楽を擁護。ピアニストを目指すも指を痛め作曲に専念。恩師ヴィークの猛反対を乗り越えて名ピアニストのクララと結婚し、幸福のなかで「歌の年」と呼ばれる歌曲の傑作群を生み出した。晩年は精神を病み悲劇的な最期を遂げた。',
    musicalStyle: '文学的幻想と音楽の融合、ポリリズムや変則的シンコペーション、内省的告白と燃え上がる情熱の同居。',
    keyFeatures: ['『新音楽時報』による音楽評論活動とブラームスの発掘', 'ピアノ連作小品集（『子供の情景』『謝肉祭』）', 'クララとの愛の結晶としての歌曲集'],
    historicalQuote: '「人の心に光を投げかけること、これこそが芸術家の使命である」',
    contemporaries: ['クララ・シューマン', 'ブラームス', 'ショパン', 'メンデルスゾーン'],
    cities: [
      {
        cityName: 'Leipzig',
        cityNameJa: 'ライプツィヒ',
        country: 'ドイツ',
        coordinates: [12.3731, 51.3397],
        startYear: 1828,
        endYear: 1844,
        role: '評論家・作曲家',
        notableEvent: '『子供の情景』『詩人の恋』、クララとの結婚'
      }
    ],
    milestones: [
    {
        "year": 1834,
        "event": "進歩的音楽誌『新音楽時報』を創刊"
    },
    {
        "year": 1838,
        "event": "ピアノ曲集『子供の情景』（トロイメライ）完成"
    },
    {
        "year": 1840,
        "event": "猛反対を乗り越えクララと結婚、「歌の年」"
    },
    {
        "year": 1853,
        "event": "若きブラームスを見出し「新しい道」で激賞"
    }
],
    works: [
      {
        id: 'liszt',
        title: '『子供の情景』より「トロイメライ（夢）」',
        originalTitle: 'Kinderszenen: Träumerei, Op. 15, No. 7',
        year: 1838,
        genre: 'Piano',
        genreJa: 'ピアノ独奏',
        city: 'Leipzig',
        cityCoordinates: [12.3731, 51.3397],
        description: '子どもの無心な夢想と大人の懐旧が溶け合う、天へとふんわり舞い上がるような優しい名旋律。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 56,
          notes: [
            { note: 'C4', duration: 1 },
            { note: 'F4', duration: 1.5 },
            { note: 'E4', duration: 0.5 },
            { note: 'F4', duration: 0.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'G4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'C5', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'liszt',
    name: 'フランツ・リスト',
    originalName: 'Franz Liszt',
    shortName: 'リスト',
    birthYear: 1811,
    deathYear: 1886,
    era: 'romantic',
    country: 'ハンガリー',
    nationalityJa: 'ハンガリー',
    flag: '🇭🇺',
    portraitUrl: '/portraits/liszt.jpg',
    biography: 'ライディングに生まれた「ピアノの魔術師」。欧州全土を熱狂の渦（リストマニア）に巻き込んだ超絶技巧ピアニスト。ピアノ独奏会（リサイタル）の形式を創始した。ヴァイオリニスト・パガニーニの超絶技巧に衝撃を受けピアノの表現限界を革新。後にヴァイマール宮廷楽長として「交響詩」を創始し、ワーグナーらの新ドイツ楽派を強力に支援した。晩年は僧籍に入った。',
    musicalStyle: '管弦楽を模倣するピアノの超絶技巧、示導動機の変容技法、単一楽章の「交響詩」の創始、晩年の無調を予見する前衛的実験。',
    keyFeatures: ['ピアノ・リサイタルという演奏形態の創出', '「交響詩」ジャンルの開拓', '未来の無調を予告した大胆な半音階和声'],
    historicalQuote: '「私のピアノは、船乗りにとっての船であり、アラブ人にとっての馬である」',
    contemporaries: ['ショパン', 'ワーグナー', 'ベルリオーズ'],
    cities: [
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1823,
        endYear: 1847,
        role: 'ヴィルトゥオーソ・ピアニスト',
        notableEvent: 'パガニーニ大練習曲、『超絶技巧練習曲』の作曲と欧州ツアー'
      },
      {
        cityName: 'Weimar',
        cityNameJa: 'ヴァイマール',
        country: 'ドイツ',
        coordinates: [11.3287, 50.9787],
        startYear: 1848,
        endYear: 1861,
        role: '宮廷楽長・指揮者',
        notableEvent: '『前奏曲』など12曲の交響詩、ロ短調ピアノソナタの完成'
      },
      {
        cityName: 'Budapest',
        cityNameJa: 'ブダペスト',
        country: 'ハンガリー',
        coordinates: [19.0402, 47.4979],
        startYear: 1875,
        endYear: 1886,
        role: '王立音楽院初代院長',
        notableEvent: 'ハンガリー狂詩曲群の発表と祖国の音楽教育への貢献'
      }
    ],
    milestones: [
    {
        "year": 1832,
        "event": "パガニーニの超絶技巧に衝撃を受け、ピアノの限界に挑む"
    },
    {
        "year": 1839,
        "event": "史上初のピアノ「リサイタル（独奏会）」を創始"
    },
    {
        "year": 1848,
        "event": "ヴァイマール宮廷楽長に就任、「交響詩」を創始"
    },
    {
        "year": 1850,
        "event": "『愛の夢 第3番』発表"
    }
],
    works: [
      {
        id: 'verdi',
        title: '愛の夢 第3番 変イ長調',
        originalTitle: 'Liebesträume Nr. 3, S. 541/3 (O lieb, so lang du lieben kannst)',
        year: 1850,
        genre: 'Piano',
        genreJa: 'ピアノ独奏',
        city: 'Weimar',
        cityCoordinates: [11.3287, 50.9787],
        description: '詩人フライリヒラートの愛の詩に基づく、ロマン派ピアノ音楽の中で最も甘美で情熱的な夜想曲。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 64,
          notes: [
            { note: 'Ab4', duration: 1 },
            { note: 'C5', duration: 1 },
            { note: 'Eb5', duration: 1 },
            { note: 'G5', duration: 2 },
            { note: 'F5', duration: 1 },
            { note: 'Eb5', duration: 1 },
            { note: 'C5', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'verdi',
    name: 'ジュゼッペ・ヴェルディ',
    originalName: 'Giuseppe Fortunino Francesco Verdi',
    shortName: 'ヴェルディ',
    birthYear: 1813,
    deathYear: 1901,
    era: 'romantic',
    country: 'イタリア',
    nationalityJa: 'イタリア',
    flag: '🇮🇹',
    portraitUrl: '/portraits/verdi.jpg',
    biography: 'パルマ近郊のブッセートに生まれたイタリア・オペラの最高峰。『ナブッコ』の「行け、我が想いよ、黄金の翼に乗って」がイタリア統一運動（リソルジメント）の合言葉となり国民的英雄に。『リゴレット』『イル・トロヴァトーレ』『椿姫』の黄金3部作、晩年の『アイーダ』『オテロ』に至るまで、生々しい人間のドラマと圧倒的な歌唱美で世界の劇場を席巻した。',
    musicalStyle: '血の通った躍動するメロディ、強烈な劇的緊張感、人間の生々しい心理描写、イタリア的声楽美の究極。',
    keyFeatures: ['イタリア・オペラの頂点（リゴレット、椿姫、アイーダ）', 'リソルジメント（祖国統一運動）の象徴', '『レクイエム』における劇的宗教音楽'],
    historicalQuote: '「真実を模倣することは善いことだが、真実を創造することはさらに善い」',
    contemporaries: ['ワーグナー', 'プッチーニ', 'ロッシーニ'],
    cities: [
      {
        cityName: 'Milan',
        cityNameJa: 'ミラノ',
        country: 'イタリア',
        coordinates: [9.19, 45.4642],
        startYear: 1839,
        endYear: 1901,
        role: 'スカラ座の常連作曲家・国民的巨匠',
        notableEvent: '『ナブッコ』『オテロ』『ファルスタッフ』初演、音楽家のための憩いの家設立'
      }
    ],
    milestones: [
    {
        "year": 1842,
        "event": "歌劇『ナブッコ』初演、祖国統一運動の英雄に"
    },
    {
        "year": 1851,
        "event": "歌劇『リゴレット』初演"
    },
    {
        "year": 1853,
        "event": "歌劇『椿姫』初演（ヴェネツィア）"
    },
    {
        "year": 1871,
        "event": "カイロ歌劇場開場記念『アイーダ』初演"
    }
],
    works: [
      {
        id: 'wagner',
        title: '歌劇『椿姫』より「乾杯の歌（乾杯！）」',
        originalTitle: 'La traviata: Libiamo ne\' lieti calici (Brindisi)',
        year: 1853,
        genre: 'Opera',
        genreJa: 'オペラ',
        city: 'Venice',
        cityCoordinates: [12.3155, 45.4408],
        description: '華やかな夜会で歌われる、グラスを掲げて今この瞬間の歓楽と愛を謳歌する屈指のオペラ・アリア。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 128,
          notes: [
            { note: 'G4', duration: 1 },
            { note: 'C5', duration: 1.5 },
            { note: 'B4', duration: 0.5 },
            { note: 'C5', duration: 1 },
            { note: 'D5', duration: 1.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'B4', duration: 1 },
            { note: 'A4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'wagner',
    name: 'リヒャルト・ワーグナー',
    originalName: 'Wilhelm Richard Wagner',
    shortName: 'ワーグナー',
    birthYear: 1813,
    deathYear: 1883,
    era: 'romantic',
    country: 'ドイツ',
    nationalityJa: 'ドイツ',
    flag: '🇩🇪',
    portraitUrl: '/portraits/wagner.jpg',
    biography: 'ライプツィヒに生まれた西洋音楽史最大の革命児の一人。詩・劇・音楽・舞台美術を一体化させた「総合芸術（楽劇）」を提唱。バイエルン王ルートヴィヒ2世の庇護を得てバイロイトに専用の祝祭劇場を建設。『ニーベルングの指環』4部作や『トリスタンとイゾルデ』『パルジファル』を上演した。伝統的調性を極限まで解体した「トリスタン和音」は現代音楽の扉を開いた。',
    musicalStyle: '無限旋律、ライトモティーフ（示導動機）の網の目、官能的な半音階和声の拡張、金管楽器を増強した巨大管弦楽法。',
    keyFeatures: ['「総合芸術（総合芸術作品）」理念と楽劇の創始', '調性崩壊への端緒となった『トリスタン和音』', 'バイロイト祝祭劇場の建設'],
    historicalQuote: '「音楽とは女性である。受胎するためには詩人という男性を必要とする」',
    contemporaries: ['リスト', 'ブラームス', 'ブルックナー'],
    cities: [
      {
        cityName: 'Bayreuth',
        cityNameJa: 'バイロイト',
        country: 'ドイツ',
        coordinates: [11.5786, 49.9456],
        startYear: 1872,
        endYear: 1883,
        role: 'バイロイト祝祭劇場主宰',
        notableEvent: '『ニーベルングの指環』全曲初演、楽劇『パルジファル』初演'
      }
    ],
    milestones: [
    {
        "year": 1849,
        "event": "ドレスデン五月蜂起に参加、スイスへ亡命"
    },
    {
        "year": 1859,
        "event": "楽劇『トリスタンとイゾルデ』完成、調性の解体"
    },
    {
        "year": 1876,
        "event": "バイロイト祝祭劇場開場、『指環』4部作全曲初演"
    }
],
    works: [
      {
        id: 'brahms',
        title: '楽劇『ヴァルキューレ』より「ワルキューレの騎行」',
        originalTitle: 'Die Walküre: Ritt der Walküren',
        year: 1870,
        genre: 'Opera',
        genreJa: '楽劇・管弦楽',
        city: 'Bayreuth',
        cityCoordinates: [11.5786, 49.9456],
        description: '天空を馬で駆け巡る戦乙女たちの咆哮を描いた、金管楽器の勇壮な付点リズムが炸裂する圧巻の音楽。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 120,
          notes: [
            { note: 'B3', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'B4', duration: 1.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'B4', duration: 1.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'B4', duration: 1 },
            { note: 'F#4', duration: 1 }
          ]
        }
      }
    ]
  },

  // --- LATE ROMANTIC & NATIONALISM ---
  {
    id: 'brahms',
    name: 'ヨハネス・ブラームス',
    originalName: 'Johannes Brahms',
    shortName: 'ブラームス',
    birthYear: 1833,
    deathYear: 1897,
    era: 'late-romantic',
    country: 'ドイツ / オーストリア',
    nationalityJa: 'ドイツ / オーストリア',
    flag: '🇩🇪',
    portraitUrl: '/portraits/brahms.jpg',
    biography: 'ハンブルクの貧民街に生まれ、バーのピアノ弾きとして育った「古典派の継承者」。シューマンに激賞され楽壇に登場。ベートーヴェンの偉大すぎる影に怯えながら20年以上の歳月をかけて『交響曲第1番』（ベートーヴェンの第10交響曲と称される）を完成。標題音楽全盛の時代にあって、絶対音楽の厳格な対位法と構築美を守り抜き、4曲の不滅の交響曲や協奏曲を遺した。',
    musicalStyle: '厳格なソナタ形式と対位法、渋く燻し銀のオーケストレーション、変形リズム（ヘミオラ）、内なるロマンの炎。',
    keyFeatures: ['バッハ・ベートーヴェンに連なる「3大B」の系譜', '絶対音楽の理念の死守', '哀愁漂う『ハンガリー舞曲集』'],
    historicalQuote: '「巨人が背後を行進してくる足音を聞きながら交響曲を書くことがどれほど過酷か、君には分かるまい」',
    contemporaries: ['ワーグナー', 'ブルックナー', 'ドヴォルザーク', 'チャイコフスキー'],
    cities: [
      {
        cityName: 'Hamburg',
        cityNameJa: 'ハンブルク',
        country: 'ドイツ',
        coordinates: [9.9937, 53.5511],
        startYear: 1833,
        endYear: 1862,
        role: '青年期のピアニスト・合唱指揮者',
        notableEvent: 'ピアノ協奏曲第1番、初期セレナードの作曲'
      },
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1862,
        endYear: 1897,
        role: 'ウィーン楽友協会指揮者・大家',
        notableEvent: '4曲の交響曲、ヴァイオリン協奏曲、クラリネット五重奏曲の完成'
      }
    ],
    milestones: [
    {
        "year": 1853,
        "event": "シューマン夫妻と出会い「未来の巨匠」と絶賛される"
    },
    {
        "year": 1868,
        "event": "『ドイツ・レクイエム』初演、世界的評価を確立"
    },
    {
        "year": 1876,
        "event": "21年かけた『交響曲第1番』完成（第10交響曲）"
    }
],
    works: [
      {
        id: 'tchaikovsky',
        title: 'ハンガリー舞曲 第5番 嬰ヘ短調',
        originalTitle: 'Ungarische Tänze Nr. 5 in fis-Moll',
        year: 1869,
        genre: 'Chamber',
        genreJa: '管弦楽・舞曲',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: 'ロマ音楽のチャールダーシュのリズムに基づく、急激なテンポの緩急変化と哀愁と情熱が爆発する世界的人気曲。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 124,
          notes: [
            { note: 'F#4', duration: 0.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'Bb4', duration: 0.5 },
            { note: 'D5', duration: 1 },
            { note: 'C5', duration: 0.5 },
            { note: 'Bb4', duration: 0.5 },
            { note: 'A4', duration: 2 },
            { note: 'Bb4', duration: 0.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'Bb4', duration: 0.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'G4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'tchaikovsky',
    name: 'ピョートル・イリイチ・チャイコフスキー',
    originalName: 'Pyotr Ilyich Tchaikovsky',
    shortName: 'チャイコフスキー',
    birthYear: 1840,
    deathYear: 1893,
    era: 'late-romantic',
    country: 'ロシア',
    nationalityJa: 'ロシア',
    flag: '🇷🇺',
    portraitUrl: '/portraits/tchaikovsky.jpg',
    biography: 'ウラル地方のヴォトキンスクに生まれ、法務省官吏からサンクトペテルブルク音楽院で学んだロシア音楽の巨匠。西欧的な洗練された作曲技法とスラヴ民族の哀愁に満ちたメロディを融合。『白鳥の湖』『眠れる森の美女』『くるみ割り人形』の3大バレエ音楽、ピアノ協奏曲第1番、そして劇的悲愴感あふれる後期交響曲（第4・5・6番『悲愴』）で世界を魅了した。',
    musicalStyle: '哀切きわまりない旋律美、色彩感あふれる華麗な管弦楽法、躍動的な舞踏リズム、感情の激情的な高揚。',
    keyFeatures: ['クラシック・バレエ音楽を芸術の頂点へと革新', 'ロシア的哀愁と西欧ロマン派形式の完全融合', '交響曲第6番『悲愴』の死と生のドラマ'],
    historicalQuote: '「私は真に心からの必要性に迫られて書いている。胸からほとばしるものを注ぎ込んでいるのだ」',
    contemporaries: ['ロシア5人組', 'ブラームス', 'ドヴォルザーク', 'グリーグ'],
    cities: [
      {
        cityName: 'St. Petersburg',
        cityNameJa: 'サンクトペテルブルク',
        country: 'ロシア',
        coordinates: [30.3351, 59.9343],
        startYear: 1862,
        endYear: 1893,
        role: '音楽院学生・客演指揮者',
        notableEvent: '交響曲第6番『悲愴』初演と急死'
      },
      {
        cityName: 'Moscow',
        cityNameJa: 'モスクワ',
        country: 'ロシア',
        coordinates: [37.6173, 55.7558],
        startYear: 1866,
        endYear: 1877,
        role: 'モスクワ音楽院教授',
        notableEvent: 'バレエ『白鳥の湖』、ピアノ協奏曲第1番の作曲'
      }
    ],
    milestones: [
    {
        "year": 1875,
        "event": "ピアノ協奏曲第1番 ボストン初演で世界的熱狂"
    },
    {
        "year": 1877,
        "event": "バレエ『白鳥の湖』モスクワ・ボリショイ初演"
    },
    {
        "year": 1892,
        "event": "バレエ『くるみ割り人形』サンクトペテルブルク初演"
    },
    {
        "year": 1893,
        "event": "交響曲第6番『悲愴』初演から9日後に急逝"
    }
],
    works: [
      {
        id: 'dvorak',
        title: 'バレエ『白鳥の湖』より「情景」',
        originalTitle: 'Swan Lake: Scène (Moderato), Op. 20',
        year: 1876,
        genre: 'Chamber',
        genreJa: 'バレエ音楽・管弦楽',
        city: 'Moscow',
        cityCoordinates: [37.6173, 55.7558],
        description: 'オーボエが静かに奏でる哀愁の主題から始まり、ハープのアルペジオと弦楽器の激情へと展開するバレエ音楽の至宝。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 78,
          notes: [
            { note: 'B4', duration: 1.5 },
            { note: 'E5', duration: 1.5 },
            { note: 'G5', duration: 1 },
            { note: 'F#5', duration: 0.5 },
            { note: 'E5', duration: 0.5 },
            { note: 'D#5', duration: 0.5 },
            { note: 'E5', duration: 2.5 }
          ]
        }
      },
      {
        id: 'tchaikovsky-sugarplum',
        title: 'バレエ『くるみ割り人形』より「金平糖の精の踊り」',
        originalTitle: 'The Nutcracker: Dance of the Sugar Plum Fairy, Op. 71a',
        year: 1892,
        genre: 'Chamber',
        genreJa: 'バレエ音楽・管弦楽',
        city: 'St. Petersburg',
        cityCoordinates: [30.3351, 59.9343],
        description: '当時発明されたばかりのチェレスタを初めて大々的にフィーチャーした、クリスタルのような煌めきと神秘のダンス。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 100,
          notes: [
            { note: 'E5', duration: 0.5 },
            { note: 'D5', duration: 0.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'B4', duration: 0.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'F#4', duration: 0.5 },
            { note: 'E4', duration: 1.5 }
          ]
        }
      }
    ]
  },
  {
    id: 'dvorak',
    name: 'アントニン・ドヴォルザーク',
    originalName: 'Antonín Leopold Dvořák',
    shortName: 'ドヴォルザーク',
    birthYear: 1841,
    deathYear: 1904,
    era: 'late-romantic',
    country: 'チェコ',
    nationalityJa: 'チェコ',
    flag: '🇨🇿',
    portraitUrl: '/portraits/dvorak.jpg',
    biography: 'モルダウ河畔の肉屋の長男として生まれ、ブラームスに才能を見出されて世界的大作曲家へと飛翔したボヘミアの星。『スラブ舞曲集』でヨーロッパを魅了。1892年にはニューヨークのナショナル音楽院院長として招聘され、ネイティブ・アメリカンや黒人霊歌の音楽性に深く感銘を受け、交響曲第9番『新世界より』や弦楽四重奏曲『アメリカ』を生み出した。',
    musicalStyle: 'ボヘミアの豊かな民俗舞踊リズム（フリアント、ドゥムカ）、素朴で温かい郷愁の歌、古典的構成力と色彩感。',
    keyFeatures: ['国民楽派の確立とスラブ民族精神の昇華', '交響曲第9番『新世界より』による新大陸と祖国の対話', 'チェロ協奏曲ロ短調（チェロ協奏曲の王）'],
    historicalQuote: '「私はボヘミアの素朴な音楽家にすぎない」',
    contemporaries: ['ブラームス', 'スメタナ', 'チャイコフスキー'],
    cities: [
      {
        cityName: 'Prague',
        cityNameJa: 'プラハ',
        country: 'チェコ',
        coordinates: [14.4378, 50.0755],
        startYear: 1857,
        endYear: 1904,
        role: 'プラハ音楽院教授・院長',
        notableEvent: '『スラヴ舞曲集』、歌劇『ルサルカ』の作曲'
      }
    ],
    milestones: [
    {
        "year": 1878,
        "event": "『スラヴ舞曲集』出版、ブラームスの推薦で世界へ"
    },
    {
        "year": 1892,
        "event": "ニューヨーク・ナショナル音楽院院長就任"
    },
    {
        "year": 1893,
        "event": "交響曲第9番『新世界より』カーネギーホール初演"
    }
],
    works: [
      {
        id: 'grieg',
        title: '交響曲第9番 ホ短調『新世界より』第2楽章 ラルゴ（家路）',
        originalTitle: 'Symphonie Nr. 9 e-Moll "Aus der Neuen Welt", Op. 95 (Largo)',
        year: 1893,
        genre: 'Symphony',
        genreJa: '交響曲',
        city: 'Prague',
        cityCoordinates: [14.4378, 50.0755],
        description: 'イングリッシュホルンが独奏する「遠き山に日は落ちて」として知られる、アメリカの夕暮れと遥かな祖国への望郷の祈り。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 52,
          notes: [
            { note: 'E4', duration: 1 },
            { note: 'G4', duration: 2 },
            { note: 'G4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'C4', duration: 1.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'E4', duration: 1 },
            { note: 'G4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'grieg',
    name: 'エドヴァルド・グリーグ',
    originalName: 'Edvard Hagerup Grieg',
    shortName: 'グリーグ',
    birthYear: 1843,
    deathYear: 1907,
    era: 'late-romantic',
    country: 'ノルウェー',
    nationalityJa: 'ノルウェー',
    flag: '🇳🇴',
    portraitUrl: '/portraits/grieg.jpg',
    biography: 'ベルゲンに生まれた「北欧のショパン」。ライプツィヒ音楽院で学んだ後、ノルウェーの民族音楽の純朴な生命力に目覚め、祖国の自然と民話を音楽に昇華。劇作家イプセンの依頼で書いた劇音楽『ペール・ギュント』やピアノ協奏曲イ短調で世界的名声を得た。トロルドハウゲンのフィヨルドを望む山荘で、自然と共に静かに暮らしながら珠玉の抒情小曲集を紡ぎ出した。',
    musicalStyle: 'ノルウェー民謡の旋法（ハルダンゲル・ヴァイオリンの響き）、清新で透明なハーモニー、フィヨルドの澄んだ大気。',
    keyFeatures: ['ノルウェー国民楽派の確立', 'ピアノ協奏曲イ短調の冒頭ティンパニロールと下降和音', '劇音楽『ペール・ギュント』（朝、アニトラの踊り）'],
    historicalQuote: '「私はモーツァルトやバッハのように教会や宮殿を建てようとは望まない。人々が心地よく過ごせる小さな住まいを建てたいのだ」',
    contemporaries: ['チャイコフスキー', 'ブラームス', 'シベリウス'],
    cities: [
      {
        cityName: 'Bergen',
        cityNameJa: 'ベルゲン',
        country: 'ノルウェー',
        coordinates: [5.3221, 60.3913],
        startYear: 1843,
        endYear: 1907,
        role: 'トロルドハウゲンの主',
        notableEvent: 'ピアノ協奏曲イ短調、『ペール・ギュント』組曲の完成'
      }
    ],
    milestones: [
    {
        "year": 1868,
        "event": "ピアノ協奏曲イ短調完成、リストに絶賛される"
    },
    {
        "year": 1875,
        "event": "イプセンの戯曲に基づく劇音楽『ペール・ギュント』完成"
    }
],
    works: [
      {
        id: 'mahler',
        title: '劇音楽『ペール・ギュント』より「朝の気分」',
        originalTitle: 'Peer Gynt Suite No. 1, Op. 46: Morning Mood',
        year: 1875,
        genre: 'Chamber',
        genreJa: '管弦楽組曲',
        city: 'Bergen',
        cityCoordinates: [5.3221, 60.3913],
        description: 'フルートとオーボエが光の差す夜明けを掛け合う、朝露に濡れた大自然の目覚めを描いた清らかな名旋律。',
        audioSnippet: {
          type: 'synth',
          instrument: 'flute',
          tempo: 84,
          notes: [
            { note: 'G4', duration: 1 },
            { note: 'E4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'C4', duration: 1 },
            { note: 'D4', duration: 0.5 },
            { note: 'E4', duration: 0.5 },
            { note: 'G4', duration: 1 },
            { note: 'E4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'C4', duration: 1 }
          ]
        }
      }
    ]
  },
  {
    id: 'mahler',
    name: 'グスタフ・マーラー',
    originalName: 'Gustav Mahler',
    shortName: 'マーラー',
    birthYear: 1860,
    deathYear: 1911,
    era: 'late-romantic',
    country: 'オーストリア',
    nationalityJa: 'オーストリア',
    flag: '🇦🇹',
    portraitUrl: '/portraits/mahler.jpg',
    biography: 'ボヘミア出身のユダヤ系作曲家・指揮者。ウィーン宮廷歌劇場総監督として妥協を許さぬ改革で黄金時代を築き、夏期休暇にアルプスの作曲小屋に籠もって全10曲の巨大な交響曲と『大地の歌』を作曲。「交響曲とは世界のようなものであり、すべてを包括しなければならない」と語り、民俗音楽、軍隊ラッパ、鳥の鳴き声から神の愛までを取り込んだ。',
    musicalStyle: '巨大編成オーケストラの極限的使用、アイロニーとパロディ、調性の解体寸前の緊張、死と復活の形而上学的探求。',
    keyFeatures: ['後期ロマン派交響曲の最高到達点と限界の突破', '歌曲と交響曲の融合（『少年の魔法の角笛』）', '20世紀新ウィーン楽派への決定的な架け橋'],
    historicalQuote: '「私の時代がいつかやって来る」',
    contemporaries: ['リヒャルト・シュトラウス', 'シベリウス', 'シェーンベルク'],
    cities: [
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1897,
        endYear: 1907,
        role: 'ウィーン宮廷歌劇場総監督',
        notableEvent: '交響曲第4番・第5番・第8番『千人の交響曲』の作曲'
      }
    ],
    milestones: [
    {
        "year": 1897,
        "event": "ウィーン宮廷歌劇場音楽総監督に就任、黄金時代"
    },
    {
        "year": 1902,
        "event": "交響曲第5番（アダージェット：妻アルマへの愛の手紙）"
    },
    {
        "year": 1908,
        "event": "交響曲『大地の歌』作曲"
    }
],
    works: [
      {
        id: 'sibelius',
        title: '交響曲第5番 嬰ハ短調より 第4楽章 アダージェット',
        originalTitle: 'Symphonie Nr. 5: IV. Adagietto (Sehr langsam)',
        year: 1902,
        genre: 'Symphony',
        genreJa: '交響曲',
        city: 'Vienna',
        cityCoordinates: [16.3738, 48.2082],
        description: 'ハープと弦楽器のみで奏でられる、妻アルマへの言葉なき愛の手紙。映画『ベニスに死す』でも使われた至高の官能と瞑想。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 46,
          notes: [
            { note: 'A3', duration: 1 },
            { note: 'C#4', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'A4', duration: 2 },
            { note: 'G#4', duration: 1 },
            { note: 'F#4', duration: 1.5 },
            { note: 'E4', duration: 0.5 },
            { note: 'F#4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'sibelius',
    name: 'ジャン・シベリウス',
    originalName: 'Jean Sibelius',
    shortName: 'シベリウス',
    birthYear: 1865,
    deathYear: 1957,
    era: 'late-romantic',
    country: 'フィンランド',
    nationalityJa: 'フィンランド',
    flag: '🇫🇮',
    portraitUrl: '/portraits/sibelius.jpg',
    biography: 'ハメーンリンナに生まれたフィンランドの国民的英雄。ロシア帝国の圧政下にあった祖国の独立の魂を鼓舞した交響詩『フィンランディア』で絶大な支持を得た。北欧の厳しい冬、針葉樹林と無数の湖を想起させる独自の研ぎ澄まされた音響空間を開拓。7曲の交響曲とヴァイオリン協奏曲ニ短調を遺し、後半生は愛機アイノラ荘で30年間にわたり沈黙を守った。',
    musicalStyle: '有機的動機労作（小さな種子が次第に大樹へと成長する形式）、北欧の冷涼で透徹したオーケストレーション、内省的静寂。',
    keyFeatures: ['交響詩『フィンランディア』による国家精神の鼓舞', 'ヴァイオリン協奏曲ニ短調の孤高の美', 'アイノラ荘における伝説の「30年の沈黙」'],
    historicalQuote: '「他の作曲家が様々な色彩のカクテルを混ぜ合わせるなら、私はただ純粋で澄んだ冷たい水を差し出す」',
    contemporaries: ['マーラー', 'ニールセン', 'ラフマニノフ'],
    cities: [
      {
        cityName: 'Helsinki',
        cityNameJa: 'ヘルシンキ',
        country: 'フィンランド',
        coordinates: [24.9384, 60.1699],
        startYear: 1885,
        endYear: 1957,
        role: '国家名誉年金受給者・国民的英雄',
        notableEvent: '『フィンランディア』、ヴァイオリン協奏曲ニ短調、交響曲全7曲の完成'
      }
    ],
    milestones: [
    {
        "year": 1899,
        "event": "愛国交響詩『フィンランディア』初演、祖国独立の魂"
    },
    {
        "year": 1904,
        "event": "ヴァイオリン協奏曲ニ短調完成、アイノラ荘へ移住"
    }
],
    works: [
      {
        id: 'rachmaninoff',
        title: '交響詩『フィンランディア』より讃歌',
        originalTitle: 'Finlandia, Op. 26: Finlandia Hymn',
        year: 1899,
        genre: 'Chamber',
        genreJa: '交響詩・管弦楽',
        city: 'Helsinki',
        cityCoordinates: [24.9384, 60.1699],
        description: 'ロシアの検閲を掻い潜りフィンランド人の魂を揺さぶった、第2の国歌として親しまれる気高い愛国讃歌。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 72,
          notes: [
            { note: 'F4', duration: 1.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'Ab4', duration: 1 },
            { note: 'Bb4', duration: 1 },
            { note: 'Ab4', duration: 1.5 },
            { note: 'G4', duration: 0.5 },
            { note: 'F4', duration: 2 },
            { note: 'Eb4', duration: 1 },
            { note: 'F4', duration: 1 },
            { note: 'G4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'rachmaninoff',
    name: 'セルゲイ・ラフマニノフ',
    originalName: 'Sergei Vasilievich Rachmaninoff',
    shortName: 'ラフマニノフ',
    birthYear: 1873,
    deathYear: 1943,
    era: 'late-romantic',
    country: 'ロシア / アメリカ',
    nationalityJa: 'ロシア / アメリカ',
    flag: '🇷🇺',
    portraitUrl: '/portraits/rachmaninoff.jpg',
    biography: 'ノヴゴロド近郊の貴族の家に生まれたロシア・ロマン派最後の巨星。巨大な手から繰り出される20世紀屈指のヴィルトゥオーソ・ピアニスト。交響曲第1番の酷評による重い鬱病を医師ダールの暗示療法で克服し、感謝を込めて捧げた『ピアノ協奏曲第2番』が歴史的大成功を収めた。ロシア革命により祖国を追われアメリカへ亡命。望郷の哀愁を胸に世界中で演奏活動を続けた。',
    musicalStyle: '深く沈み込むロシア正教の鐘の響き、果てしなく続く長大なカンタービレ旋律、圧倒的なピアノ超絶技巧。',
    keyFeatures: ['ピアノ協奏曲第2番・第3番によるピアノ芸術の金字塔', '鐘の音（ズヴォン）の音響模倣', '祖国喪失の深いノスタルジア'],
    historicalQuote: '「私はロシアの作曲家であり、私の祖国が私の気質と見解を決定づけた」',
    contemporaries: ['スクリャービン', 'プロコフィエフ', 'ストラヴィンスキー'],
    cities: [
      {
        cityName: 'Moscow',
        cityNameJa: 'モスクワ',
        country: 'ロシア',
        coordinates: [37.6173, 55.7558],
        startYear: 1885,
        endYear: 1917,
        role: 'ボリショイ劇場指揮者・ピアニスト',
        notableEvent: 'ピアノ協奏曲第2番、ピアノ協奏曲第3番、交響曲第2番の作曲'
      }
    ],
    milestones: [
    {
        "year": 1901,
        "event": "鬱病を克服し『ピアノ協奏曲第2番』完成・大成功"
    },
    {
        "year": 1917,
        "event": "ロシア革命により祖国を脱出、アメリカへ亡命"
    }
],
    works: [
      {
        id: 'debussy',
        title: 'ピアノ協奏曲第2番 ハ短調 第1楽章 主題',
        originalTitle: 'Piano Concerto No. 2 in C minor, Op. 18 (Moderato)',
        year: 1901,
        genre: 'Concerto',
        genreJa: 'ピアノ協奏曲',
        city: 'Moscow',
        cityCoordinates: [37.6173, 55.7558],
        description: '重苦しい鐘の音のようなピアノ独奏クレッシェンドから、ロシアの大地を渡る風のような哀切の第1主題が押し寄せる名曲。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 66,
          notes: [
            { note: 'C3', duration: 1 },
            { note: 'C4', duration: 1 },
            { note: 'Eb4', duration: 1 },
            { note: 'G4', duration: 1 },
            { note: 'C4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'Eb4', duration: 1.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'C4', duration: 1 }
          ]
        }
      }
    ]
  },

  // --- IMPRESSIONISM ---
  {
    id: 'debussy',
    name: 'クロード・ドビュッシー',
    originalName: 'Claude Achille Debussy',
    shortName: 'ドビュッシー',
    birthYear: 1862,
    deathYear: 1918,
    era: 'impressionism',
    country: 'フランス',
    nationalityJa: 'フランス',
    flag: '🇫🇷',
    portraitUrl: '/portraits/debussy.jpg',
    biography: 'パリ近郊に生まれた音楽の印象主義の創始者。パリ音楽院で学ぶも既存の和声法規則に反逆し「快楽こそが唯一の規則」と言い放つ。パリ万博で出会ったジャワのガムラン音楽や象徴派詩人マラルメの詩に霊感を受け、『牧神の午後への前奏曲』で西洋音楽の新たな世紀の幕を開いた。光と影、水面、風のそよぎを捉えたピアノ曲集や交響詩『海』を遺した。',
    musicalStyle: '全音音階と五音音階、機能和声から解放された平行和音、色彩感と陰影の移ろい、ペダルの残響を生かした音響彫刻。',
    keyFeatures: ['西洋音楽の機能和声の解体', '『牧神の午後への前奏曲』による現代音楽の夜明け', 'ピアノ曲『月の光』『海』'],
    historicalQuote: '「音楽は規則から生まれるのではない。音楽そのものが規則を創るのだ」',
    contemporaries: ['ラヴェル', 'サティ', 'マラルメ', 'モネ'],
    cities: [
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1862,
        endYear: 1918,
        role: '「音楽の自由人」',
        notableEvent: '『牧神の午後への前奏曲』、歌劇『ペレアスとメリザンド』、交響詩『海』の作曲'
      }
    ],
    milestones: [
    {
        "year": 1890,
        "event": "『ベルガマスク組曲』（「月の光」）作曲"
    },
    {
        "year": 1894,
        "event": "『牧神の午後への前奏曲』初演、近代音楽の夜明け"
    },
    {
        "year": 1905,
        "event": "交響詩『海』完成"
    }
],
    works: [
      {
        id: 'ravel',
        title: '『ベルガマスク組曲』より「月の光」',
        originalTitle: 'Suite bergamasque: Clair de lune',
        year: 1890,
        genre: 'Piano',
        genreJa: 'ピアノ独奏',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: 'ヴェルレーヌの詩に基づく、夜空に浮かぶ柔らかな月の光と冷たい夜風の微かな揺らめきを描いた印象主義の至宝。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 52,
          notes: [
            { note: 'F5', duration: 1.5 },
            { note: 'Eb5', duration: 0.5 },
            { note: 'Db5', duration: 1 },
            { note: 'C5', duration: 1 },
            { note: 'Bb4', duration: 1.5 },
            { note: 'Ab4', duration: 0.5 },
            { note: 'F4', duration: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'ravel',
    name: 'モーリス・ラヴェル',
    originalName: 'Maurice Ravel',
    shortName: 'ラヴェル',
    birthYear: 1875,
    deathYear: 1937,
    era: 'impressionism',
    country: 'フランス',
    nationalityJa: 'フランス',
    flag: '🇫🇷',
    portraitUrl: '/portraits/ravel.jpg',
    biography: 'バスク地方のシブールに生まれた「管弦楽の魔術師」「スイスの時計職人」。精緻を極めたスコアと完璧な形式感覚を持ち、ムソルグスキーの『展覧会の絵』を華麗なオーケストラ曲へと編曲したことでも有名。小太鼓のオスティナートの上にたった2つの旋律が巨大なクレッシェンドを築く『ボレロ』や、哀惜に満ちた『亡き王女のためのパヴァーヌ』で不滅の名声を誇る。',
    musicalStyle: '極微の細部まで磨き上げられた管弦楽法、スペイン・バスク趣味、精緻な古典的形式感覚、透明な哀感。',
    keyFeatures: ['『ボレロ』による単一クレッシェンドの実験', '『展覧会の絵』の歴史的管弦楽編曲', '『亡き王女のためのパヴァーヌ』の優美'],
    historicalQuote: '「私の音楽には秘密などない。ただ細心の配慮と入念な仕上げがあるだけだ」',
    contemporaries: ['ドビュッシー', 'ストラヴィンスキー', 'ファリャ'],
    cities: [
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1889,
        endYear: 1937,
        role: '作曲家・編曲家',
        notableEvent: '『亡き王女のためのパヴァーヌ』『ボレロ』『ダフニスとクロエ』の作曲'
      }
    ],
    milestones: [
    {
        "year": 1899,
        "event": "ピアノ曲『亡き王女のためのパヴァーヌ』作曲"
    },
    {
        "year": 1928,
        "event": "パリ・オペラ座で『ボレロ』初演、空前のセンセーション"
    }
],
    works: [
      {
        id: 'stravinsky',
        title: 'ボレロ',
        originalTitle: 'Boléro',
        year: 1928,
        genre: 'Chamber',
        genreJa: '管弦楽',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: '小太鼓が刻む一定のリズムに乗り、フルートから始まり全オーケストラが炸裂するまで一貫して高まり続ける奇跡の作品。',
        audioSnippet: {
          type: 'synth',
          instrument: 'flute',
          tempo: 72,
          notes: [
            { note: 'C4', duration: 1 },
            { note: 'B3', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'D4', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'B3', duration: 0.5 },
            { note: 'A3', duration: 0.5 },
            { note: 'C4', duration: 1 },
            { note: 'C4', duration: 0.5 },
            { note: 'A3', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'D4', duration: 0.5 }
          ]
        }
      },
      {
        id: 'ravel-pavane',
        title: '亡き王女のためのパヴァーヌ',
        originalTitle: 'Pavane pour une infante défunte',
        year: 1899,
        genre: 'Piano',
        genreJa: 'ピアノ / 管弦楽',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: 'スペイン宮廷でかつて王女が踊った古風な踊りを回想するかのような、懐かしく気品ある調べ。',
        audioSnippet: {
          type: 'synth',
          instrument: 'piano',
          tempo: 58,
          notes: [
            { note: 'G4', duration: 1 },
            { note: 'B4', duration: 1 },
            { note: 'D5', duration: 1.5 },
            { note: 'E5', duration: 0.5 },
            { note: 'D5', duration: 1 },
            { note: 'B4', duration: 2 }
          ]
        }
      }
    ]
  },

  // --- MODERN / 20TH CENTURY ---
  {
    id: 'stravinsky',
    name: 'イーゴリ・ストラヴィンスキー',
    originalName: 'Igor Fyodorovich Stravinsky',
    shortName: 'ストラヴィンスキー',
    birthYear: 1882,
    deathYear: 1971,
    era: 'modern',
    country: 'ロシア / フランス / アメリカ',
    nationalityJa: 'ロシア / フランス / アメリカ',
    flag: '🇷🇺',
    portraitUrl: '/portraits/stravinsky.jpg',
    biography: 'サンクトペテルブルク近郊に生まれ、リムスキー＝コルサコフに師事。ディアギレフ主宰のロシア・バレエ団（バレエ・リュス）のために書いた『火の鳥』『ペトルーシュカ』、そして1913年パリでの『春の祭典』初演で前代未聞の殴り合いの暴動を巻き起こし、20世紀音楽の最大の革命を成し遂げた。その後「新古典主義」や十二音技法へと変貌を遂げたカメレオンのような巨匠。',
    musicalStyle: '獰猛な変拍子とポリリズム、異質な和音の衝突（複調）、鋭利な打楽器性、新古典主義の脱主情的な乾いた美学。',
    keyFeatures: ['『春の祭典』によるリズム革命とパリの初演大暴動', 'バレエ・リュス黄金期の牽引', '新古典主義への転換と音楽の客観化'],
    historicalQuote: '「音楽はその本質において、感情であれ心理状態であれ、何も表現する能力を持たない」',
    contemporaries: ['ディアギレフ', 'ピカソ', 'ラヴェル', 'プロコフィエフ'],
    cities: [
      {
        cityName: 'St. Petersburg',
        cityNameJa: 'サンクトペテルブルク',
        country: 'ロシア',
        coordinates: [30.3351, 59.9343],
        startYear: 1882,
        endYear: 1910,
        role: '青年期の作曲家',
        notableEvent: 'バレエ『火の鳥』の作曲とパリへの進出'
      },
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1920,
        endYear: 1939,
        role: 'パリ楽壇のリーダー',
        notableEvent: '『春の祭典』スキャンダル、新古典主義の傑作群の発表'
      }
    ],
    milestones: [
    {
        "year": 1910,
        "event": "バレエ・リュス『火の鳥』パリ初演で一躍有名に"
    },
    {
        "year": 1913,
        "event": "『春の祭典』シャンゼリゼ劇場初演で歴史的殴り合い暴動"
    }
],
    works: [
      {
        id: 'stravinsky-firebird',
        title: 'バレエ『火の鳥』より「子守歌と終曲」',
        originalTitle: 'The Firebird: Berceuse and Finale',
        year: 1910,
        genre: 'Chamber',
        genreJa: 'バレエ音楽・管弦楽',
        city: 'St. Petersburg',
        cityCoordinates: [30.3351, 59.9343],
        description: 'ホルン独奏が厳かにロシア民謡の調べを奏で始め、金管の咆哮と鐘の響きとともに輝かしい大団円を迎える傑作。',
        audioSnippet: {
          type: 'synth',
          instrument: 'strings',
          tempo: 76,
          notes: [
            { note: 'B3', duration: 1 },
            { note: 'E4', duration: 1 },
            { note: 'F#4', duration: 1 },
            { note: 'G4', duration: 1.5 },
            { note: 'F#4', duration: 0.5 },
            { note: 'E4', duration: 1 },
            { note: 'D4', duration: 1 },
            { note: 'E4', duration: 2 }
          ]
        }
      }
    ]
  },

  // --- MEDIEVAL & RENAISSANCE ---
  {
    id: 'machaut',
    name: 'ギョーム・ド・マショー',
    originalName: 'Guillaume de Machaut',
    shortName: 'マショー',
    birthYear: 1300,
    deathYear: 1377,
    era: 'medieval',
    country: 'フランス',
    nationalityJa: 'フランス',
    flag: '🇫🇷',
    portraitUrl: '/portraits/machaut.jpg',
    portraitPainter: '14世紀アルス・ノーヴァ写本挿絵（ランス大聖堂）',
    portraitAttribution: 'パブリックドメイン',
    biography: '14世紀中世フランスを代表する詩人・作曲家。アルス・ノーヴァ（新芸術）運動の頂点に立ち、単一の作曲家によって通して作られた西洋音楽史上初の4声部ミサ曲『ノートルダム・ミサ曲』を遺した。',
    musicalStyle: '複雑で緻密なアイソリズム、洗練されたポリフォニー、宮廷愛の繊細な抒情。',
    keyFeatures: ['史上初の通体4声ミサ曲『ノートルダム・ミサ曲』', 'アルス・ノーヴァの記譜法革命', '詩歌と音楽の一体化'],
    historicalQuote: '「詩なき音楽は空虚であり、音楽なき詩は言葉に過ぎない」',
    contemporaries: ['フランチェスコ・ランディーニ', 'フィリップ・ド・ヴィトリ'],
    cities: [
      {
        cityName: 'Reims',
        cityNameJa: 'ランス',
        country: 'フランス',
        coordinates: [4.0317, 49.2583],
        startYear: 1330,
        endYear: 1377,
        role: 'ランスノートルダム大聖堂 聖歌隊長・カノニクス',
        notableEvent: '『ノートルダム・ミサ曲』の作曲と大聖堂初演'
      }
    ],
    milestones: [
      { year: 1323, event: 'ボヘミア王ヨハン・フォン・ルクセンブルクの宮廷秘書に就任' },
      { year: 1365, event: '名作『ノートルダム・ミサ曲』完成' }
    ],
    works: [
      {
        id: 'machaut-messe',
        title: '『ノートルダム・ミサ曲』よりキリエ',
        originalTitle: 'Messe de Nostre Dame: Kyrie',
        year: 1365,
        genre: 'Choral',
        genreJa: '合唱曲/ミサ曲',
        city: 'Reims',
        cityCoordinates: [4.0317, 49.2583],
        description: '4部合唱による中世ポリフォニーの最高金字塔。厳かかつ神聖な美しさを誇る。',
        audioSnippet: { type: 'synth', instrument: 'flute', tempo: 72, notes: [] }
      }
    ]
  },
  {
    id: 'josquin',
    name: 'ジョスカン・デ・プレ',
    originalName: 'Josquin des Prez',
    shortName: 'ジョスカン',
    birthYear: 1450,
    deathYear: 1521,
    era: 'renaissance',
    country: 'フランコ・フランドル',
    nationalityJa: 'フランドル',
    flag: '🇧🇪',
    portraitUrl: '/portraits/josquin.jpg',
    portraitPainter: '16世紀木版画（教皇庁礼拝堂所蔵）',
    portraitAttribution: 'パブリックドメイン',
    biography: 'ルネサンス音楽最大の巨匠。「音楽家の主（マスター）」と賞賛され、マルティン・ルターから「音を意のままに操る唯一の天才」と評された。通模倣様式を完成させ、声楽ポリフォニーに感情と歌詞の詩情を吹き込んだ。',
    musicalStyle: '厳密な模倣対位法、歌詞の意味を音に映す「言葉の絵画化」、天上の美しさを誇る声楽アンサンブル。',
    keyFeatures: ['通模倣ポリフォニー様式の完成', '感情豊かなモチーフの掛け合い', 'ミサ曲・モテットの最高峰'],
    historicalQuote: '「他の作曲家は音に支配されるが、ジョスカンだけが音を支配する」— マルティン・ルター',
    contemporaries: ['ハインリヒ・アイザック', 'ピエール・ド・ラ＝リュー'],
    cities: [
      {
        cityName: 'Rome',
        cityNameJa: 'ローマ',
        country: 'イタリア',
        coordinates: [12.4964, 41.9028],
        startYear: 1489,
        endYear: 1495,
        role: 'バチカン教皇庁礼拝堂聖歌隊員',
        notableEvent: '教皇礼拝堂のために数々のモテットを作曲'
      },
      {
        cityName: 'Tournai',
        cityNameJa: 'コンデ',
        country: 'フランコ・フランドル',
        coordinates: [3.3883, 50.6056],
        startYear: 1504,
        endYear: 1521,
        role: 'ノートルダム聖堂参事会長',
        notableEvent: '晩年の名作モテットの作曲'
      }
    ],
    milestones: [
      { year: 1489, event: 'バチカン教皇庁聖歌隊に就任' },
      { year: 1502, event: 'モテット『アヴェ・マリア』完成' }
    ],
    works: [
      {
        id: 'josquin-avemaria',
        title: 'モテット『アヴェ・マリア』',
        originalTitle: 'Ave Maria ... Virgo serena',
        year: 1502,
        genre: 'Choral',
        genreJa: '合唱曲/モテット',
        city: 'Rome',
        cityCoordinates: [12.4964, 41.9028],
        description: '4声の美しい模倣対位法が天上の調和を生み出すルネサンス聖楽の至宝。',
        audioSnippet: { type: 'synth', instrument: 'flute', tempo: 80, notes: [] }
      }
    ]
  },
  {
    id: 'monteverdi',
    name: 'クラウディオ・モンテヴェルディ',
    originalName: 'Claudio Monteverdi',
    shortName: 'モンテヴェルディ',
    birthYear: 1567,
    deathYear: 1643,
    era: 'baroque',
    country: 'イタリア',
    nationalityJa: 'イタリア',
    flag: '🇮🇹',
    portraitUrl: '/portraits/monteverdi.jpg',
    portraitPainter: 'ベルナルド・ストロッツィ画（1630年頃、ヴェネツィア）',
    portraitAttribution: 'パブリックドメイン',
    biography: 'ルネサンスからバロックへの架け橋を架けた「オペラの父」。『オルフェオ』をはじめ、近代的な劇音楽と和声の情感表現（第2実作）を生み出し、ヴェネツィア・サン・マルコ大聖堂楽長として西洋音楽史を新時代へ導いた。',
    musicalStyle: '感情（情念）を描く劇的な和声、モノディ様式、劇的なオペラアリア。',
    keyFeatures: ['近代オペラの確立『オルフェオ』', '「第2実作」による情感優先の和声技法', '聖マルコ大聖堂楽長'],
    historicalQuote: '「音楽の主たる目的は、聴く者の魂に情熱を呼び覚ますことである」',
    contemporaries: ['ジョヴァンニ・ガブリエリ', 'ハインリヒ・シュッツ'],
    cities: [
      {
        cityName: 'Venice',
        cityNameJa: 'ヴェネツィア',
        country: 'イタリア',
        coordinates: [12.3155, 45.4408],
        startYear: 1613,
        endYear: 1643,
        role: 'サン・マルコ大聖堂楽長',
        notableEvent: '『聖母マリアの夕べの祈り』『ポッペーアの戴冠』初演'
      }
    ],
    milestones: [
      { year: 1607, event: '歌劇『オルフェオ』初演' },
      { year: 1613, event: 'サン・マルコ大聖堂楽長に就任' }
    ],
    works: [
      {
        id: 'monteverdi-orfeo',
        title: '歌劇『オルフェオ』プロローグ',
        originalTitle: 'L’Orfeo: Toccata & Prologue',
        year: 1607,
        genre: 'Opera',
        genreJa: '歌劇',
        city: 'Venice',
        cityCoordinates: [12.3155, 45.4408],
        description: '音楽史上に輝く最古のオペラ傑作。ファンファーレと劇的な叙情詩。',
        audioSnippet: { type: 'synth', instrument: 'organ', tempo: 100, notes: [] }
      }
    ]
  },
  {
    id: 'takemitsu',
    name: '武満 徹',
    originalName: 'Toru Takemitsu',
    shortName: '武満徹',
    birthYear: 1930,
    deathYear: 1996,
    era: 'modern',
    country: '日本',
    nationalityJa: '日本',
    flag: '🇯🇵',
    portraitUrl: '/portraits/takemitsu.jpg',
    portraitPainter: '現代写真肖像',
    portraitAttribution: '著作権フリー肖像データ',
    biography: '戦後日本の現代音楽を世界の頂点へと導いた偉大な作曲家。独学で音楽を学び、ストラヴィンスキーから絶賛された『弦楽のためのレクイエム』や、琵琶・尺八と西洋オーケストラが融合する『ノヴェンバー・ステップス』で世界を感嘆させた。「音のタペストリー」と称される静寂と余白の美学で世界的評価を一身に集めた。',
    musicalStyle: '静寂と余白の美学、伝統邦楽器（琵琶・尺八）とオーケストラの奇跡的融合、タケミツ・トーン（神秘的かつ豊かな音彩）。',
    keyFeatures: ['『ノヴェンバー・ステップス』による東西音楽の融合', 'ストラヴィンスキー絶賛の『弦楽のためのレクイエム』', '「静寂」を音楽の一部とする日本的美学'],
    historicalQuote: '「音とは、静寂という大海原から救い上げられたひとしずくの水である」',
    contemporaries: ['ジョン・ケージ', 'オリヴィエ・メシアン', 'ジョン・ウィリアムズ'],
    cities: [
      {
        cityName: 'Tokyo',
        cityNameJa: '東京',
        country: '日本',
        coordinates: [38.5, 42.0],
        startYear: 1930,
        endYear: 1996,
        role: '現代音楽作曲家・実験工房',
        notableEvent: '『ノヴェンバー・ステップス』ニューヨーク・フィル初演世界的大成功'
      }
    ],
    milestones: [
      { year: 1957, event: '『弦楽のためのレクイエム』完成、ストラヴィンスキーが大絶賛' },
      { year: 1967, event: 'ニューヨーク・フィル125周年委嘱『ノヴェンバー・ステップス』世界初演' }
    ],
    works: [
      {
        id: 'takemitsu-november',
        title: '『ノヴェンバー・ステップス』',
        originalTitle: 'November Steps',
        year: 1967,
        genre: 'Concerto',
        genreJa: '邦楽・管弦楽曲',
        city: 'Tokyo',
        cityCoordinates: [38.5, 42.0],
        description: '琵琶・尺八の日本伝統楽器と西洋オーケストラが美しく交わる現代音楽至高の金字塔。',
        audioSnippet: { type: 'synth', instrument: 'flute', tempo: 60, notes: [] }
      },
      {
        id: 'takemitsu-requiem',
        title: '『弦楽のためのレクイエム』',
        originalTitle: 'Requiem for Strings',
        year: 1957,
        genre: 'Chamber',
        genreJa: '弦楽合奏曲',
        city: 'Tokyo',
        cityCoordinates: [38.5, 42.0],
        description: 'ストラヴィンスキーが「全曲に溢れる情熱に深く感動した」と激賞した不朽の名作。',
        audioSnippet: { type: 'synth', instrument: 'strings', tempo: 50, notes: [] }
      }
    ]
  },
  // --- ADDITIONAL MAJOR COMPOSERS ---
  {
    id: 'telemann',
    name: 'ゲオルク・フィリップ・テレマン',
    originalName: 'Georg Philipp Telemann',
    shortName: 'テレマン',
    birthYear: 1681,
    deathYear: 1767,
    era: 'baroque',
    country: 'ドイツ',
    nationalityJa: 'ドイツ',
    flag: '🇩🇪',
    portraitUrl: '/portraits/telemann.jpg',
    portraitPainter: 'ハンブルク市立古文書館所蔵の肖像銅版画',
    portraitAttribution: 'パブリックドメイン',
    biography: 'バロック盛期から前古典派にかけ、驚異的な多作家として欧州屈指の知名度を誇った巨匠。J.S.バッハの次男C.P.E.バッハの名付け親でもあり、ハンブルクの教会音楽監督として都市の音楽文化を牽引した。',
    musicalStyle: 'ドイツの対位法、フランスの優雅さ、イタリアの旋律美、ポーランドの民族リズムを見事に融合させた軽妙洒脱なギャラント様式。',
    keyFeatures: ['『食卓の音楽』による祝祭的管弦楽法', '多作と出版ビジネスの先駆者', 'ギャラント様式への橋渡し'],
    historicalQuote: '「音楽は万人の友でなければならない」',
    contemporaries: ['J.S.バッハ', 'ヘンデル', 'マッテゾン'],
    cities: [
      {
        cityName: 'Hamburg',
        cityNameJa: 'ハンブルク',
        country: 'ドイツ',
        coordinates: [9.9937, 53.5511],
        startYear: 1721,
        endYear: 1767,
        role: 'ハンブルク市音楽監督・カントル',
        notableEvent: '『食卓の音楽』出版と膨大な教会音楽の演奏'
      }
    ],
    milestones: [
      { year: 1721, event: 'ハンブルク市音楽総監督に就任' },
      { year: 1733, event: '傑作集『食卓の音楽 (Tafelmusik)』を刊行' },
      { year: 1737, event: 'パリに招かれ『パリ四重奏曲』が大絶賛を受ける' }
    ],
    works: [
      {
        id: 'telemann-tafelmusik',
        title: '『食卓の音楽 (Tafelmusik)』第1集 序曲と組曲',
        originalTitle: 'Musique de table, Première production',
        year: 1733,
        genre: 'Orchestral',
        genreJa: '室内・管弦楽曲集',
        city: 'Hamburg',
        cityCoordinates: [9.9937, 53.5511],
        description: '王侯貴族の宴を彩るためヨーロッパ全土の予約購読者を集めて出版された洗練の極致。',
        audioSnippet: { type: 'synth', instrument: 'strings', tempo: 80, notes: [] }
      },
      {
        id: 'telemann-viola-concerto',
        title: 'ヴィオラ協奏曲 ト長調 TWV 51:G9',
        originalTitle: 'Viola Concerto in G major',
        year: 1720,
        genre: 'Concerto',
        genreJa: '協奏曲',
        city: 'Frankfurt',
        cityCoordinates: [8.6821, 50.1109],
        description: '西洋音楽史上初のヴィオラのための独奏協奏曲として名高い端麗な傑作。',
        audioSnippet: { type: 'synth', instrument: 'strings', tempo: 92, notes: [] }
      }
    ]
  },
  {
    id: 'scarlatti',
    name: 'ドメニコ・スカルラッティ',
    originalName: 'Domenico Scarlatti',
    shortName: 'D.スカルラッティ',
    birthYear: 1685,
    deathYear: 1757,
    era: 'baroque',
    country: 'イタリア',
    nationalityJa: 'イタリア / スペイン',
    flag: '🇪🇸',
    portraitUrl: '/portraits/scarlatti.jpg',
    portraitPainter: 'ポルトガル・マドリード宮廷肖像画家による肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: 'J.S.バッハ、ヘンデルと同じ1685年に生まれたイタリアの天才鍵盤奏者。ポルトガルおよびスペイン王室のマリア・バルバラ王女のチェンバロ教師としてマドリードに定住し、555曲におよぶ革新的チェンバロ・ソナタを生み出した。',
    musicalStyle: '両手の激しい交差、同音連打、フラメンコやギターに影響された不協和音など、鍵盤楽器の技巧の限界を押し広げた輝かしい閃き。',
    keyFeatures: ['555曲の単一楽章チェンバロ・ソナタ群', 'スペイン民族音楽（フラメンコ）の導入', '両手交差や幅広い跳躍の技巧開発'],
    historicalQuote: '「音楽の規則を破ることで、より耳に心地よい響きを得られるならば、私は迷わずそれを破る」',
    contemporaries: ['J.S.バッハ', 'ヘンデル', 'ソレール'],
    cities: [
      {
        cityName: 'Madrid',
        cityNameJa: 'マドリード',
        country: 'スペイン',
        coordinates: [-3.7038, 40.4168],
        startYear: 1729,
        endYear: 1757,
        role: 'スペイン王室宮廷楽長・チェンバロ教師',
        notableEvent: 'マリア・バルバラ王妃のために500曲を超える奇跡のソナタ群を作曲'
      }
    ],
    milestones: [
      { year: 1709, event: 'ローマでヘンデルとオルガン・チェンバロ演奏で競い合い互角の腕前を披露' },
      { year: 1729, event: 'スペイン・マドリード宮廷に移住' },
      { year: 1738, event: '名作ソナタ集『練習曲集 (Essercizi)』をロンドンで出版' }
    ],
    works: [
      {
        id: 'scarlatti-k380',
        title: 'ソナタ ホ長調 K.380 (L.23)',
        originalTitle: 'Sonata in E major, K.380',
        year: 1740,
        genre: 'Keyboard',
        genreJa: 'チェンバロ・ピアノソナタ',
        city: 'Madrid',
        cityCoordinates: [-3.7038, 40.4168],
        description: '宮廷行進曲のトランペットやファンファーレを思わせる、スカルラッティ屈指の人気ソナタ。',
        audioSnippet: { type: 'synth', instrument: 'piano', tempo: 88, notes: [] }
      },
      {
        id: 'scarlatti-k141',
        title: 'ソナタ ニ短調 K.141 (トッカータ)',
        originalTitle: 'Sonata in D minor, K.141',
        year: 1749,
        genre: 'Keyboard',
        genreJa: '鍵盤ソナタ',
        city: 'Madrid',
        cityCoordinates: [-3.7038, 40.4168],
        description: 'マンドリンやフラメンコギターの超絶トレモロを再現した息をのむ急速同音連打の傑作。',
        audioSnippet: { type: 'synth', instrument: 'piano', tempo: 136, notes: [] }
      }
    ]
  },
  {
    id: 'rossini',
    name: 'ジョアキーノ・ロッシーニ',
    originalName: 'Gioachino Antonio Rossini',
    shortName: 'ロッシーニ',
    birthYear: 1792,
    deathYear: 1868,
    era: 'romantic',
    country: 'イタリア',
    nationalityJa: 'イタリア',
    flag: '🇮🇹',
    portraitUrl: '/portraits/rossini.jpg',
    portraitPainter: 'パリ市立カルナヴァレ博物館所蔵肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: '19世紀初頭のヨーロッパを「ロッシーニ旋風」で席巻したイタリア・オペラの最高峰。『セビリアの理髪師』『ウィリアム・テル』など39作の歌劇で巨万の富を築いた後、37歳で突如オペラ創作から引退し、美食家として悠々自適の後半生を送った。',
    musicalStyle: '「ロッシーニ・クレッシェンド」と呼ばれる爆発的な音圧上昇、快活で沸き立つリズム、ベルカント唱法の華麗なるアジリタ技巧。',
    keyFeatures: ['ロッシーニ・クレッシェンドの創始', 'オペラ・ブッファ（喜歌劇）の世界的頂点', 'ベルカント唱法を極限まで洗練'],
    historicalQuote: '「私は食欲があるときしか音楽を書かない。そして私の食欲はいつでも旺盛だ」',
    contemporaries: ['ベートーヴェン', 'シューベルト', 'ベッリーニ', 'ドニゼッティ'],
    cities: [
      {
        cityName: 'Rome',
        cityNameJa: 'ローマ',
        country: 'イタリア',
        coordinates: [12.4964, 41.9028],
        startYear: 1815,
        endYear: 1823,
        role: 'オペラ作曲家',
        notableEvent: 'アルジェンティーナ劇場で『セビリアの理髪師』初演'
      },
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1824,
        endYear: 1868,
        role: 'イタリア座総監督・美食家',
        notableEvent: '『ウィリアム・テル』発表後に引退、晩年サロンで『老年のいたずら』を作曲'
      }
    ],
    milestones: [
      { year: 1816, event: '歌劇『セビリアの理髪師』ローマ初演（わずか2週間で書き上げる）' },
      { year: 1829, event: '歌劇『ウィリアム・テル』パリ初演（オペラ筆折りの宣言）' },
      { year: 1863, event: '晩年の傑作『小荘厳ミサ曲』を完成' }
    ],
    works: [
      {
        id: 'rossini-barber',
        title: '歌劇『セビリアの理髪師』序曲',
        originalTitle: 'Il barbiere di Siviglia: Overture',
        year: 1816,
        genre: 'Opera',
        genreJa: '歌劇（オペラ・ブッファ）',
        city: 'Rome',
        cityCoordinates: [12.4964, 41.9028],
        description: '喜劇オペラの金字塔。弾けるような軽快さと爆発的なクレッシェンドが圧倒的。',
        audioSnippet: { type: 'synth', instrument: 'strings', tempo: 120, notes: [] }
      },
      {
        id: 'rossini-tell',
        title: '歌劇『ウィリアム・テル』序曲 (スイス軍の行進)',
        originalTitle: 'Guillaume Tell: Overture (March of the Swiss Soldiers)',
        year: 1829,
        genre: 'Opera',
        genreJa: '歌劇（グランド・オペラ）',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: 'ファンファーレから駆け抜けるギャロップで誰もが熱狂するクラシック史上屈指の有名曲。',
        audioSnippet: { type: 'synth', instrument: 'strings', tempo: 138, notes: [] }
      }
    ]
  },
  {
    id: 'berlioz',
    name: 'エクトール・ベルリオーズ',
    originalName: 'Hector Berlioz',
    shortName: 'ベルリオーズ',
    birthYear: 1803,
    deathYear: 1869,
    era: 'romantic',
    country: 'フランス',
    nationalityJa: 'フランス',
    flag: '🇫🇷',
    portraitUrl: '/portraits/berlioz.jpg',
    portraitPainter: 'ヴェルサイユ宮殿美術館所蔵肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: 'フランス・ロマン派最大の革新者であり近代管弦楽法の父。イギリス女優ハリエット・スミスソンへの狂おしい片想いから『幻想交響曲』を生み出し、従来の交響曲の概念を根底から覆した。『管弦楽法』の著書は今なおオーケストラ学習の必読書。',
    musicalStyle: '「固定楽想（イデー・フィクス）」を用いた劇的統一、巨大な管弦楽編成、新奇な楽器の積極的導入による色彩豊かな音響。',
    keyFeatures: ['『幻想交響曲』と固定楽想（イデー・フィクス）の確立', '標題交響曲の確立', '近代管弦楽法の体系化'],
    historicalQuote: '「時は大いなる教師だが、残念なことにすべての生徒を死に至らしめる」',
    contemporaries: ['ショパン', 'リスト', 'メンデルスゾーン', 'シューマン'],
    cities: [
      {
        cityName: 'Paris',
        cityNameJa: 'パリ',
        country: 'フランス',
        coordinates: [2.3522, 48.8566],
        startYear: 1821,
        endYear: 1869,
        role: 'パリ音楽院・音楽批評家',
        notableEvent: '『幻想交響曲』『レクイエム』の初演と劇音楽の革新'
      }
    ],
    milestones: [
      { year: 1830, event: 'ローマ賞受賞、および『幻想交響曲』パリ初演で衝撃を与える' },
      { year: 1844, event: '世界的名著『近代楽器法および管弦楽法』を出版' },
      { year: 1846, event: '劇的物語『ファウストの劫罰』初演' }
    ],
    works: [
      {
        id: 'berlioz-fantastique',
        title: '『幻想交響曲』作品14 第4楽章「断頭台への行進」',
        originalTitle: 'Symphonie fantastique, Op. 14: Marche au supplice',
        year: 1830,
        genre: 'Symphony',
        genreJa: '標題交響曲',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: '失恋の狂気からアヘンをあおり、自らの処刑場への行進を幻視するロマン派革命の記念碑。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 84, notes: [] }
      },
      {
        id: 'berlioz-damnation',
        title: '劇的物語『ファウストの劫罰』より「ラコッツィ行進曲」',
        originalTitle: 'La damnation de Faust: Marche hongroise',
        year: 1846,
        genre: 'Orchestral',
        genreJa: '劇的物語・管弦楽曲',
        city: 'Paris',
        cityCoordinates: [2.3522, 48.8566],
        description: 'ハンガリーの愛国行進曲を壮大な管弦楽法で編曲し大熱狂を巻き起こした名作。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 110, notes: [] }
      }
    ]
  },
  {
    id: 'puccini',
    name: 'ジャコモ・プッチーニ',
    originalName: 'Giacomo Puccini',
    shortName: 'プッチーニ',
    birthYear: 1858,
    deathYear: 1924,
    era: 'late-romantic',
    country: 'イタリア',
    nationalityJa: 'イタリア',
    flag: '🇮🇹',
    portraitUrl: '/portraits/puccini.jpg',
    portraitPainter: 'ミラノ・リコルディ音楽出版所蔵写真・肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: 'ヴェルディ亡き後のイタリア・オペラ界の頂点に君臨したヴェリズモ（現実主義）オペラの巨匠。『ラ・ボエーム』『トスカ』『蝶々夫人』『トゥーランドット』など、今なお世界の歌劇場で最も頻繁に上演される名旋律を生み出し続けた。',
    musicalStyle: '胸を締め付ける甘美で哀切な旋律美、異国情緒（オリエンタリズム）の導入、オーケストラと歌手が一体となった劇的カタルシス。',
    keyFeatures: ['世界最高のオペラ・ヒット作の数々', 'ヴェリズモ（現実主義）と繊細な心理描写', '東洋（日本・中国）の音階と美の統合'],
    historicalQuote: '「神が私に指を触れて言われた。『劇場のために作曲せよ、ただ劇場のためだけに』」',
    contemporaries: ['マーラー', 'ドビュッシー', 'リヒャルト・シュトラウス', 'マスカーニ'],
    cities: [
      {
        cityName: 'Milan',
        cityNameJa: 'ミラノ',
        country: 'イタリア',
        coordinates: [9.19, 45.4642],
        startYear: 1880,
        endYear: 1924,
        role: 'ミラノ音楽院・オペラ作曲家',
        notableEvent: 'スカラ座での初演と世界的オペラ興行の成功'
      }
    ],
    milestones: [
      { year: 1896, event: '歌劇『ラ・ボエーム』トリノ初演（トスカニーニ指揮）' },
      { year: 1900, event: '歌劇『トスカ』ローマ初演' },
      { year: 1904, event: '歌劇『蝶々夫人』スカラ座初演' },
      { year: 1924, event: '遺作『トゥーランドット』の作曲中にブリュッセルで没す' }
    ],
    works: [
      {
        id: 'puccini-turandot',
        title: '歌劇『トゥーランドット』より「誰も寝てはならぬ」',
        originalTitle: 'Turandot: Nessun dorma',
        year: 1924,
        genre: 'Opera',
        genreJa: '歌劇アリア',
        city: 'Milan',
        cityCoordinates: [9.19, 45.4642],
        description: 'カラフ王子が勝利を確信して歌い上げる、テノール・アリアの最高峰。',
        audioSnippet: { type: 'synth', instrument: 'vocal', tempo: 52, notes: [] }
      },
      {
        id: 'puccini-boheme',
        title: '歌劇『ラ・ボエーム』より「冷たき手を」',
        originalTitle: 'La bohème: Che gelida manina',
        year: 1896,
        genre: 'Opera',
        genreJa: '歌劇アリア',
        city: 'Turin',
        cityCoordinates: [7.6869, 45.0703],
        description: '極寒のパリ屋根裏部屋で詩人ロドルフォがお針子ミミに出会い愛を告げる永遠の旋律。',
        audioSnippet: { type: 'synth', instrument: 'vocal', tempo: 58, notes: [] }
      }
    ]
  },
  {
    id: 'palestrina',
    name: 'ジョヴァンニ・ピエルルイジ・ダ・パレストリーナ',
    originalName: 'Giovanni Pierluigi da Palestrina',
    shortName: 'パレストリーナ',
    birthYear: 1525,
    deathYear: 1594,
    era: 'renaissance',
    country: 'イタリア',
    nationalityJa: 'イタリア',
    flag: '🇮🇹',
    portraitUrl: '/portraits/palestrina.jpg',
    portraitPainter: 'システィーナ礼拝堂所蔵の肖像画',
    portraitAttribution: 'パブリックドメイン',
    biography: 'ルネサンス・ポリフォニー（多声音楽）の完成者。「カトリック教会音楽の父」と称され、トリエント公会議においてポリフォニー音楽の廃止論議が起こった際、『教皇マルチェルスのミサ曲』を披露して言葉の明瞭さと多声の美しさを両立させ、教会音楽を救ったという伝説で知られる。',
    musicalStyle: '不協和音の厳格な予備と解決、階段状の流麗な旋律線、神聖で澄み切った無伴奏合唱（ア・カペラ）の均衡美。',
    keyFeatures: ['パレストリーナ様式（対位法規範の確立）', '『教皇マルチェルスのミサ曲』', 'ア・カペラ宗教合唱の最高峰'],
    historicalQuote: '「神の栄光を称える声こそ、地上のすべての楽器に勝る」',
    contemporaries: ['ラッスス', 'ヴィクトリア', 'バード'],
    cities: [
      {
        cityName: 'Rome',
        cityNameJa: 'ローマ',
        country: 'イタリア',
        coordinates: [12.4964, 41.9028],
        startYear: 1551,
        endYear: 1594,
        role: 'ジュリア礼拝堂・システィーナ礼拝堂 楽長',
        notableEvent: '教皇庁のために100曲を超えるミサ曲とモテットを作曲'
      }
    ],
    milestones: [
      { year: 1551, event: 'サン・ピエトロ大聖堂ジュリア礼拝堂楽長に就任' },
      { year: 1567, event: '『教皇マルチェルスのミサ曲』出版' },
      { year: 1571, event: '終生ジュリア礼拝堂楽長としてローマ音楽界の頂点に立つ' }
    ],
    works: [
      {
        id: 'palestrina-marcelli',
        title: '『教皇マルチェルスのミサ曲』より キリエ (Kyrie)',
        originalTitle: 'Missa Papae Marcelli: Kyrie',
        year: 1562,
        genre: 'Choral',
        genreJa: 'ミサ曲（無伴奏声楽）',
        city: 'Rome',
        cityCoordinates: [12.4964, 41.9028],
        description: '神聖なる祈りと完璧な声の綾織りが天上の響きを紡ぎ出すルネサンス音楽の奇跡。',
        audioSnippet: { type: 'synth', instrument: 'choral', tempo: 60, notes: [] }
      },
      {
        id: 'palestrina-sicut-cervus',
        title: 'モテット『鹿が谷川の水を慕うように』',
        originalTitle: 'Sicut cervus',
        year: 1584,
        genre: 'Choral',
        genreJa: 'モテット',
        city: 'Rome',
        cityCoordinates: [12.4964, 41.9028],
        description: '詩編第42篇に基づく、澄明を極めた対位法が心洗われる名作モテット。',
        audioSnippet: { type: 'synth', instrument: 'choral', tempo: 56, notes: [] }
      }
    ]
  },
  {
    id: 'richard-strauss',
    name: 'リヒャルト・シュトラウス',
    originalName: 'Richard Strauss',
    shortName: 'R.シュトラウス',
    birthYear: 1864,
    deathYear: 1949,
    era: 'late-romantic',
    country: 'ドイツ',
    nationalityJa: 'ドイツ',
    flag: '🇩🇪',
    portraitUrl: '/portraits/richard-strauss.jpg',
    portraitPainter: 'ベルリン・バイエルン歌劇場所蔵肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: 'ドイツ後期ロマン派から20世紀音楽の巨匠。交響詩『ツァラトゥストラはかく語りき』『ドン・ファン』で前人未到のオーケストラ色彩美を極め、歌劇『サロメ』『ばらの騎士』で世界を熱狂させた。卓越した指揮者としても活躍。',
    musicalStyle: '巨大編成オーケストラの華麗極まる書法、痛烈な標題描写、爛熟した甘美なウィーン風ワルツと官能的ポリフォニー。',
    keyFeatures: ['交響詩（トーン・ポエム）の極致', '映画『2001年宇宙の旅』冒頭曲の原典', '歌劇『ばらの騎士』の甘美な郷愁'],
    historicalQuote: '「私はオーケストラでビールを注文する音楽さえ書くことができる」',
    contemporaries: ['マーラー', 'ドビュッシー', 'シベリウス', 'ラヴェル'],
    cities: [
      {
        cityName: 'Weimar',
        cityNameJa: 'ヴァイマール',
        country: 'ドイツ',
        coordinates: [11.3287, 50.9787],
        startYear: 1889,
        endYear: 1894,
        role: '宮廷歌劇場指揮者',
        notableEvent: '『ドン・ファン』『死と変容』の初演で交響詩の覇者となる'
      },
      {
        cityName: 'Vienna',
        cityNameJa: 'ウィーン',
        country: 'オーストリア',
        coordinates: [16.3738, 48.2082],
        startYear: 1919,
        endYear: 1924,
        role: 'ウィーン国立歌劇場総監督',
        notableEvent: '『ばらの騎士』の世界的上演と音楽劇の牽引'
      }
    ],
    milestones: [
      { year: 1888, event: '交響詩『ドン・ファン』初演、一躍ヨーロッパの寵児に' },
      { year: 1896, event: '交響詩『ツァラトゥストラはかく語りき』完成' },
      { year: 1911, event: '歌劇『ばらの騎士』ドレスデン初演、熱狂的成功' },
      { year: 1948, event: '晩年の至高の白鳥の歌『4つの最後の歌』を作曲' }
    ],
    works: [
      {
        id: 'rstrauss-zarathustra',
        title: '交響詩『ツァラトゥストラはかく語りき』作品30「日の出」',
        originalTitle: 'Also sprach Zarathustra, Op. 30: Sunrise',
        year: 1896,
        genre: 'Symphonic Poem',
        genreJa: '交響詩',
        city: 'Munich',
        cityCoordinates: [11.582, 48.1351],
        description: 'オルガンとティンパニの低音から宇宙の黎明が鳴り響く全音楽史上最も鮮烈な開始部。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 50, notes: [] }
      },
      {
        id: 'rstrauss-rosenkavalier',
        title: '歌劇『ばらの騎士』作品59 作品組曲ワルツ',
        originalTitle: 'Der Rosenkavalier: Waltz Sequences',
        year: 1911,
        genre: 'Opera',
        genreJa: '歌劇・管弦楽ワルツ',
        city: 'Dresden',
        cityCoordinates: [13.7373, 51.0504],
        description: 'マリア・テレジア時代の18世紀ウィーンの優雅と哀愁を爛熟の管弦楽で描いた不朽の名作。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 72, notes: [] }
      }
    ]
  },
  {
    id: 'bartok',
    name: 'ベーラ・バルトーク',
    originalName: 'Béla Bartók',
    shortName: 'バルトーク',
    birthYear: 1881,
    deathYear: 1945,
    era: 'modern',
    country: 'ハンガリー',
    nationalityJa: 'ハンガリー',
    flag: '🇭🇺',
    portraitUrl: '/portraits/bartok.jpg',
    portraitPainter: 'ブダペスト・バルトーク記念館所蔵肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: '20世紀を代表するハンガリーの作曲家・民族音楽学者。コダーイとともに蓄音機を担いで東欧の農村を巡り、真の民謡（マジャル、ルーマニア、スロバキア等）を採取・採譜。その変拍子と非対称リズム、黄金分割の調和を融合し革新的音楽言語を打ち立てた。',
    musicalStyle: '鋭角的なオスティナート（執拗な反復リズム）、黄金比やフィボナッチ数列に基づく形式構造、打楽器のように扱われるピアノ書法。',
    keyFeatures: ['『管弦楽のための協奏曲』のオーケストラ名人芸', '比較民族音楽学の開拓', '不協和音と民族音階の有機的結晶'],
    historicalQuote: '「民謡とは、自然の現象と同じように純粋で完璧な創造物である」',
    contemporaries: ['ストラヴィンスキー', 'シェーンベルク', 'ラヴェル', 'コダーイ'],
    cities: [
      {
        cityName: 'Budapest',
        cityNameJa: 'ブダペスト',
        country: 'ハンガリー',
        coordinates: [19.0402, 47.4979],
        startYear: 1907,
        endYear: 1940,
        role: 'リスト音楽院ピアノ科教授',
        notableEvent: '民謡研究と弦楽四重奏曲・バレエ音楽の創出'
      }
    ],
    milestones: [
      { year: 1911, event: '歌劇『青ひげ公の城』を作曲' },
      { year: 1936, event: '『弦楽器、打楽器とチェレスタのための音楽』を完成' },
      { year: 1943, event: 'ボストン交響楽団の委嘱で『管弦楽のための協奏曲』を作曲' }
    ],
    works: [
      {
        id: 'bartok-concerto-orch',
        title: '『管弦楽のための協奏曲』Sz. 116 第4楽章「中断された間奏曲」',
        originalTitle: 'Concerto for Orchestra: Intermezzo interrotto',
        year: 1943,
        genre: 'Orchestral',
        genreJa: '管弦楽曲',
        city: 'New York',
        cityCoordinates: [32.0, 43.0],
        description: '亡命先のアメリカで全オーケストラ奏者の名人芸を華麗に競わせた20世紀屈指の傑作。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 96, notes: [] }
      },
      {
        id: 'bartok-romanian-dances',
        title: '『ルーマニア民俗舞曲』Sz. 56',
        originalTitle: 'Romanian Folk Dances',
        year: 1915,
        genre: 'Chamber',
        genreJa: '舞曲集',
        city: 'Budapest',
        cityCoordinates: [19.0402, 47.4979],
        description: 'トランシルヴァニア地方の農民舞踊の素朴で情熱的な響きを芸術的に昇華した名曲。',
        audioSnippet: { type: 'synth', instrument: 'strings', tempo: 104, notes: [] }
      }
    ]
  },
  {
    id: 'prokofiev',
    name: 'セルゲイ・プロコフィエフ',
    originalName: 'Sergei Prokofiev',
    shortName: 'プロコフィエフ',
    birthYear: 1891,
    deathYear: 1953,
    era: 'modern',
    country: 'ロシア',
    nationalityJa: 'ロシア / ソ連',
    flag: '🇷🇺',
    portraitUrl: '/portraits/prokofiev.jpg',
    portraitPainter: 'モスクワ国立音楽博物館所蔵肖像',
    portraitAttribution: 'パブリックドメイン',
    biography: 'モダニズムとロシア的抒情性を兼ね備えた20世紀ソ連の巨匠。サンクトペテルブルク音楽院で「恐るべき子供」として脚光を浴び、革命後に欧米へ亡命するも祖国へ帰還。バレエ『ロメオとジュリエット』、音楽物語『ピーターと狼』など親しみやすくも機知に富んだ傑作を量産した。',
    musicalStyle: '鮮烈な不協和音と突飛な転調（トッカータ的打撃）、皮肉と諧謔（グロテスク）、そして一度聴いたら忘れられない広大で温かい歌心。',
    keyFeatures: ['『ロメオとジュリエット』の圧倒的劇性', '音楽物語『ピーターと狼』による管弦楽入門', 'ロシア・アヴァンギャルドと新古典主義の統合'],
    historicalQuote: '「私は真実のメロディを書きたい。明快で、誰もが理解できるメロディを」',
    contemporaries: ['ストラヴィンスキー', 'ラフマニノフ', 'ショスタコーヴィチ'],
    cities: [
      {
        cityName: 'St. Petersburg',
        cityNameJa: 'サンクトペテルブルク',
        country: 'ロシア',
        coordinates: [30.3351, 59.9343],
        startYear: 1904,
        endYear: 1918,
        role: '音楽院学生・前衛ピアニスト',
        notableEvent: '『古典交響曲』初演とセンセーショナルな登場'
      },
      {
        cityName: 'Moscow',
        cityNameJa: 'モスクワ',
        country: 'ロシア',
        coordinates: [37.6173, 55.7558],
        startYear: 1936,
        endYear: 1953,
        role: 'ソ連作曲家同盟・ソビエト芸術家',
        notableEvent: '『ロメオとジュリエット』『交響曲第5番』の作曲'
      }
    ],
    milestones: [
      { year: 1917, event: 'ハイドンへのオマージュ『古典交響曲（交響曲第1番）』を完成' },
      { year: 1935, event: 'バレエ音楽『ロメオとジュリエット』を作曲' },
      { year: 1936, event: '子どものための音楽物語『ピーターと狼』をわずか4日で書き上げる' }
    ],
    works: [
      {
        id: 'prokofiev-romeo-montecchi',
        title: 'バレエ『ロメオとジュリエット』組曲より「モンタギュー家とキャピュレット家」',
        originalTitle: 'Romeo and Juliet: Montagues and Capulets',
        year: 1935,
        genre: 'Ballet',
        genreJa: 'バレエ音楽・劇付随音楽',
        city: 'Moscow',
        cityCoordinates: [37.6173, 55.7558],
        description: '重厚な低音の不協和音と騎士たちの傲慢な行進を描く、映画やドラマでも多用される名曲。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 80, notes: [] }
      },
      {
        id: 'prokofiev-classical-symphony',
        title: '『交響曲第1番 ニ長調 作品25「古典」』第1楽章 アレグロ',
        originalTitle: 'Symphony No. 1 in D major, Op. 25 "Classical": Allegro',
        year: 1917,
        genre: 'Symphony',
        genreJa: '交響曲（新古典派）',
        city: 'St. Petersburg',
        cityCoordinates: [30.3351, 59.9343],
        description: 'もしハイドンが20世紀に生きていたら書いたであろう、才気とユーモアに満ちた小交響曲。',
        audioSnippet: { type: 'synth', instrument: 'orchestra', tempo: 132, notes: [] }
      }
    ]
  }
];

export const COMPOSERS: Composer[] = BASE_COMPOSERS.map(c => {
  const ep = LIFE_EPISODES[c.id];
  return ep ? { ...c, ...ep } : c;
});

export const getComposerById = (id: string): Composer | undefined => {
  return COMPOSERS.find(c => c.id === id);
};
