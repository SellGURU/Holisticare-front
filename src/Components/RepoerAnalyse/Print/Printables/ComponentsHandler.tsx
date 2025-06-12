import HeaderText from "./HeaderText";
import InformationBox from "./informationBox";
import Legend from "./Legend";
import UserInfo from "./UserInfo";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ComponentsHandlerProps {
    component:any
}

const ComponentsHandler:React.FC<ComponentsHandlerProps> = ({component}) => {
  return (
    <>
      {component.type === 'Header' && <HeaderText component={component.content} />}
      {component.type === 'UserInfo' && <UserInfo usrInfoData={component.content} />}   
      {component.type === 'information' && <InformationBox text={component.content} />}
      {component.type === 'legend' && <Legend />}
    </>
//   <div>ComponentsHandler</div>
);
};

export default ComponentsHandler;