/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        inter: ['Inter', 'sans-serif'],
      },
      colors:{
        "bg-color":"#E9F0F2",
        "Boarder":"#E2F1F8",
        "Red":"#FC5474",
        "Green":"#06C78D",
        "Orange":"#FBAD37",
        "Blue":"#4C88FF",
        "Disable":"#909090",
        "Primary":{
          "DeepTeal":"#005F73",
          "EmeraldGreen":"#6CC24A"
        },
        "Secondary":{
          "LightBlue":"#8ECAE6",
          "SelverGray":"#E5E5E5"
        },
        "Text":{
          "Primary":"#383838",
          "Secondary":"#38383899",
          "Triarty":"#38383866"
        },
        "backgroundColor":{
          "Main":"#F4F4F4",
          "Card":"#FDFDFD",
          "Secondary":"#FCFCFC"
        },
        "Gray":{
          "0":"#FFFFFF",
          "15":"#F8F9FC",
          "25":"#F5F7FA",
          "50":"#E9EDF5",
          "100":"#D0DDEC",
          "200":"#AEC1DA",
          "300":"#92A7C1",
          "400":"#7B93AF",
          "500":"#6783A0",
          "600":"#57728E",
          "700":"#445A74",
          "800":"#30445B",
          "900":"#253343"
        }
      },
      boxShadow:{
        "Btn":"0px 0px 4px 0px #00000026",
        "100":"0px 2px 4px -2px #18274B1F,0px 4px 4px -2px #18274B14",
        "200":"0px 4px 6px -4px #18274B1F, 0px 8px 8px -4px #18274B14 ",
        "300":"0px 6px 8px -6px #18274B1F, 0px 8px 16px -6px #18274B14 ",
        "400":"0px 6px 12px -6px #18274B1F, 0px 8px 24px -4px #18274B14 ",
        "500":"0px 6px 14px -6px #18274B1F, 0px 10px 32px -4px #18274B1F ",
        "600":"0px 8px 18px -6px #18274B1F, 0px 12px 42px -4px #18274B1F",
        "700":"0px 8px 22px -6px #18274B1F, 0px 14px 64px -4px #18274B1F ",
        "800":"0px 8px 28px -6px #18274B1F, 0px 18px 88px -4px #18274B24 ",
        "input":"0px 0px 4px 0px #18274B1F"
      },
    },
  },
  plugins: [],
};
