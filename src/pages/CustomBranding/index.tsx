import CustomBrandingContent from './components/CustomBrandingContent';
import HeaderCustomBranding from './components/Header';

const CustomBranding = () => {
  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 pt-6 md:px-6">
        <HeaderCustomBranding />
        <div className="mt-4 min-h-0 flex-1">
          <CustomBrandingContent />
        </div>
      </div>
    </>
  );
};

export default CustomBranding;
