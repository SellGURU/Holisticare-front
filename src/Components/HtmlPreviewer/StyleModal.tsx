import { useState } from 'react';

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
  currentStyles = defaultStyles 
}: StyleModalProps) {
  const [styles, setStyles] = useState<ElementStyles>(currentStyles);

  const handleStyleChange = (property: keyof ElementStyles, value: string) => {
    setStyles(prev => ({
      ...prev,
      [property]: value
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
        className={`bg-white rounded-l-lg p-6 w-[500px] h-full max-h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
            <label className="block text-sm font-medium mb-2">Font Weight</label>
            <select
              value={styles.fontWeight}
              onChange={(e) => handleStyleChange('fontWeight', e.target.value as 'normal' | 'bold')}
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
              onChange={(e) => handleStyleChange('fontStyle', e.target.value as 'normal' | 'italic')}
              className="w-full p-2 border rounded"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </select>
          </div>

          {/* Text Decoration */}
          <div>
            <label className="block text-sm font-medium mb-2">Text Decoration</label>
            <select
              value={styles.textDecoration}
              onChange={(e) => handleStyleChange('textDecoration', e.target.value as 'none' | 'underline' | 'line-through')}
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
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <input
              type="color"
              value={styles.backgroundColor === 'transparent' ? '#ffffff' : styles.backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="w-full h-10 border rounded"
            />
            <button
              onClick={() => handleStyleChange('backgroundColor', 'transparent')}
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
              onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">{styles.fontSize}</div>
          </div>

          {/* Text Align */}
          <div>
            <label className="block text-sm font-medium mb-2">Text Align</label>
            <div className="flex gap-2">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
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
              ))}
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
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
