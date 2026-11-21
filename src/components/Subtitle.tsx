import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BRAND, FONT_STACK, SUBTITLE_SAFE_BOTTOM } from '../constants';

type Props = {
  text: string;
  speaker?: string;
};

/** 中文按字宽断行，优先在标点处断开 */
const wrapCJK = (text: string, perLine = 13): string[] => {
  const clean = text.replace(/\s+/g, ' ').trim();
  const lines: string[] = [];
  let rest = clean;

  while (rest.length > perLine) {
    let cut = -1;
    for (let i = Math.min(perLine, rest.length - 1); i >= Math.floor(perLine / 2); i--) {
      if ('，。！？；：、…—'.includes(rest[i])) {
        cut = i + 1;
        break;
      }
    }
    if (cut === -1) cut = perLine;
    lines.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) lines.push(rest);

  // 避免最后一行的孤字（"的。"这种），从上一行挪几个字过来
  if (lines.length > 1) {
    const last = lines[lines.length - 1];
    if (last.length <= 3) {
      const prev = lines[lines.length - 2];
      const shift = Math.min(4 - last.length, prev.length - 5);
      if (shift > 0) {
        lines[lines.length - 2] = prev.slice(0, prev.length - shift);
        lines[lines.length - 1] = prev.slice(prev.length - shift) + last;
      }
    }
  }

  return lines;
};

export const Subtitle: React.FC<Props> = ({ text, speaker }) => {
  if (!text) return null;
  const lines = wrapCJK(text);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: SUBTITLE_SAFE_BOTTOM,
        pointerEvents: 'none',
      }}
    >
      {speaker ? (
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 24,
            letterSpacing: 3,
            color: BRAND.accent,
            marginBottom: 14,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          {speaker}
        </div>
      ) : null}

      <div
        style={{
          fontFamily: FONT_STACK,
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.36,
          letterSpacing: 1.5,
          color: '#fff',
          textAlign: 'center',
          maxWidth: 940,
          textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.95)',
          WebkitTextStroke: '0.6px rgba(0,0,0,0.6)',
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
