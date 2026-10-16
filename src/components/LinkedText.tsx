import React, { useMemo } from 'react';
import { linkify, WikiTarget } from '../data/glossary';
import { openWiki } from '../utils/wikiStore';

const KIND_TITLE: Record<string, string> = { term: '用語', composer: '作曲家', period: '時代' };

/** 文章の中の用語・作曲家・時代を、タップでウィキ風のページが開くリンクにする */
export const LinkedText: React.FC<{ text: string; exclude?: string[] }> = ({ text, exclude }) => {
  const parts = useMemo(() => linkify(text, exclude), [text, exclude]);
  return (
    <>
      {parts.map((p, i) =>
        p.target ? (
          <WikiLink key={i} target={p.target}>
            {p.text}
          </WikiLink>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        )
      )}
    </>
  );
};

/** ひとつのリンク（点線の下線つき） */
export const WikiLink: React.FC<{ target: WikiTarget; children: React.ReactNode; className?: string }> = ({
  target,
  children,
  className = ''
}) => (
  <span
    role="link"
    tabIndex={0}
    title={`${KIND_TITLE[target.kind] ?? ''}のページを開く`}
    onClick={e => {
      e.stopPropagation();
      openWiki(target);
    }}
    onKeyDown={e => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        openWiki(target);
      }
    }}
    className={`cursor-pointer underline decoration-dotted decoration-[#e6b95c] underline-offset-[3px] hover:text-[#e6b95c] hover:decoration-solid ${className}`}
  >
    {children}
  </span>
);
