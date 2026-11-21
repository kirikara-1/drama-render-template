import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, FONT_STACK } from '../constants';

type Props = {
  series: string;
  title: string;
  episode: string;
  hook?: string;
};

/** 片头：系列名 → 主标题 → 钩子文案，末 8 帧淡出 */
export const Intro: React.FC<Props> = ({ series, title, episode, hook }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const seriesOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const seriesY = interpolate(frame, [0, 18], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const titleOpacity = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [8, 30], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const lineWidth = interpolate(frame, [16, 36], [0, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const hookOpacity = interpolate(frame, [30, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hookY = interpolate(frame, [30, 50], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.bg,
        backgroundImage:
          'radial-gradient(circle at 50% 38%, rgba(200,160,106,0.16) 0%, rgba(11,11,12,0) 62%)',
        opacity: fadeOut,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 96px',
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACK,
          fontSize: 30,
          letterSpacing: 10,
          color: BRAND.dim,
          opacity: seriesOpacity,
          transform: `translateY(${seriesY}px)`,
          marginBottom: 34,
        }}
      >
        {series}
      </div>

      <div
        style={{
          fontFamily: FONT_STACK,
          fontSize: 108,
          fontWeight: 800,
          letterSpacing: 6,
          color: BRAND.fg,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>

      <div
        style={{
          height: 2,
          width: lineWidth,
          backgroundColor: BRAND.accent,
          margin: '44px 0 44px',
          opacity: titleOpacity,
        }}
      />

      <div
        style={{
          fontFamily: FONT_STACK,
          fontSize: 38,
          lineHeight: 1.6,
          color: BRAND.dim,
          opacity: hookOpacity,
          transform: `translateY(${hookY}px)`,
          textAlign: 'center',
          maxWidth: 820,
        }}
      >
        {hook ?? ''}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 120,
          right: 96,
          fontFamily: FONT_STACK,
          fontSize: 26,
          letterSpacing: 6,
          color: BRAND.accent,
          opacity: seriesOpacity,
        }}
      >
        {episode}
      </div>
    </AbsoluteFill>
  );
};
