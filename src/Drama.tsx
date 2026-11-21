import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { DramaProps, DEFAULT_SHOT_FRAMES } from './types';
import { FPS } from './constants';
import { Intro } from './components/Intro';
import { Outro } from './components/Outro';
import { ShotView } from './components/ShotView';

export const Drama: React.FC<DramaProps> = ({
  series,
  title,
  episode,
  hook,
  nextTeaser,
  bgm,
  introSeconds,
  outroSeconds,
  shots,
}) => {
  const introFrames = Math.max(1, Math.round(introSeconds * FPS));
  const outroFrames = Math.max(1, Math.round(outroSeconds * FPS));

  // 时间轴在这里一次算完，每帧重新计算的结果必须完全一致
  let cursor = introFrames;
  const timeline = shots.map((shot) => {
    const durationInFrames = shot.durationInFrames ?? DEFAULT_SHOT_FRAMES;
    const from = cursor;
    cursor += durationInFrames;
    return { shot, from, durationInFrames };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={introFrames} name="片头">
        <Intro series={series} title={title} episode={episode} hook={hook} />
      </Sequence>

      {timeline.map(({ shot, from, durationInFrames }, index) => (
        <Sequence
          key={shot.id}
          from={from}
          durationInFrames={durationInFrames}
          name={`镜头 ${String(index + 1).padStart(2, '0')}`}
        >
          <ShotView shot={shot} index={index} />
        </Sequence>
      ))}

      <Sequence from={cursor} durationInFrames={outroFrames} name="片尾">
        <Outro teaser={nextTeaser} series={series} episode={episode} />
      </Sequence>

      {bgm ? <Audio src={staticFile(bgm)} volume={0.18} loop /> : null}
    </AbsoluteFill>
  );
};
