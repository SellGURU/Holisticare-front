/* eslint-disable @typescript-eslint/no-explicit-any */
import { BotMsg } from './botMsg.tsx';
import { UserMsg } from './userMsg.tsx';
import { InputChat } from './inputChat.tsx';
import { useEffect, useRef, useState } from 'react';
import Application from '../../api/app.ts';

type Message = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  time: string;
};

export const PopUpChat = ({
  isOpen,
  memberId,
  info,
}: {
  memberId: string;
  isOpen: boolean;
  info: any;
}) => {
  // const memberIdTest="872642194025"
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
  }, [MessageData, isOpen]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  return (
    <>
      {isOpen && (
        <div
          className={
            'w-[315px] h-[438px] bg-white border border-Gray-50 z-50 p-4 pb-0 absolute bottom-0 right-16 rounded-2xl space-y-6'
          }
        >
          <h1 className={'TextStyle-Headline-6'}>Copilot</h1>
          <div
            className={'w-[283px] h-[293px] overflow-y-auto overscroll-y-auto'}
          >
            {MessageData.map((MessageDatum) => {
              if (MessageDatum.sender == 'user') {
                return (
                  <>
                    <UserMsg
                      info={info}
                      msg={MessageDatum.text}
                      key={MessageDatum.id}
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <BotMsg msg={MessageDatum.text} key={MessageDatum.id} />
                  </>
                );
              }
            })}

            <div ref={messagesEndRef}></div>
          </div>
          <InputChat
            onChange={(event) => setInput(event.target.value)}
            sendHandler={handleSend}
          />
        </div>
      )}
    </>
  );
};
