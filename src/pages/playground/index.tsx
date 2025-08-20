/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
// import SearchBox from "../../Components/SearchBox";
// import { MessageList } from "../../Components/DashBoardComponents";
import PlaygroundList from "./PlaygroundList";
import Application from "../../api/app";
import PlayGproundShow from "./PlayGproundShow";
// import { ButtonPrimary } from "../../Components/Button/ButtonPrimary";
import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";
import AddPlayGround from "./addPlayGround";

const Playground = () => {
//   const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [allTests, setAllTests] = useState<any[]>([]);
  const getPlaygroundList = () => {
    Application.getPlaygroundList().then((res) => {
      setAllTests(res.data);
    });
  }
  useEffect(() => {
    getPlaygroundList();
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="h-[calc(100%-41px)] relative ">
        <div className="w-full fixed md:static top-[40px] h-[67px] md:h-auto z-20 bg-bg-color left-0 right-0  flex justify-between items-center  mt-6 px-6 ">
            <div className="text-Text-Primary font-medium opacity-[87%]">
            Playground
            </div>    
            <div>
                <ButtonSecondary
                  style={{ borderRadius: '20px' }}
                  onClick={() => {
                    setIsOpen(true);
                    // navigate('/addClient');
                  }}
                >
                  {/* <img className="mr-1" src="/icons/user-add2.svg" alt="" /> */}
                  Add Test
                </ButtonSecondary>
            </div>
            {/* <SearchBox
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-200"
            placeHolder="Search messages or clients…"
            onSearch={(e) => setSearch(e)}
            value={search}
            />             */}
        </div>

      <div className="w-full mt-[51px] md:mt-0 h-fit md:h-[90%]  flex justify-between px-3  md:px-6 md:pb-8 pt-4  gap-5 ">
        <div
          className={`w-full md:w-[315px] h-full  ${selectedMessage ? 'hidden md:block' : 'block'}`}
        >
          <PlaygroundList
            messages={allTests}
            setMessages={() => {}}
            search={''}
            onSelectMessage={setSelectedMessage}
          />
        </div>
        <div
          className={`w-full   ${selectedMessage ? 'block ' : 'hidden md:block '}`}
        >
            {selectedMessage &&
            <PlayGproundShow data={selectedMessage} />
            }
        </div>
        <AddPlayGround onSubmited={() => {
          getPlaygroundList();
        }} isOpen={isOpen} onClose={() => {
            setIsOpen(false);
        }} />
      </div>
    </div>
  )
};

export default Playground;