/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import Application from '../../../api/app';
import SvgIcon from '../../../utils/svgIcon';
import Circleloader from '../../CircleLoader';
import InputMentions from './InputMentions';
import MainModal from '../../MainModal';
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
};
type SendMessage = {
  conversation_id?: number;
  receiver_id: number;
  message_text: string;
  replied_conv_id?: number;
  images: string[];
};

const MessagesChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<any>(null);
  const [username, setUsername] = useState<any>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [Images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const usernameParams = searchParams.get('username');
  const userMessagesList = (member_id: number) => {
    Application.userMessagesList({ member_id: member_id })
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
  const [selectedBenchMarks, setSelectedBenchMarks] = useState<Array<string>>(
    [],
  );
  console.log(selectedBenchMarks);
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const lastConversationId =
        messages.length > 0
          ? messages[messages.length - 1].conversation_id
          : undefined;
      const newMessage: SendMessage = {
        message_text: input,
        receiver_id: memberId,
        images: Images,
        conversation_id: lastConversationId,
      };
      setMessages([
        ...messages,
        {
          conversation_id: Number(lastConversationId),
          date: new Date().toISOString(),
          message_text: input,
          replied_message_id: 0,
          sender_id: Number(memberId),
          isSending: true,
          sender_type: 'user',
          time: '',
          images: Images,
        },
      ]);
      setInput('');
      setImages([]);
      try {
        await Application.sendMessage(newMessage);
        userMessagesList(parseInt(memberId));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const formatText = (text: string) => {
    const boldedText = text.replace(
      /\*(.*?)\*/g,
      (_match, p1) => `<strong>${p1}</strong>`,
    );

    const lines = boldedText.split('\n');

    return lines.map((line, index) => (
      <span key={index}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        <br />
      </span>
    ));
  };
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    const objDiv: any = document.getElementById('userChat');
    objDiv.scrollTop = objDiv.scrollHeight;
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // const handleUpload = (file: File) => {
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     const base64String = reader.result as string;
  //     setImages((prevImages) => [...prevImages, base64String]);
  //   };
  //   reader.readAsDataURL(file);
  // };
  // const handleDeleteImage = (indexToDelete: number) => {
  //   setImages((prev) => prev.filter((_, i) => i !== indexToDelete));
  // };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };
  const colors = ['#CC85FF', '#90CAFA', '#FABA90', '#90FAB2'];
  const getColorForUsername = (username: string): string => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  const hexToRGBA = (hex: string, opacity: number = 1) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <>
      <div className="w-full mx-auto bg-white shadow-200 h-full rounded-[16px] relative flex flex-col">
        {isLoading ? (
          <>
            <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 w-full h-full rounded-[16px]">
              <Circleloader />
            </div>
          </>
        ) : (
          <>
            {messages.length !== 0 && (
              <div className="px-4 pt-4 pb-2 border shadow-drop bg-white border-Gray-50 rounded-t-[16px]">
                <div className="flex items-center gap-2">
                  <div
                    className="min-w-12 h-12 rounded-full flex items-center justify-center mr-1"
                    style={{
                      backgroundColor: hexToRGBA(
                        getColorForUsername(username),
                        0.2,
                      ),
                      color: hexToRGBA(getColorForUsername(username), 0.87),
                    }}
                  >
                    {username?.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-Text-Primary">
                      {username}
                    </div>
                    <div className="text-[10px] text-Text-Quadruple">
                      Offline
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div
              id="userChat"
              className="p-4 space-y-4 h-[80%] overflow-y-scroll"
            >
              {messages.map((message, index: number) => (
                <>
                  {message.sender_type === 'patient' ? (
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
                          <div className="flex flex-row gap-2">
                            {message.images?.map((image, index) => {
                              return (
                                <img
                                  src={image}
                                  alt=""
                                  key={index}
                                  className="w-32 h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => handleImageClick(image)}
                                />
                              );
                            })}
                          </div>
                          <div
                            className="max-w-[500px] bg-[#E9F0F2] border border-[#E2F1F8] py-2 px-4 text-justify  mt-1 text-[12px] text-Text-Primary rounded-[20px] rounded-tl-none "
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
                            <span className="text-Text-Primary mr-1">
                              {message.time}
                            </span>
                            Me{' '}
                          </div>
                          <div className="flex flex-row gap-2">
                            {message.images?.map((image, index) => {
                              return (
                                <img
                                  src={image}
                                  alt=""
                                  key={index}
                                  className="w-32 h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => handleImageClick(image)}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-end ml-1">
                            {message.isSending ? (
                              <span>
                                <MoonLoader color="#383838" size={12} />
                              </span>
                            ) : (
                              <span>
                                <SvgIcon
                                  src="./icons/tick-green.svg"
                                  color="#8a8a8a"
                                />
                              </span>
                            )}
                            <div className="max-w-[500px] bg-[#E9F0F2] border border-[#E2F1F8] px-4 py-2 text-justify mt-1  text-Text-Primary text-[12px] rounded-[20px] rounded-tr-none ">
                              {formatText(message.message_text)}
                            </div>
                          </div>
                        </div>
                        <div className="w-[40px] h-[40px] overflow-hidden flex justify-center items-center rounded-full bg-[#383838]">
                          <img
                            className="rounded-full"
                            src={`https://ui-avatars.com/api/?name=Me`}
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
                <div className="flex items-center justify-center w-full h-full text-[14px] pt-14 text-Text-Secondary">
                  No items have been selected to display the chat.
                </div>
              )}
            </div>
            {messages.length !== 0 && (
              <div className="px-2">
                <InputMentions
                  // onUpload={handleUpload}
                  // handleDeleteImage={handleDeleteImage}
                  changeBenchMarks={(val: Array<string>) => {
                    setSelectedBenchMarks(val);
                  }}
                  onChange={setInput}
                  onSubmit={handleSend}
                  value={input}
                  PlaceHolder="Enter your message here..."
                />
              </div>
            )}
          </>
        )}
      </div>

      <MainModal isOpen={isImageModalOpen} onClose={handleCloseImageModal}>
        <div className="flex flex-col items-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          )}
        </div>
      </MainModal>
    </>
  );
};

export default MessagesChatBox;
