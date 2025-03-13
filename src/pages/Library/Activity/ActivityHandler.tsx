import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActivityHandlerProps {
  data: Array<any>;
}

const ActivityHandler: React.FC<ActivityHandlerProps> = ({ data }) => {
  return (
    <>
      {data.length == 0 && (
        <>
          <div className="w-full h-full min-h-[450px] flex justify-center items-center">
            <div>
              <img src="./icons/amico.svg" alt="" />
              <div className="mt-8">
                <div className="text-Text-Primary text-center font-medium">
                  No activity existed yet.
                </div>
                <div className="flex justify-center mt-4">
                  <ButtonSecondary ClassName="rounded-full min-w-[180px]">
                    <img src="./icons/add-square.svg" alt="" />
                    Add Activity
                  </ButtonSecondary>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActivityHandler;
