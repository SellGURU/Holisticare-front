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
   <>
      <div className="w-full  flex justify-between items-center  mt-6 px-6">
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
      <div className="w-full  h-[80%] md:h-[90%] flex justify-between px-6 pb-8 pt-4 gap-5">
        <div className={`w-full md:w-[315px] h-full  ${selectedMessage ? 'hidden md:block' : 'block'}`}>
          <MessageList 
            search={search} 
            onSelectMessage={setSelectedMessage} 
          />
        </div>
        <div className={`w-full  h-  ${selectedMessage ? 'block ]' : 'hidden md:block '}`}>
          <MessagesChatBox onBack={() => setSelectedMessage(null)} />
        </div>
      </div>
      </>
  );
};
export default Messages;
