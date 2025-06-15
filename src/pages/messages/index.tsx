import { useState } from 'react';
import {
  MessageList,
  MessagesChatBox,
} from '../../Components/DashBoardComponents';
import SearchBox from '../../Components/SearchBox';

const Messages = () => {
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  return (
    <div className="h-screen relative ">
      <div className="w-full fixed md:static top-[40px] h-[67px] md:h-auto z-20 bg-bg-color left-0 right-0  flex justify-between items-center  mt-6 px-6 ">
        <div className="text-Text-Primary font-medium opacity-[87%]">
          Messages
        </div>
        <SearchBox
          ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-200"
          placeHolder="Search messages or clients…"
          onSearch={(e) => setSearch(e)}
          value={search}
        />
      </div>
      <div className="w-full mt-[51px] md:mt-0 h-fit md:h-[90%]  flex justify-between px-3  md:px-6 md:pb-8 pt-4  gap-5 ">
        <div
          className={`w-full md:w-[315px] h-full  ${selectedMessage ? 'hidden md:block' : 'block'}`}
        >
          <MessageList search={search} onSelectMessage={setSelectedMessage} />
        </div>
        <div
          className={`w-full   ${selectedMessage ? 'block ' : 'hidden md:block '}`}
        >
          <MessagesChatBox onBack={() => setSelectedMessage(null)} />
        </div>
      </div>
    </div>
  );
};
export default Messages;
