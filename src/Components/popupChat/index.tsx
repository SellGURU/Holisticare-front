/* eslint-disable @typescript-eslint/no-explicit-any */
import { BotMsg } from './botMsg.tsx';
import { UserMsg } from './userMsg.tsx';
import { InputChat } from './inputChat.tsx';
import { Fragment, useEffect, useRef, useState } from 'react';
import Application from '../../api/app.ts';
import { motion, AnimatePresence } from 'framer-motion';
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
  // const [conversationId, setConversationId] = useState<number>(1);
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
        MessageData.length > 0 ? conversationIdData : 1;
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
          conversation_id: lastConversationId,
          search: false,
          benchmark_areas: [],
        });

        const data = await res.data;
        setConversationIdData(data.current_conversation_id);
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
    <AnimatePresence>
      {isOpen && (
           <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{
            type: 'spring',
            stiffness: 250,
            damping: 25,
            duration: 0.8,
          }}
          className="w-[315px] h-[438px] bg-white border border-Gray-50 z-50 p-4 pb-0 absolute bottom-0 right-16 rounded-2xl space-y-6 shadow-lg"
        >
          <h1 className={'TextStyle-Headline-6 text-Text-Primary'}>Copilot</h1>
          <div
            className={'w-[283px] h-[293px] overflow-y-auto overscroll-y-auto'}
          >
            {MessageData.length == 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-full text-base  text-Text-Primary font-medium select-none">
                <img className='size-[110px]' src="/icons/empty-messages.svg" alt="" />
                No messages found
              </div>
            ) : (
              <>
                {MessageData.map((MessageDatum, index) => {
                  return (
                    <Fragment key={index}>
                      {MessageDatum.request && (
                        <UserMsg
                          time={MessageDatum.timestamp}
                          msg={MessageDatum.request}
                          info={{
                            picture: JSON.parse(
                              localStorage.getItem('brandInfoData') as string,
                            )?.selectedImage,
                            name: JSON.parse(
                              localStorage.getItem('brandInfoData') as string,
                            )?.name,
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
              </>
            )}
          </div>
          <InputChat
            onChange={(event) => setInput(event.target.value)}
            sendHandler={handleSend}
          />
     </motion.div>
      )}
    </AnimatePresence>
  );
};
