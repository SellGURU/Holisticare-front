
// import { BiomarkerEntry , BiomarkerCategory , ChartDataItem , diagnosis } from "@/types"
// const resolveRespiration = (respiration:string) => {
//     const respirationValue = Number(respiration)
//     if(respirationValue> 50){
//         return 'normal'
//     }
//     if(respirationValue>30 && respirationValue<=50){
//         return 'at-risk'
//     }
//     if(respirationValue<=30){
//         return 'critical'
//     }    
//     return 'critical'
// }
// const getStatusBgColorClass = (
//   status: string,
//   currentStatus: string
// ): string => {
//   if (status.toLowerCase() === currentStatus.toLowerCase()) {
//     switch (status.toLowerCase()) {
//       case "high":
//         return "bg-red-status text-black";
//       case "low":
//         return "bg-brand-primary-color text-black";
//       case "medium":
//         return "bg-orange-status  text-black";
//       case "excellent":
//         return "bg-[#7F39FB] text-black";
//       case "good":
//         return "bg-[#03DAC5] text-black";
//       case "ok":
//         return "bg-[#FBAD37] text-black";        
//       case "needs focus":
//         return "bg-[#FC5474] text-black";      
//       case "incompleted":
//         return "bg-red-500 text-black";    
//       case "incomplete data":
//         return "bg-red-500 text-black";                      
//       case "all":
//         return "dark:bg-secondary-text bg-gray-500 text-white  dark:text-black";
//         case "need to check":
//           return "bg-orange-status text-black"                   
//         case "checked":
//           return "bg-green-status text-black"                   
//       default:
//         return "border border-light-blue-active dark:border-none dark:bg-black-secondary";
//     }
//   }
//   return "border border-light-blue-active text-light-secandary-text dark:text-white dark:border-none dark:bg-black-secondary";
// };
// const formatDate = (dateString: string): string => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: 'numeric',
//       month: 'short'
//     });
//   };
//   const extractBiomarkerData = (biomarker: BiomarkerEntry[]): {
//     dates: string[];
//     values: number[] | { systolic: number[]; diastolic: number[] };
//     status: string;
//     chart: string;
//     average?: string;
//     current?: string;
//   } => {
//     const dates = biomarker.flatMap(entry => {
//       if (Array.isArray(entry.date)) {
//         return entry.date.map(formatDate);
//       } else {
//         return [formatDate(entry.date)];
//       }
//     });
  
//     const hasHighLow = biomarker.some(entry => entry.value.diastolic && entry.value.systolic);
//     const hasStringValue = biomarker.some(entry => typeof entry.value.current === 'string' && typeof entry.value.average === 'string');
  
//     const values = hasHighLow
//       ? {
//           systolic: biomarker.flatMap(entry => entry.value.systolic || []),
//           diastolic: biomarker.flatMap(entry => entry.value.diastolic || [])
//         }
//       : biomarker.flatMap(entry => entry.value.value || []).filter(v => typeof v === 'number');
  
//     const status = biomarker[0]?.value.status || "";
//     const chart = biomarker[0]?.chart || "line";
//     const average = hasStringValue ? biomarker[0]?.value.average : undefined;
//     const current = hasStringValue ? biomarker[0]?.value.current : undefined;
  
//     return { dates, values, status, chart, average, current };
//   };
//   const prepareChartData = (biomarkers: BiomarkerCategory[]): ChartDataItem[] => {
//     return biomarkers?.flatMap(biomarkerObject =>
//       Object.entries(biomarkerObject).map(([key, biomarkerData]) => {
//         const { dates, values, status, chart, average, current } = extractBiomarkerData(biomarkerData);
  
//         let compatibleValues: number[] | { systolic: number[]; diastolic: number[] };
  
//         if (Array.isArray(values)) {
//           // Convert strings to numbers if necessary, or filter them out
//           compatibleValues = values.map(v => (typeof v === 'string' ? parseFloat(v) : v)).filter(v => !isNaN(v));
//         } else {
//           compatibleValues = values;
//         }
  
//         return {
//           type: key.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
//           value: average || '',
//           isMeasured: Array.isArray(values) ? values.length > 0 : (!!values.systolic?.length && !!values.diastolic?.length),
//           status,
//           otherTypes: [],
//           chartData: { dates, values: compatibleValues },
//           chart,
//           average,
//           current,
//         };
//       })
//     );
//   };
//   export const prepareDiagnosisData = (diagnosis: diagnosis[])=> {
//     return diagnosis.map(diag => {

   
//       return {
//         ...diag,
        
//       };
//     });
//   };
// export {resolveRespiration , getStatusBgColorClass , prepareChartData}