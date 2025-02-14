import { BotMsg } from '../../popupChat/botMsg.tsx';
import { UserMsg } from '../../popupChat/userMsg.tsx';
import { InputChat } from '../../popupChat/inputChat.tsx';
import { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app.ts';
interface ChatModalProps {
  memberId: undefined | string;
  info: any;
}
type Message = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  time: string;
};

export const ChatModal: React.FC<ChatModalProps> = ({ memberId, info }) => {
  const [MessageData, setMessageData] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number>(1);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    Application.getListChats({
      member_id: memberId,
    }).then((res) => {
      const resolve = res.data.messages.flatMap((mes: any, index: number) => {
        const request: Message = {
          id: 1,
          sender: 'user',
          text: mes.request,
          time: mes.entrytime,
        };
        const response: Message = {
          id: index,
          sender: 'ai',
          text: mes.response,
          time: mes.entrytime,
        };
        return [request, response];
      });
      setMessageData(resolve);
      // console.log(resolve)
    });
  }, []);
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const newMessage: Message = {
        id: MessageData.length + 1,
        sender: 'user',
        text: input,
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessageData([...MessageData, newMessage]);
      setInput('');
      try {
        const res = await Application.aiStudio_copilotChat({
          text: newMessage.text,
          member_id: memberId,
          conversation_id: conversationId,
          search: false,
          benchmark_areas: [],
        });
        console.log(res);

        const data = await res.data;
        setConversationId(data.current_conversation_id);
        const aiMessage: Message = {
          id: MessageData.length + 2,
          sender: 'ai',
          text: data.answer,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessageData((prevMessages) => [...prevMessages, aiMessage]);
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [MessageData]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  return (
    <div className="w-full h-full ">
      {MessageData.length < 1 ? (
        <div className="relative h-[85vh]">
          {' '}
          <div className="w-full  flex flex-col items-center justify-center h-[250px]  gap-2">
            <img src="/images/direct.svg" alt="" />
            <div className="text-Text-Primary text-xs">
              No History Available
            </div>
          </div>
          <div className="w-full absolute bottom-0 flex justify-center">
            <InputChat
              onChange={(event) => setInput(event.target.value)}
              sendHandler={handleSend}
            />
          </div>
        </div>
      ) : (
        <div className={'   flex flex-col justify-between'}>
          {/* <h1 className={"TextStyle-Headline-6"}>Copilot</h1> */}
          <div
            className={
              'w-[283px] h-[533px] overflow-y-auto overscroll-y-auto  '
            }
          >
            {MessageData.map((MessageDatum) => {
              if (MessageDatum.sender == 'user') {
                return (
                  <>
                    <UserMsg
                      time={MessageDatum.time}
                      info={info}
                      msg={MessageDatum.text}
                      key={MessageDatum.id}
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <BotMsg
                      time={MessageDatum.time}
                      msg={MessageDatum.text}
                      key={MessageDatum.id}
                    />
                  </>
                );
              }
            })}

            <div ref={messagesEndRef}></div>
          </div>
          <div className="w-full">
            <InputChat
              onChange={(event) => setInput(event.target.value)}
              sendHandler={handleSend}
            />
          </div>
        </div>
      )}
    </div>
  );
};
