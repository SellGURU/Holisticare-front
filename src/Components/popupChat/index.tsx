/* eslint-disable @typescript-eslint/no-explicit-any */
import { BotMsg } from './botMsg.tsx';
import { UserMsg } from './userMsg.tsx';
import { InputChat } from './inputChat.tsx';
import { Fragment, useEffect, useRef, useState } from 'react';
import Application from '../../api/app.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveDiagonal } from 'lucide-react';

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
  const isRecent = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = (now - timestamp) / 1000;
    return diffInSeconds <= 60; // within the last minute
  };
  const boxRef = useRef<HTMLDivElement | null>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const box = boxRef.current;
    if (!box) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = box.offsetWidth;
    const startHeight = box.offsetHeight;

    const handleMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX);
      const newHeight = startHeight - (moveEvent.clientY - startY);

      box.style.width = Math.max(315, newWidth) + 'px';
      box.style.height = Math.max(438, newHeight) + 'px';
    };

    const stopResize = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stopResize);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={boxRef}
          style={{
            width: '315px',
            height: '458px',
            minWidth: '315px',
            maxWidth: '900px',
            maxHeight: '700px',
            minHeight: '458px',
            position: 'absolute',
          }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{
            type: 'spring',
            stiffness: 250,
            damping: 25,
            duration: 0.8,
          }}
          className=" bg-white border border-Gray-50 z-50 px-4  absolute bottom-0 right-16 rounded-2xl space-y-6 shadow-lg flex flex-col pb-4"
        >
          <div
            onMouseDown={startResize}
            className="absolute top-0 rotate-90 left-0 cursor-nw-resize z-50 p-1 text-gray-400 hover:text-gray-600"
          >
            <MoveDiagonal size={12} />
          </div>

          <h1 className={'TextStyle-Headline-6  text-Text-Primary'}>Copilot</h1>
          <div
            className={
              'min-w-[283px] w-full   flex-1 overflow-y-auto overscroll-y-auto'
            }
          >
            {MessageData.length == 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-full text-base  text-Text-Primary font-medium select-none">
                <img
                  className="size-[110px]"
                  src="/icons/empty-messages.svg"
                  alt=""
                />
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
                          isTyping={isRecent(MessageDatum.timestamp)}
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
