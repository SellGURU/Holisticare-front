import { useState, useEffect, useRef } from 'react';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (styles: ElementStyles) => void;
  currentStyles?: ElementStyles;
  selectedText: string;
  onUpdatePreviewText: (text: string) => void;
  setShowReset: () => void;
}

export interface ElementStyles {
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  backgroundColor: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

const defaultStyles: ElementStyles = {
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#000000',
  backgroundColor: 'transparent',
  fontSize: '16px',
  textAlign: 'left',
};

export default function StyleModal({
  isOpen,
  onClose,
  onApplyStyle,
  currentStyles = defaultStyles,
  selectedText,
  onUpdatePreviewText,
  setShowReset,
}: StyleModalProps) {
  const [styles, setStyles] = useState<ElementStyles>(currentStyles);
  const [previewText, setPreviewText] = useState(selectedText);
  const [previewHtml, setPreviewHtml] = useState(selectedText);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if selectedText contains HTML
    const hasHtml = /<[^>]+>/g.test(selectedText);

    if (hasHtml) {
      // If it's HTML, use it directly
      setPreviewHtml(selectedText);
      setPreviewText(selectedText.replace(/<[^>]+>/g, '')); // Extract plain text for fallback
    } else {
      // If it's plain text, use it for both
      setPreviewText(selectedText);
      setPreviewHtml(selectedText);
    }

    // Update editor content when selectedText changes
    if (editorRef.current) {
      // Always update to ensure content is synced
      editorRef.current.innerHTML = hasHtml ? selectedText : selectedText || '';
    }
  }, [selectedText]);

  // Update styles when currentStyles prop changes
  useEffect(() => {
    if (currentStyles) {
      setStyles(currentStyles);
    }
  }, [currentStyles]);

  // Initialize editor content when modal opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      // Always set content when modal opens to ensure HTML is preserved
      const hasHtml = /<[^>]+>/g.test(selectedText);
      if (hasHtml) {
        editorRef.current.innerHTML = selectedText;
      } else {
        // If empty or just <br>, set the text
        if (
          !editorRef.current.innerHTML ||
          editorRef.current.innerHTML === '<br>' ||
          editorRef.current.innerHTML.trim() === ''
        ) {
          editorRef.current.innerHTML = selectedText || '';
        }
      }
    }
  }, [isOpen, selectedText]);

  const handleStyleChange = (property: keyof ElementStyles, value: string) => {
    setStyles((prev) => ({
      ...prev,
      [property]: value,
    }));
    setShowReset(); // Activate reset button when styles change
  };

  const handleHtmlChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setPreviewHtml(html);
      setPreviewText(
        editorRef.current.innerText || editorRef.current.textContent || '',
      );
      setShowReset();
    }
  };

  const applyFormat = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleHtmlChange();
    }
  };

  const isFormatActive = (command: string): boolean => {
    if (!editorRef.current) return false;
    // Check if editor has focus
    const isFocused = document.activeElement === editorRef.current;
    if (!isFocused) return false;
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const handleApply = () => {
    // Always get the latest HTML from the editor
    const htmlContent = editorRef.current?.innerHTML || previewHtml;
    onUpdatePreviewText(htmlContent);
    onApplyStyle(styles);
    setShowReset();
    onClose();
  };

  const isResetButtonDisabled =
    currentStyles?.backgroundColor == styles?.backgroundColor &&
    currentStyles?.color == styles?.color &&
    currentStyles?.fontWeight == styles?.fontWeight &&
    currentStyles?.fontStyle == styles?.fontStyle &&
    currentStyles?.textDecoration == styles?.textDecoration &&
    currentStyles?.fontSize == styles?.fontSize &&
    currentStyles?.textAlign == styles?.textAlign &&
    selectedText === previewText; // Also check if text has changed

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-l-lg w-[800px] h-full max-h-screen transform transition-transform duration-300 ease-in-out flex ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Panel */}
        <div className="w-1/2 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Preview</h4>

          {/* Preview Text Input */}
          {/* <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-600">
              Preview Text
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="flex-1 p-2 border rounded text-sm"
                placeholder="Enter preview text..."
              />
              <button
                onClick={() => setPreviewText('Lorem ipsum dolor sit amet')}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                title="Sample text"
              >
                Sample
              </button>
            </div>
          </div> */}

          {/* Live Preview */}
          <div className="border rounded bg-white p-4 flex flex-col overflow-hidden">
            <div className="text-sm text-gray-500 mb-2">Your Text:</div>

            {/* Rich Text Editor Toolbar */}
            <div className="flex gap-1 mb-2 p-2 bg-gray-100 rounded border-b flex-wrap">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className={`px-2 py-1 rounded text-sm ${
                  isFormatActive('bold')
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className={`px-2 py-1 rounded text-sm ${
                  isFormatActive('italic')
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => applyFormat('underline')}
                className={`px-2 py-1 rounded text-sm ${
                  isFormatActive('underline')
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
                title="Underline"
              >
                <u>U</u>
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => applyFormat('justifyLeft')}
                className="px-2 py-1 rounded text-sm bg-white hover:bg-gray-200"
                title="Align Left"
              >
                ⬅
              </button>
              <button
                type="button"
                onClick={() => applyFormat('justifyCenter')}
                className="px-2 py-1 rounded text-sm bg-white hover:bg-gray-200"
                title="Align Center"
              >
                ⬌
              </button>
              <button
                type="button"
                onClick={() => applyFormat('justifyRight')}
                className="px-2 py-1 rounded text-sm bg-white hover:bg-gray-200"
                title="Align Right"
              >
                ➡
              </button>
            </div>

            {/* Rich Text Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleHtmlChange}
              onBlur={handleHtmlChange}
              className="w-full p-2 border rounded resize-none min-h-[350px] max-h-[500px] focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
              style={{
                fontWeight: styles.fontWeight,
                fontStyle: styles.fontStyle,
                textDecoration: styles.textDecoration,
                color: styles.color,
                fontSize: styles.fontSize,
                textAlign: styles.textAlign,
              }}
              suppressContentEditableWarning
            />
            {/* <div
              className="min-h-[200px] p-4 border rounded"
              style={{
                fontWeight: styles.fontWeight,
                fontStyle: styles.fontStyle,
                textDecoration: styles.textDecoration,
                color: styles.color,
                fontSize: styles.fontSize,
                textAlign: styles.textAlign,
              }}
            >
              {previewText || 'Preview Text'}
            </div> */}
          </div>

          {/* Style Summary */}
          {/* <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <div className="font-medium text-blue-800 mb-2">
              Current Styles:
            </div>
            <div className="space-y-1 text-blue-700">
              <div>Weight: {styles.fontWeight}</div>
              <div>Style: {styles.fontStyle}</div>
              <div>Decoration: {styles.textDecoration}</div>
              <div>Size: {styles.fontSize}</div>
              <div>Align: {styles.textAlign}</div>
            </div>
          </div> */}
        </div>

        {/* Style Controls Panel */}
        <div className="w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Style</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            {/* Text */}
            {/* <div>
              <label className="block text-sm font-medium mb-2">Text</label>
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full p-2 border rounded min-h-[100px] resize-none text-sm"
                placeholder="Enter text..."
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Font Weight
              </label>
              <select
                value={styles.fontWeight}
                onChange={(e) =>
                  handleStyleChange(
                    'fontWeight',
                    e.target.value as 'normal' | 'bold',
                  )
                }
                className="w-full p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Style
              </label>
              <select
                value={styles.fontStyle}
                onChange={(e) =>
                  handleStyleChange(
                    'fontStyle',
                    e.target.value as 'normal' | 'italic',
                  )
                }
                className="w-full p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>
            </div>

            {/* Text Decoration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Decoration
              </label>
              <select
                value={styles.textDecoration}
                onChange={(e) =>
                  handleStyleChange(
                    'textDecoration',
                    e.target.value as 'none' | 'underline' | 'line-through',
                  )
                }
                className="w-full p-2 border rounded"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Line Through</option>
              </select>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={styles.color}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full h-10 border rounded"
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Size
              </label>
              <input
                type="range"
                min="8"
                max="72"
                value={parseInt(styles.fontSize)}
                onChange={(e) =>
                  handleStyleChange('fontSize', `${e.target.value}px`)
                }
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {styles.fontSize}
              </div>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Align
              </label>
              <div className="flex gap-2">
                {(['left', 'center', 'right', 'justify'] as const).map(
                  (align) => (
                    <button
                      key={align}
                      onClick={() => handleStyleChange('textAlign', align)}
                      className={`px-3 py-1 rounded text-sm ${
                        styles.textAlign === align
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {align === 'left' && 'Left'}
                      {align === 'center' && 'Center'}
                      {align === 'right' && 'Right'}
                      {align === 'justify' && 'Justify'}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleApply}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Apply
            </button>
            {!isResetButtonDisabled && (
              <button
                onClick={() => {
                  setStyles(currentStyles || defaultStyles);
                  setPreviewText(selectedText); // Reset text to original
                }}
                className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                title="Reset to original"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
