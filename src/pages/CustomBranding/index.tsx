import CustomBrandingContent from './components/CustomBrandingContent';
import HeaderCustomBranding from './components/Header';

const CustomBranding = () => {
  return (
    <>
      <div className="px-6 pt-8">
        <HeaderCustomBranding />
        <CustomBrandingContent />
      </div>
    </>
  );
};

export default CustomBranding;
