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
  return Math.ceil(text.length / 112) * 20;
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

const AddSummaryJson = (ClientSummaryBoxs: any, usrInfoData: any) => {
  addEmptyPage();
  // addBox(30)
  addHeader(
    'Client Summary',
    `Total of ${ClientSummaryBoxs.total_subcategory} Biomarkers in${' '}${ClientSummaryBoxs.total_category} Categories`,
  );
  addUserInfo(usrInfoData);
  addInformation(ClientSummaryBoxs?.client_summary);
  addLegend();
};

const resovleJson = ({
  usrInfoData,
  ClientSummaryBoxs,
}: {
  usrInfoData: any;
  ClientSummaryBoxs: any;
}) => {
  AddSummaryJson(ClientSummaryBoxs, usrInfoData);
  return myjson;
};

export default resovleJson;
