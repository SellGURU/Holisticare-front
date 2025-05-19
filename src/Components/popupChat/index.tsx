/* eslint-disable @typescript-eslint/no-explicit-any */
import { BotMsg } from './botMsg.tsx';
import { UserMsg } from './userMsg.tsx';
import { InputChat } from './inputChat.tsx';
import { useEffect, useRef, useState } from 'react';
import Application from '../../api/app.ts';

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
  info,
}: {
  memberId: string;
  isOpen: boolean;
  info: any;
}) => {
  const [MessageData, setMessageData] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number>(1);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    Application.userMessagesList({
      member_id: memberId,
      message_from: 'ai',
    }).then((res) => {
      setMessageData(res.data);
    });
  }, []);
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const lastConversationId =
        MessageData.length > 0
          ? MessageData[MessageData.length - 1].conversation_id
          : undefined;
      const newMessage: SendMessage = {
        message_text: input,
        receiver_id: Number(memberId),
        images: [],
        conversation_id: lastConversationId,
      };
      setMessageData([
        ...MessageData,
        {
          conversation_id: Number(lastConversationId),
          date: new Date().toISOString(),
          message_text: input,
          replied_message_id: 0,
          sender_id: Number(memberId),
          isSending: true,
          sender_type: 'patient',
          time: '',
          images: [],
          timestamp: Date.now(),
          name: '',
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
          conversation_id: MessageData.length + 2,
          sender_id: 2,
          message_text: data.answer,
          date: new Date().toISOString(),
          replied_message_id: 0,
          sender_type: 'ai',
          timestamp: Date.now(),
          name: '',
          time: new Date().toLocaleTimeString(),
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
            {MessageData.map((MessageDatum) => {
              if (MessageDatum.sender_type == 'patient') {
                return (
                  <>
                    <UserMsg
                      time={MessageDatum.time}
                      msg={MessageDatum.message_text}
                      key={MessageDatum.conversation_id}
                      info={info}
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <BotMsg
                      time={MessageDatum.time}
                      msg={MessageDatum.message_text}
                      key={MessageDatum.conversation_id}
                    />
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
