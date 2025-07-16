/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { Exercise, Tasks } from '../tasks.interface';

const BoxActivity: FC<Tasks> = ({ activities }) => {
  const [selectIndexTitle, setSelectIndexTitle] = useState<{
    index: number | null;
    title: string | null;
  }>({
    index: null,
    title: null,
  });
  const [selectData, setSelectData] = useState<Exercise | null>(null);
  const [videoData, setVideoData] = useState<
    { file_id: string; base64: string; url?: string }[]
  >([]);
  const getYouTubeEmbedUrl = (url: string) => {
    const standardOrShortsRegExp =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/;

    const match = url.match(standardOrShortsRegExp);

    if (match && match[1]) {
      // For standard videos and shorts, use the /embed/ path
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };
  useEffect(() => {
    const fetchVideos = async () => {
      if (selectData && selectData.Files.length > 0) {
        const videoFiles = selectData.Files.filter(
          (file) => file.Type === 'Video' || file.Type === 'link',
        );

        const videoPromises = videoFiles.map((file) => {
          if (file.Type === 'Video') {
            return Promise.resolve({
              file_id: file.Content.file_id,
              url: file.Content.url,
              base64: '',
            });
          } else if (file.Type === 'link') {
            return Promise.resolve({
              file_id: file.Content.file_id,
              url: file.Content.url,
              base64: '',
            });
          }
        });

        const videos = await Promise.all(videoPromises);
        setVideoData(
          videos as { file_id: string; base64: string; url?: string }[],
        );
      }
    };

    if (selectIndexTitle.index) {
      fetchVideos();
    }
  }, [selectIndexTitle.index, selectData]);
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-5">
      {activities.Sections.map((activity, index) => {
        return (
          <div className="flex-col flex" key={index}>
            <div className="text-xs font-medium text-Text-Primary mb-2">
              {activity.Section}
            </div>
            <div className="flex flex-col gap-1">
              {activity.Exercises.map((superset, index) => {
                console.log(superset);
                return (
                  <>
                    <div
                      onClick={() => {
                        if (selectIndexTitle.index === index + 1) {
                          setSelectIndexTitle({
                            index: null,
                            title: null,
                          });
                          setSelectData(null);
                          setVideoData([]);
                        } else {
                          setSelectIndexTitle({
                            index: index + 1,
                            title: activity.Section,
                          });
                          setSelectData(superset);
                        }
                      }}
                      className="flex items-center justify-between border border-Gray-50 rounded-2xl px-3 py-2 bg-white cursor-pointer"
                      key={index}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={superset?.Files[0]?.Content.url}
                          alt=""
                          className="w-[32px] h-[32px] rounded-xl object-cover"
                        />
                        <div className="text-Text-Primary text-xs font-medium">
                          {superset.Title}
                        </div>
                      </div>
                      {superset.Status ? (
                        <img src="/icons/done-enable.svg" alt="" />
                      ) : (
                        <img src="/icons/done-disable.svg" alt="" />
                      )}
                    </div>
                    {selectIndexTitle.index === index + 1 &&
                    selectIndexTitle.title === activity.Section ? (
                      <>
                        {videoData.map((video) =>
                          video.url ? (
                            <iframe
                              key={video.file_id}
                              className="rounded-xl h-[200px] w-[370px] border border-Gray-50"
                              src={getYouTubeEmbedUrl(video.url)}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              key={video.file_id}
                              className="rounded-xl h-[200px] w-[370px] border border-Gray-50 object-contain"
                              controls
                              src={video.base64}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ),
                        )}
                        <div className="flex items-center gap-14 ml-7 mt-3">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-Text-Quadruple text-xs">
                              Sets
                            </div>
                            <div className="text-Text-Primary text-sm font-medium">
                              01
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-Text-Quadruple text-xs">
                              Weight
                            </div>
                            <div className="text-Text-Primary text-sm font-medium">
                              50
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-Text-Quadruple text-xs">
                              Rep
                            </div>
                            <div className="text-Text-Primary text-sm font-medium">
                              10,10,10
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-Text-Quadruple text-xs">
                              Rest
                            </div>
                            <div className="text-Text-Primary text-sm font-medium">
                              90s
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      ''
                    )}
                  </>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoxActivity;
