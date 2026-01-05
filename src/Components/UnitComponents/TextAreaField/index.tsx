import React, { FC, useEffect, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value: string;
  isValid?: boolean;
  validationText?: string;

  // ✅ keep EXACT same signature for normal textarea usage
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

  // ✅ TipTap-only: string output
  onValueChange?: (value: string) => void;

  margin?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void; // textarea-only
  InfoText?: string;
  height?: string;
  as?: 'textarea' | 'tiptap';

  // ✅ TipTap-only: when user presses Enter
  onEnterSubmit?: () => void;
}

const isEmptyTiptapHtml = (html: string) => {
  const cleaned = (html || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    cleaned === '' ||
    cleaned === '<p></p>' ||
    cleaned === '<p><br></p>' ||
    cleaned === '<p><br/></p>' ||
    cleaned === '<ul><li><p></p></li></ul>' ||
    cleaned === '<ol><li><p></p></li></ol>'
  );
};

const TextAreaField: FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onValueChange,
  isValid = true,
  validationText,
  margin,
  onKeyDown,
  InfoText,
  height,
  as = 'textarea',
  onEnterSubmit,
}) => {
  const tooltipId = `info-text-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const isTipTap = as === 'tiptap';

  const contentClass = useMemo(() => {
    return [
      'w-full',
      height ? height : 'h-[98px]',
      'px-3',
      'py-2',
      'text-xs',
      'font-normal',
      'text-Text-Primary',
      'outline-none',
      'text-justify',
      // show bullets nicely
      'prose',
      'prose-sm',
      'max-w-none',
      'dark:prose-invert',
      '[&_ul]:list-disc',
      '[&_ul]:pl-5',
      '[&_ul]:my-1',
      '[&_ol]:list-decimal',
      '[&_ol]:pl-5',
      '[&_ol]:my-1',
      '[&_li]:my-0.5',
      '[&_p]:my-0',
    ].join(' ');
  }, [height]);

  const editor = useEditor({
    extensions: [
      StarterKit
    ],
    content: value || '',
    editorProps: {
      attributes: { class: contentClass },
      handleKeyDown: (_view, event) => {
        // ✅ Enter submits, does NOT insert new line
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          onEnterSubmit?.();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // ✅ TipTap emits string through onValueChange
      onValueChange?.(html);
    },
  });

  // Keep TipTap synced when parent changes `value`
  useEffect(() => {
    if (!isTipTap) return;
    if (!editor) return;

    const current = editor.getHTML();
    const next = value || '';

    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor, isTipTap]);

  const isEditorEmpty = useMemo(() => {
    if (!isTipTap) return (value || '').trim().length === 0;
    if (!editor) return isEmptyTiptapHtml(value || '');
    return editor.state.doc.textContent.trim().length === 0;
  }, [editor, value, isTipTap]);

  return (
    <div className={`flex flex-col w-full gap-2 ${margin ? margin : 'mt-4'}`}>
      <div className="text-xs font-medium text-Text-Primary flex gap-1 items-start">
        {label}
        {InfoText && (
          <img data-tooltip-id={tooltipId} src="/icons/info-circle.svg" alt="" />
        )}
      </div>

      {/* ✅ NORMAL TEXTAREA (UNCHANGED) */}
      {!isTipTap && (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full ${height ? height : 'h-[98px]'} text-justify rounded-[16px] py-1 px-3 border ${
            !isValid ? 'border-Red' : 'border-Gray-50'
          } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold resize-none focus-visible:outline-none md:focus-visible:border-black`}
          onKeyDown={onKeyDown}
        />
      )}

      {/* ✅ TIPTAP */}
      {isTipTap && (
        <div
          className={`w-full rounded-[16px] border ${
            !isValid ? 'border-Red' : 'border-Gray-50'
          } bg-backgroundColor-Card text-xs font-normal focus-within:border-black`}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-Gray-50">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={[
                'px-2 py-1 rounded text-xs border transition',
                editor?.isActive('bold')
                  ? 'bg-[#005f73] text-white'
                  : 'bg-backgroundColor-Card text-Text-Primary',
              ].join(' ')}
            >
              Bold
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={[
                'px-2 py-1 rounded text-xs border transition',
                editor?.isActive('bulletList')
                  ? 'bg-[#005f73] text-white'
                  : 'bg-backgroundColor-Card text-Text-Primary',
              ].join(' ')}
            >
              • Bullet
            </button>
          </div>

          {isEditorEmpty && (
            <div className="px-3 pt-2 text-xs font-normal text-Text-Fivefold pointer-events-none select-none">
              {placeholder}
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      )}

      {validationText && <div className="text-Red text-[10px]">{validationText}</div>}

      {InfoText && (
        <Tooltip
          id={tooltipId}
          place="top-start"
          className="!bg-white !max-w-[300px] !font-normal !leading-5 !text-wrap !shadow-100 !text-Text-Primary !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
        >
          {InfoText}
        </Tooltip>
      )}
    </div>
  );
};

export default TextAreaField;
