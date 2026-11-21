#!/usr/bin/env node
/**
 * 交付编码：音量归一 + 平台规格 + faststart
 *
 * 用法：
 *   node scripts/assemble.mjs out/video.mp4 out/final.mp4
 *   node scripts/assemble.mjs out/video.mp4 out/final.mp4 --nvenc   # 本机 5060 用这个，快 3-5 倍
 *   node scripts/assemble.mjs out/video.mp4 out/final.mp4 --lufs -16 --crf 18
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const input = args[0];
const output = args[1];

if (!input || !output) {
  console.error('用法: node scripts/assemble.mjs <输入> <输出> [--nvenc] [--lufs -16] [--crf 18]');
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`[assemble] 找不到输入文件：${input}`);
  process.exit(1);
}

try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('[assemble] 未找到 ffmpeg。Windows 装 gyan.dev 的 full 版并加入 PATH。');
  process.exit(1);
}

const useNvenc = args.includes('--nvenc');
const lufs = flag('--lufs', '-16');
const crf = flag('--crf', '18');

// 没音轨的片子（纯画面 demo）不能套 loudnorm，会直接报错
const hasAudio = (() => {
  try {
    const out = execFileSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_type', '-of', 'csv,p=0'],
      { encoding: 'utf8' },
    );
    return out.trim().startsWith('audio');
  } catch {
    return false;
  }
})();
if (!hasAudio) console.warn('[assemble] 输入没有音轨，跳过音量归一');

const videoCodec = useNvenc
  ? ['-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '19', '-b:v', '6M']
  : ['-c:v', 'libx264', '-preset', 'slow', '-crf', crf];

const ffmpegArgs = [
  '-y',
  '-i',
  input,
  '-map',
  '0:v:0',
];

if (hasAudio) {
  ffmpegArgs.push('-map', '0:a:0', '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11`);
}

ffmpegArgs.push(
  ...videoCodec,
  '-profile:v',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
);

if (hasAudio) {
  ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k', '-ar', '48000');
}

ffmpegArgs.push(output);

console.info(`[assemble] ${useNvenc ? 'NVENC 硬编' : 'x264 软编'}，音量 ${lufs} LUFS`);
execFileSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });

const size = (fs.statSync(output).size / 1024 / 1024).toFixed(1);
console.info(`[assemble] 完成：${output}（${size} MB）`);
