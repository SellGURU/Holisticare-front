import BiomarkersPrint from '../BiomarkersPrint';
import TreatmentPlanPrint from '../TreatmentplanPrint';
import ActionPlanHeadBox from './ActionPlanHeadBox';
import AddActionPlanHeaderOverflow from './ActionPlanHeaderOverflow';
import ActionPlanRowOverFlow from './ActionPlanRowOverFlow';
import BoxPrint from './BoxPrint';
import CategoryRow from './CategoryRow';
import ConcerningResultHeaderTable from './ConcerningResultHeaderTable';
import ConcerningResultRowTable from './ConcerningResultRowTable';
import DetailedAnalyseCategory from './DetailedAnalyseCategory';
import DetailedAnalyseDescription from './DetailedAnalyseDescription';
import HeaderText from './HeaderText';
import HolisticPlanCategory from './HolisticPlanCategory';
import HolisticPlanExercisesAvoid from './HolisticPlanExercisesAvoid';
import HolisticPlanExpectedBenefits from './HolisticPlanExpectedBenefits';
import HolisticPlanFoodsLimit from './HolisticPlanFoodsLimit';
import HolisticPlanGuidelines from './HolisticPlanGuidelines';
import HolisticPlanHeader from './HolisticPlanHeadBox';
import HolisticPlanRecommendedDosage from './HolisticPlanRecommendedDosage';
import HolisticPlanRecommendedExercises from './HolisticPlanRecommendedExercises';
import HolisticPlanRecommendedFoods from './HolisticPlanRecommendedFoods';
import HolisticPlanScientificBasis from './HolisticPlanScientificBasis';
import HolisticPlanTitle from './HolisticPlanTitle';
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
        <HeaderText id={component.id} component={component.content} />
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
      {component.type == 'HolisticPlanHeader' && (
        <>
          <HolisticPlanHeader
            helthPlan={component.content}
          ></HolisticPlanHeader>
        </>
      )}
      {component.type == 'ActionPlanHeader' && (
        <>
          <ActionPlanHeadBox ActionPlan={component.content}></ActionPlanHeadBox>
        </>
      )}
      {component.type == 'TreatmentplanCategory' && (
        <>
          <HolisticPlanCategory el={component.content}></HolisticPlanCategory>
        </>
      )}
      {component.type == 'TreatmentplanItem' && (
        <>
          <TreatmentPlanPrint data={component.content}></TreatmentPlanPrint>
        </>
      )}
      {component.type == 'ScientificBasis' && (
        <>
          <HolisticPlanScientificBasis
            value={component.content}
          ></HolisticPlanScientificBasis>
        </>
      )}
      {component.type == 'Guidelines' && (
        <>
          <HolisticPlanGuidelines
            value={component.content}
          ></HolisticPlanGuidelines>
        </>
      )}
      {component.type == 'ExpectedBenefits' && (
        <>
          <HolisticPlanExpectedBenefits
            value={component.content}
          ></HolisticPlanExpectedBenefits>
        </>
      )}
      {component.type == 'Title' && (
        <>
          <HolisticPlanTitle value={component.content}></HolisticPlanTitle>
        </>
      )}
      {component.type == 'RecommendedDosage' && (
        <>
          <HolisticPlanRecommendedDosage
            value={component.content}
          ></HolisticPlanRecommendedDosage>
        </>
      )}
      {component.type == 'RecommendedExercises' && (
        <>
          <HolisticPlanRecommendedExercises
            value={component.content}
          ></HolisticPlanRecommendedExercises>
        </>
      )}
      {component.type == 'ExercisesAvoid' && (
        <>
          <HolisticPlanExercisesAvoid
            value={component.content}
          ></HolisticPlanExercisesAvoid>
        </>
      )}
      {component.type == 'RecommendedFoods' && (
        <>
          <HolisticPlanRecommendedFoods
            value={component.content}
          ></HolisticPlanRecommendedFoods>
        </>
      )}
      {component.type == 'FoodsLimit' && (
        <>
          <HolisticPlanFoodsLimit
            value={component.content}
          ></HolisticPlanFoodsLimit>
        </>
      )}
      {component.type == 'AddActionPlanHeaderOverflow' && (
        <>
          <AddActionPlanHeaderOverflow></AddActionPlanHeaderOverflow>
        </>
      )}
      {component.type == 'ActionPlanRowOverFlow' && (
        <ActionPlanRowOverFlow
          index={component.index}
          item={component.content}
          category={component.key}
        ></ActionPlanRowOverFlow>
      )}
    </>
    //   <div>ComponentsHandler</div>
  );
};

export default ComponentsHandler;
