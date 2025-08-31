/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Mobile from '../../../api/mobile';
import Circleloader from '../../../Components/CircleLoader';
import { Exercise, Tasks } from '../tasks.interface';

interface FileData {
  Title: string;
  Type: string;
  base64Data?: string;
  // Optional until received from the API
  Content: {
    url?: string;
    file_id?: string;
  };
}

const BoxActivity: FC<Tasks> = ({ activities, encoded_mi }) => {
  const [selectIndexTitle, setSelectIndexTitle] = useState<{
    index: number | null;
    title: string | null;
  }>({
    index: null,
    title: null,
  });
  const [selectData, setSelectData] = useState<Exercise | null>(null);
  const [videoData, setVideoData] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      const videoFiles = selectData?.Files?.filter(
        (file: any) =>
          file.Type === 'Video' ||
          file.Type === 'link' ||
          file.Type?.split('/')[0] === 'image',
      );

      const videoPromises = videoFiles?.map((file: any) => {
        if (file.Type === 'Video' || file.Type?.split('/')[0] === 'image') {
          return Mobile.getExerciseFile({
            file_id: file.Content.file_id,
            encoded_mi: encoded_mi,
          }).then((res) => ({
            Title: res.data.file_name,
            Type: res.data.file_type,
            Content: {
              file_id: file.Content.file_id,
              url: res.data.base_64_data,
            },
          }));
        } else if (file.Type === 'link') {
          return Promise.resolve({
            Content: {
              file_id: file.Content.file_id,
              url: file.Content.url,
            },
            Title: file.Title,
            Type: 'link',
          });
        }
      });

      const videos = await Promise.all(videoPromises as Promise<FileData>[]);
      setVideoData(videos as FileData[]);
      setIsLoading(false);
    };

    if (selectIndexTitle.index && selectData) {
      fetchVideos();
    }
  }, [selectIndexTitle.index, selectData]);
  // useEffect(() => {
  //   const fetchVideos = async () => {
  //     if (selectData && selectData.Files.length > 0) {
  //       const videoFiles = selectData.Files.filter(
  //         (file) =>
  //           file.Type === 'Video' ||
  //           file.Type === 'link' ||
  //           file.Type?.split('/')[0] === 'image',
  //       );

  //       const videoPromises = videoFiles.map((file) => {
  //         if (file.Type === 'Video' || file.Type === 'link') {
  //           return Promise.resolve({
  //             file_id: file.Content.file_id,
  //             url: file.Content.url,
  //             base64: '',
  //           });
  //         } else if (file.Type?.split('/')[0] === 'image') {
  //           return Promise.resolve({
  //             file_id: file.Content.file_id,
  //             base64: file.Content.url,
  //             type: file.Type,
  //           });
  //         }
  //       });

  //       const videos = await Promise.all(videoPromises);
  //       setVideoData(
  //         videos as {
  //           file_id: string;
  //           base64: string;
  //           url?: string;
  //           type?: string;
  //         }[],
  //       );
  //     }
  //   };

  //   if (selectIndexTitle.index) {
  //     fetchVideos();
  //   }
  // }, [selectIndexTitle.index, selectData]);
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
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-5">
      {activities.Sections.map((activity, index) => {
        return (
          <div className="flex-col flex" key={index}>
            <div className="text-xs font-medium text-Text-Primary mb-2">
              {activity.Section}
            </div>
            <div className="flex flex-col gap-1">
              {activity.Exercises.map((exercise, index) => {
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
                          setSelectData(exercise);
                        }
                      }}
                      className="flex items-center justify-between border border-Gray-50 rounded-2xl px-3 py-2 bg-white cursor-pointer"
                      key={index}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            videoData[0]?.Content?.url ||
                            '/images/activity/activity-demo.png'
                          }
                          alt=""
                          className="w-[32px] h-[32px] rounded-xl object-cover"
                        />
                        <div className="text-Text-Primary text-xs font-medium">
                          {exercise.Title}
                        </div>
                      </div>
                      {/* {superset.Status ? (
                        <img src="/icons/done-enable.svg" alt="" />
                      ) : (
                        <img src="/icons/done-disable.svg" alt="" />
                      )} */}
                    </div>
                    {isLoading ? (
                      <>
                        <div className="flex justify-center items-center mt-5">
                          <Circleloader></Circleloader>
                        </div>
                      </>
                    ) : (
                      ''
                    )}
                    {selectIndexTitle.index === index + 1 &&
                    selectIndexTitle.title === activity.Section ? (
                      videoData?.[0]?.Type?.split('/')[0] === 'image' ? (
                        <div className="w-full flex justify-center items-center gap-4 mt-3 mb-3">
                          <button
                            onClick={prevSlide}
                            disabled={indexImage === 0}
                          >
                            <img src="/icons/chevron-left.svg" alt="prev" />
                          </button>

                          <div className="flex w-full overflow-hidden justify-start items-center">
                            <div
                              className="flex transition-transform duration-300 ease-in-out gap-2"
                              style={{
                                transform: `translateX(-${indexImage * (120 + 8)}px)`,
                              }}
                            >
                              {videoData
                                .filter((file) => file.Type !== 'link')
                                .map((src, i) => (
                                  <div
                                    key={i}
                                    className="flex-shrink-0 w-[120px] h-[114px] overflow-hidden rounded-xl"
                                  >
                                    <img
                                      src={src.Content.url}
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
                          {videoData.map((video) =>
                            video.Content.url ? (
                              <iframe
                                key={video.Content.file_id}
                                className="rounded-xl h-[200px] w-[370px] border border-Gray-50"
                                src={getYouTubeEmbedUrl(video.Content.url)}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                key={video.Content.file_id}
                                className="rounded-xl h-[200px] w-[370px] border border-Gray-50 object-contain"
                                controls
                                src={video.Content.url}
                              >
                                Your browser does not support the video tag.
                              </video>
                            ),
                          )}
                        </>
                      )
                    ) : (
                      ''
                    )}
                    {selectIndexTitle.index === index + 1 &&
                    selectIndexTitle.title === activity.Section ? (
                      <div className="flex items-center gap-14 ml-7 mt-3">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="text-Text-Quadruple text-xs">
                            Sets
                          </div>
                          <div className="text-Text-Primary text-sm font-medium">
                            {activity.Sets || '-'}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="text-Text-Quadruple text-xs">
                            Weight
                          </div>
                          <div className="text-Text-Primary text-sm font-medium">
                            {exercise.Weight || '-'}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="text-Text-Quadruple text-xs">Rep</div>
                          <div className="text-Text-Primary text-sm font-medium">
                            {exercise.Reps || '-'}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="text-Text-Quadruple text-xs">
                            Rest
                          </div>
                          <div className="text-Text-Primary text-sm font-medium">
                            {exercise.Rest || '-'}
                          </div>
                        </div>
                      </div>
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
