import { BotMsg } from '../../popupChat/botMsg.tsx';
import { UserMsg } from '../../popupChat/userMsg.tsx';
import { InputChat } from '../../popupChat/inputChat.tsx';
import { FC, useEffect, useRef, useState } from 'react';
import Application from '../../../api/app.ts';
import Circleloader from '../../CircleLoader/index.tsx';
interface ChatModalProps {
  memberId: number;
}
type SendMessage = {
  conversation_id?: number;
  receiver_id: number;
  message_text: string;
  replied_conv_id?: number;
};
type Message = {
  date: string;
  time: string;
  conversation_id: number;
  message_text: string;
  sender_id: number;
  isSending?: boolean;
  replied_message_id: number | null;
  sender_type: string;
  images?: string[];
  timestamp: number;
  name: string;
};

export const ChatModal: FC<ChatModalProps> = ({ memberId }) => {
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const userMessagesList = (member_id: number) => {
    setLoading(true);
    Application.getListChats({ member_id: member_id })
      .then((res) => {
        setMessageData(res.data.reverse());
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (memberId) {
      userMessagesList(memberId);
    }
  }, [memberId]);
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const lastConversationId =
        messageData.length > 0
          ? messageData[messageData.length - 1].conversation_id
          : undefined;
      const newMessage: SendMessage = {
        message_text: input,
        receiver_id: memberId,
        conversation_id: lastConversationId,
      };
      setMessageData([
        ...messageData,
        {
          conversation_id: Number(lastConversationId),
          date: new Date().toISOString(),
          message_text: input,
          replied_message_id: 0,
          sender_id: Number(memberId),
          isSending: true,
          sender_type: 'user',
          time: '',
          timestamp: Date.now(),
          name: '',
        },
      ]);
      setInput('');
      try {
        await Application.sendMessage(newMessage);
        userMessagesList(memberId);
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messageData]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 w-full h-full rounded-[16px] absolute">
          <Circleloader />
        </div>
      )}
      {messageData.length < 1 ? (
        <div className="relative h-[85vh]">
          {' '}
          <div className="w-full  flex flex-col items-center justify-center h-[533px]  ">
            <img src="/icons/EmptyInbox.svg" alt="" />
            <div className="text-Text-Primary font-medium text-xs">
              No history found.
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
        <div className={'h-[84vh] flex flex-col justify-between'}>
          {/* <h1 className={"TextStyle-Headline-6"}>Copilot</h1> */}
          <div className={'w-full h-[90%] overflow-y-auto overscroll-y-auto'}>
            {messageData.map((message) => {
              if (message.sender_type == 'user') {
                return (
                  <>
                    <UserMsg
                      time={new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                      name={message.name}
                      msg={message.message_text}
                      key={message.conversation_id}
                      isSending={message.isSending}
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <BotMsg
                      time={new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                      msg={message.message_text}
                      key={message.conversation_id}
                      name={message.name}
                    />
                  </>
                );
              }
            })}

            <div ref={messagesEndRef}></div>
          </div>
          <div className="w-full ">
            <InputChat
              onChange={(event) => setInput(event.target.value)}
              sendHandler={handleSend}
              Placeholder="Enter your message here..."
            />
          </div>
        </div>
      )}
    </div>
  );
};
