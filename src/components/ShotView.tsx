import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BRAND, FONT_STACK } from '../constants';
import { Shot } from '../types';
import { Subtitle } from './Subtitle';

type Props = {
  shot: Shot;
  index: number;
};

/** 单个镜头：素材 + 缓慢推近 + 底部渐变压暗 + 字幕 */
export const ShotView: React.FC<Props> = ({ shot, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const zoom = shot.zoom ?? 0.05;
  const scale = interpolate(frame, [0, durationInFrames], [1, 1 + zoom], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeIn =
    shot.transition === 'fade'
      ? interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 1;

  const fadeOut = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (!shot.file) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#141416',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 96px',
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 26,
            letterSpacing: 6,
            color: BRAND.accent,
            marginBottom: 28,
          }}
        >
          镜头 {String(index + 1).padStart(2, '0')}
        </div>
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 34,
            lineHeight: 1.6,
            color: 'rgba(244,241,234,0.45)',
            textAlign: 'center',
          }}
        >
          素材待生成
          <br />
          public/shots/{shot.id}.mp4
        </div>
        <Subtitle text={shot.text ?? ''} speaker={shot.speaker} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity: fadeIn * fadeOut }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(shot.file)}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* 底部渐变，保证字幕可读 */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 22%, rgba(0,0,0,0) 42%)',
        }}
      />

      <Subtitle text={shot.text ?? ''} speaker={shot.speaker} />
    </AbsoluteFill>
  );
};
