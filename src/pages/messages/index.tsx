import { useState } from 'react';
import {
  MessageList,
  MessagesChatBox,
} from '../../Components/DashBoardComponents';
import SearchBox from '../../Components/SearchBox';

const Messages = () => {
  const [search, setSearch] = useState('');
  return (
    <>
      <div className="w-[97.2%] flex justify-between items-center mt-6 ml-6">
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
      <div className="w-full h-[90%] flex justify-between px-6 pb-8 pt-4 gap-5">
        <div className="w-[315px] h-full">
          <MessageList search={search}></MessageList>
        </div>
        <MessagesChatBox></MessagesChatBox>
      </div>
    </>
  );
};
export default Messages;
