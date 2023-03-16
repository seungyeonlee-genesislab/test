import { useState } from 'react';
import { VideoCropper, VideoTrimmer } from './components';
import './App.css';

const TabIds = {
  VIDEO_CROPPER: 1,
  VIDEO_TRIMMER: 2,
} as const;

type TabIdTypes = typeof TabIds[keyof typeof TabIds];

const tabs: { id: TabIdTypes; label: string }[] = [
  {
    id: TabIds.VIDEO_CROPPER,
    label: '비디오 영역 자르기',
  },
  {
    id: TabIds.VIDEO_TRIMMER,
    label: '비디오 구간 자르기',
  },
];

const tabViews: { id: TabIdTypes; component: (props: any) => JSX.Element }[] = [
  { id: TabIds.VIDEO_CROPPER, component: (props: any) => <VideoCropper {...props} /> },
  { id: TabIds.VIDEO_TRIMMER, component: (props: any) => <VideoTrimmer {...props} /> },
];

function App() {
  const [video, setVideo] = useState<File | null>(null);
  const [tabId, setTabId] = useState<TabIdTypes>(TabIds.VIDEO_CROPPER);

  const onChangeVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideo(file as File);
  };

  return (
    <div className='App'>
      <input className='file-input' type='file' onChange={onChangeVideo} accept='video/*' />
      <section className='tab-view'>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setTabId(tab.id)}
            className={`tab ${tabId === tab.id ? 'selected' : ''}`}
          >
            <h3>{tab.label}</h3>
          </div>
        ))}
      </section>
      <section>
        {tabViews.map((tabView) => {
          const Component = tabView.component;
          return (
            tabId === tabView.id && (
              <Component
                key={tabView.id}
                video={video}
                videoUrl={video ? window.URL.createObjectURL(video) : ''}
              />
            )
          );
        })}
      </section>
    </div>
  );
}

export default App;
