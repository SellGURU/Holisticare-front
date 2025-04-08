import { useState, useEffect } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import Accordion from '../../Accordion';
export const Notes = () => {
  const [data, setData] = useState<any>([]);
  const { id } = useParams<{ id: string }>();
  const [showAddNote, setShowAddNote] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  useEffect(() => {
    // setIsLoading(true);
    Application.getNotes({ member_id: id })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          throw new Error('Unexpected data format');
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
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      day: 'numeric',
      month: 'long',
    });
  };
  const handleEditClick = (index: number, currentNote: string) => {
    setEditIndex(index);
    setEditText(currentNote);
  };

  const handleSaveEdit = (index: number) => {
    const updatedData = [...data];
    updatedData[index].note = editText;
    setData(updatedData);
    setEditIndex(null);
  };
  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleConfirmDelete = (index: number) => {
    setData((prevData: any) =>
      prevData.filter((_: any, i: number) => i !== index),
    );
    setDeleteIndex(null);
  };
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
                ClassName="bg-backgroundColor-Card shadow-Btn"
                onClick={() => {
                  setShowAddNote(false);
                  setCommentText('');
                }}
                style={{
                  height: '24px',
                  border: '1px solid',
                  borderColor: '#005F73',
                }}
              >
                <div className=" w-[60px] md:w-[100px] text-xs text-Primary-DeepTeal">
                  Cancel
                </div>
              </ButtonPrimary>
              <ButtonPrimary
                onClick={() => {
                  setShowAddNote(false);
                  Application.addNote({
                    member_id: id,
                    note: commentText,
                  })
                    .then(() => {
                      setData((prevNotes: any[]) => [
                        ...prevNotes,
                        {
                          date: Date.now(),
                          time: new Date().toLocaleTimeString(),
                          writer: 'clinic',
                          note: commentText,
                        },
                      ]);
                      setCommentText('');
                    })
                    .catch((error) => {
                      console.error('Error adding note:', error);
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
                style={{ height: '24px' }}
              >
                <div className=" w-[60px] md:w-[100px] text-xs">Save Note</div>
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
      <div
        className="flex justify-center items-center h-[500px] overflow-y-scroll"
        style={{
          alignItems: data?.length > 0 ? 'start' : 'center',
        }}
      >
        {data?.length > 0 ? (
          <>
            <div className="w-full ">
              {data?.map((el: any, index: number) => {
                return (
                  <div className=" my-2">
                    <Accordion time={el.time} title={formatDate(el.date)}>
                      {editIndex === index ? (
                        <textarea
                          className="text-[12px] w-full resize-none outline-none"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                      ) : (
                        <>
                          <div className="text-[#005F73] text-xs">
                            {el.writer}
                          </div>
                          <p className="text-[12px]">{el.note}</p>
                        </>
                      )}
                      <div className="flex w-full justify-end items-center gap-1">
                        {editIndex === index ? (
                          <div className="flex justify-end w-full items-center gap-4 mt-3">
                            <button
                              className="text-xs font-medium text-[#909090] cursor-pointer"
                              onClick={() => setEditIndex(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-xs font-medium text-Primary-DeepTeal cursor-pointer"
                              onClick={() => handleSaveEdit(index)}
                            >
                              Save Changes
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* <img
                          className="size-5 cursor-pointer"
                          src="/icons/edit-green.svg"
                          alt="Edit"
                          onClick={() => handleEditClick(index, el.note)}
                        /> */}
                            {deleteIndex === index ? (
                              <div className="flex w-full justify-end items-center gap-2">
                                <span className="text-xs  text-[#909090] ">
                                  Sure?
                                </span>
                                <img
                                  className="size-5 cursor-pointer"
                                  src="/icons/confirm-tick-circle.svg"
                                  alt="Confirm"
                                  onClick={() => handleConfirmDelete(index)}
                                />
                                <img
                                  className="size-5 cursor-pointer"
                                  src="/icons/cansel-close-circle.svg"
                                  alt="Cancel"
                                  onClick={() => setDeleteIndex(null)}
                                />
                              </div>
                            ) : (
                              <>
                                <img
                                  className="size-5 cursor-pointer"
                                  src="/icons/edit-green.svg"
                                  alt="Edit"
                                  onClick={() =>
                                    handleEditClick(index, el.note)
                                  }
                                />
                                <img
                                  className="size-5 cursor-pointer"
                                  src="/icons/trash-red.svg"
                                  alt="Delete"
                                  onClick={() => handleDeleteClick(index)}
                                />
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </Accordion>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-start -mt-[300px]">
            <img src="/icons/no-note.svg" alt="" />
            <div className="text-[12px] text-Text-Primary mt-1">
              No Notes Found
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
