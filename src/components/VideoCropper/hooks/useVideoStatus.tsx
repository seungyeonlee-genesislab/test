import { useState, RefObject } from 'react';

const useVideoStatus = (videoRef: RefObject<HTMLVideoElement> | null) => {
  const [isVideoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const onPlayOrPause = () => {
    const video = videoRef?.current;

    if (video) {
      setVideoPlaying(video.paused);
      video.paused ? video.play() : video.pause();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef?.current?.currentTime || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef?.current?.duration || 0);
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLProgressElement, MouseEvent>) => {
    if (videoRef?.current) {
      const { clientX } = event;
      const { left, width } = event.currentTarget.getBoundingClientRect();
      const percentage = (clientX - left) / width;
      const time = duration * percentage;
      videoRef.current.currentTime = time || 0;
    }
  };

  return {
    isVideoPlaying,
    currentTime,
    duration,
    onPlayOrPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgressClick,
  };
};

export default useVideoStatus;
