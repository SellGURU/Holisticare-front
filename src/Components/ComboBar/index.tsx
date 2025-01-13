/* eslint-disable @typescript-eslint/no-explicit-any */
import { PopUpChat } from "../popupChat";
import { useEffect, useRef, useState } from "react";
import useModalAutoClose from "../../hooks/UseModalAutoClose.ts";
import { useParams } from "react-router-dom";
import { SlideOutPanel } from "../SlideOutPanel";
import { subscribe } from "../../utils/event.ts";
import Application from "../../api/app.ts";
import { ButtonPrimary } from "../Button/ButtonPrimary.tsx";
import { useConstructor } from "../../help.ts";
import { useFormik } from "formik";
import Data from "./data.json";
import TimeLine from "./components/timeLine.tsx";
import Accordion from "../Accordion/index.tsx";
import { ChatModal } from "./components/chatModal.tsx";
import { ClientInfo } from "./components/clientInfo.tsx";
import { DataSyncing } from "./components/dataSyncing.tsx";
import { Questionary } from "./components/Questionary.tsx";
export const ComboBar = () => {
  const { id } = useParams<{ id: string }>();
  const itemList = [
    { name: "Client Info", url: "/images/sidbar-menu/info-circle.svg" },
    { name: "Data Syncing", url: "/icons/sidbar-menu/messages.svg" },
    { name: "File History", url: "/icons/sidbar-menu/cloud-change.svg" },
    {
      name: "Questionary Tracking",
      url: "/icons/sidbar-menu/clipboard-text.svg",
    },
    { name: "Expert’s Note", url: "/icons/sidbar-menu/note-2.svg" },
    { name: "Repeat", url: "/icons/sidbar-menu/repeat.svg" },
    { name: "Timeline", url: "/icons/sidbar-menu/task-square.svg" },
    { name: "chat history", url: "/icons/sidbar-menu/timeline.svg" },
  ];
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    picture: "",
  });
  const [data, setData] = useState<any>(Data);

  useEffect(() => {
    Application.getPatientsInfo({
      member_id: id,
    }).then((res) => {
      setPatientInfo(res.data);
    });
  }, []);
  useConstructor(() => {
    // setIsLoading(true);
    Application.getSummary(id as string).then((res) => {
      console.log(res);
      if (res.data != "Internal Server Error") {
        // setData(res.data);
        formik.setFieldValue("firstName", res.data.personal_info["first_name"]);
        formik.setFieldValue("lastName", res.data.personal_info["last_name"]);
        // setImage(res.data.personal_info.picture);
        formik.setFieldValue(
          "workOuts",
          res.data.personal_info["total workouts"] != "No Data"
            ? res.data.personal_info["total workouts"]
            : ""
        );
        formik.setFieldValue(
          "Activity",
          res.data.personal_info["total Cardio Activities"] != "No Data"
            ? res.data.personal_info["total Cardio Activities"]
            : ""
        );
        formik.setFieldValue(
          "expert",
          res.data.personal_info.expert ? res.data.personal_info.expert : ""
        );
        formik.setFieldValue(
          "location",
          res.data.personal_info.Location ? res.data.personal_info.Location : ""
        );
      }
      //   setIsLoading(false);
    });
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      workOuts: "",
      Activity: "",
      expert: "",
      location: "",
    },
    onSubmit: () => {},
  });
  const [toogleOpenChat, setToogleOpenChat] = useState<boolean>(false);

  // Refs for modal and button to close it when clicking outside
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Handle modal close
  const closeModal = () => {
    setToogleOpenChat(false);
  };

  // Using the custom hook to automatically close the modal when clicking outside
  useModalAutoClose({
    refrence: modalRef,
    buttonRefrence: buttonRef,
    close: closeModal,
  });
  const [isSlideOutPanel, setIsSlideOutPanel] = useState<boolean>(false);
  const [updated, setUpdated] = useState(false);
  subscribe("QuestionaryTrackingCall", () => {
    setUpdated(true);
  });
  const handleItemClick = (name: string) => {
    setActiveItem(name);
    setIsSlideOutPanel(true);
  };
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [commentText, setCommentText] = useState("");
  const renderModalContent = () => {
    switch (activeItem) {
      case "Client Info":
        return (
         <ClientInfo></ClientInfo>
        );
      case "Data Syncing":
        return (
          <DataSyncing></DataSyncing>
        );
      case "File History":
        return (
          <div className=" w-full">
            <div className="px-2">
              <div className="w-full text-[12px] px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
                <div>File Name</div>
                <div>Upload Date</div>
                <div>Action</div>
              </div>

              <>
                {data["File History"]?.length > 0 ? (
                  <>
                    <div className="flex justify-center w-full items-start overflow-auto h-[240px]">
                      <div className="w-full mt-2">
                        {data["File History"]?.map((el: any) => {
                          return (
                            <div className=" bg-white border border-Gray-50 mb-1 p-3 h-[48px] w-full rounded-[12px] flex justify-between items-center text-Text-Primary text-[10px]">
                              <div className="text-[10px] w-[50px]  text-Text-Primary">
                                {el.Data}
                              </div>
                              <div className="w-[70px] text-center">
                                {el["Upload Date"]}
                              </div>
                              <div className="flex items-center justify-end gap-1">
                                <img
                                  className="cursor-pointer"
                                  src="/icons/eye-green.svg"
                                  alt=""
                                />
                                <img
                                  className="cursor-pointer"
                                  src="/icons/import.svg"
                                  alt=""
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <img
                      className=" object-contain"
                      src="/icons/document-text.svg"
                      alt=""
                    />
                    <div className="text-[12px] text-[#383838]">
                      No Data Found
                    </div>
                  </div>
                )}
              </>
            </div>
          </div>
        );
      case "Questionary Tracking":
        return (
         
          <Questionary></Questionary>
        )
      case "Expert’s Note":
        return (
          <div className=" w-full ">
            <div className="w-full flex justify-between px-3.5 py-3">
              {/* <div className="text-[14px] text-light-secandary-text dark:text-[#FFFFFFDE]">
                Trainer's Notes (
                {data?.notes ? data.notes.length : "0"})
              </div> */}
              {!showAddNote && (
                <div
                  onClick={() => {
                    setShowAddNote(true);
                  }}
                  className="text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-xl border-dashed px-5 py-2 w-full text-Primary-DeepTeal "
                >
                  <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
                  Add Note
                </div>
              )}
            </div>
            {showAddNote ? (
              <div className="flex justify-center items-center">
                <div className="w-full ">
                  <div className="text-[12px] font-medium text-Text-Primary ">
                    Note
                  </div>
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                    }}
                    placeholder="Add your note for this client here..."
                    className="h-[215px] font-light text-[12px] p-2 border border-Gray-50  mt-1 rounded-[16px] bg-backgroundColor-Card w-full resize-none outline-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <ButtonPrimary
                      ClassName="bg-backgroundColor-Main"
                      onClick={() => {
                        setShowAddNote(false);
                        setCommentText("");
                      }}
                      style={{ height: "24px" }}
                    >
                      <div className="w-[100px] text-xx text-Text-Primary">
                        Cancel
                      </div>
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => {
                        setCommentText("");
                        setShowAddNote(false);
                        setData((pre: any) => ({
                          ...pre,
                          notes: [
                            ...pre.notes,
                            {
                              date: Date.now(),
                              time: "14:14:32.274416",
                              writer: "",
                              note: commentText,
                            },
                          ],
                        }));
                      }}
                      //   onClick={() => {
                      //     Application.addNoteHelth({
                      //       member_id: id,
                      //       note: commentText,
                      //       writer: "",
                      //     }).then(() => {
                      //       setCommentText("");
                      //       setShowAddNote(false);
                      //       setData((pre: any) => ({
                      //         ...pre,
                      //         notes: [
                      //           ...pre.notes,
                      //           {
                      //             date: Date.now(),
                      //             time: "14:14:32.274416",
                      //             writer: "",
                      //             note: commentText,
                      //           },
                      //         ],
                      //       }));
                      //     });
                      //   }}
                      style={{ height: "24px" }}
                    >
                      <div className="w-[100px] text-xs">Save Note</div>
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex justify-center items-center h-[600px] overflow-y-scroll"
                style={{
                  alignItems: data?.notes.length > 0 ? "start" : "center",
                }}
              >
                {data?.notes?.length > 0 ? (
                  <>
                    <div className="w-full ">
                      {data?.notes.map((el: any) => {
                        return (
                          <div className="w-full px-3 my-2">
                            <Accordion title={el.date}>
                              <div className="text-[12px] text-justify w-full">
                                {el.note}
                              </div>
                            </Accordion>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <img src="/icons/no-note.svg" alt="" />
                    <div className="text-[12px] text-Text-Primary mt-1">
                    No Notes Found
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      // Add more cases as needed
     case "Timeline" :
        return(
            <TimeLine/>
        )
        case "chat history":
            return(
                <ChatModal memberId={id}             info={patientInfo}
                ></ChatModal>
            )
      default:
        return <div>No Content</div>;
    }
  };
  console.log(isSlideOutPanel);
  return (
    <>
      <SlideOutPanel
        isOpen={isSlideOutPanel}
        isCombo={true}
        onClose={() => setIsSlideOutPanel(false)}
        headline={activeItem || ""}
      >
        {renderModalContent()}
      </SlideOutPanel>
      <div
        className={
          "w-[55px] flex justify-center items-center relative bg-white h-[500px] border-Boarder border rounded-xl p-5 "
        }
      >
        <div
          className={
            "absolute top-0 left-0 bg-Primary-DeepTeal h-[49px] rounded-xl w-full z-10"
          }
        ></div>
        <ul className={"flex items-center flex-col z-10 gap-3"}>
          <li
            key={"1"}
            className={
              "flex items-center justify-center border-2 rounded-full  w-10 h-10 "
            }
          >
            <img
              src={
                patientInfo.picture != ""
                  ? patientInfo.picture
                  : `https://ui-avatars.com/api/?name=${patientInfo.name}`
              }
              onError={(e: any) => {
                e.target.src = `https://ui-avatars.com/api/?name=${patientInfo.name}`; // Set fallback image
              }}
              className={"border-whiteavatar w-full h-full rounded-full"}
            />
          </li>
          <li
            key={"2"}
            className={
              "text-Text-Primary TextStyle-Headline-6 w-10 text-center"
            }
            style={{
              whiteSpace: "",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {patientInfo.name.substring(0, 20)}
          </li>
          <li
            key={"line"}
            className={"h-[2px] w-full px-[1px] bg-green-400"}
          ></li>
          {itemList.map((el, index) => (
            <li
              key={index + "el"}
              onClick={() => {
                if (el.name == "Questionary Tracking") {
                  setIsSlideOutPanel(true);
                  setUpdated(false);
                }
                handleItemClick(el.name);
              }}
              className={`cursor-pointer rounded-full relative border w-8 h-8 flex items-center justify-center ${
                updated &&
                el.name == "Questionary Tracking" &&
                "border-2 border-Orange"
              }`}
            >
              <img src={el.url} className={"w-5 h-5"} />
              {
                updated && el.name == "Questionary Tracking" && (
                  <img
                    className="absolute top-[-4px]  right-[-3px]"
                    src="/icons/warning.svg"
                    alt=""
                  />
                )
                // <div className="w-[12px] h-[12px] bg-[#FFBD59] rounded-full absolute top-[-4px]  right-[-3px]">
                // </div>
              }
            </li>
          ))}
        </ul>
      </div>
      <div className={"space-y-1"}>
        <div
          className={
            "w-8 h-8 rounded-md flex bg-Primary-EmeraldGreen items-center justify-center"
          }
        >
          <img src={"/icons/add.svg"} />
        </div>
        <div
          ref={buttonRef}
          onClick={() => setToogleOpenChat(!toogleOpenChat)}
          className={
            "w-8 shadow-200 cursor-pointer h-8 rounded-md bg-white flex items-center justify-center"
          }
        >
          {toogleOpenChat ? (
            <img src={"/icons/close.svg"} />
          ) : (
            <img src={"/icons/sidbar-menu/message-question.svg"} />
          )}
        </div>
        <div ref={modalRef} className="w-full shadow-200">
          <PopUpChat
            isOpen={toogleOpenChat}
            info={patientInfo}
            memberId={id as string}
          />
        </div>
      </div>
    </>
  );
};
