/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import TurndownService from 'turndown';
import { marked } from 'marked';

interface TextAreaFieldProps {
  label: string;
  placeholder: string;

  /**
   * For textarea: plain string
   * For tiptap: MARKDOWN string (we store markdown, not HTML)
   */
  value: string;

  /** textarea mode ONLY (keep old behavior) */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

  /** tiptap mode ONLY */
  onMarkdownChange?: (value: string) => void;

  /**
   * tiptap mode ONLY:
   * Optional handler used by other screens (previous "add note on enter").
   * In your new "single note" usage, you won't use this.
   */
  onEnterSubmit?: () => void;

  /**
   * tiptap mode ONLY:
   * If true, Enter triggers onEnterSubmit (and prevents newline).
   * Default false so Enter inserts newline (what you want now).
   */
  submitOnEnter?: boolean;

  isValid?: boolean;
  validationText?: string;
  margin?: string;

  /** textarea mode ONLY (keep old behavior) */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  InfoText?: string;
  height?: string;
  as?: 'textarea' | 'tiptap';
}

const TextAreaField: FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onMarkdownChange,
  onEnterSubmit,
  submitOnEnter = false, // ✅ default: allow newline
  isValid = true,
  validationText,
  margin,
  onKeyDown,
  InfoText,
  height,
  as = 'textarea',
}) => {
  const tooltipId = `info-text-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const isTipTap = as === 'tiptap';

  // --- Markdown <-> HTML helpers ---
  const turndown = useMemo(() => {
    const td = new TurndownService({
      bulletListMarker: '-',
      emDelimiter: '*',
      strongDelimiter: '**',
    });
    td.keep(['br']);
    return td;
  }, []);

  const markdownToHtml = useMemo(() => {
    return (md: string) => {
      const html = marked.parse(md || '');
      return typeof html === 'string' ? html : '';
    };
  }, []);

  // ✅ Build class safely (no tokens with spaces)
  const editorAreaClass = useMemo(() => {
    return [
      'w-full',
      height ? height : 'h-[98px]',
      'text-justify',
      'rounded-[16px]',
      'py-1',
      'px-3',
      'outline-none',
      'bg-backgroundColor-Card',
      'text-xs',
      'font-normal',
      'text-Text-Primary',
      // 👇 makes bullets visible inside the editor
      '[&_ul]:list-disc [&_ul]:pl-5',
      '[&_ol]:list-decimal [&_ol]:pl-5',
      '[&_p]:my-0',
    ].join(' ');
  }, [height]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {},
        orderedList: {},
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-Text-Fivefold before:float-left before:pointer-events-none before:h-0',
      }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: editorAreaClass,
      },
      handleKeyDown: (_view, event) => {
        // ✅ Default: allow Enter to insert newline/paragraph
        // ✅ Only intercept Enter if submitOnEnter is enabled (legacy behavior)
        if (submitOnEnter && event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          onEnterSubmit?.();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (!isTipTap) return;
      const html = editor.getHTML();
      const md = turndown.turndown(html);
      onMarkdownChange?.(md);
    },
  });

  // Keep editor in sync when external value changes (markdown -> html)
  useEffect(() => {
    if (!editor) return;
    if (!isTipTap) return;

    const nextHtml = markdownToHtml(value || '');
    const currentHtml = editor.getHTML();

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [value, editor, isTipTap, markdownToHtml]);

  // Active toolbar styles
  const btnBase = 'px-2 py-1 rounded text-xs border transition select-none';
  const btnActive = 'bg-[#005f73] text-white border-[#005f73]';
  const btnInactive = 'bg-backgroundColor-Card text-Text-Primary border-Gray-50';

  return (
    <div className={`flex flex-col w-full gap-2 ${margin ? margin : 'mt-4'}`}>
      <div className="text-xs font-medium text-Text-Primary flex gap-1 items-start">
        {label}
        {InfoText && (
          <img data-tooltip-id={tooltipId} src="/icons/info-circle.svg" alt="" />
        )}
      </div>

      {/* TEXTAREA (unchanged) */}
      {!isTipTap && (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={[
            'w-full',
            height ? height : 'h-[98px]',
            'text-justify',
            'rounded-[16px]',
            'py-1',
            'px-3',
            'border',
            !isValid ? 'border-Red' : 'border-Gray-50',
            'bg-backgroundColor-Card',
            'text-xs',
            'font-normal',
            'placeholder:text-Text-Fivefold',
            'resize-none',
            'focus-visible:outline-none',
            'md:focus-visible:border-black',
          ].join(' ')}
          onKeyDown={onKeyDown}
        />
      )}

      {/* TIPTAP */}
      {isTipTap && (
        <div
          className={[
            'w-full',
            'rounded-[16px]',
            'border',
            !isValid ? 'border-Red' : 'border-Gray-50',
            'bg-backgroundColor-Card',
            'text-xs',
            'font-normal',
            'focus-within:border-black',
          ].join(' ')}
        >
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 pt-2 pb-2 border-b border-Gray-50">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={[
                btnBase,
                editor?.isActive('bold') ? btnActive : btnInactive,
              ].join(' ')}
            >
              Bold
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={[
                btnBase,
                editor?.isActive('bulletList') ? btnActive : btnInactive,
              ].join(' ')}
            >
              • Bullet
            </button>
          </div>

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
