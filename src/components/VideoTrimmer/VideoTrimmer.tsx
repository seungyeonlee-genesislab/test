import { useEffect, useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './VideoTrimmer.css';

interface TrimmedVideoDuration {
  startHour: number | '';
  startMin: number | '';
  startSec: number | '';
  endHour: number | '';
  endMin: number | '';
  endSec: number | '';
}

const validateAndTimes = (name: string, value: string): string => {
  const nameRegex = /(Min|Sec)/;
  const valueRegex = /^([0-5]?\d)$/;

  if (nameRegex.test(name)) {
    return valueRegex.test(value) ? value : '0';
  }
  return value;
};

const getTimeDiffInSeconds = (trimmedVideoDuration: TrimmedVideoDuration): number => {
  const { startHour, startMin, startSec, endHour, endMin, endSec } = trimmedVideoDuration;
  const startSeconds =
    parseInt(String(startHour || 0)) * 3600 +
    parseInt(String(startMin || 0)) * 60 +
    parseInt(String(startSec || 0));
  const endSeconds =
    parseInt(String(endHour || 0)) * 3600 +
    parseInt(String(endMin || 0)) * 60 +
    parseInt(String(endSec || 0));

  return endSeconds - startSeconds;
};

// TODO: class로 빼기
const ffmpeg = createFFmpeg({
  log: true,
  progress: (p) => console.log(p),
});

const loadFFMPEG = async () => {
  await ffmpeg.load();
};

const VideoTrimmer = ({ video, videoUrl }: { video: File | null; videoUrl: string }) => {
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
    loadFFMPEG();
  }, []);

  const doTranscode = async () => {
    const duration = getTimeDiffInSeconds(trimmedVideoDuration);

    if (duration < 0) {
      setMessage('종료 시간이 시작 시간보다 작습니다.');
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

    setTrimmedVideoDuration((prev) => ({ ...prev, [name]: Number(validateAndTimes(name, value)) }));
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
