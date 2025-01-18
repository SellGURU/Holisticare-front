// import React from 'react'
import { MessageList } from '../../Components/DashBoardComponents';
import AiChat from './Chat';
// import Application from '../../api/app'

export const Messages = () => {
  return (
    <div className="w-full flex justify-between px-6 py-10 gap-5 ">
      <div className="w-[315px]">
        <MessageList isMessages></MessageList>
      </div>

      <AiChat></AiChat>
    </div>
  );
};
