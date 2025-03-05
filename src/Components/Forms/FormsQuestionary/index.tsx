import SvgIcon from '../../../utils/svgIcon';
import { ButtonSecondary } from '../../Button/ButtosSecondary';

const FormsQuestionary = () => {
  return (
    <>
      <img
        src="/icons/plant-device-floor.svg"
        alt="plant-device-floor"
        width="284.53px"
        height="190px"
        className="mt-16"
      />
      <div className="text-Text-Primary text-base font-medium mt-9">
        No questionary form existed yet.
      </div>
      <ButtonSecondary ClassName="rounded-[20px] w-[229px] mt-9">
        <SvgIcon src="/icons/firstline.svg" color="#FFF" />
        Create New
      </ButtonSecondary>
    </>
  );
};

export default FormsQuestionary;
