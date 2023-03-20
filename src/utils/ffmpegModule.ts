import { createFFmpeg } from '@ffmpeg/ffmpeg';

class FFMpegModule {
  ffmpeg = createFFmpeg({
    log: true,
    progress: (p) => console.log(p),
  });

  async load() {
    await this.ffmpeg.load();
  }
}

const ffmpegModule = new FFMpegModule();

export default ffmpegModule;
