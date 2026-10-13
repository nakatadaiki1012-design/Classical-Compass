import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWikiImage } from '../utils/useWikiPortrait';

const titleOf = (key: string) => key.split('|')[1] || key.split('|')[0];

/** 小さな写真（取れなければ何も出さない） */
export const WikiThumb: React.FC<{ imageKey: string; className?: string }> = ({ imageKey, className = '' }) => {
  const url = useWikiImage(imageKey);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!url || failed) return null;
  return (
    <img
      src={url}
      alt={titleOf(imageKey)}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover rounded-md border border-white/10 ${className}`}
    />
  );
};

/** 用語などにカーソルを合わせると、写真が出る（パソコンのみ）。写真が取れなければ何も出ない */
export const HoverImage: React.FC<{ imageKey: string; children: React.ReactNode; className?: string }> = ({
  imageKey,
  children,
  className
}) => {
  const url = useWikiImage(imageKey);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLSpanElement | null>(null);

  const canShow = !!url && !failed && !!imageKey;
  const place = (x: number, y: number) => {
    const w = 280;
    const left = x + 18 + w > window.innerWidth - 8 ? x - w - 18 : x + 18;
    const top = Math.min(y + 18, window.innerHeight - 260);
    setPos({ x: Math.max(8, left), y: Math.max(8, top) });
  };

  return (
    <span
      ref={boxRef}
      className={className}
      onMouseEnter={e => canShow && window.matchMedia('(hover: hover)').matches && place(e.clientX, e.clientY)}
      onMouseMove={e => pos && place(e.clientX, e.clientY)}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos &&
        canShow &&
        createPortal(
          <div
            className="fixed z-[80] pointer-events-none w-[280px] rounded-xl border border-[#c99738]/60 bg-[#14100c]/95 p-2 shadow-2xl"
            style={{ left: pos.x, top: pos.y }}
          >
            <img
              src={url}
              alt={titleOf(imageKey)}
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
              className="w-full max-h-56 object-contain rounded-lg"
            />
            <div className="mt-1 text-[11px] text-[#d6cdbd]">{titleOf(imageKey)}</div>
            <div className="text-[10px] text-[#8f8476]">画像：ウィキペディアより</div>
          </div>,
          document.body
        )}
    </span>
  );
};
