/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';

const BoxActivity: FC<{
  activities: {
    title: string;
    work: {
      title: string;
      link: string;
      picture: string[];
      done: boolean;
      files: {
        video: string;
        type: string;
      }[];
    }[];
    superset: {
      title: string;
      link: string;
      picture: string[];
      done: boolean;
      files: {
        video: string;
        type: string;
      }[];
    }[];
  }[];
}> = ({ activities }) => {
  const [selectIndexTitle, setSelectIndexTitle] = useState<{
    index: number | null;
    title: string | null;
  }>({
    index: null,
    title: null,
  });
  const [selectData, setSelectData] = useState<{
    title: string;
    link: string;
    picture: string[];
    done: boolean;
    files: {
      video: string;
      type: string;
    }[];
  }>({
    title: '',
    link: '',
    picture: [],
    done: false,
    files: [],
  });
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
      const videoFiles = selectData.files.filter(
        (file: any) => file.type === 'Video' || file.type === 'link',
      );

      const videoPromises = videoFiles.map((file: any) => {
        if (file.type === 'Video') {
          return Promise.resolve({
            file_id: file.video,
            url: file.video,
            base64: '',
          });
        } else if (file.type === 'link') {
          return Promise.resolve({
            file_id: file.video,
            url: file.video,
            base64: '',
          });
        }
      });

      const videos = await Promise.all(videoPromises);
      setVideoData(
        videos as { file_id: string; base64: string; url?: string }[],
      );
    };

    if (selectIndexTitle.index) {
      fetchVideos();
    }
  }, [selectIndexTitle.index, selectData]);
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-5">
      {activities.map((activity, index) => {
        return (
          <div className="flex-col flex" key={index}>
            <div className="text-xs font-medium text-Text-Primary mb-2">
              {activity.title}
            </div>
            <div className="flex flex-col gap-1">
              {activity.superset.map((superset, index) => {
                return (
                  <>
                    <div
                      onClick={() => {
                        setSelectIndexTitle({
                          index: index + 1,
                          title: activity.title,
                        });
                        setSelectData(superset);
                      }}
                      className="flex items-center justify-between border border-Gray-50 rounded-2xl px-3 py-2 bg-white cursor-pointer"
                      key={index}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={superset.picture[0] || superset.link}
                          alt=""
                          className="w-[32px] h-[32px] rounded-xl object-cover"
                        />
                        <div className="text-Text-Primary text-xs font-medium">
                          {superset.title}
                        </div>
                      </div>
                      {superset.done ? (
                        <img src="/icons/done-enable.svg" alt="" />
                      ) : (
                        <img src="/icons/done-disable.svg" alt="" />
                      )}
                    </div>
                    {selectIndexTitle.index === index &&
                    selectIndexTitle.title === activity.title ? (
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
              {activity.work.map((work, index) => {
                return (
                  <>
                    <div
                      className="flex items-center justify-between border border-Gray-50 rounded-2xl px-3 py-2 bg-white cursor-pointer"
                      key={index}
                      onClick={() => {
                        setSelectIndexTitle({
                          index: index + 1,
                          title: activity.title,
                        });
                        setSelectData(work);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={work.picture[0] || work.link}
                          alt=""
                          className="w-[32px] h-[32px] rounded-xl object-cover"
                        />
                        <div className="text-Text-Primary text-xs font-medium">
                          {work.title}
                        </div>
                      </div>
                      {work.done ? (
                        <img src="/icons/done-enable.svg" alt="" />
                      ) : (
                        <img src="/icons/done-disable.svg" alt="" />
                      )}
                    </div>

                    {selectIndexTitle.index === index &&
                    selectIndexTitle.title === activity.title ? (
                      <>
                        {videoData.map((video) =>
                          video.url ? (
                            <iframe
                              key={video.file_id}
                              className="rounded-xl h-[200px] w-[370px] border border-Gray-50 mt-2"
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
