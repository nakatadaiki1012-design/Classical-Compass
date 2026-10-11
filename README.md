# Classical Compass (クラシック・コンパス) 🎵

> クラシック音楽の巨匠たちの生涯年表、主要作品、Web Audio APIによる試聴プレーヤー、およびヨーロッパ年代別作曲マップを探索できるインタラクティブ音楽史アーカイブ。

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square)

---

## 🌟 主な機能

### 1. インタラクティブ年表タイムライン (Timeline View)
- **時代ごとの色分け生涯バー**: バロック、古典派、前期・盛期ロマン派、後期ロマン派・国民楽派、印象主義、近代音楽を美しいカラーパレットで視覚化。
- **滑らかなズーム＆スクロール**: ズームイン/ズームアウト、年代ルーラー（1650年〜1950年）、ドラッグスクロール、タッチデバイスでのピンチイン/アウトに対応。
- **年表上の主要作品ピン**: 生涯バーの上に作曲年ごとの作品ピン（♪）をプロット。ホバーで曲名・作曲地・解説がポップアップし、1クリックで即座に試聴可能。
- **絞り込み＆検索**: 時代別、国別、フリーワード（作曲家名・曲名）でのリアルタイム検索。

### 2. ヨーロッパ音楽地図 (Europe Historical Map)
- **年代スライダー（1650年〜1950年）**: スライダーを動かすと、その年に存命の作曲家たちがヨーロッパのどの都市（ウィーン、パリ、ライプツィヒ、ロンドン、ヴェネツィア、プラハ、サンクトペテルブルクなど）で活動していたかをリアルタイムでプロット。
- **都市と作曲の連動**: その年代に誕生した代表作が音符アイコンとともに表示され、都市をクリックすると「都市クロニクル」で滞在作曲家と作品一覧を展開。
- **「歴史年代を巡る」オートプレイ**: 速度調整（1x, 2x, 4x）付きの自動再生で、音楽史の地理的変遷を鑑賞可能。

### 3. Web Audio API 統合クラシック試聴プレーヤー
- **高音質シンセシス音源**: 外部通信エラーやリンク切れに強い、Web Audio APIによるポリフォニック音響合成エンジン（ピアノ、弦楽合奏、パイプオルガン、チェンバロ、フルート）。
- **リアルタイム波形アナライザー**: 再生中の周波数データをキャンバス上にスペクトラムとして描画。
- **シークバー＆プレイリスト**: 再生/一時停止、シーク、音量調整、ミュート、全曲クイック選択ドロワー。

### 4. 作曲家詳細プロファイル・名鑑
- パブリックドメインの肖像画メダリオン。
- 生涯と経歴、音楽的特徴と革新性、代表作カタログ、同時代作曲家との関係性を確認可能。

---

## 🛠 技術スタック

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Audio Engine**: Web Audio API (Additive Synthesis, Polyphony, AnalyserNode)
- **Typography**: Cormorant Garamond, Cinzel, Shippori Mincho, Plus Jakarta Sans

---

## 🚀 ローカルでの開発・実行方法

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (ポート 3000)
npm run dev

# プロダクションビルド
npm run build
```

---

## 📜 ライセンス

MIT License
