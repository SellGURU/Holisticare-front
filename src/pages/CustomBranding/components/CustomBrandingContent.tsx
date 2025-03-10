import LeftItemContent from './LeftItemContent';
import RightItemContent from './RightItemContent';

const CustomBrandingContent = () => {
  return (
    <>
      <div className="flex items-center justify-between w-full h-full mt-6">
        <LeftItemContent />
        <RightItemContent />
      </div>
    </>
  );
};

export default CustomBrandingContent;
