/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const myjson: Array<any> = [];
const checkPageCanRender = (sizeReqired: number) => {
  const lastPage = myjson[myjson.length - 1];
  const pageHeight = 980;
  const pageSize = lastPage.renderBoxs.reduce(
    (acc: any, box: any) => acc + box.height,
    0,
  );
  if (pageSize + sizeReqired > pageHeight) {
    addEmptyPage();
  }
};

const resolveHightText = (text: string, isSmal?: boolean) => {
  if (isSmal) {
    return Math.ceil(text?.length / 134) * 18 + 8;
  }
  return Math.ceil(text?.length / 112) * 30;
};

const addHeader = (title: string, moreInfo: string, id: string) => {
  checkPageCanRender(30);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'Header',
    height: 30,
    id: id,
    content: {
      value: title,
      moreInfo: moreInfo,
    },
  });
};
const addUserInfo = (usrInfoData: any) => {
  checkPageCanRender(30);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'UserInfo',
    height: 30,
    content: { ...usrInfoData },
  });
};
const addEmptyPage = () => {
  myjson.push({
    renderBoxs: [],
  });
};
const addInformation = (information: string) => {
  checkPageCanRender(resolveHightText(information));
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'information',
    height: resolveHightText(information),
    content: information,
  });
};
const addBox = (size: number) => {
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'box',
    height: size,
    content: null,
  });
};

const addLegend = () => {
  checkPageCanRender(16);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'legend',
    height: 16,
    content: null,
  });
};

const addCategoryRow = (data: Array<any>) => {
  checkPageCanRender(80);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'category',
    height: 80,
    content: [...data],
  });
};

const addNeedFocusBiomarker = (data: any) => {
  checkPageCanRender(120);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'needFocusBiomarker',
    height: 120,
    content: data,
  });
};

const addNeedFocus = (resolveBioMarkers: () => Array<any>) => {
  resolveBioMarkers()
    .filter((val) => val.outofref == true)
    .map((el: any) => {
      addNeedFocusBiomarker(el);
      addBox(16);
    });
};

function chunkArrayToObjects(arr: Array<any>, size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push({ data: arr.slice(i, i + size) });
  }
  return result;
}

const addCategoriesHandler = (resolveCategories: () => any) => {
  {
    chunkArrayToObjects(resolveCategories(), 2).map((_el) => {
      return addCategoryRow([..._el.data]);
    });
  }
};

const addConcerningResultHeaderTable = () => {
  checkPageCanRender(50);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'ConcerningResultHeaderTable',
    height: 50,
    content: null,
  });
};

const addHolisticPlanHeader = (holisticData: any) => {
  // console.log(holisticData)
  if (holisticData) {
    checkPageCanRender(40);
    const lastPage = myjson[myjson.length - 1];
    lastPage.renderBoxs.push({
      type: 'HolisticPlanHeader',
      height: 40,
      content: [...holisticData],
    });
  }
};
const addActionPlanHeader = (actionData: any) => {
  // console.log(holisticData)
  if (actionData) {
    checkPageCanRender(100);
    const lastPage = myjson[myjson.length - 1];
    lastPage.renderBoxs.push({
      type: 'ActionPlanHeader',
      height: 100,
      content: [...actionData],
    });
  }
};

const AddTreatmentplanCategory = (category: any) => {
  checkPageCanRender(260);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'TreatmentplanCategory',
    height: 40,
    content: category,
  });
};
const resolveHigthNotes = (notes: Array<string>) => {
  let size = 4;
  // console.log(notes);
  notes?.map((el) => {
    size = size + resolveHightText(el, true);
  });
  return size;
};
const addHolisticPlanItem = (item: any) => {
  checkPageCanRender(
    80 + resolveHigthNotes(item.Notes) + resolveHigthNotes(item.Client_Notes),
  );
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'TreatmentplanItem',
    height:
      80 + resolveHigthNotes(item.Notes) + resolveHigthNotes(item.Client_Notes),
    content: item,
  });
  addBox(8);
};

