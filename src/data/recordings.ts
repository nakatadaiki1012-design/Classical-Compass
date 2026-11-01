/**
 * 曲ごとの録音（ウィキメディア・コモンズ）。キーは作品の id。
 * scripts/ で候補を集め、曲名・長さ・説明を人の目で確かめて選んだもの。
 */
export interface Recording {
  /** upload.wikimedia.org/wikipedia/commons/ 以降のパス（例: 5/5b/Name.ogg） */
  path: string;
  /** 長さ（秒） */
  dur: number;
  /** 演奏者など（わかる場合） */
  performer?: string;
  /** ライセンスの短い名前（例: Public domain, CC BY-SA 4.0） */
  license: string;
  /** 曲の一部だけのとき、その説明（例: 第1楽章） */
  note?: string;
}

export const RECORDINGS: Record<string, Recording> = {
  'bach': { path: 'f/ff/Vivaldi_-_Four_Seasons_1_Spring_mvt_1_Allegro_-_John_Harrison_violin.oga', dur: 215, license: 'CC BY-SA 4.0', performer: 'John Harrison（ヴァイオリン）', note: '第1楽章' },
  'handel': { path: '4/41/PDP-CH_-_Adolf_Busch_Chamber_Players_-_Adolf_Busch_-_Suite_No._3_in_D_major%2C_BWV_1068_-_Air_-_Bach_-_Hmv-db3019-2ea3895.flac', dur: 283, license: 'Public domain', performer: 'アドルフ・ブッシュ室内合奏団' },
  'bach-toccata': { path: '4/4d/Bach%2C_Toccata_und_Fuge_d-moll_BWV_565%2C_Norbert_Schenk.mp3', dur: 464, license: 'CC BY 4.0', performer: 'Norbert Schenk（オルガン）' },
  'haydn': { path: 'c/ce/Handel_-_messiah_-_44_hallelujah.ogg', dur: 227, license: 'CC BY-SA 2.0' },
  'beethoven': { path: '2/24/Mozart_-_Eine_kleine_Nachtmusik_-_1._Allegro.ogg', dur: 355, license: 'CC BY-SA 2.0' },
  'mozart-sym40': { path: 'a/a8/Mozart_-_Symphony_No._40_in_G_minor%2C_K550_-_I._Molto_allegro_%28Musopen_Symphony%29.flac', dur: 359, license: 'Public domain', performer: 'Musopen Symphony' },
  'schubert': { path: '5/5b/Ludwig_van_Beethoven_-_Symphonie_5_c-moll_-_1._Allegro_con_brio.ogg', dur: 436, license: 'Public domain' },
  'beethoven-ode-to-joy': { path: 'd/da/PMLP01607-Symphony_No.9%2C_Op.125_%28Beethoven%2C_Ludwig_van%29%2C_IV_Presto.ogg', dur: 1350, license: 'CC BY-SA 3.0', note: '第4楽章の全曲（約22分）' },
  'beethoven-moonlight': { path: '4/48/Ludwig_van_Beethoven_-_sonata_no._14_in_c_sharp_minor_%27moonlight%27%2C_op._27_no._2_-_i._adagio_sostenuto.ogg', dur: 336, license: 'Public domain' },
  'chopin': { path: '6/6f/Franz_Schubert_-_Ellens_dritter_Gesang.oga', dur: 366, license: 'CC BY 3.0' },
  'mendelssohn': { path: '8/89/Chopin_-_Nocturne_No._2_in_E-flat_major%2C_Op._9_No._2_%28Frank_Levy%29.flac', dur: 271, license: 'Public domain', performer: 'Frank Levy（ピアノ）' },
  'chopin-fantaisie': { path: '3/33/Chopin_-_Fantasie_Impromptu_Op._66_played_by_Dario_Fernandez_Torre.oga', dur: 274, license: 'CC BY-SA 3.0', performer: 'Dario Fernandez Torre（ピアノ）' },
  'schumann': { path: 'c/cb/A_Midsummer_Night%27s_Dream_Op._61_Wedding_March_%28Mendelssohn%29_European_Archive.ogg', dur: 294, license: 'Public domain' },
  'liszt': { path: '0/06/Robert_Schumann_-_scenes_from_childhood%2C_op._15_-_vii._dreaming.ogg', dur: 203, license: 'Public domain' },
  'verdi': { path: '5/59/PDP-CH_-_Marek_Weber%2C_piano_-_Liebestr%C3%A4ume%2C_S_541%2C_R_211_-_Liebestraum_No._3_-_Liszt_-_Hmv-fkx110-2b5802.flac', dur: 239, license: 'Public domain', performer: 'Marek Weber（ピアノ）' },
  'wagner': { path: '3/3a/%22Brindisi%22_from_La_Traviata_-_Singing_Sergeants_-_United_States_Air_Force_Band.mp3', dur: 182, license: 'Public domain', performer: 'アメリカ空軍バンド' },
  'brahms': { path: '2/29/Richard_Wagner_-_Ride_of_the_Valkyries.ogg', dur: 258, license: 'Public domain' },
  'tchaikovsky': { path: 'd/d8/Johannes_Brahms_-_Ungarischer_Tanz_5_g-moll.ogg', dur: 228, license: 'EEF OAL-1' },
  'dvorak': { path: '1/1f/Tchaikovsky_Swan_Lake_Op.20_No.10._Sc%C3%A8ne.ogg', dur: 150, license: 'Public domain' },
  'grieg': { path: 'c/c3/Antonin_Dvorak_-_symphony_no._9_in_e_minor_%27from_the_new_world%27%2C_op._95_-_ii._largo.ogg', dur: 694, license: 'Public domain' },
  'mahler': { path: 'c/c2/Grieg_-_Peer_Gynt_Suite_No._1%2C_Op._46_-_I._Morning_Mood_%28Musopen_Symphony%29.flac', dur: 229, license: 'Public domain', performer: 'Musopen Symphony' },
  'ravel': { path: 'b/be/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg', dur: 304, license: 'Public domain' },
  'stravinsky': { path: '3/32/Bol%C3%A9ro_de_Ravel%2C_Orchestre_de_l%27Association_des_Concerts_Lamoureux%2C_1935%2C_1.mp3', dur: 256, license: 'Public domain', performer: 'ラムルー管弦楽団（1935年録音）', note: 'SPレコード4面のうち1面目' },
  'ravel-pavane': { path: 'd/d6/Maurice_Ravel_-_Th%C3%A9r%C3%A8se_Dussaut_-_Pavane_pour_une_infante_d%C3%A9funte.ogg', dur: 308, license: 'CC BY-SA 2.0', performer: 'Thérèse Dussaut（ピアノ）' },
  'monteverdi-orfeo': { path: '3/3d/Orfeo_-_Toccata.ogg', dur: 90, license: 'Public domain', note: '冒頭のトッカータ' },
  'telemann-viola-concerto': { path: '1/1a/Telemann_-_Viola_Concerto_Gmaj_-_1._Largo.ogg', dur: 177, license: 'CC BY-SA 2.0', note: '第1楽章' },
  'scarlatti-k380': { path: '6/68/Domenico_Scarlatti_-_Sonate_en_mi_majeur_Kk.380_%28Marcelle_Meyer%2C_1954%29.flac', dur: 331, license: 'Public domain', performer: 'Marcelle Meyer（ピアノ, 1954年）' },
  'scarlatti-k141': { path: 'd/d1/D._Scarlatti_K141.ogg', dur: 130, license: 'CC BY-SA 3.0' },
  'rossini-barber': { path: '8/8c/PDP-CH_-_New_York_Philharmonic_-_Arturo_Toscanini_-_The_Barber_of_Seville_-_Gioachino_Rossini_-_Overture_-_Part_1_-_Electrola-ej576-42-846.flac', dur: 221, license: 'Public domain', performer: 'トスカニーニ指揮 ニューヨーク・フィル', note: '前半（SPレコード2面のうち1面目）' },
  'rossini-tell': { path: '0/09/Guillaume_Tell_-_Overture_-_%28Rossini%2C_Gioacchino%29_by_Fritz_Reiner_%28conductor%29.mp3', dur: 716, license: 'CC BY-SA 4.0', performer: 'フリッツ・ライナー指揮' },
  'berlioz-fantastique': { path: 'e/ee/Hector_Berlioz_-_Symphonie_fantastique%2C_op._14_-_4._Marche_au_supplice_%28Igor_Markevitch%2C_Orchestre_Lamoureux%2C_1962%29.ogg', dur: 288, license: 'Public domain', performer: 'マルケヴィチ指揮 ラムルー管弦楽団（1962年）' },
  'berlioz-damnation': { path: 'e/e0/Marche_Hongroise_-_U.S._Marine_Band.ogg', dur: 297, license: 'Public domain', performer: 'アメリカ海兵隊バンド' },
  'puccini-turandot': { path: '0/03/%27Nessun_Dorma%27%2C_Aureliano_Pertile%2C_1927.ogg', dur: 183, license: 'Public domain', performer: 'アウレリアーノ・ペルティーレ（1927年）' },
  'puccini-boheme': { path: 'a/a8/PDP-CH_-_Beniamino_Gigli%2C_Tenor_-_La_boh%C3%A8me_-_Che_gelida_manina_-_Puccini_-_Hmv-db1538-8769a.flac', dur: 253, license: 'Public domain', performer: 'ベニャミーノ・ジーリ（テノール）' },
  'palestrina-marcelli': { path: 'e/e1/Missa_Papae_Marcelli_-_I._Kyrie.flac', dur: 214, license: 'CC0' },
  'rstrauss-zarathustra': { path: '0/0b/Also_Sprach_Zarathustra_-_Einleitung.ogg', dur: 86, license: 'CC BY 3.0', note: '冒頭（導入部）' },
  'bartok-romanian-dances': { path: '0/0d/Bartok_-_Romanian_Folk_Dances.ogg', dur: 127, license: 'CC BY-SA 2.0', note: '第2・5・6曲' },
  'prokofiev-romeo-montecchi': { path: '5/5d/Prokofiev-75-6-Montaigus-et-Capulets-part.ogg', dur: 112, license: 'CC BY-SA 4.0', note: '抜粋' },
  'tallis-lamentations': { path: '4/47/Thomas_Tallis_Lamentations_I_%28The_Tudor_Consort%29.ogg', dur: 538, license: 'CC BY 2.5', performer: 'The Tudor Consort', note: '第1部' },
  'byrd-mass4': { path: 'a/a4/Byrd_4-Part_Mass_-_Kyrie.ogg', dur: 138, license: 'CC BY 3.0', note: 'キリエ' },
  'schutz-exequien': { path: 'e/e0/Cantus_Polonicus_-_Musikalische_Exequien_II.ogg', dur: 169, license: 'CC BY-SA 4.0', performer: 'Cantus Polonicus', note: '第2部のモテット（SWV 280）' },
  'lully-bourgeois': { path: '7/74/Lully_Le_Bourgeois_Gentilhomme_-_01._Ouverture.ogg', dur: 178, license: 'CC BY-SA 2.0', note: '序曲' },
  'corelli-christmas': { path: '7/7d/PDP-CH_-_London_Symphony_Orchestra_-_Bruno_Walter_-_Concerto_grosso_in_G_minor%2C_Op._6%2C_No._8_-_Pastorale%2C_Largo%2C_Conclusion_-_Arcangelo_Corelli_-_Hmv-db3640-2ea6777.flac', dur: 227, license: 'Public domain', performer: 'ブルーノ・ワルター指揮 ロンドン交響楽団', note: 'パストラーレ' },
  'pachelbel-canon': { path: '8/8a/Canon_and_Gigue_in_D.ogg', dur: 387, license: 'CC BY-SA 3.0', note: 'カノンとジーグ' },
  'pachelbel-hexachordum': { path: 'd/d6/Pachelbel_aria_quinta.Ogg', dur: 414, license: 'CC BY-SA 3.0', note: 'アリア第5番' },
  'couperin-barricades': { path: '5/5a/Fran%C3%A7ois_Couperin_-_Les_barricades_mysterieuses_%28Marcelle_Meyer%2C_1954%29.flac', dur: 95, license: 'Public domain', performer: 'Marcelle Meyer（ピアノ, 1954年）' },
  'rameau-poule': { path: '2/29/Jean-Philippe_Rameau_-_La_Poule_%28Marcelle_Meyer%2C_1953%29.flac', dur: 186, license: 'Public domain', performer: 'Marcelle Meyer（ピアノ, 1953年）' },
  'gluck-orfeo': { path: 'c/c2/PDP-CH_-_New_York_Philharmonic_-_Arturo_Toscanini_-_Orfeo_ed_Euridice_-_Dance_of_the_Blessed_Spirits_-_Christoph_Willibald_Gluck_-_Hmv-d1784-42-664.flac', dur: 289, license: 'Public domain', performer: 'トスカニーニ指揮 ニューヨーク・フィル', note: '精霊の踊り' },
  'boccherini-cello': { path: '8/89/PDP-CH_-_London_Symphony_Orchestra_-_Landon_Ronald_-_Pau_Casals%2C_Cello_-_Cello_Concerto_in_B-flat_major%2C_G482_-_Luigi_Boccherini_-_Hmv-db3056-2ea4156.flac', dur: 218, license: 'Public domain', performer: 'パブロ・カザルス（チェロ）', note: '冒頭（SPレコード1面目）' },
  'paganini-caprices': { path: '1/17/Paganini_Caprice-24.ogg', dur: 311, license: 'Public domain', note: '第24番' },
  'weber-freischutz': { path: '5/5d/Carl_Maria_von_Weber_-_der_freischutz%2C_j._277_-_overture.ogg', dur: 618, license: 'Public domain', note: '序曲' },
  'bruckner-7': { path: '5/5c/HSO_Bruckner-7_01.mp3', dur: 1075, license: 'Public domain', note: '第1楽章' },
  'smetana-moldau': { path: '3/39/Smetana_-_M%C3%A1_Vlast_-_Vltava_%28Musopen_Symphony%29.flac', dur: 771, license: 'Public domain', performer: 'Musopen Symphony' },
  'smetana-bartered': { path: 'c/c5/Smetana_-_Bartered_Bride_overture.ogg', dur: 388, license: 'Public domain' },
  'bizet-carmen': { path: '9/9f/Carmen_-_Prelude_to_Act_1.ogg', dur: 125, license: 'CC0', note: '第1幕への前奏曲' },
  'mussorgsky-pictures': { path: '7/7e/Mussorgsky_Pictures_at_an_Exhibition_Part1.ogg', dur: 212, license: 'CC BY-SA 2.0 de', note: '冒頭「プロムナード」から' },
  'mussorgsky-bald': { path: 'c/ca/Modest_Mussorgsky_-_night_on_bald_mountain.ogg', dur: 733, license: 'Public domain' },
  'saint-saens-carnival': { path: '7/7f/Camille_Saint-Sa%C3%ABns_-_The_Carnival_of_the_Animals.ogg', dur: 1372, license: 'CC BY-SA 2.0', note: '全曲' },
  'strauss-danube': { path: 'b/bf/%22An_der_sch%C3%B6nen%2C_blauen_Donau%22_performed_by_the_U.S._Marine_Band.flac', dur: 549, license: 'Public domain', performer: 'アメリカ海兵隊バンド' },
  'donizetti-lucia': { path: '7/7e/Donizetti_-_Melba_-_Del_ciel_clemente_un_riso_%28Lucia_di_Lammermoor%2C_air_de_la_folie%29_-_1904.ogg', dur: 171, license: 'Public domain', performer: 'ネリー・メルバ（1904年）', note: '狂乱の場' },
  'donizetti-elisir': { path: 'd/dd/Enrico_Caruso%2C_L%27elisir_d%27amore%2C_Una_furtiva_lagrima.ogg', dur: 261, license: 'Public domain', performer: 'エンリコ・カルーソー', note: '「人知れぬ涙」' },
  'rimsky-scheherazade': { path: '4/4e/Rimsky-Korsakov._Scheherazade%2C_Symphonic_Suite%2C_Op._35_-_01_The_Sea_And_Sinbads_Ship.ogg', dur: 499, license: 'CC0', note: '第1楽章「海とシンドバッドの船」' },
  'rimsky-bumblebee': { path: 'c/c0/Rimsky-Korsakov_-_flight_of_the_bumblebee.oga', dur: 79, license: 'Public domain' },
  'elgar-enigma': { path: 'e/e7/Elgar%3B_Enigma_variations%2C_Theme_IX._Nimrod.ogg', dur: 174, license: 'Public domain', note: '第9変奏「ニムロッド」' },
  'elgar-pomp': { path: '2/28/ELGAR_Pomp_and_Circumstance_in_D%2C_Opus_39%2C_No._1_-_United_States_Marine_Band.mp3', dur: 346, license: 'Public domain', performer: 'アメリカ海兵隊バンド' },
  'satie-gymnopedie': { path: '9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg', dur: 184, license: 'Public domain' },
  'satie-gnossienne': { path: 'e/e5/Erik_Satie_-_Gnossienne_no_1.ogg', dur: 208, license: 'CC BY-SA 3.0' },
  'holst-planets': { path: '3/3f/Gustav_Holst_-_the_planets%2C_op._32_-_iv._jupiter%2C_the_bringer_of_jollity.ogg', dur: 508, license: 'Attribution', note: '「木星」' },
  'gershwin-rhapsody': { path: '1/16/1st_recording_of_Rhapsody_In_Blue_-_Paul_Whiteman_Orch._and_George_Gershwin_piano_%281924_version%29.ogg', dur: 546, license: 'Public domain', performer: 'ガーシュウィン（ピアノ）＆ポール・ホワイトマン楽団（1924年の初録音）' },
  'taki-koujou': { path: 'c/c0/Kojonotsuki.ogg', dur: 42, license: 'CC BY-SA 4.0', note: '短い演奏' },
  'liliuokalani-aloha': { path: '4/45/Madam_Alapai%2C_Henry_N._Clark_-_Aloha_Oe.ogg', dur: 176, license: 'Public domain', performer: 'マダム・アラパイ（初期の録音）' },
  'joplin-maple': { path: 'd/db/Maple_leaf_rag_-_played_by_Scott_Joplin_1916_V2.ogg', dur: 130, license: 'Public domain', performer: 'スコット・ジョプリン本人（1916年のピアノロール）' },
  'joplin-entertainer': { path: '6/6d/Scott_Joplin_-_04_-_The_Entertainer_1902_piano_roll.mp3', dur: 157, license: 'Public domain', performer: 'ピアノロール' },
  'abing-erquan': { path: 'f/ff/%E4%BA%8C%E6%B3%89%E6%98%A0%E6%9C%88.ogg', dur: 268, license: 'CC BY-SA 4.0', note: '二胡の演奏' },
  'cage-433': { path: 'c/cb/4%2733%22_performed_by_Eikanger-Bj%C3%B8rsvik.ogg', dur: 273, license: 'Public domain', performer: 'Eikanger-Bjørsvik Musikklag（ブラスバンド）', note: '音のない曲です' },
  'vivaldi-winter': { path: '2/2a/Vivaldi_-_Four_Seasons_4_Winter_mvt_1_Allegro_non_molto_-_John_Harrison_violin.oga', dur: 209, license: 'CC BY-SA 4.0', performer: 'John Harrison（ヴァイオリン）', note: '第1楽章' },
  'mozart': { path: '4/42/Haydn%3B_Symphony_No._94_%22Surprise%22%2C_2._Andante.ogg', dur: 438, license: 'Public domain', note: '第2楽章' },
  'tchaikovsky-sugarplum': { path: '0/0c/PDP-CH_-_National_Symphony_Orchestra_of_London_-_Stanford_Robinson%2C_conductor_-_The_Nutcracker_Suite%2C_Op._71_-_Dance_of_the_Sugar_Plum_Fairy_-_Russian_Dance_-_Tchaikovsky_-_Decca-k1142-ar9057.flac', dur: 183, license: 'Public domain', performer: 'スタンフォード・ロビンソン指揮 ロンドン・ナショナル交響楽団', note: '続けて「ロシアの踊り」' },
  'sibelius': { path: 'b/b2/Mahler_Symphony_No._5%2C_IV._Adagietto.ogg', dur: 621, license: 'CC0' },
  'debussy': { path: '6/63/Sergei_Rachmaninoff_-_piano_concerto_no._2_in_c_minor%2C_op._18_-_i._moderato.ogg', dur: 654, license: 'Public domain', note: '第1楽章' },
  'faure-requiem': { path: '6/64/Faur%C3%A9_-_Requiem_-_IV._Pie_Jesu.flac', dur: 181, license: 'Public domain', note: '第4曲「ピエ・イエズ」' },
  'gregory1-chant': { path: '7/73/Schola_Gregoriana-Kyrie_eleison.ogg', dur: 42, license: 'CC BY-SA 3.0', performer: 'スコラ・グレゴリアーナ', note: 'キリエ' },
  'tansen-malhar': { path: '3/36/Rag_Miyan_Malhar_-_NCERT.ogg', dur: 774, license: 'CC BY 3.0', performer: 'インド国立教育研究訓練評議会（NCERT）の録音' }
};
