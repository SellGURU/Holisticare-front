/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { ButtonPrimary } from "../Button/ButtonPrimary";
export const TopBar = () => {
  const navigate = useNavigate();
  const printreport  = () => {
      const mywindow:any = window.open("", "PRINT", "height=300,width=800");
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
          ${document.getElementById("printDiv")?.innerHTML}
          </body>
      </html>
      `);
      mywindow.document.close(); // necessary for IE >= 10
      mywindow.onload = () => {
          mywindow.focus(); // necessary for IE >= 10*/
  
          mywindow.print();
          mywindow.close();

      }
      // mywindow.print()        
  }  
  return (
    <div className="w-full flex items-center justify-between bg-white border-b  border-gray-50 pl-4 pr-6 py-2 shadow-100">
      <div className="flex gap-2 items-center ">
        <img src="/icons/home.svg" alt="" />
        <div
          onClick={() => navigate("/")}
          className="TextStyle-Button text-[#445A74] cursor-pointer ml-1"
        >
          Home
        </div>

        <img className="w-5 h-5" src="/icons/arrow-right.svg" alt="" />
        <span className="TextStyle-Button text-[#6783A0]">Report</span>
      </div>
      <div className="flex gap-10 ">
        <div className="flex gap-3">
        <ButtonPrimary onClick={printreport}>
          <img src="/icons/download.svg" alt="" />
          Download
        </ButtonPrimary>
        <div className="flex items-center gap-1 TextStyle-Button text-[#005F73] cursor-pointer ">
            <img src="/icons/share.svg" alt="" />
            Share
          </div>
        </div>
        
          <div className="flex items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]">
          <img src="/icons/topbar-logo2.png" alt="" />
          Clinic Longevity 1
        </div>
      </div>
    </div>
  );
};
