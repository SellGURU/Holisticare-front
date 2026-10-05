/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import Application from '../../../api/app';
import { getCached } from '../../../utils/pageCache';
import { PORTAL_CACHE_KEYS } from '../../../utils/cacheKeys';
import Circleloader from '../../CircleLoader';
import InputMentions from './InputMentions';
import MainModal from '../../MainModal';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import SvgIcon from '../../../utils/svgIcon';
import SearchBox from '../../SearchBox';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import { useVisibilityAwarePoll } from '../../../hooks/useVisibilityAwarePoll';
import { Tooltip } from 'react-tooltip';
import { ChatDateSeparator } from '../../ComboBar/components/ChatDateSeparator';
import { ChatMessageBubble } from '../../ComboBar/components/ChatMessageBubble';
import {
  groupMessagesByDay,
  messageListKey,
  normalizeHistoryResponse,
  sortMessagesChronologically,
} from '../../ComboBar/components/chatMessageUtils';
import type { ChatMessage } from '../../ComboBar/components/chatTypes';
import { useCoachChatThread } from '../../ComboBar/components/useCoachChatThread';
interface MessagesChatBoxProps {
  onBack: () => void;
  onMessageSent?: (memberId: number) => void;
  selectMessages: string | null;
}

const MessagesChatBox: React.FC<MessagesChatBoxProps> = ({
  onBack,
  onMessageSent,
  selectMessages,
}) => {
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [memberId, setMemberId] = useState<any>(null);
  const [username, setUsername] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [Images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const options = [
    { label: 'Coach', value: false },
    { label: 'AI Copilot', value: true },
  ];
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    setAiMode(false);
  }, [memberId]);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const usernameParams = searchParams.get('username');
  const statusParams = searchParams.get('status');
  const coachMemberId = id != null ? Number(id) : NaN;
  const coachThread = useCoachChatThread({
    memberId: Number.isFinite(coachMemberId) ? coachMemberId : null,
    liveEnabled: Boolean(coachMemberId) && !aiMode,
    onSent: (sentMemberId) => onMessageSent?.(sentMemberId),
  });
  const aiMessagesList = (member_id: number) => {
    setIsLoading(true);
    getCached(PORTAL_CACHE_KEYS.messagesThreadAi(member_id), () =>
      Application.userMessagesList({
        member_id: member_id,
        message_from: 'ai',
      }).then((res) => res.data),
    )
      .then((data) => {
        setAiMessages(
          sortMessagesChronologically(
            normalizeHistoryResponse(data).messages,
          ),
        );
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (id != undefined && aiMode === true) {
      aiMessagesList(parseInt(id));
    }
  }, [aiMode, id]);
  useEffect(() => {
    if (id != undefined && usernameParams != undefined) {
      setMemberId(id);
      setUsername(usernameParams);
    } else {
      setMemberId(null);
      setUsername(null);
    }
  }, [id, usernameParams]);
  const pollUnreadMessages = useCallback(() => {
    if (!username || !memberId || !aiMode) return;
    Application.has_unread_message({
      member_id: memberId,
    })
      .then((res) => {
        if (res?.data?.has_unread === true) {
          aiMessagesList(parseInt(memberId));
        }
      })
      .catch(() => {});
  }, [aiMode, memberId, username]);

  useVisibilityAwarePoll(
    pollUnreadMessages,
    15000,
    Boolean(username && memberId && aiMode),
    {
      immediate: false,
    },
  );
  const [, setSelectedBenchMarks] = useState<Array<string>>([]);
  const handleSend = async () => {
    await coachThread.handleSend(undefined, { images: Images });
    setImages([]);
  };

  const formatText = (text: string) => {
    // ابتدا بولدها رو جایگزین می‌کنیم
    const boldedText = text.replace(
      /\*(.*?)\*/g,
      (_match, p1) => `<strong>${p1}</strong>`,
    );

    // سپس لینک‌ها رو جایگزین می‌کنیم
    const linkifiedText = boldedText.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`,
    );

    // متن رو به خطوط تقسیم می‌کنیم
    const lines = linkifiedText.split('\n');

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
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  };
  useEffect(() => {
    if (aiMode) {
      scrollToBottom();
    }
  }, [aiMessages, aiMode]);
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
  const [isSearchOpen, setisSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef(null);
  useModalAutoClose({
    refrence: searchRef,
    close: () => {
      setisSearchOpen(false);
    },
  });
  const [searchedMessages, setSearchedMessages] = useState<ChatMessage[] | null>(
    null,
  );
  const [searchedAiMessages, setSearchedAiMessages] = useState<
    ChatMessage[] | null
  >(null);

  useEffect(() => {
    if (!memberId) return;

    const term = search.trim().toLowerCase();

    if (!term) {
      setSearchedMessages(null);
      setSearchedAiMessages(null);
      return;
    }

    if (aiMode) {
      const filtered = aiMessages.filter((msg) =>
        msg.message_text?.toLowerCase().includes(term),
      );
      setSearchedAiMessages(filtered);
    } else {
      const filtered = coachThread.messageData.filter((msg) =>
        msg.message_text?.toLowerCase().includes(term),
      );
      setSearchedMessages(filtered);
    }
  }, [search, aiMode, coachThread.messageData, aiMessages, memberId]);
  const coachGroups = useMemo(
    () => groupMessagesByDay(searchedMessages ?? coachThread.messageData),
    [searchedMessages, coachThread.messageData],
  );
  const peerOnline =
    coachThread.presence?.peer.online ?? statusParams === 'true';
  const [isMobilePage, setIsMobilePage] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobilePage(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobileSearchOpen = () => {
    if (isSearchOpen) {
      if (isMobilePage) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };
  return (
    <>
      <div className="w-full  mx-auto bg-white shadow-200 h-[75vh] md:h-full rounded-[16px] relative  flex flex-col">
        {(aiMode ? isLoading : coachThread.isLoading && coachThread.messageData.length < 1) ? (
          <>
            <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 w-full h-full rounded-[16px]">
              <Circleloader />
            </div>
          </>
        ) : (
          <>
            {coachThread.messageData.length !== 0 || username ? (
              <div className="px-4 pt-4 pb-2 border shadow-drop bg-white border-Gray-50 rounded-t-[16px]  flex items-center justify-between ">
                {isMobileSearchOpen() ? (
                  <div className="flex items-center gap-2">
                    <div
                      onClick={onBack}
                      className="flex cursor-pointer md:hidden"
                    >
                      <img
                        src="/icons/arrow-left-new.svg"
                        className="size-8"
                        alt=""
                      />
                    </div>
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
                    <div className="w-[80%]">
                      <div className="text-sm font-medium w-full text-Text-Primary">
                        <TooltipTextAuto maxWidth="350px">
                          {username}
                        </TooltipTextAuto>
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        {peerOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <div className="flex items-center md:gap-6 gap-3">
                  {isSearchOpen ? (
                    <div ref={searchRef}>
                      <SearchBox
                        isGrayIcon
                        isHaveBorder
                        placeHolder="Search messages..."
                        value={search}
                        onSearch={(e) => {
                          setSearch(e);
                        }}
                      />
                    </div>
                  ) : (
                    <div onClick={() => setisSearchOpen(true)}>
                      <SvgIcon
                        width="24px"
                        height="24px"
                        color="#005F73"
                        src="icons/search-normal.svg"
                      />
                    </div>
                  )}

                  <div
                    className="relative md:w-[120px] flex gap-6 items-center font-normal"
                    ref={wrapperRef}
                  >
                    <div
                      className="cursor-pointer w-full bg-backgroundColor-Card border py-2 px-4 pr-3 rounded-2xl leading-tight text-[12px] text-Text-Primary flex justify-between items-center"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      {options.find((opt) => opt.value === aiMode)?.label}
                      <img
                        className={`w-3 h-3 object-contain opacity-80 ml-2 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        src="/icons/arow-down-drop.svg"
                        alt=""
                      />
                    </div>

                    {isOpen && (
                      <ul className="absolute z-10 top-7 mt-1 w-full bg-white border border-gray-100 rounded-2xl shadow-sm text-[12px] text-Text-Primary">
                        {options.map((opt, index) => (
                          <li
                            key={index}
                            className={`cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-2xl ${
                              aiMode === opt.value
                                ? 'bg-gray-50 font-semibold'
                                : ''
                            }`}
                            onClick={() => {
                              setAiMode(opt.value);
                              setIsOpen(false);
                            }}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
            <div
              id="userChat"
              ref={!aiMode ? coachThread.listRef : undefined}
              onScroll={!aiMode ? () => void coachThread.handleScroll() : undefined}
              className="flex h-full flex-col overflow-auto p-4"
            >
              {!aiMode && coachGroups.length > 0 && (
                <div className="mt-auto flex flex-col">
                  {coachThread.isLoadingOlder && (
                    <p className="text-center text-[11px] text-Text-Quadruple py-2">
                      Loading earlier messages...
                    </p>
                  )}
                  {coachGroups.map((group) => (
                    <section key={group.key} aria-label={group.label}>
                      <ChatDateSeparator label={group.label} />
                      {group.messages.map((message) => (
                        <ChatMessageBubble
                          key={messageListKey(message)}
                          message={{
                            ...message,
                            name:
                              message.sender_type === 'patient'
                                ? username || message.name
                                : message.name,
                          }}
                          layout="wide"
                          highlighted={
                            coachThread.highlightedId === message.conversation_id
                          }
                          onReply={coachThread.setReplyingTo}
                          onDelete={coachThread.handleDelete}
                          onReact={coachThread.handleReact}
                          onRetry={coachThread.handleSend}
                          onJumpToReply={(conversationId) => {
                            setSearch('');
                            setSearchedMessages(null);
                            void coachThread.jumpToReply(conversationId);
                          }}
                          onImageClick={handleImageClick}
                        />
                      ))}
                    </section>
                  ))}
                  <div ref={coachThread.endRef} />
                </div>
              )}
              {aiMode && (searchedAiMessages ?? aiMessages).length > 0 && (
                <div className="mt-auto flex flex-col space-y-4">
                  {(searchedAiMessages ?? aiMessages).map(
                    (message, index: number) => (
                      <Fragment
                        key={`${message.conversation_id}-${message.timestamp}-${index}`}
                      >
                        {message.sender_type === 'patient' ? (
                          <>
                            <div className="flex justify-start items-start gap-1">
                              <div className="w-[32px] h-[32px] flex justify-center items-center rounded-full bg-backgroundColor-Main ">
                                <img
                                  src={`https://ui-avatars.com/api/?name=${username}`}
                                  alt=""
                                  className="rounded-full"
                                />
                              </div>
                              <div>
                                <div className="text-Text-Primary font-medium text-xs">
                                  {username}{' '}
                                  <span className="text-Text-Primary ml-1">
                                    {new Date(
                                      message.timestamp,
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false,
                                    })}
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
                                  style={{
                                    lineHeight: '26px',
                                    overflowWrap: 'anywhere',
                                  }}
                                >
                                  {formatText(message.message_text)}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-end items-start gap-1">
                              <div className=" relative flex flex-col items-end">
                                {message.reported == true && (
                                  <>
                                    <img
                                      data-tooltip-id={
                                        message.conversation_id + 'flag'
                                      }
                                      className="absolute -left-5 cursor-pointer top-5"
                                      src="/icons/flag-2.svg"
                                      alt=""
                                    />
                                    <Tooltip
                                      id={message.conversation_id + 'flag'}
                                    >
                                      This response was reported by the client.
                                    </Tooltip>
                                  </>
                                )}
                                <div className="text-Text-Primary text-xs font-medium">
                                  <span className="text-Text-Primary mr-1">
                                    {new Date(
                                      message.timestamp,
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false,
                                    })}
                                  </span>
                                  AI Copilot
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
                                  {
                                    message.isSending ? (
                                      <span>
                                        <MoonLoader color="#383838" size={12} />
                                      </span>
                                    ) : null
                                    // <span>
                                    //   <SvgIcon
                                    //     src="./icons/tick-green.svg"
                                    //     color="#8a8a8a"
                                    //   />
                                    // </span>
                                  }
                                  {message.recipient == true && (
                                    <>
                                      <span>
                                        <img
                                          className="w-4 h-4 object-contain"
                                          src="/icons/telegram_read.svg"
                                          alt=""
                                        />
                                        {/* <SvgIcon
                                        src="./icons/telegram_read.svg"
                                        color="#8a8a8a"
                                      /> */}
                                      </span>
                                    </>
                                  )}
                                  <div
                                    style={{ overflowWrap: 'anywhere' }}
                                    className="max-w-[500px] bg-[#E9F0F2] border border-[#E2F1F8] px-4 py-2 text-justify mt-1  text-Text-Primary text-[12px] rounded-[20px] rounded-tr-none "
                                  >
                                    {formatText(message.message_text)}
                                  </div>
                                </div>
                              </div>
                              <div className="w-[40px] h-[40px] overflow-hidden flex justify-center items-center">
                                <img src="/icons/ai-pic-messages.svg" alt="" />
                              </div>
                            </div>
                          </>
                        )}
                      </Fragment>
                    ),
                  )}
                  <div ref={aiMode ? messagesEndRef : undefined} />
                </div>
              )}
              {selectMessages == null ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-base select-none text-Text-Primary font-medium g">
                  <img src="/icons/noClient2.svg" alt="" />
                  <div className="text-base font-medium -mt-10">
                    No client selected
                  </div>
                  <div className="text-xs font-normal">
                    Select a client from the list to view or send messages.
                  </div>
                </div>
              ) : (aiMode === false && coachThread.messageData.length === 0) ||
                (aiMode === true && aiMessages.length === 0) ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-base pt-8 text-Text-Primary font-medium gap-6">
                  <img src="/icons/empty-messages.svg" alt="" />
                  {username ? 'No messages found.' : 'No messages found.'}
                </div>
              ) : (
                ''
              )}
            </div>
            {username && !aiMode ? (
              <div
                className={`px-2 w-full flex justify-center ${
                  coachThread.replyingTo || coachThread.error
                    ? 'h-[148px]'
                    : 'h-[100px]'
                }`}
              >
                <InputMentions
                  changeBenchMarks={(val: Array<string>) => {
                    setSelectedBenchMarks(val);
                  }}
                  onChange={coachThread.setInput}
                  onSubmit={handleSend}
                  value={coachThread.input}
                  PlaceHolder="Enter your message here..."
                  error={coachThread.error}
                  replyingTo={
                    coachThread.replyingTo
                      ? {
                          name: coachThread.replyingTo.name,
                          text: coachThread.replyingTo.deleted
                            ? 'This message was deleted'
                            : coachThread.replyingTo.message_text,
                        }
                      : null
                  }
                  onCancelReply={() => coachThread.setReplyingTo(null)}
                />
              </div>
            ) : (
              ''
            )}
          </>
        )}
      </div>

      <MainModal isOpen={isImageModalOpen} onClose={handleCloseImageModal}>
        <div className="flex flex-col items-center ">
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
