/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Application from '../../../../api/app';
import { MainModal } from '../../../../Components';
import Circleloader from '../../../../Components/CircleLoader';

interface ViewExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: any;
  onEdit: () => void;
  isActivty?: boolean;
}

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

const PreviewExerciseModal: FC<ViewExerciseModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onEdit,
  isActivty,
}) => {
  const [data, setData] = useState({
    title: '',
    score: 0,
    instruction: '',
    Parent_Title: '',
  });
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

  // const isYouTubeShorts = (url: string) => {
  //   return url.includes('/shorts/');
  // };

  const [videoData, setVideoData] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      const videoFiles = exercise.Files.filter(
        (file: any) =>
          file.Type?.split('/')[0] === 'video' ||
          file.Type?.split('/')[0] === 'Video' ||
          file.Type === 'link' ||
          file.Type?.split('/')[0] === 'image',
      );

      const videoPromises = videoFiles.map((file: any) => {
        if (
          file.Type?.split('/')[0] === 'video' ||
          file.Type?.split('/')[0] === 'Video' ||
          file.Type?.split('/')[0] === 'image'
        ) {
          return Application.showExerciseFille({
            file_id: file.Content.file_id,
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
            Type: 'link',
          });
        }
      });

      const videos = await Promise.all(videoPromises);
      setVideoData(videos);
      setIsLoading(false);
    };

    if (isOpen && exercise.Files && exercise.Files.length > 0) {
      fetchVideos();
    }
  }, [isOpen, exercise.Files]);
  const [Sections, setSections] = useState<any[]>([]);
  useEffect(() => {
    if (isActivty && isOpen) {
      Application.getActivity(exercise.Act_Id).then((res) => {
        setSections(res.data.Sections);
        setData({
          title: res.data.Title,
          score: res.data.Base_Score,
          instruction: res.data.Instruction,
          Parent_Title: res.data.Parent_Title,
        });
      });
    }
  }, [isOpen, exercise]);
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
  console.log(videoData);

  return (
    <MainModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setIndexImage(0);
      }}
    >
      <div
        className={`bg-white rounded-2xl p-4 ${data.instruction.length > 500 ? 'w-[800px]' : isActivty ? 'w-[600px]' : 'w-[500px]'} shadow-800 relative`}
      >
        <div
          className="w-full flex justify-between items-center border-b border-Gray-50 pb-2"
          title={
            isActivty
              ? data.title.length > 30
                ? data.title
                : undefined
              : exercise.Title.length > 30
                ? exercise.Title
                : undefined
          }
        >
          {isActivty
            ? data.title.length > 30
              ? `${data.title.substring(0, 30)}...`
              : data.title
            : exercise.Title.length > 30
              ? `${exercise.Title.substring(0, 30)}...`
              : exercise.Title}
          <img
            onClick={onEdit}
            className="size-6 cursor-pointer"
            src="/icons/edit-blue.svg"
            alt=""
          />
        </div>
        <div className="flex flex-col gap-4 mt-7">
          {/* <div className="flex w-full items-start gap-3">
            <div className="text-xs font-medium">Description</div>
            <div className="text-xs text-[#888888] text-justify">
              {exercise.Description}
            </div>
          </div> */}
          {data.Parent_Title && (
            <div className="flex w-full items-start gap-3">
              <div className="text-xs font-medium">Associated Intervention</div>
              <div className="text-xs text-[#888888] text-justify">
                {data.Parent_Title}
              </div>
            </div>
          )}
          <div
            className={`flex w-full items-start ${isActivty ? 'gap-[87px]' : 'gap-3'}`}
          >
            <div className="text-xs font-medium">Instruction</div>
            <div
              className={`text-xs text-[#888888] text-justify text-wrap break-words max-w-[375px] ${isActivty ? '' : 'ml-5'}`}
            >
              {isActivty ? data.instruction : exercise.Instruction}
            </div>
          </div>
          <div
            className={`flex w-full items-start ${isActivty ? 'gap-24' : 'gap-3'}`}
          >
            <div className="text-xs font-medium">
              {' '}
              {isActivty ? 'Sections' : 'File'}
            </div>
            {isActivty ? (
              <div className="bg-[#E9F0F2]  w-full p-1 pr-2 rounded-2xl border border-Gray-50">
                <div
                  className="max-h-[330px] w-full overflow-y-auto flex flex-col gap-1 p-2"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#FFFFFF transparent',
                  }}
                >
                  <div className={`w-full h-full bg-[#E9F0F2] rounded-[16px]`}>
                    {(() => {
                      // Create a map to track section numbers
                      const sectionNumbers: Record<string, number> = {};
                      let nextSectionNumber = 1;

                      return Sections.map((el: any, index: number) => {
                        // Check if this section has been shown before
                        const isFirstOccurrence =
                          index ===
                          Sections.findIndex(
                            (t: any) => t.Section === el.Section,
                          );

                        // Assign section number if it's the first occurrence
                        if (isFirstOccurrence && el.Section) {
                          sectionNumbers[el.Section] = nextSectionNumber++;
                        }

                        return (
                          <>
                            <div className="p-1">
                              <div className=" w-full justify-between items-start">
                                <div
                                  className={` ${el.Section && isFirstOccurrence ? 'visible' : 'invisible'} text-[12px] text-Text-Primary font-medium`}
                                >
                                  {el.Section &&
                                    isFirstOccurrence &&
                                    `${sectionNumbers[el.Section]}. ${el.Section}`}
                                </div>

                                <div className="w-full relative gap-2 grid">
                                  {el.Exercises.length > 1 && (
                                    <div
                                      className="absolute z-[1]  top-[25px] left-[-8px]"
                                      style={{
                                        height: `${el.Exercises.length * 87 - 12}px`,
                                      }}
                                    >
                                      <div className="w-[20px] relative h-full rounded-[16px]  bg-bg-color border-2 border-gray-300 border-r-bg-color">
                                        <img
                                          className="absolute top-[35%] left-[-8px] bg-bg-color py-1"
                                          src="/icons/link.svg"
                                          alt="super set"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {el.Exercises.map(
                                    (val: any, exIndex: number) => {
                                      return (
                                        <>
                                          <div
                                            key={exIndex}
                                            className="py-2 px-3 rounded-2xl relative z-10 w-full bg-white my-2"
                                          >
                                            <div className="flex items-center gap-2">
                                              <img
                                                src="/icons/video-preview.svg"
                                                className="size-8 rounded-md"
                                                alt="Video"
                                              />
                                              <div className="text-xs text-[#383838] font-medium">
                                                {isActivty
                                                  ? data.title
                                                  : exercise.Title}
                                              </div>
                                            </div>
                                            <div className="pt-1 border-t mt-2 border-Gray-50 w-full flex justify-between text-Text-Primary">
                                              <div className="flex flex-col justify-between items-center text-[10px] ">
                                                <span className="text-[8px] text-Text-Secondary">
                                                  Set
                                                </span>
                                                {el.Sets}
                                              </div>
                                              <div className="flex flex-col justify-between items-center text-[10px] ">
                                                <span className="text-[8px] text-Text-Secondary">
                                                  Reps
                                                </span>
                                                {val.Reps}
                                              </div>
                                              <div className="flex flex-col justify-between items-center text-[10px] ">
                                                <span className="text-[8px] text-Text-Secondary">
                                                  Weight{' '}
                                                </span>
                                                {val.Weight}
                                              </div>
                                              <div className="flex flex-col justify-between items-center text-[10px] ">
                                                <span className="text-[8px] text-Text-Secondary">
                                                  Rest (min){' '}
                                                </span>
                                                {val.Rest}
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`${videoData?.[0]?.Type?.split('/')[0] === 'image' ? '' : 'h-[200px]'} overflow-auto  flex flex-col gap-1 ml-[60px]`}
              >
                {isLoading ? (
                  <div className="w-[370px] h-[200px] flex justify-center items-center">
                    <Circleloader />
                  </div>
                ) : videoData?.[0]?.Type?.split('/')[0] === 'image' ? (
                  <div className="w-full flex justify-center items-center gap-4">
                    {videoData.length > 1 && (
                      <button onClick={prevSlide} disabled={indexImage === 0}>
                        <img src="/icons/chevron-left.svg" alt="prev" />
                      </button>
                    )}

                    <div className="flex w-full overflow-hidden justify-start items-center ">
                      <div
                        className="flex transition-transform duration-300 ease-in-out gap-2"
                        style={{
                          transform: `translateX(-${indexImage * (120 + 8)}px)`,
                        }}
                      >
                        {videoData
                          .filter((file) => file.Type !== 'link')
                          .map((src, i) => {
                            return (
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
                            );
                          })}
                      </div>
                    </div>

                    {videoData.length > 1 && (
                      <button
                        onClick={nextSlide}
                        disabled={indexImage >= lastIndex}
                      >
                        <img src="/icons/chevron-right.svg" alt="next" />
                      </button>
                    )}
                  </div>
                ) : videoData?.[0]?.Type?.split('/')[0] === 'video' ? (
                  videoData.map((video) => {
                    return (
                      <video
                        key={video.Content.file_id}
                        className="rounded-xl h-[200px] w-[30px] border border-Gray-50 object-contain"
                        controls
                        src={video.Content.url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    );
                  })
                ) : (
                  videoData.map((video) => {
                    return (
                      <iframe
                        key={video.Content.file_id}
                        className="rounded-xl h-[200px] w-[370px] border border-Gray-50"
                        src={getYouTubeEmbedUrl(video.Content.url || '')}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
          <div
            className={`flex w-full items-start ${isActivty ? 'gap-[60px]' : 'gap-3'} mt-3 mb-7`}
          >
            <div className="text-xs font-medium">Priority Weight</div>
            <div className="bg-[#FFD8E4] w-[47px] select-none rounded-xl py-1 px-2 h-[18px] flex justify-center items-center text-[10px]">
              <div className="flex">
                {isActivty ? data.score : exercise.Base_Score}{' '}
                <span className="text-Text-Triarty">/10</span>
              </div>
            </div>
          </div>
          {/* {exercise.Ai_note && (
            <div className="flex w-full items-start gap-3 mb-7">
              <div className="text-xs font-medium text-nowrap">
                Clinical Guidance
              </div>
              <div className="text-xs text-[#888888] text-justify">
                {exercise.Ai_note}
              </div>
            </div>
          )} */}
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

export default PreviewExerciseModal;
