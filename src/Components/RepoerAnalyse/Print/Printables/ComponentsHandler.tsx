import BiomarkersPrint from '../BiomarkersPrint';
import BoxPrint from './BoxPrint';
import CategoryRow from './CategoryRow';
import ConcerningResultHeaderTable from './ConcerningResultHeaderTable';
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
    </>
    //   <div>ComponentsHandler</div>
  );
};

export default ComponentsHandler;
