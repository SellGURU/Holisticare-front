import React, { useEffect, useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
};

interface MessageListProps {
  isMessages?: boolean;
}

const Actions: React.FC<MessageListProps> = ({ isMessages }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Read' | 'Unread'>('All');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesSearched, setMessagesSearched] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSearch, setshowSearch] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  useEffect(() => {
    if (id != undefined) {
      setExpandedMessage(parseInt(id));
    }
  }, [id]);
  const messagesUsersList = () => {
    Application.messagesUsersList()
      .then((res) => {
        setMessages(res.data);
        setMessagesSearched(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    setIsLoading(true);
    messagesUsersList();
  }, []);

  const filteredMessages = messagesSearched.filter((message) =>
    filter === 'All'
      ? true
      : filter === 'Read'
        ? message.unread
        : !message.unread,
  );
  const colors = ['#CC85FF', '#90CAFA', '#FABA90', '#90FAB2'];

  const getColorForUsername = (username: string): string => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  const handleClickMessage = (id: string, username: string) => {
    navigate(`?id=${id}&username=${username}`);
  };
  const handleClickAgainMessage = () => {
    navigate(``);
  };
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setMessagesSearched(messages);
      return;
    }

    const searchResult = messages.filter((message) =>
      message.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setMessagesSearched(searchResult);
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
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div className="w-full h-full overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
          <div className="flex w-full justify-between">
            {!showSearch && (
              <h2 className="text-sm text-Text-Primary font-medium">
                {' '}
                {isMessages ? 'Messages' : ' Recently Messages'}
              </h2>
            )}
            {isMessages && (
              <div className="flex items-center gap-1">
                <div className="cursor-pointer">
                  {showSearch ? (
                    <div>
                      <SearchBox
                        id="searchBar"
                        ClassName={`rounded-md w-full !min-w-[120%]`}
                        onSearch={handleSearch}
                        placeHolder="Search for users ..."
                        onBlur={() => {
                          setshowSearch(false);
                        }}
                      ></SearchBox>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setshowSearch(true);
                        setTimeout(() => {
                          document.getElementById('searchBar')?.focus();
                        }, 200);
                      }}
                      className="cursor-pointer flex justify-center items-center"
                    >
                      <SvgIcon
                        width="20px"
                        height="20px"
                        src="/icons/search.svg"
                        color="#005F73"
                      />
                    </div>
                  )}
                </div>

                {!showSearch && (
                  <img
                    className="cursor-pointer"
                    src="/icons/setting-2.svg"
                    alt=""
                  />
                )}
              </div>
            )}
          </div>

          <div className="w-full  shadow-200  flex mt-3">
            {['All', 'Read', 'Unread'].map((type) => (
              <div
                key={type}
                onClick={() => setFilter(type as 'All' | 'Read' | 'Unread')}
                className={` ${type === 'All' ? 'rounded-tl-xl rounded-bl-xl' : type === 'Unread' ? 'rounded-tr-xl rounded-br-xl' : ''} w-full text-center px-4 py-2 border border-Boarder text-xs cursor-pointer ${filter === type ? 'bg-Primary-EmeraldGreen text-white' : ''}`}
              >
                {type}
              </div>
            ))}
          </div>
          <ul className="mt-5 w-full h-full pr-3 overflow-y-scroll">
            {filteredMessages.map((message) => {
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
                      );
                    }
                  }}
                  className={`mb-5 cursor-pointer ${expandedMessage === message.member_id && 'bg-backgroundColor-Card  shadow-200 rounded-2xl '}`}
                >
                  <div className="flex justify-between ">
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
                      className="min-w-10 h-10   rounded-full  flex items-center justify-center mr-3 "
                    >
                      {message.name.charAt(0)}
                    </div>
                    <div className="border-b border-Boarder pb-2">
                      <div className="flex items-center justify-between flex-wrap">
                        <div>
                          <div className="text-[10px] font-medium text-Text-Primary">
                            {message.name}
                          </div>
                          {expandedMessage === message.member_id && (
                            <div className="text-[8px] text-Text-Secondary mt-1">
                              {message.Date}
                            </div>
                          )}
                        </div>

                        {expandedMessage === message.member_id ? (
                          <div className="flex items-center gap-1">
                            <img
                              className="w-4 h-4 object-contain"
                              src="/icons/reply-svgrepo-com (1) 1.svg"
                              alt=""
                            />
                            <img
                              className="w-4 h-4 object-contain"
                              src="/icons/delete.svg"
                              alt=""
                            />
                          </div>
                        ) : (
                          <div className="text-[8px] text-Text-Secondary">
                            {message.Date}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] text-Text-Secondary   ${
                          expandedMessage === message.member_id
                            ? ''
                            : 'line-clamp-2'
                        } `}
                      >
                        {message.message}
                      </div>

                      {/* <button
                className="ml-3 text-blue-500"
                onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)}
              >
                {expandedMessage === message.id ? '-' : '+'}
              </button> */}
                    </div>
                  </div>
                  {/* {expandedMessage === message.id && (
              <div className="mt-2 text-sm text-gray-700">
                Detailed message content goes here...
              </div>
            )} */}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default Actions;