const addHolisticPlanBox = (category: any) => {
  category?.data.map((el: any) => {
    AddTreatmentplanCategory(category);
    return addHolisticPlanItem(el);
  });
};

const addHolisticPlanTreatmentplanData = (TreatMentPlanData: Array<any>) => {
  TreatMentPlanData.map((el) => {
    return addHolisticPlanBox(el);
  });
};

const addConcerningResultRowTable = (el: any) => {
  checkPageCanRender(65);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'ConcerningResultRowTable',
    height: 65,
    content: el,
  });
};

const addDetailedAnalyseCategory = (el: any) => {
  checkPageCanRender(70);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'DetailedAnalyseCategory',
    height: 70,
    content: el,
  });
};

const addDescriptionDetailedAnalyse = (description: string) => {
  checkPageCanRender(resolveHightText(description, true) + 32);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'addDescriptionDetailedAnalyse',
    height: resolveHightText(description, true) + 32,
    content: description,
  });
};

const addBiomarkerDetailAnalyse = (el: any, isEnd: boolean) => {
  // console.log(el)
  checkPageCanRender(140);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'addBiomarkerDetailAnalyse',
    height: 140,
    content: el,
  });
  addMoreInfoDetailAnalyse(el.more_info, isEnd);
};

const addMoreInfoDetailAnalyse = (text: string, isEnd: boolean) => {
  checkPageCanRender(resolveHightText(text, true) + 10);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'addMoreInfoDetailAnalyse',
    height: resolveHightText(text, true) + 10,
    isEnd: isEnd,
    content: text,
  });
};

const addDetailedAnalyseBox = (
  categoryData: any,
  resolveSubCategories: () => Array<any>,
) => {
  const biomarkers = resolveSubCategories().filter(
    (val) => val.subcategory == categoryData.subcategory,
  );
  addDetailedAnalyseCategory(categoryData);
  addDescriptionDetailedAnalyse(categoryData.description);
  biomarkers?.map((ref: any, index: number) => {
    return addBiomarkerDetailAnalyse(ref, index == biomarkers.length - 1);
  });
  addBox(8);
};

// add sections -- summary
const AddSummaryJson = (
  ClientSummaryBoxs: any,
  usrInfoData: any,
  resolveCategories: () => Array<any>,
) => {
  addEmptyPage();
  // addBox(60)
  addHeader(
    'Client Summary',
    `Total of ${ClientSummaryBoxs.total_subcategory} Biomarkers in${' '}${ClientSummaryBoxs.total_category} Categories`,
    'client-summary',
  );
  addUserInfo(usrInfoData);
  addInformation(ClientSummaryBoxs?.client_summary);
  addLegend();
  addCategoriesHandler(resolveCategories);
};

// add section needsFocus
const AddNeedsFocusSection = (
  referenceData: any,
  resolveBioMarkers: () => Array<any>,
) => {
  if (myjson.length == 0) {
    addEmptyPage();
  }
  addBox(16);
  addHeader(
    'Needs Focus Biomarkers',
    referenceData.total_biomarker_note,
    'needs-focus-biomarkers',
  );
  addBox(16);
  addNeedFocus(resolveBioMarkers);
};
// Add Concerning Result

const AddConcerningResult = (transformConceringData: Array<any>) => {
  if (myjson.length == 0) {
    addEmptyPage();
  }
  addHeader('Concerning Result', '', 'concerning-result');
  addBox(16);
  addConcerningResultHeaderTable();
  // addBox(120)
  {
    transformConceringData.map((el) => {
      return addConcerningResultRowTable(el);
    });
  }
  addBox(16);
  // addConcerningResultRowTable(transformConceringData[0])
};

