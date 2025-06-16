import CustomBrandingContent from './components/CustomBrandingContent';
import HeaderCustomBranding from './components/Header';

const CustomBranding = () => {
  return (
    <>
      <div className="  md:px-6 pt-8 h-screen md:h-auto pb-[100px] md:pb-0  pr-1 md:pr-0 overflow-auto">
        <HeaderCustomBranding />
        <CustomBrandingContent />
      </div>
    </>
  );
};

export default CustomBranding;
