#!/usr/bin/env node
/**
 * 分镜表 → Remotion props
 *
 * 用法：
 *   node scripts/build-props.mjs --shots contents/shots.json --out props.json
 *   node scripts/build-props.mjs --strict        # 素材缺一个就直接失败
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FPS = 30;
const args = process.argv.slice(2);

const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const shotsPath = flag('--shots', 'contents/shots.json');
const outPath = flag('--out', 'props.json');
const publicDir = flag('--public', 'public');
const defaultFrames = Number(flag('--default-frames', '90'));
const strict = args.includes('--strict');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const probeDuration = (absPath) => {
  try {
    const json = execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', absPath],
      { encoding: 'utf8' },
    );
    const seconds = JSON.parse(json)?.format?.duration;
    return Number(seconds) || null;
  } catch {
    return null;
  }
};

if (!fs.existsSync(shotsPath)) {
  console.error(`[build-props] 找不到分镜表：${shotsPath}`);
  process.exit(1);
}

const project = readJson(shotsPath);
const shots = Array.isArray(project.shots) ? project.shots : [];
if (shots.length === 0) {
  console.error('[build-props] 分镜表里 shots 为空');
  process.exit(1);
}

let hasFfprobe = true;
try {
  execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
} catch {
  hasFfprobe = false;
}

const missing = [];
const rows = [];

const resolvedShots = shots.map((shot, index) => {
  const id = shot.id ?? `s${String(index + 1).padStart(2, '0')}`;
  const rel = shot.file ?? `shots/${id}.mp4`;
  const abs = path.join(publicDir, rel);

  let durationInFrames = shot.durationInFrames;

  if (!fs.existsSync(abs)) {
    missing.push(rel);
  } else if (!durationInFrames) {
    const seconds = hasFfprobe ? probeDuration(abs) : null;
    durationInFrames = seconds
      ? Math.max(30, Math.min(900, Math.round(seconds * FPS)))
      : defaultFrames;
  }

  if (!durationInFrames) durationInFrames = defaultFrames;

  rows.push({
    id,
    文件: fs.existsSync(abs) ? rel : `${rel}（缺失，渲染占位）`,
    帧数: durationInFrames,
    秒: (durationInFrames / FPS).toFixed(2),
  });

  return {
    id,
    file: fs.existsSync(abs) ? rel : '',
    text: shot.text ?? '',
    speaker: shot.speaker ?? undefined,
    durationInFrames,
    transition: shot.transition ?? 'cut',
    zoom: shot.zoom ?? 0.05,
  };
});

const props = {
  series: project.series ?? '未命名短剧',
  title: project.title ?? '第 01 集',
  episode: project.episode ?? 'EP01',
  hook: project.hook ?? '',
  nextTeaser: project.nextTeaser ?? '',
  bgm: project.bgm ?? '',
  introSeconds: Number(project.introSeconds ?? 3),
  outroSeconds: Number(project.outroSeconds ?? 4),
  shots: resolvedShots,
};

fs.writeFileSync(outPath, JSON.stringify(props, null, 2), 'utf8');

console.info(`[build-props] 写出 ${outPath}`);
console.table(rows);
const total = resolvedShots.reduce((sum, s) => sum + s.durationInFrames, 0);
console.info(
  `[build-props] 镜头 ${resolvedShots.length} 个，总时长 ${(total / FPS).toFixed(2)} 秒（不含片头片尾）`,
);
if (!hasFfprobe) console.warn('[build-props] 未找到 ffprobe，缺失时长的镜头已用默认帧数');
if (missing.length) {
  console.warn(`[build-props] ${missing.length} 个素材缺失：${missing.join(', ')}`);
  if (strict) process.exit(2);
}
