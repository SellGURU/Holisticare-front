/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import border from '../../assets/images/profile-img-border.svg';
import ReportAnalyseView from './ReportAnalyseView';
import { useParams } from 'react-router-dom';
// import PrintReport from "./PrintReport";

const ReportAnalyse = () => {
  const { id } = useParams<{ id: string }>();

  const [generateStep, setGeneralStep] = useState('Client Summary');

  const changeStep = (step: string) => {
    setGeneralStep(step);
    document.getElementById(step)?.scrollIntoView({
      behavior: 'smooth',
    });
  };
  // const divRef = useRef<any>(null);
  const printreport = () => {
    const mywindow: any = window.open('', 'PRINT', 'height=300,width=800');
    mywindow.document.write(`
        <html>
            <head>
            <title>${document.title}</title>
            <!-- Link to Tailwind CSS -->
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            <style>
                @media print {
                body {
                    background-color: white !important;
                }
                .bg-gray-100 {
                    background-color: #f3f4f6 !important; /* Tailwind Gray 100 */
                }
                .bg-blue-500 {
                    background-color: #3b82f6 !important; /* Tailwind Blue 500 */
                }
                .no-split {
                page-break-inside: avoid; /* Prevents splitting the element */
                break-inside: avoid;     /* For modern browsers */
                }                    
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }                    
                }
            </style>            
            </head>
            <body>
            ${document.getElementById('printDiv')?.innerHTML}
            </body>
        </html>
        `);
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.onload = () => {
      mywindow.focus(); // necessary for IE >= 10*/

      mywindow.print();
      mywindow.close();
    };
    // mywindow.print()
  };
  // resolveRefrences()
  return (
    <>
      <div
        className="w-full bg-[#121212]  "
        style={{ height: window.innerHeight }}
      >
        <div className="w-full flex justify-between items-start h-full p-6 pr-0 fixed">
          <div className="bg-[#1E1E1E] relative  w-[240px] h-[600px] rounded-[6px]">
            <img
              onClick={() => printreport()}
              className="absolute w-5 right-2 top-2 cursor-pointer"
              src="./Themes/Aurora/icons/Upload icon.svg"
              alt=""
            />
            <div className="flex justify-center items-center pt-4">
              <img src={border} className="w-[81px] h-[81px]" alt="" />
              <img
                className="absolute w-[70px] h-[70px] rounded-full"
                src={`https://ui-avatars.com/api/?name=userName`}
                alt=""
              />
              {/* <div className="absolute text-[#FFFFFF61] text-[38px]">LA</div> */}
            </div>
            <div className="text-center text-[#FFFFFFDE] mt-[28px] text-[18px] font-medium">
              Leslie Alexander
            </div>
            <div className="text-[#FFFFFF99] text-[10px] text-center mt-4 font-medium">
              Check-up date: <span>2024/02/02</span>{' '}
            </div>
            <div className="px-6 mt-6">
              <div className="flex gap-1 mb-2 text-[12px] justify-start items-center">
                <div className="text-[#FFFFFF99] font-medium">Age:</div>
                <div className="text-[#FFFFFFDE]">48 Years</div>
              </div>
              <div className="flex gap-1 mb-2 text-[12px] justify-start items-center">
                <div className="text-[#FFFFFF99] font-medium">Sex:</div>
                <div className="text-[#FFFFFFDE]">Female</div>
              </div>
              <div className="flex gap-1 mb-2 text-[12px] justify-start items-center">
                <div className="text-[#FFFFFF99] font-medium">Height:</div>
                <div className="text-[#FFFFFFDE]">180 cm</div>
              </div>
              <div className="flex gap-1 mb-2 text-[12px] justify-start items-center">
                <div className="text-[#FFFFFF99] font-medium">Weight:</div>
                <div className="text-[#FFFFFFDE]">75 kg</div>
              </div>

              <div className="flex gap-1 mb-2 text-[12px] justify-start items-center">
                <div className="text-[#FFFFFF99] font-medium">Conditions:</div>
                <div className="text-[#FFFFFFDE]">-</div>
              </div>
            </div>
            <div className="absolute bottom-10  flex justify-center w-full">
              <div className="flex justify-center gap-2 items-end">
                <div className="text-[12px] text-[#FFFFFFDE]">Powered by</div>
                <img
                  className="w-[63px] mt-6"
                  src="./images/Logo3.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="flex-grow w-full max-w-[85%]  ">
            <div className=" relative z-50 mx-6 h-[56px] flex justify-evenly border-light-border-color bg-white border dark:border-[#383838]  dark:bg-[#272727] rounded-[6px] ">
              <div
                onClick={() => changeStep('Client Summary')}
                className="flex  cursor-pointer justify-center items-center gap-2"
              >
                <div
                  className={`w-5 h-5 rounded-full ${generateStep == 'Client Summary' ? 'dark:border-primary-color dark:text-primary-color text-light-blue-active border-light-blue-active' : 'text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]'} border flex justify-center items-center text-[12px] font-medium `}
                >
                  1
                </div>
                <div
                  className={`text-[12px] ${generateStep == 'Client Summary' ? 'dark:text-primary-color text-light-blue-active' : ' text-light-primary-text dark:text-[#FFFFFF99]'} font-medium `}
                >
                  Client Summary
                </div>
              </div>

              <img
                className="w-[16px] invert dark:invert-0"
                src="./Themes/Aurora/icons/nextStep.svg"
                alt=""
              />

              <div
                onClick={() => {
                  changeStep('Out of Reference');
                }}
                className="flex  cursor-pointer justify-center items-center gap-2"
              >
                <div
                  className={`w-5 h-5 rounded-full ${generateStep == 'Out of Reference' ? 'dark:border-primary-color dark:text-primary-color text-light-blue-active border-light-blue-active' : 'text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]'} border flex justify-center items-center text-[12px] font-medium `}
                >
                  2
                </div>
                <div
                  className={`text-[12px] ${generateStep == 'Out of Reference' ? 'dark:text-primary-color text-light-blue-active' : ' text-light-primary-text dark:text-[#FFFFFF99]'} font-medium `}
                >
                  Out of Reference{' '}
                </div>
              </div>

              <img
                className="w-[16px] invert dark:invert-0"
                src="./Themes/Aurora/icons/nextStep.svg"
                alt=""
              />

              <div
                onClick={() => changeStep('Detailed analysis')}
                className="flex cursor-pointer justify-center items-center gap-2"
              >
                <div
                  className={`w-5 h-5 rounded-full ${generateStep == 'Detailed analysis' ? 'dark:border-primary-color dark:text-primary-color text-light-blue-active border-light-blue-active' : 'text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]'} border flex justify-center items-center text-[12px] font-medium `}
                >
                  3
                </div>
                <div
                  className={`text-[12px] ${generateStep == 'Detailed analysis' ? 'dark:text-primary-color text-light-blue-active' : ' text-light-primary-text dark:text-[#FFFFFF99]'} font-medium `}
                >
                  Detailed analysis
                </div>
              </div>

              <img
                className="w-[16px] invert dark:invert-0"
                src="./Themes/Aurora/icons/nextStep.svg"
                alt=""
              />

              <div
                onClick={() => changeStep('Treatment Plan')}
                className="flex cursor-pointer justify-center items-center gap-2"
              >
                <div
                  className={`w-5 h-5 rounded-full ${generateStep == 'Treatment Plan' ? 'dark:border-primary-color dark:text-primary-color text-light-blue-active border-light-blue-active' : 'text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]'} border flex justify-center items-center text-[12px] font-medium `}
                >
                  4
                </div>
                <div
                  className={`text-[12px] ${generateStep == 'Treatment Plan' ? 'dark:text-primary-color text-light-blue-active' : ' text-light-primary-text dark:text-[#FFFFFF99]'} font-medium `}
                >
                  Treatment Plan
                </div>
              </div>

              <img
                className="w-[16px] invert dark:invert-0"
                src="./Themes/Aurora/icons/nextStep.svg"
                alt=""
              />

              <div
                onClick={() => changeStep('Concerning Result')}
                className="flex cursor-pointer justify-center items-center gap-2"
              >
                <div
                  className={`w-5 h-5 rounded-full ${generateStep == 'Concerning Result' ? 'dark:border-primary-color dark:text-primary-color text-light-blue-active border-light-blue-active' : 'text-light-primary-text border-light-primary-text dark:text-[#FFFFFF99]'} border flex justify-center items-center text-[12px] font-medium `}
                >
                  5
                </div>
                <div
                  className={`text-[12px] ${generateStep == 'Concerning Result' ? 'dark:text-primary-color text-light-blue-active' : ' text-light-primary-text dark:text-[#FFFFFF99]'} font-medium `}
                >
                  Concerning Result
                </div>
              </div>
            </div>
            <div className="">
              <ReportAnalyseView
                setActiveCheckProgress={() => {}}
                memberID={Number(id)}
              ></ReportAnalyseView>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportAnalyse;
