import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { BRAND, FONT_STACK } from '../constants';

type Props = {
  teaser?: string;
  series: string;
  episode: string;
};

/** 片尾：下集预告 + 追更提示 */
export const Outro: React.FC<Props> = ({ teaser, series, episode }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [0, 24], [32, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.bg,
        backgroundImage:
          'radial-gradient(circle at 50% 30%, rgba(200,160,106,0.14) 0%, rgba(11,11,12,0) 60%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 96px',
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACK,
          fontSize: 28,
          letterSpacing: 8,
          color: BRAND.accent,
          opacity: fadeIn,
          marginBottom: 40,
        }}
      >
        下集预告
      </div>

      <div
        style={{
          fontFamily: FONT_STACK,
          fontSize: 60,
          fontWeight: 700,
          lineHeight: 1.5,
          color: BRAND.fg,
          textAlign: 'center',
          opacity: fadeIn,
          transform: `translateY(${y}px)`,
          maxWidth: 860,
        }}
      >
        {teaser ?? '未完待续'}
      </div>

      <div
        style={{
          marginTop: 96,
          fontFamily: FONT_STACK,
          fontSize: 30,
          letterSpacing: 4,
          color: BRAND.dim,
          opacity: interpolate(frame, [24, 44], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        关注 · 追更
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 120,
          fontFamily: FONT_STACK,
          fontSize: 24,
          letterSpacing: 4,
          color: 'rgba(244,241,234,0.35)',
        }}
      >
        {series} · {episode}
      </div>
    </AbsoluteFill>
  );
};
