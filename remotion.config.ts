import { Config } from '@remotion/cli/config';

// 逐帧截图用 jpeg，速度比 png 快很多，画质对视频无感差异
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