// add DetiledAnalyse
const AddDetailedAnalyse = (
  referenceData: any,
  resolveCategories: Array<any>,
  resolveSubCategories: () => Array<any>,
) => {
  if (myjson.length == 0) {
    addEmptyPage();
  }
  addHeader(
    'Detailed Analysis ',
    referenceData.detailed_analysis_note,
    'detailed-analysis',
  );
  addBox(16);
  {
    resolveCategories.map((el) => {
      return addDetailedAnalyseBox(el, resolveSubCategories);
    });
  }
  // addBox()
};

const addHolisticPlan = (holisticData: any, TreatMentPlanData: Array<any>) => {
  if (myjson.length == 0) {
    addEmptyPage();
  }
  addHeader('Holistic Plan', '', 'holistic-plan');
  addBox(16);
  addHolisticPlanHeader(holisticData);
  addBox(16);
  addHolisticPlanTreatmentplanData(TreatMentPlanData);
  // addBox(200)
  // addBox(40)
};

const AddActionPlanHeaderOverflow = () => {
  checkPageCanRender(60);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'AddActionPlanHeaderOverflow',
    height: 60,
    content: null,
  });
};

const AddActionPlanOverView = (grouped: any) => {
  AddActionPlanHeaderOverflow();
  if (grouped) {
    (Object.entries(grouped) as [string, any[]][]).map(([key, items]) => {
      AddActionPLanRowCategory(key, items);
    });
  }
};
const AddActionPLanRow = (category: string, item: any, index: number) => {
  checkPageCanRender(90);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'ActionPlanRowOverFlow',
    height: 90,
    content: item,
    index: index,
    key: category,
  });
};
const AddActionPLanRowCategory = (category: string, item: Array<any>) => {
  // console.log(category,item)
  item.map((el: any, index: number) => {
    return AddActionPLanRow(category, el, index);
  });
};
const AddActionPlan = (actionPlanData: any, caldenderData: any) => {
  console.log(actionPlanData);
  console.log(caldenderData);

  if (Array.isArray(caldenderData)) {
    const grouped = caldenderData?.reduce((acc: any, item: any) => {
      const key = item.category?.toLowerCase() || '';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    if (myjson.length == 0) {
      addEmptyPage();
    }
    addHeader('Action Plan', '', 'action-plan');
    addBox(16);
    addActionPlanHeader(actionPlanData);
    AddActionPlanOverView(grouped);
  }
};

const resovleJson = ({
  usrInfoData,
  ClientSummaryBoxs,
  resolveCategories,
  referenceData,
  resolveBioMarkers,
  transformConceringData,
  // resolveSubCategories,
  helthPlan,
  TreatMentPlanData,
  isActiveSection,
  ActionPlan,
  caldenderData,
}: {
  usrInfoData: any;
  ClientSummaryBoxs: any;
  resolveCategories: () => Array<any>;
  referenceData: any;
  resolveBioMarkers: () => Array<any>;
  transformConceringData: () => Array<any>;
  resolveSubCategories: () => Array<any>;
  helthPlan: any;
  TreatMentPlanData: Array<any>;
  isActiveSection: (section: string) => boolean;
  ActionPlan: any;
  caldenderData: any;
}) => {
  console.log(ActionPlan);
  console.log(caldenderData);

  myjson.splice(0, myjson.length);

  if (isActiveSection('Client Summary') == true) {
    AddSummaryJson(ClientSummaryBoxs, usrInfoData, resolveCategories);
  }
  if (isActiveSection('Needs Focus Biomarker') == true) {
    AddNeedsFocusSection(referenceData, resolveBioMarkers);
  }
  if (isActiveSection('Concerning Result') == true) {
    AddConcerningResult(transformConceringData());
  }
  if (isActiveSection('Detailed Analysis') == true) {
    AddDetailedAnalyse(referenceData, resolveCategories(), resolveBioMarkers);
  }
  if (isActiveSection('Holistic Plan') == true) {
    addHolisticPlan(helthPlan, TreatMentPlanData);
  }
  if (isActiveSection('Action Plan') == true) {
    AddActionPlan(ActionPlan, caldenderData);
  }
  return myjson;
};

export default resovleJson;
