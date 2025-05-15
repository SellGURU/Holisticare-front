/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import Accordion from '../../Accordion';
import Circleloader from '../../CircleLoader';
export const Notes = () => {
  const [data, setData] = useState<any>([]);
  const { id } = useParams<{ id: string }>();
  const [showAddNote, setShowAddNote] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const getNotes = (Id: any) => {
    setLoading(true);
    Application.getNotes({ member_id: Id })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getNotes(id);
  }, [id]);
  const handleNoteDelete = (noteId: string) => {
    setLoading(true);
    Application.deleteNote(noteId).then(() => {
      getNotes(id);
    });
  };
  const handleNoteUpdate = (noteId: string) => {
    setLoading(true);
    const data = {
      note_unique_id: noteId,
      updated_note: editText,
    };
    Application.updateNote(data).then(() => {
      getNotes(id);
    });
  };
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

  const handleSaveEdit = (id: string) => {
    handleNoteUpdate(id);
    setEditIndex(null);
  };
  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleConfirmDelete = (id: string) => {
    handleNoteDelete(id);
    setDeleteIndex(null);
  };
  return (
    <div className=" w-full relative">
      <div className="w-full flex justify-between px-3.5 py-3">
        {/* <div className="text-[14px] text-light-secandary-text dark:text-[#FFFFFFDE]">
        Trainer's Notes (
        {data?.notes ? data.notes.length : "0"})
      </div> */}
        {loading && (
          <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 w-full h-full rounded-[16px] absolute">
            <Circleloader />
          </div>
        )}
        {!showAddNote && (
          <div
            onClick={() => {
              setShowAddNote(true);
            }}
            className=" text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-xl border-dashed px-8 h-8 w-full text-Primary-DeepTeal "
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
                      getNotes(id);
                      setCommentText('');
                    })
                    .catch((error) => {
                      console.error('Error adding note:', error);
                    });
                }}
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
                  <div className="my-2" key={index}>
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
                              onClick={() => handleSaveEdit(el.unique_id)}
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
                                  onClick={() =>
                                    handleConfirmDelete(el.unique_id)
                                  }
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
            <img src="/icons/EmptyNote.svg" alt="" />
            <div className="text-[12px] text-Text-Primary ">
              No notes found.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
