import { useRef, useState } from 'react';
import * as cv from '@techstark/opencv-js';
import ReactCrop, { Crop } from 'react-image-crop';
import { useVideoStatus } from './hooks';
import { secondsToTime } from 'utils';
import 'react-image-crop/dist/ReactCrop.css';
import './VideoCropper.css';

const DEFAULT_WIDTH_PER_HEIGHT_RATIO = 9 / 12;
const DEFAULT_HEIGHT = 720;
const DEFUALT_WIDTH = DEFAULT_HEIGHT * DEFAULT_WIDTH_PER_HEIGHT_RATIO;

const VideoCropper = ({ video, videoUrl }: { video: File | null; videoUrl: string }) => {
  const [crop, setCrop] = useState<Crop>({
    width: DEFUALT_WIDTH,
    height: DEFAULT_HEIGHT,
    unit: 'px',
    x: 0,
    y: 0,
  });
  const [cropped, setCropped] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const editedVideoRef = useRef<HTMLVideoElement>(null);

  const {
    isVideoPlaying: isOriginalVideoPlaying,
    currentTime: originalVideoCurrentTime,
    duration: originalVideoDuration,
    onPlayOrPause: onPlayOrPauseOriginalVideo,
    handleTimeUpdate: handleTimeUpdateOriginalVideo,
    handleLoadedMetadata: handleLoadedMetadataOriginalVideo,
    handleProgressClick: handleProgressClickOriginalVideo,
  } = useVideoStatus(originalVideoRef);

  const {
    isVideoPlaying: isEditedVideoPlaying,
    currentTime: editedVideoCurrentTime,
    duration: editedVideoDuration,
    onPlayOrPause: onPlayOrPauseEditedVideo,
    handleTimeUpdate: handleTimeUpdateEditedVideo,
    handleLoadedMetadata: handleLoadedMetadataEditedVideo,
    handleProgressClick: handleProgressClickEditedVideo,
  } = useVideoStatus(editedVideoRef);

  const draw = () => {
    const video = editedVideoRef?.current;
    const canvas = canvasRef?.current;
    setCropped(true);

    if (!video || !canvas) {
      return;
    }

    video.height = video.videoHeight;
    video.width = video.videoWidth;

    const context = canvasRef.current.getContext('2d');
    const cap = new cv.VideoCapture(video);
    const mat = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(mat);

    const cropMat = mat.roi(new cv.Rect(crop.x, crop.y, crop.width, crop.height));

    cv.imshow(canvas, cropMat);
    context?.drawImage(canvas, 0, 0, crop.width, crop.height);

    // cap.delete();
    mat.delete();
    cropMat.delete();

    requestAnimationFrame(draw);
  };

  const onChangeCrop = (p: Crop) => {
    setCrop(p);
  };

  return (
    <section className='video-cropper'>
      {video ? (
        <div className='video-container'>
          <div className='video-size-input'>
            <div className='input-item'>
              <label id='width'>비디오 가로 길이:</label>
              <input
                id='width'
                name='width'
                placeholder='비디오 가로 길이'
                value={crop.width}
                onChange={() => {}}
              />
            </div>
            <div className='input-item'>
              <label id='height'>비디오 세로 길이:</label>
              <input
                name='height'
                placeholder='비디오 세로 길이'
                value={crop.height}
                onChange={() => {}}
              />
            </div>
          </div>
          <ReactCrop crop={crop} onChange={onChangeCrop}>
            <video
              className='video'
              ref={originalVideoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdateOriginalVideo}
              onLoadedMetadata={handleLoadedMetadataOriginalVideo}
              crossOrigin=''
            />
          </ReactCrop>
          <div className='controller'>
            <progress
              className='progress'
              value={originalVideoCurrentTime}
              max={originalVideoDuration}
              onClick={handleProgressClickOriginalVideo}
            />
            <div className='controls'>
              <button className='play-button' onClick={onPlayOrPauseOriginalVideo}>
                {isOriginalVideoPlaying ? 'Pause' : 'Play'}
              </button>
              <div className='times'>
                <span>{`${secondsToTime(originalVideoCurrentTime)} / ${secondsToTime(
                  originalVideoDuration
                )}`}</span>
              </div>
            </div>
          </div>
          <button onClick={draw} style={{ marginBottom: '20px' }}>
            crop
          </button>
          <h4>미리보기</h4>
          <div className='edited-video-container' style={{ display: !cropped ? 'none' : 'block' }}>
            <video
              style={{ display: 'none' }}
              className='video'
              ref={editedVideoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdateEditedVideo}
              onLoadedMetadata={handleLoadedMetadataEditedVideo}
              controls={false}
              crossOrigin=''
            />
            <canvas ref={canvasRef} width='1280' height='720' />
            <div className='controller'>
              <progress
                className='progress'
                value={editedVideoCurrentTime}
                max={editedVideoDuration}
                onClick={handleProgressClickEditedVideo}
              />
              <div className='controls'>
                <button className='play-button' onClick={onPlayOrPauseEditedVideo}>
                  {isEditedVideoPlaying ? 'Pause' : 'Play'}
                </button>
                <div className='times'>
                  <span>{`${secondsToTime(editedVideoCurrentTime)} / ${secondsToTime(
                    editedVideoDuration
                  )}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        '비디오를 업로드해주세요'
      )}
    </section>
  );
};

export default VideoCropper;
