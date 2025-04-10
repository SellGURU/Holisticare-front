/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { MainModal } from '../../../../Components';
import Application from '../../../../api/app';
import Circleloader from '../../../../Components/CircleLoader';

interface ViewExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: any;
  onEdit: () => void;
  isActivty?: boolean;
}

const PreviewExerciseModal: React.FC<ViewExerciseModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onEdit,
  isActivty,
}) => {
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

  const [videoData, setVideoData] = useState<
    { file_id: string; base64: string; url?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      const videoFiles = exercise.Files.filter(
        (file: any) => file.Type === 'Video' || file.Type === 'link',
      );

      const videoPromises = videoFiles.map((file: any) => {
        if (file.Type === 'Video') {
          return Application.showExerciseFille({
            file_id: file.Content.file_id,
          }).then((res) => ({
            file_id: file.Content.file_id,
            base64: res.data.base_64_data,
          }));
        } else if (file.Type === 'link') {
          return Promise.resolve({
            file_id: file.Content.file_id,
            url: file.Content.url, // Use the URL directly for link type
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
      });
    }
  }, [isOpen, exercise]);
  console.log(Sections);

  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div
        className={`bg-white rounded-2xl p-4 w-[500px] ${isActivty ? 'h-[566px]' : 'h-[440px]'}  shadow-800 relative`}
      >
        <div
          className="w-full flex justify-between items-center border-b border-Gray-50 pb-2"
          title={exercise.Title.length > 30 ? exercise.Title : undefined}
        >
          {exercise.Title.length > 30
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
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">Description</div>
            <div className="text-xs text-[#888888]">{exercise.Description}</div>
          </div>
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">Base Score</div>
            <div className="bg-[#FFD8E4] w-[47px] select-none rounded-xl py-1 px-2 h-[18px] flex justify-center items-center text-[10px]">
              <div className="flex">
                {exercise.Base_Score}{' '}
                <span className="text-Text-Triarty">/10</span>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">Instruction</div>
            <div className="text-xs text-[#888888]">{exercise.Instruction}</div>
          </div>
          <div className="flex w-full justify-between items-start gap-3">
            <div className="text-xs font-medium">
              {' '}
              {isActivty ? 'Sections' : 'File'}
            </div>
            {isActivty ? (
              <div className="h-[330px] w-full overflow-auto  flex flex-col gap-1 rounded-2xl border border-Gray-50 p-3 bg-[#E9F0F2]">
                {/* {Sections?.map((section, index) => (
                  <div key={index}>
                    <div className="text-xs font-medium text-[#383838]">
                      {index + 1}. {section.Section}
                    </div>
                    {section.Exercises.map((exercise: any, exIndex: number) => (
                      <div
                        key={exIndex}
                        className="py-2 px-3 rounded-2xl bg-white my-2"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src="/icons/video-preview.svg"
                            className="size-8 rounded-md"
                            alt="Video"
                          />
                          <div className="text-xs text-[#383838] font-medium">
                            {exercise.Title}
                          </div>
                        </div>
                        <div className="pt-1 border-t mt-2 border-Gray-50 w-full flex justify-between text-Text-Primary">
                          <div className="flex flex-col justify-between items-center text-[10px] ">
                            <span className="text-[8px] text-Text-Secondary">
                              Set
                            </span>
                            {section.Sets}
                          </div>
                          <div className="flex flex-col justify-between items-center text-[10px] ">
                            <span className="text-[8px] text-Text-Secondary">
                              Reps
                            </span>
                            {exercise.Reps}
                          </div>
                          <div className="flex flex-col justify-between items-center text-[10px] ">
                            <span className="text-[8px] text-Text-Secondary">
                              Weight{' '}
                            </span>
                            {exercise.Weight}
                          </div>
                          <div className="flex flex-col justify-between items-center text-[10px] ">
                            <span className="text-[8px] text-Text-Secondary">
                              Rest (min){' '}
                            </span>
                            {exercise.Rest}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))} */}
                <div
                  className={`w-full h-full bg-[#E9F0F2] rounded-[16px]  mt-2 `}
                >
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
                                              {exercise.Title}
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
            ) : (
              <div className="h-[220px] overflow-auto flex flex-col gap-1">
                {isLoading ? (
                  <div className="w-[370px] h-[200px] flex justify-center items-center">
                    <Circleloader />
                  </div>
                ) : (
                  videoData.map((video) =>
                    video.url ? (
                      isYouTubeShorts(video.url) ? (
                        <div className="rounded-xl h-[200px] w-[370px] border border-Gray-50 flex flex-col items-center justify-center p-4">
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
                          key={video.file_id}
                          className="rounded-xl h-[200px] w-[370px] border border-Gray-50"
                          src={getYouTubeEmbedUrl(video.url)}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )
                    ) : (
                      <video
                        key={video.file_id}
                        className="rounded-xl h-[150px] w-[370px] border border-Gray-50 object-contain"
                        controls
                        src={video.base64}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ),
                  )
                )}
              </div>
            )}
          </div>
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
