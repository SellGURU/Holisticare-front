import BiomarkersPrint from '../BiomarkersPrint';
import BoxPrint from './BoxPrint';
import CategoryRow from './CategoryRow';
import ConcerningResultHeaderTable from './ConcerningResultHeaderTable';
import ConcerningResultRowTable from './ConcerningResultRowTable';
import DetailedAnalyseCategory from './DetailedAnalyseCategory';
import DetailedAnalyseDescription from './DetailedAnalyseDescription';
import HeaderText from './HeaderText';
import InformationBox from './informationBox';
import Legend from './Legend';
import UserInfo from './UserInfo';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ComponentsHandlerProps {
  component: any;
}

const ComponentsHandler: React.FC<ComponentsHandlerProps> = ({ component }) => {
  return (
    <>
      {component.type === 'Header' && (
        <HeaderText component={component.content} />
      )}
      {component.type === 'UserInfo' && (
        <UserInfo usrInfoData={component.content} />
      )}
      {component.type === 'information' && (
        <InformationBox text={component.content} />
      )}
      {component.type === 'legend' && <Legend />}
      {component.type === 'box' && (
        <BoxPrint height={component.height}></BoxPrint>
      )}
      {component.type === 'category' && (
        <CategoryRow contents={component.content}></CategoryRow>
      )}
      {component.type == 'needFocusBiomarker' && (
        <BiomarkersPrint data={component.content}></BiomarkersPrint>
      )}
      {component.type == 'ConcerningResultHeaderTable' && (
        <ConcerningResultHeaderTable></ConcerningResultHeaderTable>
      )}
      {component.type == 'ConcerningResultRowTable' && (
        <ConcerningResultRowTable
          el={component.content}
        ></ConcerningResultRowTable>
      )}
      {component.type == 'DetailedAnalyseCategory' && (
        <DetailedAnalyseCategory
          data={component.content}
        ></DetailedAnalyseCategory>
      )}
      {component.type == 'addDescriptionDetailedAnalyse' && (
        <DetailedAnalyseDescription
          description={component.content}
        ></DetailedAnalyseDescription>
      )}
      {component.type == 'addBiomarkerDetailAnalyse' && (
        <div className="w-full bg-white px-4 pb-4 pt-1">
          <BiomarkersPrint data={component.content}></BiomarkersPrint>
        </div>
      )}
      {component.type == 'addMoreInfoDetailAnalyse' && (
        <div
          className="text-xs text-justify bg-white text-gray-700 pb-2 px-4"
          style={{
            color: '#888888',
            fontSize: '12px',
            borderBottomLeftRadius: component.isEnd ? '16px' : '0px',
            borderBottomRightRadius: component.isEnd ? '16px' : '0px',
          }}
        >
          {component.content}
        </div>
      )}
    </>
    //   <div>ComponentsHandler</div>
  );
};

export default ComponentsHandler;
