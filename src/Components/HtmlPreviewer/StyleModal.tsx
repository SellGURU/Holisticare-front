import { useState, useEffect } from 'react';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (styles: ElementStyles) => void;
  currentStyles?: ElementStyles;
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
}: StyleModalProps) {
  const [styles, setStyles] = useState<ElementStyles>(currentStyles);
  const [previewText, setPreviewText] = useState('Preview Text');

  // Update styles when currentStyles prop changes
  useEffect(() => {
    if (currentStyles) {
      setStyles(currentStyles);
    }
  }, [currentStyles]);

  const handleStyleChange = (property: keyof ElementStyles, value: string) => {
    setStyles((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleApply = () => {
    onApplyStyle(styles);
    onClose();
  };

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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-600">Preview Text</label>
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
          </div>

          {/* Live Preview */}
          <div className="flex-1 border rounded bg-white p-4">
            <div className="text-sm text-gray-500 mb-2">Live Preview:</div>
            <div 
              className="min-h-[200px] p-4 border rounded"
              style={{
                fontWeight: styles.fontWeight,
                fontStyle: styles.fontStyle,
                textDecoration: styles.textDecoration,
                color: styles.color,
                backgroundColor: styles.backgroundColor === 'transparent' ? 'transparent' : styles.backgroundColor,
                fontSize: styles.fontSize,
                textAlign: styles.textAlign,
              }}
            >
              {previewText || 'Preview Text'}
            </div>
          </div>

          {/* Style Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <div className="font-medium text-blue-800 mb-2">Current Styles:</div>
            <div className="space-y-1 text-blue-700">
              <div>Weight: {styles.fontWeight}</div>
              <div>Style: {styles.fontStyle}</div>
              <div>Decoration: {styles.textDecoration}</div>
              <div>Size: {styles.fontSize}</div>
              <div>Align: {styles.textAlign}</div>
            </div>
          </div>
        </div>

        {/* Style Controls Panel */}
        <div className="w-1/2 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Style</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Font Weight */}
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
            <label className="block text-sm font-medium mb-2">Font Style</label>
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
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <input
              type="color"
              value={styles.color}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-full h-10 border rounded"
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={
                styles.backgroundColor === 'transparent'
                  ? '#ffffff'
                  : styles.backgroundColor
              }
              onChange={(e) =>
                handleStyleChange('backgroundColor', e.target.value)
              }
              className="w-full h-10 border rounded"
            />
            <button
              onClick={() =>
                handleStyleChange('backgroundColor', 'transparent')
              }
              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Transparent
            </button>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
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
            <label className="block text-sm font-medium mb-2">Text Align</label>
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
          <button
            onClick={() => setStyles(currentStyles || defaultStyles)}
            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            title="Reset to original"
          >
            Reset
          </button>
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
