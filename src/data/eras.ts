import { Era } from '../types';

export const ERAS: Era[] = [
  {
    id: 'ancient',
    name: '古代・初期中世',
    nameEn: 'Ancient / Early Medieval',
    startYear: -800,
    endYear: 1100,
    color: '#9ca3af',
    accentColor: '#d1d5db',
    bgLight: 'rgba(156, 163, 175, 0.12)',
    description: '古代ギリシアで音楽が数と結びついて考えられ、のちキリスト教の礼拝でグレゴリオ聖歌が歌われるようになった時代。楽譜の工夫もここから始まる。',
    musicalFeatures: ['音程と数の比（ピタゴラス）', '単旋律聖歌（グレゴリオ聖歌）', 'ネウマ譜と譜線、階名（ドレミ）の誕生', '初期のオルガヌム']
  },
  {
    id: 'medieval',
    name: '中世西洋音楽',
    nameEn: 'Medieval',
    startYear: 1100,
    endYear: 1400,
    color: '#8B5CF6', // Royal Purple
    accentColor: '#A78BFA',
    bgLight: 'rgba(139, 92, 246, 0.15)',
    description: '単旋律のグレゴリオ聖歌から多声部（ポリフォニー）のノートルダム楽派、そしてアルス・ノーヴァの高度なリズム表記への発展の時代。',
    musicalFeatures: ['単旋律聖歌（グレゴリオ聖歌）', '初期ポリフォニー（オルガヌム）', 'アルス・ノーヴァのリズム表現', '吟遊詩人（トルバドゥール）の世俗歌曲']
  },
  {
    id: 'renaissance',
    name: 'ルネサンス音楽',
    nameEn: 'Renaissance',
    startYear: 1400,
    endYear: 1600,
    color: '#10B981', // Emerald Renaissance Green
    accentColor: '#34D399',
    bgLight: 'rgba(16, 185, 129, 0.15)',
    description: 'フランコ・フランドル楽派とイタリア・パレストリーナ様式が頂点に達した人文書の時代。均整の取れた模倣対位法とマドリガーレが開花。',
    musicalFeatures: ['通模倣様式（Imitative Counterpoint）', '無伴奏無声合唱（ア・カペラ）', '世俗歌曲マドリガーレの隆盛', '調和と不協和音の厳格な制御']
  },
  {
    id: 'baroque',
    name: 'バロック音楽',
    nameEn: 'Baroque',
    startYear: 1600,
    endYear: 1750,
    color: '#D97706', // Warm Amber / Gold
    accentColor: '#F59E0B',
    bgLight: 'rgba(217, 119, 6, 0.15)',
    description: '通奏低音、厳格な対位法、フーガ、感情の表出（アフェクト説）を特徴とし、教会音楽からオペラまで劇的な形式が確立された時代。',
    musicalFeatures: ['通奏低音（バッソ・コンティヌオ）', '対位法とフーガの極致', '協奏曲（コンチェルト）形式の誕生', '感情の劇的な起伏']
  },
  {
    id: 'classical',
    name: '古典派音楽',
    nameEn: 'Classical',
    startYear: 1730,
    endYear: 1820,
    color: '#2563EB', // Sapphire Blue
    accentColor: '#3B82F6',
    bgLight: 'rgba(37, 99, 235, 0.15)',
    description: 'ウィーンを中心に花開いた時代。明晰な形式美、ソナタ形式の完成、管弦楽の標準化、調和と均整の美学が追求された。',
    musicalFeatures: ['ソナタ形式の確立', '旋律と和声の明快なホモフォニー', '交響曲・弦楽四重奏の誕生', '均整と普遍の美']
  },
  {
    id: 'romantic',
    name: '前期・盛期ロマン派',
    nameEn: 'Early & High Romantic',
    startYear: 1800,
    endYear: 1860,
    color: '#DC2626', // Crimson Ruby
    accentColor: '#EF4444',
    bgLight: 'rgba(220, 38, 38, 0.15)',
    description: '個人の主観的感情、文学との融合、標題音楽、ピアノ音楽の飛躍的発展。ベートーヴェンの意志を継ぎ、情熱と幻想が爆発した時代。',
    musicalFeatures: ['個人の激情と内面の表現', 'ピアノ表現力の極限的拡大', '歌曲（リート）と標題音楽の隆盛', '色彩的な半音階和声']
  },
  {
    id: 'late-romantic',
    name: '後期ロマン派・国民楽派',
    nameEn: 'Late Romantic & Nationalism',
    startYear: 1850,
    endYear: 1910,
    color: '#9333EA', // Purple / Violet
    accentColor: '#A855F7',
    bgLight: 'rgba(147, 51, 234, 0.15)',
    description: 'オーケストラの巨大化、民族のアイデンティティ（国民楽派）、和声の崩壊寸前の拡張、交響詩や楽劇の大規模化。',
    musicalFeatures: ['巨大編成オーケストラと濃厚な管弦楽法', '自国の民謡や祖国愛（国民楽派）', '無限旋律とライトモティーフ', '極限の主情主義']
  },
  {
    id: 'impressionism',
    name: '印象主義',
    nameEn: 'Impressionism',
    startYear: 1890,
    endYear: 1925,
    color: '#0D9488', // Emerald Teal
    accentColor: '#14B8A6',
    bgLight: 'rgba(13, 148, 136, 0.15)',
    description: '伝統的な機能和声を解体し、全音音階や教会旋法、響きの陰影・色彩感を重視したフランス発祥の革新的音楽運動。',
    musicalFeatures: ['機能和声からの脱却と平行和音', '全音音階・五音音階（ペンタトニック）', '光と影の移ろいを音で捉える音彩感', '繊細な管弦楽法とペダル奏法']
  },
  {
    id: 'modern',
    name: '近代・20世紀音楽',
    nameEn: '20th Century / Modern',
    startYear: 1900,
    endYear: 1960,
    color: '#BE123C', // Deep Rose Bronze
    accentColor: '#E11D48',
    bgLight: 'rgba(190, 18, 60, 0.15)',
    description: '無調音楽、十二音技法、新古典主義、激しいリズムの探求など、西洋音楽の伝統を再構築・刷新した多様性の時代。',
    musicalFeatures: ['無調（アトナリティ）と十二音技法', '複雑で野性的な変拍子・ポリリズム', '新古典主義によるバロック・古典の再解釈', '民族音楽の科学的探求']
  }
];

export const getEraById = (id: string): Era => {
  return ERAS.find(e => e.id === id) || ERAS[0];
};
