/* eslint-disable @typescript-eslint/no-explicit-any */
import Application from '../../../api/app';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import InputMentions from '../../AiChat/InputMentions';
import Circleloader from '../../CircleLoader';
type Message = {
  date: string;
  time: string;
  conversation_id: number;
  message_text: string;
  sender_id: number;
  replied_message_id: number | null;
};
type SendMessage = {
  conversation_id?: number;
  receiver_id: number;
  message_text: string;
  replied_conv_id?: number;
};

const MessagesChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<any>(null);
  const [username, setUsername] = useState<any>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const usernameParams = searchParams.get('username');
  const userMessagesList = (user_id: number) => {
    Application.userMessagesList({ user_id: user_id })
      .then((res) => {
        setMessages(res.data.reverse());
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (id != undefined) {
      setIsLoading(true);
      userMessagesList(parseInt(id));
    } else {
      setIsLoading(false);
    }
  }, [id]);
  useEffect(() => {
    if (id != undefined && usernameParams != undefined) {
      setMemberId(id);
      setUsername(usernameParams);
    } else {
      setMemberId(null);
      setUsername(null);
      setMessages([]);
    }
  }, [id, usernameParams]);
  // const [conversationId, setConversationId] = useState<number>(1);
  const [selectedBenchMarks, setSelectedBenchMarks] = useState<Array<string>>(
    [],
  );
  console.log(selectedBenchMarks);
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const newMessage: SendMessage = {
        message_text: input,
        receiver_id: memberId,
      };
      // setMessages([...messages, newMessage]);
      setInput('');
      try {
        const res = await Application.sendMessage(newMessage);
        const data = await res.data;
        console.log(data);
        userMessagesList(parseInt(memberId));
        // setConversationId(data.current_conversation_id);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const formatText = (text: string) => {
    // First, replace the bold formatting *text* with <strong>text</strong>
    const boldedText = text.replace(
      /\*(.*?)\*/g,
      (_match, p1) => `<strong>${p1}</strong>`,
    );

    // Then, split the text by \n to handle newlines
    const lines = boldedText.split('\n');

    // Return the formatted text as JSX
    return lines.map((line, index) => (
      <span key={index}>
        {/* Use dangerouslySetInnerHTML to render HTML inside the span */}
        <span dangerouslySetInnerHTML={{ __html: line }} />
        <br />
      </span>
    ));
  };
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const objDiv: any = document.getElementById('userChat');
    objDiv.scrollTop = objDiv.scrollHeight;
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <>
      <div className="w-full mx-auto bg-white shadow-200 h-[90%] rounded-[16px] relative flex flex-col">
        {isLoading ? (
          <>
            <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 w-full h-full">
              <Circleloader></Circleloader>
            </div>
          </>
        ) : (
          <>
            {messages.length !== 0 && (
              <div className="px-4 py-2 border shadow-drop bg-white border-Gray-50 rounded-t-[16px]">
                <div className="flex items-center gap-2 ">
                  <div className="min-w-10 h-10   rounded-full bg-blue-300   flex items-center justify-center mr-3 opacity-35">
                    {username?.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#383838]">
                      {username}
                    </div>
                    <div className="text-[10px] text-Text-Secondary">
                      Offline
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div
              id="userChat"
              className="p-4 space-y-4 h-[85%] overflow-y-scroll"
            >
              {messages.map((message, index: number) => (
                <>
                  {message.sender_id === memberId ? (
                    <>
                      {index == messages.length - 1 && (
                        <div ref={messagesEndRef}></div>
                      )}
                      <div className="flex justify-start items-start gap-1">
                        <div className="w-[32px] h-[32px] flex justify-center items-center rounded-full bg-backgroundColor-Main ">
                          <img
                            src={`https://ui-avatars.com/api/?name=${username}`}
                            alt=""
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <div className="text-Text-Primary font-medium text-[12px]">
                            {username}{' '}
                            <span className="text-Text-Primary ml-1">
                              {message.time}
                            </span>
                          </div>
                          <div
                            className="max-w-[500px] bg-backgroundColor-Card border border-Gray-50 p-4 text-justify  mt-1 text-[12px] text-Text-Primary rounded-[20px] rounded-tl-none "
                            style={{ lineHeight: '26px' }}
                          >
                            {formatText(message.message_text)}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-end items-start gap-1">
                        <div className="flex flex-col items-end">
                          <div className="text-Text-Primary text-[12px]">
                            Me{' '}
                            <span className="text-Text-Primary ml-1">
                              {message.time}
                            </span>
                          </div>
                          <div className="max-w-[500px] bg-[#005F7340] bg-opacity-25  p-4 text-justify mt-1 border-Gray-50 border text-Text-Primary text-[12px] rounded-[20px] rounded-tr-none ">
                            {formatText(message.message_text)}
                          </div>
                        </div>
                        <div className="w-[40px] h-[40px] overflow-hidden flex justify-center items-center rounded-full bg-[#383838]">
                          <img
                            className="rounded-full"
                            src={`https://ui-avatars.com/api/?name=${username}`}
                            alt=""
                          />
                        </div>
                      </div>
                      {index == messages.length - 1 && (
                        <div ref={messagesEndRef}></div>
                      )}
                    </>
                  )}
                </>
              ))}
              {messages.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-[28px] text-Text-Secondary">
                  No items have been selected to display the chat.
                </div>
              )}
            </div>
            {messages.length !== 0 && (
              <div className="px-2">
                <InputMentions
                  changeBenchMarks={(val: Array<string>) => {
                    setSelectedBenchMarks(val);
                  }}
                  onChange={setInput}
                  onSubmit={handleSend}
                  value={input}
                ></InputMentions>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MessagesChatBox;
