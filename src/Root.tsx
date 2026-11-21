import React from 'react';
import { Composition, CalculateMetadataFunction } from 'remotion';
import { Drama } from './Drama';
import { DramaProps, DEFAULT_SHOT_FRAMES } from './types';
import { FPS, WIDTH, HEIGHT } from './constants';

/**
 * 演示用分镜：file 留空时会渲染占位卡片，所以这个仓 clone 下来立刻能出片。
 * 真实项目由 scripts/build-props.mjs 从 shots.json 生成 props.json 覆盖。
 */
const demoProps: DramaProps = {
  series: '未命名短剧',
  title: '第 01 集',
  episode: 'EP01',
  hook: '她收到了三年前自己寄出的那封信。',
  nextTeaser: '下集：信里写的那个人，还活着。',
  bgm: '',
  introSeconds: 3,
  outroSeconds: 4,
  shots: [
    { id: 's01', text: '这封信，是我三年前写给自己的。', durationInFrames: 90 },
    { id: 's02', text: '邮戳上的日期，是我离开南京的那天。', durationInFrames: 90 },
    { id: 's03', text: '我以为我早就忘了。', durationInFrames: 75 },
    { id: 's04', text: '可信封背面有一行字，不是我的笔迹。', durationInFrames: 105 },
    { id: 's05', text: '“如果你看到这封信，说明他已经回来了。”', durationInFrames: 120 },
  ],
};

const calculateMetadata: CalculateMetadataFunction<DramaProps> = ({ props }) => {
  const introFrames = Math.max(1, Math.round((props.introSeconds ?? 3) * FPS));
  const outroFrames = Math.max(1, Math.round((props.outroSeconds ?? 4) * FPS));
  const shotFrames = props.shots.reduce(
    (total, shot) => total + (shot.durationInFrames ?? DEFAULT_SHOT_FRAMES),
    0,
  );

  return {
    durationInFrames: introFrames + shotFrames + outroFrames,
    props,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShortDrama"
      component={Drama}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={demoProps}
      calculateMetadata={calculateMetadata}
    />
  );
};
