import {useState,useEffect} from 'react'
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import Accordion from '../../Accordion';
export const Notes = () => {
    const [data, setData] = useState<any>([]);
    const { id } = useParams<{ id: string }>();
    const [showAddNote, setShowAddNote] = useState(false);
    const [commentText, setCommentText] = useState("");
    useEffect(() => {
        // setIsLoading(true);
        Application.getNotes({ member_id: id })
            .then((res) => {
                if (res.data.notes) {
                   
                    setData(res.data.notes);
                  
                } else {
                    throw new Error("Unexpected data format");
                }
            })
            .catch((err) => {
                console.error(err);
                // setError("Failed to fetch client data");
            })
            .finally(() => {
                // setIsLoading(false);
            });
    }, [id]);
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
    {showAddNote && (
      <div className="flex justify-center items-center mb-6">
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
                setShowAddNote(false);
                Application.addNote({
                  member_id: id,
                  note: commentText,
                }).then(() => {
                  setData((prevNotes: any[]) => [
                    ...prevNotes,
                    {
                      date: Date.now(),
                      time: new Date().toLocaleTimeString(),
                      writer: "",
                      note: commentText,
                    },
                  ]);
                  setCommentText("");
                }).catch((error) => {
                  console.error("Error adding note:", error);
                });
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
    ) }
      <div
        className="flex justify-center items-center h-[600px] overflow-y-scroll"
        style={{
          alignItems: data?.length > 0 ? "start" : "center",
        }}
      >
        {data?.length > 0 ? (
          <>
            <div className="w-full ">
              {data?.map((el: any) => {
                return (
                  <div className="w-full  my-2">
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
    
  </div>
  )
}
