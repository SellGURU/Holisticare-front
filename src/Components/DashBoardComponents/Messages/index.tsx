import React, { useEffect, useState } from 'react';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Toggle from '../../Toggle';
import { Tooltip } from 'react-tooltip';

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
  search: string;
  onSelectMessage: (messageId: string | null) => void;
}

const MessageList: React.FC<MessageListProps> = ({ search, onSelectMessage }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('All');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesSearched, setMessagesSearched] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

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
        <div className=" w-full md:w-[315px] h-full overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
          <div className="w-full flex justify-center mt-2">
            <Toggle
              active={filter}
              setActive={setFilter}
              value={['All', 'Read', 'Unread']}
              isMessages
            />
          </div>
          {messagesSearched.length === 0 && (
            <div className="flex flex-col items-center w-full h-[90%] justify-center">
              <img src="/icons/empty-messages-coach.svg" alt="" />
              <div className="text-base font-medium text-Text-Primary -mt-5">
                No results found.
              </div>
            </div>
          )}
          <ul className="mt-5 w-full h-[91%] pr-3 overflow-y-scroll divide-y divide-Boarder">
            {messagesSearched.map((message) => {
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
                  className={`pt-2 mb-2 cursor-pointer ${expandedMessage === message.member_id && 'bg-backgroundColor-Card shadow-100 border border-Gray-50 rounded-2xl p-2'}`}
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
                          {expandedMessage === message.member_id && (
                            <div className="text-[8px] text-Text-Secondary mt-1">
                              {message.Date}
                            </div>
                          )}
                        </div>
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

