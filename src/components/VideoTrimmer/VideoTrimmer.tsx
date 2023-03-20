import { useEffect, useState } from 'react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import {
  TrimmedVideoDuration,
  validateTimeByName,
  getTimeDiffInSeconds,
  ffmpegModule,
} from 'utils';
import './VideoTrimmer.css';

const VideoTrimmer = ({ video, videoUrl }: { video: File | null; videoUrl: string }) => {
  const { ffmpeg } = ffmpegModule;

  const [videoSrc, setVideoSrc] = useState('');
  const [message, setMessage] = useState('Click Start to transcode');
  const [trimmedVideoDuration, setTrimmedVideoDuration] = useState<TrimmedVideoDuration>({
    startHour: '',
    startMin: '',
    startSec: '',
    endHour: '',
    endMin: '',
    endSec: '',
  });

  useEffect(() => {
    if (!ffmpeg.isLoaded) {
      ffmpegModule.load();
    }

    return () => ffmpeg.exit();
  }, [ffmpeg]);

  const doTranscode = async () => {
    const duration = getTimeDiffInSeconds(trimmedVideoDuration);

    if (Number(duration) < 0) {
      setMessage('종료 시간이 시작 시간보다 작습니다.');
      return;
    }

    setMessage('Start transcoding');
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(video as File));

    await ffmpeg.run(
      '-ss',
      `${trimmedVideoDuration.startHour || 0}:${trimmedVideoDuration.startMin || 0}:${
        trimmedVideoDuration.startSec || 0
      }`,
      '-i',
      'input.mp4',
      '-t',
      String(duration),
      '-c',
      'copy',
      'output.mp4'
    );
    setMessage('Complete transcoding');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
  };

  const onChangeDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setTrimmedVideoDuration((prev) => ({
      ...prev,
      [name]: Number(validateTimeByName(name, value)),
    }));
  };

  return (
    <section className='video-trimmer'>
      {video ? (
        <div className='trimmer-wrapper'>
          <div className='timmer-original-video'>
            <video
              style={{ width: '1280px', height: '720px' }}
              className='original-video'
              src={videoUrl}
              controls
              crossOrigin=''
            ></video>
            <div className='duration-inputs'>
              <div className='start-times times'>
                <input
                  name='startHour'
                  className='start-hour'
                  value={trimmedVideoDuration.startHour}
                  placeholder='시'
                  onChange={onChangeDuration}
                />
                <div>:</div>
                <input
                  name='startMin'
                  className='start-min'
                  value={trimmedVideoDuration.startMin}
                  placeholder='분'
                  onChange={onChangeDuration}
                />
                <div>:</div>
                <input
                  name='startSec'
                  className='start-sec'
                  value={trimmedVideoDuration.startSec}
                  placeholder='초'
                  onChange={onChangeDuration}
                />
              </div>
              <div>~</div>
              <div className='end-times times'>
                <input
                  name='endHour'
                  className='end-hour'
                  value={trimmedVideoDuration.endHour}
                  placeholder='시'
                  onChange={onChangeDuration}
                />
                <div>:</div>
                <input
                  name='endMin'
                  className='end-min'
                  value={trimmedVideoDuration.endMin}
                  placeholder='분'
                  onChange={onChangeDuration}
                />
                <div>:</div>
                <input
                  name='endSec'
                  className='end-sec'
                  value={trimmedVideoDuration.endSec}
                  placeholder='초'
                  onChange={onChangeDuration}
                />
              </div>
            </div>
            <button className='trim-button' onClick={doTranscode}>
              자르기
            </button>
            <p>{message}</p>
          </div>
          {videoSrc && (
            <div className='preview-wrapper'>
              <h4>미리보기</h4>
              <video
                style={{ width: '1280px', height: '720px' }}
                src={videoSrc}
                controls
                crossOrigin=''
                className='preview-video'
              ></video>
            </div>
          )}
        </div>
      ) : (
        '비디오를 업로드해주세요'
      )}
    </section>
  );
};

export default VideoTrimmer;
