import {
  MessageList,
  MessagesChatBox,
} from '../../Components/DashBoardComponents';

export const Messages = () => {
  return (
    <div className="w-full h-full flex justify-between px-6 py-10 gap-5">
      <div className="w-[315px] h-full">
        <MessageList isMessages></MessageList>
      </div>
      <MessagesChatBox></MessagesChatBox>
    </div>
  );
};
