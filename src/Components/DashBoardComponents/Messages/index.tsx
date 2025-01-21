import React, { useEffect, useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import { useNavigate } from 'react-router-dom';

type Message = {
  Username: string;
  User_picture: string;
  user_id: number;
  Date: string;
  message: string;
  is_read: boolean;
  unread_count: number;
};

// const messages: Message[] = [
//   {
//     id: 1,
//     sender: 'Sarah Thompson',
//     content: 'There are many variations of messages that we can show you...',
//     date: '2024/03/02',
//     read: false,
//   },
//   {
//     id: 2,
//     sender: 'John Doe',
//     content:
//       'There are many variations of messages that we can show you  There are many variations of messages that we can show youThere are many variations of messages that we can show youThere are many variations of messages that we can show youThere are many variations of messages that we can show youThere are many variations of messages that we can show you',
//     date: '2024/03/02',
//     read: true,
//   },

//   {
//     id: 3,
//     sender: 'Emil Thompson',
//     content: 'There are many variations of messages that we can show you...',
//     date: '2024/03/02',
//     read: false,
//   },
//   // Add more messages as needed
// ];
interface MessageListProps {
  isMessages?: boolean;
}
const MessageList: React.FC<MessageListProps> = ({ isMessages }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Read' | 'Unread'>('All');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesUsersList = () => {
    Application.messagesUsersList()
      .then((res) => {
        setMessages(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    setIsLoading(true);
    messagesUsersList();
  }, []);
  console.log(messages);

  const filteredMessages = messages.filter((message) =>
    filter === 'All'
      ? true
      : filter === 'Read'
        ? message.is_read
        : !message.is_read,
  );
  //   const colors = ['#CC85FF', '#90CAFA', '#FABA90', '#90FAB2'];

  //   const getRandomColor = () => {
  //     return colors[Math.floor(Math.random() * colors.length)];
  //   };

  const handleClick = (id: string) => {
    navigate(`?id=${id}`);
  };

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div className="w-full h-[664px] overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
          <div className="flex w-full justify-between">
            <h2 className="text-sm text-Text-Primary font-medium">
              {' '}
              {isMessages ? 'Messages' : ' Recently Messages'}
            </h2>
            {isMessages && (
              <div className="flex items-center gap-1">
                <div className="cursor-pointer">
                  <SvgIcon
                    width="20px"
                    height="20px"
                    src="/icons/search.svg"
                    color="#005F73"
                  />
                </div>

                <img
                  className="cursor-pointer"
                  src="/icons/setting-2.svg"
                  alt=""
                />
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
              //   const color = getRandomColor();
              return (
                <li
                  key={message.user_id}
                  onClick={() => {
                    setExpandedMessage(
                      expandedMessage === message.user_id
                        ? null
                        : message.user_id,
                    );
                    handleClick(message.user_id.toString());
                  }}
                  className={`mb-5 cursor-pointer ${expandedMessage === message.user_id && 'bg-backgroundColor-Card  shadow-200 rounded-2xl '}`}
                >
                  <div className="flex justify-between ">
                    <div className="min-w-10 h-10   rounded-full bg-blue-300   flex items-center justify-center mr-3 opacity-35">
                      {message.Username.charAt(0)}
                    </div>
                    <div className="border-b border-Boarder pb-2">
                      <div className="flex items-center justify-between flex-wrap">
                        <div>
                          <div className="text-[10px] text-Text-Primary">
                            {message.Username}
                          </div>
                          {expandedMessage === message.user_id && (
                            <div className="text-[8px] text-Text-Secondary mt-1">
                              {message.Date}
                            </div>
                          )}
                        </div>

                        {expandedMessage === message.user_id ? (
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
                          expandedMessage === message.user_id
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

export default MessageList;
