export type Transition = 'cut' | 'fade';

export type Shot = {
  /** 镜号，用来对应素材文件名 */
  id: string;
  /** 视频文件路径，相对 public 目录；留空则渲染占位卡片 */
  file?: string;
  /** 字幕 / 台词 */
  text?: string;
  /** 说话人，用于打角色标签 */
  speaker?: string;
  /** 时长（帧）。生成脚本可用 ffprobe 自动补齐 */
  durationInFrames?: number;
  /** 转场方式 */
  transition?: Transition;
  /** 推近幅度，0.05 = 5% 缓慢推近 */
  zoom?: number;
};

export type DramaProps = {
  series: string;
  title: string;
  episode: string;
  /** 0-3 秒的钩子文案，显示在片头 */
  hook?: string;
  /** 片尾下集预告 */
  nextTeaser?: string;
  /** 背景音乐，相对 public 目录，如 audio/bgm.mp3，留空则不加 */
  bgm?: string;
  introSeconds: number;
  outroSeconds: number;
  shots: Shot[];
};

export const DEFAULT_SHOT_FRAMES = 90;
