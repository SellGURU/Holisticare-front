/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  MessageList,
  MessagesChatBox,
} from '../../Components/DashBoardComponents';

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  // Clear unread badge when a chat is opened
  useEffect(() => {
    if (!selectedMessage) return;
    setMessages((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (
          String(m.member_id) === String(selectedMessage) &&
          m.unread_count > 0
        ) {
          changed = true;
          return { ...m, unread_count: 0 };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  }, [selectedMessage]);
  const handleMessageSent = (memberId: number) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const messageIndex = updatedMessages.findIndex(
        (msg) => msg.member_id === memberId,
      );

      if (messageIndex > -1) {
        const [movedMessage] = updatedMessages.splice(messageIndex, 1);
        // Update the Date to "Today"
        movedMessage.Date = 'Today';
        updatedMessages.unshift(movedMessage); // Move to top
      }
      return updatedMessages;
    });
  };
  return (
    <div className="h-[calc(100%-41px)] relative ">
      <div className="w-full fixed md:static top-[40px] h-[67px] md:h-auto z-20 bg-bg-color left-0 right-0  flex justify-between items-center  mt-6 px-6 ">
        <div className="text-Text-Primary font-medium opacity-[87%]">
          Messages
        </div>
        {/* <SearchBox
          ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-200"
          placeHolder="Search messages or clients…"
          onSearch={(e) => setSearch(e)}
          value={search}
        /> */}
      </div>
      <div className="w-full mt-[51px] md:mt-0 h-fit md:h-[90%]  flex justify-between px-3  md:px-6 md:pb-8 pt-4  gap-5 ">
        <div
          className={`w-full md:w-[315px] h-full  ${selectedMessage ? 'hidden md:block' : 'block'}`}
        >
          <MessageList
            messages={messages}
            setMessages={setMessages}
            onSelectMessage={setSelectedMessage}
          />
        </div>
        <div
          className={`w-full   ${selectedMessage ? 'block ' : 'hidden md:block '}`}
        >
          <MessagesChatBox
            selectMessages={selectedMessage}
            onMessageSent={handleMessageSent}
            onBack={() => setSelectedMessage(null)}
          />
        </div>
      </div>
    </div>
  );
};
export default Messages;
