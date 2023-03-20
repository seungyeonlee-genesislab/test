import { createFFmpeg } from '@ffmpeg/ffmpeg';

const FFMPEG_CORE_CDN_PATH = 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js';

class FFMpegModule {
  ffmpeg = createFFmpeg({
    log: true,
    progress: (p) => console.log(p),
    corePath: FFMPEG_CORE_CDN_PATH,
  });

  async load() {
    await this.ffmpeg.load();
  }
}

const ffmpegModule = new FFMpegModule();

export default ffmpegModule;
