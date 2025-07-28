import React, { useEffect, useState } from 'react';
import MainModal from '../../../Components/MainModal';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';

interface Section {
  Section: string;
  Exercises: Exercise[];
}

interface Exercise {
  Title: string;
  Files: File[];
}

interface File {
  Type: string;
  Content: {
    url: string;
    file_id: string;
  };
  Title?: string;
}

interface VideoData {
  file_id: string;
  base64?: string;
  url?: string;
  title?: string;
  type?: string;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  sections,
}) => {
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!sections || sections.length === 0) return;

      setIsLoading(true);

      // Get all video links from sections
      const allVideoLinks = sections.flatMap((section: Section) => {
        return section.Exercises.flatMap((exercise: Exercise) => {
          return exercise.Files.filter(
            (file: File) =>
              (file.Type === 'link' ||
                file.Type === 'Video' ||
                file.Type?.split('/')[0] === 'image') &&
              (file.Content.url || file.Content.file_id),
          ).map((file: File) => ({
            url: file.Content.url,
            file_id: file.Content.file_id,
            title: file.Title || 'Video',
            type: file.Type,
          }));
        });
      });

      try {
        const videoPromises = allVideoLinks.map(async (video) => {
          if (video.url) {
            return {
              file_id: video.file_id,
              url: video.url,
              title: video.title,
              type: video.type,
            } as VideoData;
          } else if (video.file_id) {
            const res = await Application.showExerciseFille({
              file_id: video.file_id,
            });
            return {
              file_id: video.file_id,
              base64: res.data.base_64_data,
              title: video.title,
              type: video.type,
            } as VideoData;
          }
          return null;
        });

        const videos = await Promise.all(videoPromises);
        const validVideos = videos.filter(
          (video): video is VideoData => video !== null,
        );
        setVideoData(validVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideoData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && sections) {
      fetchVideos();
    }
  }, [isOpen, sections]);

  const getYouTubeEmbedUrl = (url: string) => {
    // Handle different YouTube URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const isYouTubeShorts = (url: string) => {
    return url.includes('/shorts/');
  };

  const handleVideoClick = (file: VideoData) => {
    Application.showExerciseFille({ file_id: file.file_id }).then((res) => {
      const base64Data = res.data.base_64_data;
      const videoUrl = base64Data;

      // Create a temporary anchor element with download attribute
      const downloadLink = document.createElement('a');
      downloadLink.href = videoUrl;
      downloadLink.download = `${file.title || 'video'}.mp4`;
      downloadLink.style.display = 'none';

      // Add to document, click it, and remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  };

  const handleUrlClick = (url: string) => {
    try {
      let cleanUrl = url
        .replace(/^(https?:\/\/)+/, '')
        .replace(/^(https?\/\/)+/, '')
        .replace(/^(https?\/:)+/, '')
        .replace(/^(https?\/\/:)+/, '')
        .replace(/^(https?\/\/\/:)+/, '')
        .replace(/^:+\/?/, '')
        .replace(/^\/+/, '');

      cleanUrl = `https://${cleanUrl}`;
      new URL(cleanUrl);
      window.open(cleanUrl, '_blank');
    } catch (error) {
      console.error('Error processing URL:', error);
    }
  };
  const [indexImage, setIndexImage] = useState(0);
  const VISIBLE_COUNT = 2;

  const lastIndex = Math.max(videoData.length - VISIBLE_COUNT, 0);

  const nextSlide = () => {
    if (indexImage >= lastIndex) {
      setIndexImage(0);
    } else {
      setIndexImage((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (indexImage <= 0) {
      setIndexImage(lastIndex);
    } else {
      setIndexImage((prev) => prev - 1);
    }
  };

  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div
        className={`bg-white rounded-2xl p-4 w-[500px] shadow-800 relative ${
          videoData?.[0]?.type?.split('/')[0] === 'image'
            ? 'h-[260px]'
            : 'h-[500px]'
        }`}
      >
        <div className="w-full flex justify-between items-center border-b border-Gray-50 pb-2">
          <div className="text-sm font-medium">Files & Videos</div>
          <img
            onClick={onClose}
            className="size-6 cursor-pointer"
            src="/icons/close.svg"
            alt="Close"
          />
        </div>

        <div
          className={`overflow-auto ${
            videoData?.[0]?.type?.split('/')[0] === 'image'
              ? 'mt-8'
              : 'h-[400px] mt-4'
          }`}
        >
          {isLoading ? (
            <div className="w-full h-[200px] flex justify-center items-center">
              <Circleloader />
            </div>
          ) : videoData.length === 0 ? (
            <div className="w-full h-[200px] flex justify-center items-center text-Text-Secondary">
              No files or videos available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {videoData?.[0]?.type?.split('/')[0] === 'image' ? (
                <div className="w-full flex justify-center items-center gap-4">
                  <button onClick={prevSlide} disabled={indexImage === 0}>
                    <img src="/icons/chevron-left.svg" alt="prev" />
                  </button>

                  <div className="flex w-full overflow-hidden justify-start items-center">
                    <div
                      className="flex transition-transform duration-300 ease-in-out gap-2"
                      style={{
                        transform: `translateX(-${indexImage * (120 + 8)}px)`,
                      }}
                    >
                      {videoData.map((src, i) => (
                        <div
                          key={i}
                          className="flex-shrink-0 w-[120px] h-[114px] overflow-hidden rounded-xl"
                        >
                          <img
                            src={src.url}
                            alt={`Slide ${i}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={nextSlide}
                    disabled={indexImage >= lastIndex}
                  >
                    <img src="/icons/chevron-right.svg" alt="next" />
                  </button>
                </div>
              ) : (
                <>
                  {videoData.map((video, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-Gray-50 p-3 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium">{video.title}</div>
                        <div className="flex gap-2">
                          {video.url ? (
                            <button
                              onClick={() => handleUrlClick(video.url!)}
                              className="text-xs text-Primary-DeepTeal hover:underline"
                            >
                              Open Link
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVideoClick(video)}
                              className="text-xs text-Primary-DeepTeal hover:underline"
                            >
                              Download Video
                            </button>
                          )}
                        </div>
                      </div>

                      {video.url ? (
                        isYouTubeShorts(video.url) ? (
                          <div className="rounded-xl h-[150px] w-full border border-Gray-50 flex flex-col items-center justify-center p-4">
                            <img
                              src="/icons/video-preview.svg"
                              className="size-12 mb-4"
                              alt="Video"
                            />
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm font-medium"
                            >
                              Watch on YouTube
                            </a>
                          </div>
                        ) : (
                          <iframe
                            className="rounded-xl h-[150px] w-full border border-Gray-50"
                            src={getYouTubeEmbedUrl(video.url)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )
                      ) : (
                        <div className="rounded-xl h-[150px] w-full border border-Gray-50 flex flex-col items-center justify-center p-4">
                          <img
                            src="/icons/video-preview.svg"
                            className="size-12 mb-4"
                            alt="Video"
                          />
                          <div className="text-xs text-Text-Secondary text-center">
                            Click "Download" to save this video to your device
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div
          onClick={onClose}
          className="absolute right-4 bottom-4 text-sm font-medium text-[#909090] cursor-pointer"
        >
          Close
        </div>
      </div>
    </MainModal>
  );
};

export default FilePreviewModal;
