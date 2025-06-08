/* eslint-disable @typescript-eslint/no-explicit-any */
import { BotMsg } from './botMsg.tsx';
import { UserMsg } from './userMsg.tsx';
import { InputChat } from './inputChat.tsx';
import { Fragment, useEffect, useRef, useState } from 'react';
import Application from '../../api/app.ts';

type Message = {
  timestamp: number;
  entrytime: string;
  request: string;
  response: string;
};

type SendMessage = {
  conversation_id?: number;
  receiver_id: number;
  message_text: string;
  replied_conv_id?: number;
  images: string[];
};

export const PopUpChat = ({
  isOpen,
  memberId,
  // info,
}: {
  memberId: string;
  isOpen: boolean;
  info: any;
}) => {
  const [MessageData, setMessageData] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number>(1);
  const [conversationIdData, setConversationIdData] = useState<number>(0);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    Application.getListChats({
      member_id: memberId,
      chatting_with: 'ai',
    }).then((res) => {
      setMessageData(res.data.messages);
      setConversationIdData(res.data.conversation_id);
    });
  }, []);
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const lastConversationId =
        MessageData.length > 0 ? conversationIdData : undefined;
      const newMessage: SendMessage = {
        message_text: input,
        receiver_id: Number(memberId),
        images: [],
        conversation_id: lastConversationId,
      };
      setMessageData([
        ...MessageData,
        {
          request: input,
          timestamp: Date.now(),
          entrytime: '',
          response: '',
        },
      ]);
      setInput('');
      try {
        const res = await Application.aiStudio_copilotChat({
          text: newMessage.message_text,
          member_id: memberId,
          conversation_id: conversationId,
          search: false,
          benchmark_areas: [],
        });

        const data = await res.data;
        setConversationId(data.current_conversation_id);
        const aiMessage: Message = {
          response: data.answer,
          timestamp: Date.now(),
          entrytime: '',
          request: '',
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
          <h1 className={'TextStyle-Headline-6 text-Text-Primary'}>Copilot</h1>
          <div
            className={'w-[283px] h-[293px] overflow-y-auto overscroll-y-auto'}
          >
            {MessageData.map((MessageDatum, index) => {
              return (
                <Fragment key={index}>
                  {MessageDatum.request && (
                    <UserMsg
                      time={MessageDatum.timestamp}
                      msg={MessageDatum.request}
                      info={{
                        picture:JSON.parse(localStorage.getItem("brandInfoData")as string)?.selectedImage,
                        name:JSON.parse(localStorage.getItem("brandInfoData")as string)?.name,
                      }}
                    />
                  )}
                  {MessageDatum.response && (
                    <BotMsg
                      time={MessageDatum.timestamp}
                      msg={MessageDatum.response}
                    />
                  )}
                </Fragment>
              );
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
