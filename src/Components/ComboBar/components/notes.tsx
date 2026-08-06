/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import Accordion from '../../Accordion';
import Circleloader from '../../CircleLoader';
import useIsDemo from '../../../hooks/useIsDemo';
import { uploadBlobToAzure } from '../../../services/uploadBlobService';
import {
  noteAttachmentFileType,
  validateNoteAttachmentFile,
} from '../../../utils/expertNoteAttachment';

export const Notes = () => {
  const isDemo = useIsDemo();
  const [data, setData] = useState<any>([]);
  const { id } = useParams<{ id: string }>();
  const [showAddNote, setShowAddNote] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // A note is either written text OR an attached file - never both, never
  // neither. See doc/EXPERT_NOTE_FILE_ATTACHMENT_PLAN.md.
  const [noteMode, setNoteMode] = useState<'text' | 'file'>('text');
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
    if (isDemo) return;
    setLoading(true);
    Application.deleteNote(noteId)
      .then(() => {
        getNotes(id);
      })
      .catch((err) => {
        console.error('Error deleting note:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleNoteUpdate = (noteId: string) => {
    if (isDemo) return;
    setLoading(true);
    const data = {
      note_unique_id: noteId,
      updated_note: editText,
    };
    Application.updateNote(data)
      .then(() => {
        getNotes(id);
      })
      .catch((err) => {
        console.error('Error updating note:', err);
      })
      .finally(() => {
        setLoading(false);
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
    if (isDemo) return;
    setEditIndex(index);
    setEditText(currentNote);
  };

  const handleSaveEdit = (id: string) => {
    handleNoteUpdate(id);
    setEditIndex(null);
  };
  const handleDeleteClick = (index: number) => {
    if (isDemo) return;
    setDeleteIndex(index);
  };

  const handleConfirmDelete = (id: string) => {
    handleNoteDelete(id);
    setDeleteIndex(null);
  };
  const handleAttachFileClick = () => {
    if (isDemo) return;
    fileInputRef.current?.click();
  };
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    // Reset input value so re-selecting the same file re-triggers onChange.
    e.target.value = '';
    if (!file) return;
    const validation = validateNoteAttachmentFile(file);
    if (!validation.ok) {
      setAttachmentError(validation.message);
      return;
    }
    setAttachmentError(null);
    setAttachedFile(file);
  };
  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setAttachmentError(null);
    setUploadProgress(null);
  };
  const handleNoteModeChange = (mode: 'text' | 'file') => {
    if (isDemo || mode === noteMode) return;
    setAttachmentError(null);
    if (mode === 'file') {
      // Switching to File mode: a note can't have both text and a file, so
      // clear whatever was typed.
      setCommentText('');
    } else {
      // Switching to Text mode: clear any attached file for the same reason.
      setAttachedFile(null);
      setUploadProgress(null);
    }
    setNoteMode(mode);
  };
  const handleSaveNote = async () => {
    if (isDemo) return;
    if (noteMode === 'text' && !commentText.trim()) {
      setAttachmentError('Please write a note.');
      return;
    }
    if (noteMode === 'file' && !attachedFile) {
      setAttachmentError('Please attach a file.');
      return;
    }
    setIsSavingNote(true);
    setLoading(true);
    try {
      let attachment:
        | { blob_url: string; file_name: string; file_type: string }
        | undefined;
      if (noteMode === 'file' && attachedFile) {
        setUploadProgress(0);
        const blobUrl = await uploadBlobToAzure({
          file: attachedFile,
          containerKey: 'reports',
          name: attachedFile.name,
          onProgress: (progress) => setUploadProgress(progress),
        });
        attachment = {
          blob_url: blobUrl,
          file_name: attachedFile.name,
          file_type: noteAttachmentFileType(attachedFile.name),
        };
      }
      await Application.addNote({
        member_id: id,
        // Exactly one of note text / attachment is ever sent - never both.
        note: noteMode === 'text' ? commentText : '',
        ...(attachment ? { attachment } : {}),
      });
      setShowAddNote(false);
      setCommentText('');
      setAttachedFile(null);
      setUploadProgress(null);
      setAttachmentError(null);
      setNoteMode('text');
      getNotes(id);
    } catch (error) {
      console.error('Error adding note:', error);
      setAttachmentError('Failed to save note. Please try again.');
    } finally {
      setIsSavingNote(false);
      setLoading(false);
    }
  };
  return (
    <div className=" w-full relative">
      {/* <div className="text-[14px] text-light-secandary-text dark:text-[#FFFFFFDE]">
        Trainer's Notes (
        {data?.notes ? data.notes.length : "0"})
      </div> */}
      {loading && (
        <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 w-[100%] h-full absolute">
          <Circleloader />
        </div>
      )}
      {!showAddNote && (
        <div
          onClick={() => {
            if (isDemo) return;
            setShowAddNote(true);
          }}
          title={
            isDemo
              ? 'Demo version cannot add or edit data. Upgrade for full access.'
              : undefined
          }
          className={` text-[14px] flex justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-xl border-dashed px-8 h-8 w-full text-Primary-DeepTeal ${isDemo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} `}
        >
          <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
          Add Note
        </div>
      )}

      {showAddNote && (
        <div className="flex justify-center items-center mb-6">
          <div className="w-full ">
            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                disabled={isDemo}
                onClick={() => handleNoteModeChange('text')}
                className={`text-[11px] font-medium px-3 py-1 rounded-full border ${
                  noteMode === 'text'
                    ? 'bg-Primary-DeepTeal text-white border-Primary-DeepTeal'
                    : 'bg-white text-Primary-DeepTeal border-Gray-50'
                } ${isDemo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Text
              </button>
              <button
                type="button"
                disabled={isDemo}
                onClick={() => handleNoteModeChange('file')}
                className={`text-[11px] font-medium px-3 py-1 rounded-full border ${
                  noteMode === 'file'
                    ? 'bg-Primary-DeepTeal text-white border-Primary-DeepTeal'
                    : 'bg-white text-Primary-DeepTeal border-Gray-50'
                } ${isDemo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                File
              </button>
            </div>
            {noteMode === 'text' ? (
              <>
                <div className="text-[12px] font-medium text-Text-Primary ">
                  Note
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                  }}
                  placeholder="Provide expert commentary on the patient's condition"
                  className="min-h-[215px] font-light text-[12px] p-2 border border-Gray-50 text-justify mt-1 rounded-[16px] bg-backgroundColor-Card w-full resize-y outline-none"
                />
              </>
            ) : (
              <>
                <div className="text-[12px] font-medium text-Text-Primary ">
                  Attachment
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileSelected}
                />
                <div className="flex items-center justify-between mt-2 gap-2 min-h-[40px] border border-dashed border-Gray-50 rounded-[16px] px-3">
                  {attachedFile ? (
                    <div className="flex items-center gap-2 min-w-0 py-2">
                      <img
                        className="size-4 shrink-0"
                        src="/icons/attach-svgrepo-com 1.svg"
                        alt=""
                      />
                      <span className="text-[11px] text-Text-Primary truncate max-w-[140px]">
                        {attachedFile.name}
                      </span>
                      {uploadProgress !== null && uploadProgress < 100 && (
                        <span className="text-[10px] text-Text-Secondary">
                          {uploadProgress}%
                        </span>
                      )}
                      {!isSavingNote && (
                        <img
                          className="size-4 shrink-0 cursor-pointer"
                          src="/icons/cansel-close-circle.svg"
                          alt="Remove attachment"
                          onClick={handleRemoveAttachment}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-1 text-[11px] text-Primary-DeepTeal py-2 ${isDemo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={handleAttachFileClick}
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : 'Attach a PDF, DOCX, or TXT file (max 10 MB)'
                      }
                    >
                      <img
                        className="size-4"
                        src="/icons/attach-svgrepo-com 1.svg"
                        alt=""
                      />
                      Attach File
                    </div>
                  )}
                </div>
              </>
            )}
            {attachmentError && (
              <div className="text-[11px] text-red-500 mt-1">
                {attachmentError}
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <ButtonPrimary
                ClassName="bg-backgroundColor-Card shadow-Btn"
                onClick={() => {
                  setShowAddNote(false);
                  setCommentText('');
                  setAttachedFile(null);
                  setAttachmentError(null);
                  setUploadProgress(null);
                  setNoteMode('text');
                }}
                style={{
                  height: '24px',
                  border: '1px solid',
                  borderColor: '#005F73',
                }}
              >
                <div className=" w-[60px] md:w-[100px] font-medium text-xs text-Primary-DeepTeal">
                  Cancel
                </div>
              </ButtonPrimary>
              <ButtonPrimary
                disabled={isDemo || isSavingNote}
                title={
                  isDemo
                    ? 'Demo version cannot add or edit data. Upgrade for full access.'
                    : undefined
                }
                onClick={handleSaveNote}
                style={{ height: '24px' }}
              >
                <div className=" w-[60px] md:w-[100px] font-medium text-xs">
                  {isSavingNote
                    ? attachedFile
                      ? 'Uploading...'
                      : 'Saving...'
                    : 'Save Note'}
                </div>
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
      <div
        className={`flex w-full justify-center items-center h-[500px] ${data?.length > 6 && 'overflow-y-scroll pr-1'}`}
        style={{
          alignItems: data?.length > 0 ? 'start' : 'center',
        }}
      >
        {data?.length > 0 ? (
          <>
            <div className="w-full ">
              {data?.map((el: any, index: number) => {
                return (
                  <div className="my-2 w-full" key={index}>
                    <Accordion time={el.time} title={formatDate(el.date)}>
                      {editIndex === index ? (
                        <textarea
                          className="text-[12px] w-full min-h-[80px] resize-y outline-none"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                      ) : (
                        <>
                          <div className="text-[#005F73] text-xs">
                            {el.writer}
                          </div>
                          {el.note && (
                            <p className="text-[12px] break-words">{el.note}</p>
                          )}
                          {el.has_attachment && (
                            <div className="flex items-center gap-1 mt-1">
                              <img
                                className="size-3.5"
                                src="/icons/attach-svgrepo-com 1.svg"
                                alt=""
                              />
                              <span className="text-[10px] text-Text-Secondary truncate max-w-[160px]">
                                {el.attachment_file_name}
                              </span>
                              {el.attachment_extraction_status === 'failed' && (
                                <span
                                  className="text-[10px] text-amber-600"
                                  title="The note text was saved, but text could not be extracted from this attachment."
                                >
                                  (text not extracted)
                                </span>
                              )}
                            </div>
                          )}
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
                              className={`text-xs font-medium ${isDemo ? 'text-Text-Secondary cursor-not-allowed' : 'text-Primary-DeepTeal cursor-pointer'}`}
                              title={
                                isDemo
                                  ? 'Demo version cannot add or edit data. Upgrade for full access.'
                                  : undefined
                              }
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
                                  className={`size-5 ${isDemo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                  src="/icons/edit-green.svg"
                                  alt="Edit"
                                  title={
                                    isDemo
                                      ? 'Demo version cannot add or edit data. Upgrade for full access.'
                                      : undefined
                                  }
                                  onClick={() =>
                                    handleEditClick(index, el.note)
                                  }
                                />
                                <img
                                  className={`size-5 ${isDemo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                  src="/icons/trash-red.svg"
                                  alt="Delete"
                                  title={
                                    isDemo
                                      ? 'Demo version cannot add or edit data. Upgrade for full access.'
                                      : undefined
                                  }
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
