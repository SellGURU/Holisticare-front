/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const myjson: Array<any> = [];
const checkPageCanRender = (sizeReqired: number) => {
  const lastPage = myjson[myjson.length - 1];
  const pageHeight = 970;
  const pageSize = lastPage.renderBoxs.reduce(
    (acc: any, box: any) => acc + box.height,
    0,
  );
  if (pageSize + sizeReqired > pageHeight) {
    addEmptyPage();
  }
};

const resolveHightText = (text: string) => {
  return Math.ceil(text.length / 112) * 30;
};

const addHeader = (title: string, moreInfo: string) => {
  checkPageCanRender(30);
  const lastPage = myjson[myjson.length - 1];
  lastPage.renderBoxs.push({
    type: 'Header',
    height: 30,
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
  addBox(16);
  addHeader('Needs Focus Biomarkers', referenceData.total_biomarker_note);
  addBox(16);
  addNeedFocus(resolveBioMarkers);
};

const resovleJson = ({
  usrInfoData,
  ClientSummaryBoxs,
  resolveCategories,
  referenceData,
  resolveBioMarkers,
}: {
  usrInfoData: any;
  ClientSummaryBoxs: any;
  resolveCategories: () => Array<any>;
  referenceData: any;
  resolveBioMarkers: () => Array<any>;
}) => {
  AddSummaryJson(ClientSummaryBoxs, usrInfoData, resolveCategories);
  AddNeedsFocusSection(referenceData, resolveBioMarkers);
  return myjson;
};

export default resovleJson;
