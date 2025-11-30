import React, { useEffect, useState } from 'react';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Toggle from '../../Toggle';
import { Tooltip } from 'react-tooltip';
import SearchBox from '../../SearchBox';

type Message = {
  name: string;
  patient_picture: string;
  member_id: number;
  Date: string;
  message: string;
  sender_type: string;
  unread: boolean;
  unread_count: number;
  online_status: boolean;
};

interface MessageListProps {
  // search: string;
  onSelectMessage: (messageId: string | null) => void;
  messages: Message[]; // Receive messages from parent
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; // Receive setter for initial load
}

const MessageList: React.FC<MessageListProps> = ({
  // search,
  onSelectMessage,
  messages,
  setMessages,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('All');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [messagesSearched, setMessagesSearched] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (id != undefined) {
      setExpandedMessage(parseInt(id));
      onSelectMessage(id);
    }
  }, [id, onSelectMessage]);

  const messagesUsersList = () => {
    Application.messagesUsersList()
      .then((res) => {
        setMessages(res.data);
        // setMessagesSearched(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    setIsLoading(true);
    messagesUsersList();
  }, []);
  const applyFilters = () => {
    let filtered = [...messages];

    if (search) {
      filtered = filtered.filter((message) =>
        message.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filter === 'Read') {
      filtered = filtered.filter((message) => message.unread === false);
    } else if (filter === 'Unread') {
      filtered = filtered.filter((message) => message.unread === true);
    }

    setMessagesSearched(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [search, filter, messages]);

  const colors = ['#CC85FF', '#90CAFA', '#FABA90', '#90FAB2'];

  const getColorForUsername = (username: string): string => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  const handleClickMessage = (
    id: string,
    username: string,
    status: boolean,
  ) => {
    navigate(`?id=${id}&username=${username}&status=${status}`);
    onSelectMessage(id);
  };
  const handleClickAgainMessage = () => {
    navigate(``);
    onSelectMessage(null);
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
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-95 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div className=" w-full md:w-[315px] h-[75vh] pb-20 md:h-full overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
          <div className="w-full bg-white  flex justify-center mt-2">
            <Toggle
              active={filter}
              setActive={setFilter}
              value={['All', 'Read', 'Unread']}
              isMessages
            />
          </div>
          <div className="my-4">
            <SearchBox
              isMessages
              isHaveBorder
              isGrayIcon
              value={search}
              onSearch={(e) => setSearch(e)}
              placeHolder="Search clients..."
            />
          </div>
          {messagesSearched.length === 0 && (
            <div className="flex flex-col items-center w-full h-[70vh] md:h-[90%] justify-center">
              <img src="/icons/empty-messages-coach.svg" alt="" />
              <div className="text-base font-medium text-Text-Primary -mt-5">
                No results found.
              </div>
            </div>
          )}
          <ul className="mt-5 w-full h-[90%] pr-3   overflow-y-scroll divide-y ">
            {messagesSearched.map((message, index) => {
              const isSelected = expandedMessage === message.member_id;
              const isBeforeSelected =
                index < messagesSearched.length - 1 &&
                messagesSearched[index + 1].member_id === expandedMessage;
              const isAfterSelected =
                index > 0 &&
                messagesSearched[index - 1].member_id === expandedMessage;

              return (
                <li
                  key={message.member_id}
                  onClick={() => {
                    setExpandedMessage(
                      expandedMessage === message.member_id
                        ? null
                        : message.member_id,
                    );
                    if (expandedMessage === message.member_id) {
                      handleClickAgainMessage();
                    } else {
                      handleClickMessage(
                        message.member_id.toString(),
                        message.name,
                        message.online_status,
                      );
                    }
                  }}
                  className={`py-2 relative cursor-pointer border-y border-Boarder
              ${index === 0 && '!border-y-0'}
              ${isSelected ? 'bg-backgroundColor-Card shadow-100 rounded-2xl p-2' : ''}
              ${isBeforeSelected && '!border-b-0'}
            ${isAfterSelected && '!border-t-0'}
            `}
                >
                  <div className="flex justify-start">
                    <div
                      style={{
                        backgroundColor: hexToRGBA(
                          getColorForUsername(message.name),
                          0.2,
                        ),
                        color: hexToRGBA(
                          getColorForUsername(message.name),
                          0.87,
                        ),
                      }}
                      className="min-w-10 h-10   rounded-full  flex items-center justify-center mr-3 capitalize"
                    >
                      {message.name.charAt(0)}
                    </div>
                    <div className="w-full flex flex-col justify-center">
                      <div className="flex items-center justify-between flex-wrap">
                        <div>
                          <div
                            data-tooltip-id={message.name}
                            className="text-[10px] font-medium text-Text-Primary"
                          >
                            {message.name.length > 25
                              ? message.name.substring(0, 25) + '...'
                              : message.name}
                            {message.name.length > 25 && (
                              <Tooltip
                                place="top"
                                id={message.name}
                                className="!bg-white !w-fit !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !z-[99] !border-Gray-50 !p-2"
                              >
                                {message.name}
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        {expandedMessage !== message.member_id && (
                          <div
                            className={`text-[8px] text-Text-Secondary mt-1 ${message.message === 'No messages found' && 'invisible'}`}
                          >
                            {message.Date}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] text-nowrap  overflow-ellipsis overflow-hidden w-[150px] max-w-[150px] text-Text-Secondary   ${
                          expandedMessage === message.member_id ? '' : ''
                        } `}
                      >
                        {message.message}
                      </div>
                    </div>
                  </div>
                  {message.unread_count > 0 && (
                    <div className="absolute bottom-[10px] right-0 rounded-full flex items-center justify-center bg-Primary-DeepTeal size-[14px] text-white text-[8px]">
                      {message.unread_count}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default MessageList;
