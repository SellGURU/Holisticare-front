import SearchBox from '../../Components/SearchBox';
import BioMarkerBox from './BiomarkerBox';
import mockData from './mockData.json';
const CustomBiomarkers = () => {
  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
        <div className="w-full flex justify-between items-center">
          <div className="text-Text-Primary font-medium opacity-[87%]">
            Custom Biomarker
          </div>
          <SearchBox
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search for categories & biomarkers ..."
            onSearch={() => {}}
          />
        </div>
      </div>
      <div className="w-full px-6 py-[80px]">
        {mockData.map((el) => {
          return <BioMarkerBox data={el}></BioMarkerBox>;
        })}
      </div>
    </>
  );
};

export default CustomBiomarkers;
