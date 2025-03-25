import React, { useEffect, useState } from 'react';
import { MainModal } from '../../../../Components';
import Application from '../../../../api/app';
import Circleloader from '../../../../Components/CircleLoader';

interface ViewExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: any;
  onEdit: () => void;
}

const PreviewExerciseModal: React.FC<ViewExerciseModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onEdit,
}) => {
  console.log(exercise);
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

  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-4 w-[500px] h-[440px] shadow-800 relative">
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
            <div className="text-xs font-medium">Base Weight</div>
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
            <div className="text-xs font-medium">File</div>
            <div className="h-[230px] overflow-auto flex flex-col gap-1">
              {isLoading ? (
                <div className="w-[370px] h-[200px] flex justify-center items-center">
                  <Circleloader />
                </div>
              ) : (
                videoData.map((video) => (
                  <video
                    key={video.file_id}
                    className="rounded-xl border border-Gray-50 object-contain"
                    controls
                    width="370px"
                    height="200px"
                    src={video.base64 || video.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ))
              )}
            </div>
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
