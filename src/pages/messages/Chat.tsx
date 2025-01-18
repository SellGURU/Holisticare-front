/* eslint-disable @typescript-eslint/no-explicit-any */
import Application from "../../api/app";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import InputMentions from "../../Components/AiChat/InputMentions";
type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
};
interface AiChatProps {
  memberID?: null | number;
}
const AiChat: React.FC<AiChatProps> = ({ memberID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<any>(memberID);
  const [input, setInput] = useState("");
//   const formatDate = (date: Date) => {
//     const day = date.getDate();
//     const month = date.toLocaleString("default", { month: "long" });
//     const year = date.getFullYear();
//     return `${day} ${month} ${year}`;
//   };

//   const [chatStartDate] = useState<string>(formatDate(new Date()));

  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    setMemberId(memberID);
  }, [memberID]);
  useEffect(() => {
    if (id != undefined) {
      setMemberId(id);
    }
  }, [id]);
  const [conversationId, setConversationId] = useState<number>(1);
  useEffect(() => console.log(conversationId), [conversationId]);
  const [selectedBenchMarks, setSelectedBenchMarks] = useState<Array<string>>(
    []
  );
  const handleSend = async () => {
    if (input.trim() && memberId !== null) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        text: input,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInput("");
      try {
        const res = await Application.aiStudio_copilotChat({
          text: newMessage.text,
          member_id: memberId,
          conversation_id: conversationId,
          search: selectedBenchMarks.length > 0 ? true : false,
          benchmark_areas: selectedBenchMarks,
        });
        console.log(res);

        const data = await res.data;
        setConversationId(data.current_conversation_id);
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          text: data.answer,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (err) {
        console.log(err);
      }
      // Simulate AI response
      // setTimeout(() => {
      //   const aiMessage: Message = {
      //     id: messages.length + 2,
      //     sender: 'ai',
      //     text: 'Thank you for your message!',
      //     time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      //   };
      //   setMessages((prevMessages) => [...prevMessages, aiMessage]);
      // }, 1000);
    }
  };

  const formatText = (text: string) => {
    // First, replace the bold formatting *text* with <strong>text</strong>
    const boldedText = text.replace(
      /\*(.*?)\*/g,
      (_match, p1) => `<strong>${p1}</strong>`
    );

    // Then, split the text by \n to handle newlines
    const lines = boldedText.split("\n");

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
    const objDiv:any = document.getElementById("aiChat");
    objDiv.scrollTop = objDiv.scrollHeight;    
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    Application.getListChats({
      member_id: memberId,
    }).then((res) => {
      const resolve = res.data.messages.flatMap((mes: any, index: number) => {
        const request: Message = {
          id: 1,
          sender: "user",
          text: mes.request,
          time: mes.entrytime,
        };
        const response: Message = {
          id: index,
          sender: "ai",
          text: mes.response,
          time: mes.entrytime,
        };
        return [request, response];
      });
      setMessages(resolve);
      // console.log(resolve)
    });
  }, [memberId]);
  return (
    <div className="w-full  mx-auto bg-white shadow-200 min-h-[545px]  rounded-[16px] relative flex flex-col  ">
     <div className="px-4 py-2 border shadow-drop bg-white border-Gray-50 rounded-t-[16px]">
        <div className="flex items-center gap-2 ">
        <div  className="min-w-10 h-10   rounded-full bg-blue-300   flex items-center justify-center mr-3 opacity-35">
                  S
                </div>
                <div>
                    <div className="text-sm font-medium text-[#383838]">Sara Thompson</div>
                    <div className="text-[10px] text-Text-Secondary">Ofline</div>
                </div>
        </div>
     </div>
      <div id="aiChat" className="p-4 space-y-4 max-h-[380px] overflow-y-scroll">
        {messages.map((msg, index: number) => (
          <>
            {msg.sender == "ai" ? (
              <>
                {index == messages.length - 1 && (
                  <div ref={messagesEndRef}></div>
                )}
                <div className="flex justify-start items-start gap-1">
                  <div className="w-[32px] h-[32px] flex justify-center items-center rounded-full bg-backgroundColor-Main ">
                    <img src="/icons/layer1.svg" alt="" />
                  </div>
                  <div>
                    <div className="text-Text-Primary font-medium text-[12px]">
                      AI-Copilot{" "}
                      <span className="text-Text-Primary ml-1">
                        {msg.time}
                      </span>
                    </div>
                    <div
                      className="max-w-[500px] bg-backgroundColor-Card border border-Gray-50 p-4 text-justify  mt-1 text-[12px] text-Text-Primary rounded-[20px] rounded-tl-none "
                      style={{ lineHeight: "26px" }}
                    >
                      {formatText(msg.text)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end items-start gap-1">
                  <div className="flex flex-col items-end">
                    <div className="text-Text-Primary text-[12px]">
                      Coach{" "}
                      <span className="text-Text-Primary dark:text-[#FFFFFF99] ml-1">
                        {msg.time}
                      </span>
                    </div>
                    <div className="max-w-[500px] bg-[#005F7340] bg-opacity-25  p-4 text-justify mt-1 border-Gray-50 border text-Text-Primary text-[12px] rounded-[20px] rounded-tr-none ">
                      {formatText(msg.text)}
                    </div>
                  </div>
                  <div className="w-[40px] h-[40px] overflow-hidden flex justify-center items-center rounded-full bg-[#383838]">
                    <img
                      className="rounded-full"
                      src={`https://ui-avatars.com/api/?name=${"Coach"}`}
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
          // <div key={msg.id} className={` relative flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
          //   <div className="flex flex-col items-center space-x-2 max-w-[383px]">
          //   <div className='text-primary-text flex items-center gap-3 '>{msg.sender === "ai" ? 'ai-coilot' : 'nima'}
          //   <span className="text-xs  text-gray-400">{msg.time}</span></div>

          //     <div className={`rounded-[20px] p-3 bg-black-secondary text-primary-text`}>
          //       <p>{msg.text}</p>
          //     </div>

          //   </div>
          // </div>
        ))}
      </div>
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
     

      {/* <div className="p-4 border-t border-gray-700 flex space-x-2">
        <input
          type="text"
          className="flex-1 p-2 bg-gray-700 rounded-lg outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onClick={handleSend}
        >
          Send
        </button>
      </div> */}
    </div>
  );
};

export default AiChat;
