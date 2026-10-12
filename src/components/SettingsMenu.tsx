import React, { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { AppSettings, updateSettings, useSettings } from '../utils/appSettings';

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <div className="text-[11px] font-bold text-[#c99738]">{label}</div>
    <div className="flex flex-wrap gap-1">{children}</div>
  </div>
);

function Choice<K extends keyof AppSettings>({
  field,
  value,
  label,
  style
}: {
  field: K;
  value: AppSettings[K];
  label: string;
  style?: React.CSSProperties;
}) {
  const settings = useSettings();
  const active = settings[field] === value;
  return (
    <button
      onClick={() => updateSettings({ [field]: value } as Partial<AppSettings>)}
      aria-pressed={active}
      style={style}
      className={`px-2.5 py-1 rounded border text-[12px] transition-colors ${
        active
          ? 'bg-[#c99738] border-[#c99738] text-[#161412] font-bold'
          : 'bg-[#241f19] border-[#3d362e] text-[#d6cdbd] hover:text-[#f5ebd9]'
      }`}
    >
      {label}
    </button>
  );
}

/** ヘッダーの「表示設定」：テーマ・フォント・文字の大きさ・年表の色分け */
export const SettingsMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="表示設定"
        aria-expanded={open}
        title="表示設定（ダーク／ライト、フォント、色分け）"
        className="w-8 h-8 rounded-md border border-[#2e2924] bg-[#1e1a16] text-[#bdb1a1] hover:text-[#f5ebd9] flex items-center justify-center"
      >
        <Settings className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-[#c99738]/50 bg-[#14100c] p-3 shadow-2xl space-y-3 z-50">
          <Row label="画面の明るさ">
            <Choice field="theme" value="dark" label="🌙 ダーク" />
            <Choice field="theme" value="light" label="☀ ライト" />
          </Row>
          <Row label="フォント">
            <Choice field="font" value="default" label="標準" />
            <Choice field="font" value="gothic" label="ゴシック" style={{ fontFamily: '"Noto Sans JP", sans-serif' }} />
            <Choice field="font" value="mincho" label="明朝" style={{ fontFamily: '"Noto Serif JP", serif' }} />
            <Choice field="font" value="maru" label="丸ゴシック" style={{ fontFamily: '"Zen Maru Gothic", sans-serif' }} />
            <Choice field="font" value="ud" label="見やすい(UD)" style={{ fontFamily: '"BIZ UDPGothic", sans-serif' }} />
          </Row>
          <Row label="文字の大きさ">
            <Choice field="size" value="s" label="小" />
            <Choice field="size" value="m" label="標準" />
            <Choice field="size" value="l" label="大" />
          </Row>
          <Row label="年表の色分け">
            <Choice field="colorBy" value="era" label="時代ごと" />
            <Choice field="colorBy" value="country" label="国ごと（現在の国）" />
          </Row>
        </div>
      )}
    </div>
  );
};
