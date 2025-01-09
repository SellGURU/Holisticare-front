import React, { useState } from 'react';

type Message = {
  id: number;
  sender: string;
  content: string;
  date: string;
  read: boolean;
};

const messages: Message[] = [
  { id: 1, sender: 'Sarah Thompson', content: 'There are many variations of messages that we can show you...', date: '2024/03/02', read: false },
  { id: 2, sender: 'John Doe', content: 'There are many variations of messages that we can show you  There are many variations of messages that we can show youThere are many variations of messages that we can show youThere are many variations of messages that we can show youThere are many variations of messages that we can show youThere are many variations of messages that we can show you', date: '2024/03/02', read: true },
 
 
  { id: 3, sender: 'Emil Thompson', content: 'There are many variations of messages that we can show you...', date: '2024/03/02', read: false },
  // Add more messages as needed
];

const MessageList: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Read' | 'Unread'>('All');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  const filteredMessages = messages.filter((message) =>
    filter === 'All' ? true : filter === 'Read' ? message.read : !message.read
  );
//   const colors = ['#CC85FF', '#90CAFA', '#FABA90', '#90FAB2'];

//   const getRandomColor = () => {
//     return colors[Math.floor(Math.random() * colors.length)];
//   };

  return (
    <div className="max-w-[315px] h-[664px] overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
      <h2 className="text-sm text-Text-Primary font-medium">Recently Messages</h2>
      <div className="w-full  shadow-200  flex mt-3"   >
        {['All', 'Read', 'Unread'].map((type) => (
          <div
            key={type}
            onClick={() => setFilter(type as 'All' | 'Read' | 'Unread')}
            className={` ${type === 'All' ? 'rounded-tl-xl rounded-bl-xl' : type === 'Unread' ?  'rounded-tr-xl rounded-br-xl' : ''} w-full text-center px-4 py-2 border border-Boarder text-xs cursor-pointer ${filter === type ? 'bg-Primary-EmeraldGreen text-white' : ''}`}
          >
            {type}
          </div>
        ))}
      </div>
      <ul className='mt-5 w-full h-full pr-3 overflow-y-scroll'>
        {filteredMessages.map((message) => {
                    //   const color = getRandomColor();
            return(
          <li key={message.id}   onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)} className={`mb-5 cursor-pointer ${expandedMessage === message.id && 'bg-backgroundColor-Card  shadow-200 rounded-2xl '}`}>
            <div className="flex justify-between ">
              
                <div  className="min-w-10 h-10   rounded-full bg-blue-300   flex items-center justify-center mr-3 opacity-35">
                  {message.sender.charAt(0)}
                </div>
                <div className='border-b border-Boarder pb-2'>

             
                <div className='flex items-center justify-between flex-wrap'>
                    <div>
                    <div className="text-[10px] text-Text-Primary">{message.sender}</div>
                    {expandedMessage === message.id && (
                      <div className="text-[8px] text-Text-Secondary mt-1">{message.date}</div>
                    )}
                    </div>
                 
                    {expandedMessage === message.id ? (
                      <div className="flex items-center gap-1">
                        <img className='w-4 h-4 object-contain' src="/icons/reply-svgrepo-com (1) 1.svg" alt="" />
                        <img className='w-4 h-4 object-contain' src="/icons/delete.svg" alt="" />
                      </div>
                    ) : (
                      <div className="text-[8px] text-Text-Secondary">{message.date}</div>
                    )}

                </div>
                <div className={`text-[10px] text-Text-Secondary   ${
                      expandedMessage === message.id ? '' : 'line-clamp-2'
                    } `}>{message.content}</div>
             
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
            )
})}
      </ul>
    </div>
  );
};

export default MessageList;