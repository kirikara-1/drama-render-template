# 短剧渲染模板仓（公开）

这是「Trae 当导演 + 本机 GPU 出镜头 + GitHub Actions 出成片」里的**渲染层**。仓里只有代码和版式，**不含任何剧本、台词、人脸素材**，所以可以放心设成公开仓蹭免费的 Actions 额度。

## 它负责什么

- 片头（系列名 / 标题 / 钩子文案，3 秒）
- 逐镜头拼接（素材来自 `public/shots/`，缺失时渲染占位卡片）
- 逐句字幕（1080×1920 竖屏、底部安全区 260px）
- 片尾（下集预告 + 追更 CTA）
- 背景音乐混入（`bgm` 字段一填就生效）

它**不负责**生成画面。画面由本机 ComfyUI + Wan 2.2 5B 出，或云端 Seedance 出。

## 本地跑

```bash
npm install
node scripts/build-props.mjs          # 生成 props.json（会自动 ffprobe 量镜头时长）
npx remotion studio                   # 打开预览，改字幕/版式实时看
npx remotion render ShortDrama out/video.mp4 --props=props.json
node scripts/assemble.mjs out/video.mp4 out/final.mp4 --nvenc
```

没装 ffmpeg 也能跑前两步（会退回默认 90 帧/镜头并给出警告）。

## 在 Actions 上跑

1. 推到 GitHub，仓库设为 Public
2. Settings → Secrets and variables → Actions 加两个 secret：
   - `ASSET_REPO`：私有素材仓的 `owner/repo`
   - `ASSET_TOKEN`：fine-grained PAT，只勾「Contents: Read」对私有仓的权限
3. Actions → render → Run workflow，填 `release_tag`（如 `assets-ep01`）
4. 跑完在 Artifact 里下 `final.mp4`

工作流会先用 `gh release download` 拉镜头，再用 `gh api` 拉私有仓的 `shots.json`，然后渲染、编码、上传。

## 目录

```
src/
  Root.tsx            Composition 注册 + 时长自动计算
  Drama.tsx           时间轴：片头 → 镜头序列 → 片尾
  components/
    Intro.tsx         片头
    Outro.tsx         片尾
    ShotView.tsx      单镜头：素材 + 推近 + 底部渐变压暗 + 字幕
    Subtitle.tsx      中文断行 + 字幕样式
scripts/
  build-props.mjs     分镜表 → props.json（含 ffprobe 时长探测）
  assemble.mjs        loudnorm + NVENC/x264 + faststart
contents/shots.json   示例分镜（公开仓里请勿放真实台词）
```

## 字体

`constants.ts` 里用的是字体栈，会依次找源黑体 / Noto Sans CJK / 微软雅黑 / 苹方。生产环境想统一字形，把免费商用的 **思源黑体** 放 `public/fonts/`，在 `src/index.ts` 里用 `@remotion/fonts` 的 `loadFont` 加载即可。

## 注意

- **Remotion 不是开源软件**：个人和 3 人以下公司免费，4 人以上商用要买授权。
- Actions 上别用 Bun 跑渲染，会卡在最后拼装阶段，用 Node。
- 单 job 有 6 小时上限；90 秒片子用 4 并发大约几分钟，远够。
