import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import StyleModal, { ElementStyles } from './StyleModal';
import { useNavigate } from 'react-router-dom';

type Props = {
  html: string;
  editable?: boolean;
  sandbox?: string;
  className?: string;
  onChange?: (html: string) => void;
  onSave: (html: string) => void;
};

export default function HtmlEditor({
  html,
  editable = false,
  sandbox = 'allow-scripts allow-same-origin',
  className = '',
  onChange,
  onSave,
}: Props) {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadedRef = useRef(false);
  const [originalHtml] = useState(html);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null,
  );
  const [currentStyles, setCurrentStyles] = useState<ElementStyles | null>(
    null,
  );
  const [, setIconsAdded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTextFormatting, setShowTextFormatting] = useState(false);

  // Helper function to detect Tailwind classes and get their values
  const getTailwindStyleValue = (element: HTMLElement, property: string) => {
    const classList = element.className;

    // Common Tailwind mappings
    const tailwindMappings: { [key: string]: { [key: string]: string } } = {
      fontWeight: {
        'font-bold': 'bold',
        'font-semibold': 'bold',
        'font-medium': 'normal',
        'font-normal': 'normal',
        'font-light': 'normal',
        'font-thin': 'normal',
      },
      fontStyle: {
        italic: 'italic',
        'not-italic': 'normal',
      },
      textDecoration: {
        underline: 'underline',
        'line-through': 'line-through',
        'no-underline': 'none',
      },
      textAlign: {
        'text-left': 'left',
        'text-center': 'center',
        'text-right': 'right',
        'text-justify': 'justify',
      },
    };

    const mappings = tailwindMappings[property];
    if (mappings) {
      for (const [className, value] of Object.entries(mappings)) {
        if (classList.includes(className)) {
          return value;
        }
      }
    }

    return null;
  };

  // Function to handle text selection in editable elements
  const handleTextSelection = (doc: Document) => {
    const selection = doc.getSelection();
    console.log('Selection detected:', selection?.toString()); // Debug log

    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      console.log('Selected text:', selectedText); // Debug log
      setSelectedText(selectedText);
      setShowTextFormatting(true);
    } else {
      setSelectedText('');
      setShowTextFormatting(false);
    }
  };

  // Function to apply formatting to selected text
  const applyTextFormatting = (format: 'bold' | 'italic' | 'underline') => {
    if (!iframeRef.current) return;

    const doc =
      iframeRef.current.contentDocument ||
      iframeRef.current.contentWindow?.document;
    if (!doc) return;

    const selection = doc.getSelection();
    if (!selection || selection.toString().trim().length === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // Create a new element with the formatting
    let formattedElement: HTMLElement;
    switch (format) {
      case 'bold':
        formattedElement = doc.createElement('strong');
        break;
      case 'italic':
        formattedElement = doc.createElement('em');
        break;
      case 'underline':
        formattedElement = doc.createElement('u');
        break;
      default:
        return;
    }

    formattedElement.textContent = selectedText;

    // Replace the selected text with the formatted element
    range.deleteContents();
    range.insertNode(formattedElement);

    // Clear selection
    selection.removeAllRanges();

    // Hide formatting toolbar
    setShowTextFormatting(false);
    setSelectedText('');

    // Trigger onChange to update parent component
    if (onChange) {
      onChange(doc.documentElement.outerHTML);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    if (iframeRef.current) {
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (!doc) return;

      const editableElements = doc.querySelectorAll('.editable');

      if (newEditMode) {
        // Enable edit mode
        editableElements.forEach((element) => {
          (element as HTMLElement).setAttribute('contenteditable', 'true');
        });

        // Add edit icons
        setTimeout(() => {
          addEditIcons(doc);
        }, 100);
      } else {
        // Disable edit mode
        editableElements.forEach((element) => {
          (element as HTMLElement).removeAttribute('contenteditable');
        });

        // Remove all edit icons
        const existingIcons = doc.querySelectorAll('.edit-icon');
        existingIcons.forEach((icon) => icon.remove());
      }
    }
  };

  const handleSave = async () => {
    if (isEditMode) {
      await toggleEditMode();
      setTimeout(() => {
        onSave(
          iframeRef.current?.contentDocument?.documentElement.outerHTML || '',
        );
      }, 800);
    }
  };

  // Function to add edit icons to editable elements
  const addEditIcons = useCallback(
    (doc: Document) => {
      const editableElements = doc.querySelectorAll('.editable');
      console.log('Found editable elements:', editableElements.length); // Debug log

      if (editableElements.length === 0) {
        console.log('No editable elements found, retrying...');
        return;
      }

      let iconsAddedCount = 0;

      editableElements.forEach((element) => {
        const htmlElement = element as HTMLElement;

        // Remove existing edit icon if any
        const existingIcon = htmlElement.querySelector('.edit-icon');
        if (existingIcon) {
          existingIcon.remove();
        }

        // Create edit icon
        const editIcon = doc.createElement('div');
        editIcon.className = 'edit-icon';
        editIcon.innerHTML = '✏️';
        editIcon.contentEditable = 'false';
        editIcon.style.cssText = `
        position: absolute;
        right: -12px;
        top: -12px;
        width: 24px;
        height: 24px;
        background: #3b82f6;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        z-index: 1000;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        -webkit-touch-callout: none;
        -webkit-user-drag: none;
        -khtml-user-select: none;
      `;

        // Make the editable element itself relatively positioned and inline-block
        htmlElement.style.position = 'relative';
        htmlElement.style.display = 'inline-block';
        htmlElement.appendChild(editIcon);

        // Add selection event listeners to the element itself
        htmlElement.addEventListener('mouseup', () => {
          if (isEditMode) {
            setTimeout(() => {
              handleTextSelection(doc);
            }, 10);
          }
        });

        htmlElement.addEventListener('keyup', () => {
          if (isEditMode) {
            setTimeout(() => {
              handleTextSelection(doc);
            }, 10);
          }
        });

        // Add click event to edit icon
        editIcon.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Temporarily hide icon to avoid detecting its blue background
          const iconDisplay = editIcon.style.display;
          editIcon.style.display = 'none';

          // Small delay to ensure icon is hidden before reading styles
          setTimeout(() => {
            setSelectedElement(htmlElement);

            // Get current styles from the element in iframe
            const computedStyle =
              doc.defaultView?.getComputedStyle(htmlElement);
            if (computedStyle) {
              // Parse font size to get numeric value
              const fontSize = computedStyle.fontSize;
              const fontSizeNum = parseFloat(fontSize);

              // Parse color to hex format
              const colorToHex = (color: string) => {
                if (color.startsWith('rgb')) {
                  const rgb = color.match(/\d+/g);
                  if (rgb && rgb.length >= 3) {
                    const r = parseInt(rgb[0]);
                    const g = parseInt(rgb[1]);
                    const b = parseInt(rgb[2]);
                    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                  }
                }
                return color;
              };

              // Check for inline styles first, then fall back to computed styles
              const inlineStyle = htmlElement.style;
              const hasInlineStyles = inlineStyle.cssText.length > 0;

              const currentStyles: ElementStyles = {
                fontWeight:
                  hasInlineStyles && inlineStyle.fontWeight
                    ? (inlineStyle.fontWeight as 'bold' | 'normal')
                    : (getTailwindStyleValue(htmlElement, 'fontWeight') as
                        | 'bold'
                        | 'normal') ||
                      (computedStyle.fontWeight === 'bold' ||
                      parseInt(computedStyle.fontWeight) >= 700
                        ? 'bold'
                        : 'normal'),
                fontStyle:
                  hasInlineStyles && inlineStyle.fontStyle
                    ? (inlineStyle.fontStyle as 'normal' | 'italic')
                    : (getTailwindStyleValue(htmlElement, 'fontStyle') as
                        | 'normal'
                        | 'italic') ||
                      (computedStyle.fontStyle === 'italic'
                        ? 'italic'
                        : 'normal'),
                textDecoration:
                  hasInlineStyles && inlineStyle.textDecoration
                    ? (inlineStyle.textDecoration as
                        | 'none'
                        | 'underline'
                        | 'line-through')
                    : (getTailwindStyleValue(htmlElement, 'textDecoration') as
                        | 'none'
                        | 'underline'
                        | 'line-through') ||
                      (computedStyle.textDecoration.includes('underline')
                        ? 'underline'
                        : computedStyle.textDecoration.includes('line-through')
                          ? 'line-through'
                          : 'none'),
                color:
                  hasInlineStyles && inlineStyle.color
                    ? inlineStyle.color
                    : colorToHex(computedStyle.color),
                backgroundColor: 'transparent', // Always set to transparent, don't read or apply background color
                fontSize:
                  hasInlineStyles && inlineStyle.fontSize
                    ? inlineStyle.fontSize
                    : `${fontSizeNum}px`,
                textAlign:
                  hasInlineStyles && inlineStyle.textAlign
                    ? (inlineStyle.textAlign as
                        | 'left'
                        | 'center'
                        | 'right'
                        | 'justify')
                    : (getTailwindStyleValue(htmlElement, 'textAlign') as
                        | 'left'
                        | 'center'
                        | 'right'
                        | 'justify') ||
                      (computedStyle.textAlign as
                        | 'left'
                        | 'center'
                        | 'right'
                        | 'justify'),
              };
              setCurrentStyles(currentStyles);
            }

            // Restore icon display
            editIcon.style.display = iconDisplay || '';
            setIsStyleModalOpen(true);
          }, 50); // Small delay to ensure icon is hidden before reading styles
        });

        // Add hover effects
        editIcon.addEventListener('mouseenter', () => {
          editIcon.style.transform = 'scale(1.1)';
          editIcon.style.background = '#2563eb';
        });

        editIcon.addEventListener('mouseleave', () => {
          editIcon.style.transform = 'scale(1)';
          editIcon.style.background = '#3b82f6';
        });

        // Prevent text selection on the icon
        editIcon.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        editIcon.addEventListener('selectstart', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        editIcon.addEventListener('dragstart', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        iconsAddedCount++;
      });

      console.log('Icons added:', iconsAddedCount);
      setIconsAdded(true);
    },
    [isEditMode],
  );

  // درج HTML یک بار و فعال کردن ویرایشگر
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      if (loadedRef.current) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(html);
      doc.close();

      if (editable && doc.body && isEditMode) {
        // Make only elements with 'editable' class editable
        const editableElements = doc.querySelectorAll('.editable');
        editableElements.forEach((element) => {
          if (isEditMode) {
            (element as HTMLElement).setAttribute('contenteditable', 'true');
          } else {
            (element as HTMLElement).removeAttribute('contenteditable');
          }
        });

        // Add edit icons to editable elements after DOM is fully loaded
        const addIconsWhenReady = () => {
          if (doc.readyState === 'complete') {
            requestAnimationFrame(() => {
              addEditIcons(doc);
            });
          } else {
            doc.addEventListener('DOMContentLoaded', () => {
              requestAnimationFrame(() => {
                addEditIcons(doc);
              });
            });
          }
        };

        addIconsWhenReady();

        // Fallback timeout to ensure icons are added
        setTimeout(() => {
          addEditIcons(doc);
        }, 1000);

        // Add event listener to the document for input events
        doc.addEventListener('input', () => {
          if (onChange) onChange(doc.documentElement.outerHTML);
        });

        // Add event listener for text selection
        doc.addEventListener('mouseup', () => {
          if (isEditMode) {
            setTimeout(() => {
              handleTextSelection(doc);
            }, 10);
          }
        });

        doc.addEventListener('keyup', () => {
          if (isEditMode) {
            setTimeout(() => {
              handleTextSelection(doc);
            }, 10);
          }
        });

        // Also listen for selection change
        doc.addEventListener('selectionchange', () => {
          if (isEditMode) {
            setTimeout(() => {
              handleTextSelection(doc);
            }, 10);
          }
        });

        // Hide formatting toolbar when clicking outside
        doc.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.text-formatting-toolbar')) {
            setShowTextFormatting(false);
            setSelectedText('');
          }
        });
      } else {
        const editableElements = doc.querySelectorAll('.editable');
        editableElements.forEach((element) => {
          (element as HTMLElement).removeAttribute('contenteditable');
        });
        const existingIcons = doc.querySelectorAll('.edit-icon');
        existingIcons.forEach((icon) => icon.remove());
      }

      loadedRef.current = true;
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    } else {
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, [html, editable, onChange, addEditIcons, isEditMode]);

  // Separate useEffect to add icons when HTML changes
  useEffect(() => {
    if (!editable || !iframeRef.current || !isEditMode) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Reset icons added state
    setIconsAdded(false);

    // Try to add icons with multiple strategies
    const tryAddIcons = () => {
      const editableElements = doc.querySelectorAll('.editable');
      if (editableElements.length > 0) {
        addEditIcons(doc);
      } else {
        // Retry after a short delay
        setTimeout(tryAddIcons, 200);
      }
    };

    // Initial attempt
    setTimeout(tryAddIcons, 100);

    // Additional attempts
    setTimeout(tryAddIcons, 500);
    setTimeout(tryAddIcons, 1000);
  }, [html, editable, addEditIcons, isEditMode]);

  // Function to apply styles to selected element
  const applyStyles = (styles: ElementStyles) => {
    if (!selectedElement) return;

    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Find the element in the iframe document
    const editableElements = doc.querySelectorAll('.editable');
    let targetElement: HTMLElement | null = null;

    editableElements.forEach((element) => {
      if (element === selectedElement) {
        targetElement = element as HTMLElement;
      }
    });

    if (targetElement) {
      // Apply styles (excluding backgroundColor - never apply background color)
      (targetElement as HTMLElement).style.fontWeight = styles.fontWeight;
      (targetElement as HTMLElement).style.fontStyle = styles.fontStyle;
      (targetElement as HTMLElement).style.textDecoration =
        styles.textDecoration;
      (targetElement as HTMLElement).style.color = styles.color;
      // backgroundColor is intentionally not applied
      (targetElement as HTMLElement).style.fontSize = styles.fontSize;
      (targetElement as HTMLElement).style.textAlign = styles.textAlign;

      // Trigger onChange to update parent component
      if (onChange) {
        onChange(doc.documentElement.outerHTML);
      }
    }
  };

  const handleReset = () => {
    setIsEditMode(false);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(originalHtml);
    doc.close();

    if (editable && doc.body && isEditMode) {
      // Make only elements with 'editable' class editable
      const editableElements = doc.querySelectorAll('.editable');
      editableElements.forEach((element) => {
        (element as HTMLElement).contentEditable = 'true';
      });

      // Reset icons added state and remove existing icons
      setIconsAdded(false);
      const existingIcons = doc.querySelectorAll('.edit-icon');
      existingIcons.forEach((icon) => icon.remove());

      // Add edit icons to editable elements after DOM is fully loaded
      const addIconsWhenReady = () => {
        if (doc.readyState === 'complete') {
          requestAnimationFrame(() => {
            addEditIcons(doc);
          });
        } else {
          doc.addEventListener('DOMContentLoaded', () => {
            requestAnimationFrame(() => {
              addEditIcons(doc);
            });
          });
        }
      };

      addIconsWhenReady();

      // Multiple fallback attempts
      setTimeout(() => addEditIcons(doc), 500);
      setTimeout(() => addEditIcons(doc), 1000);
      setTimeout(() => addEditIcons(doc), 2000);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2 absolute top-2 left-0 w-full justify-between items-center px-4">
        {editable && (
          <>
            <ButtonSecondary
              onClick={() => navigate(-1)}
              size="small"
              ClassName="bg-gray-200 !text-Primary-DeepTeal hover:bg-gray-300"
            >
              <img className="w-4 h-4" src="/icons/arrow-back.svg" alt="back" />
              Back
            </ButtonSecondary>
            <div className="flex gap-2">
              <ButtonSecondary
                onClick={toggleEditMode}
                ClassName={`${isEditMode ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                {isEditMode ? '✏️ Exit Edit' : '✏️ Edit Mode'}
              </ButtonSecondary>
              <ButtonSecondary
                onClick={handleReset}
                ClassName="bg-red-500 text-white hover:bg-red-600"
              >
                ❌ Reset
              </ButtonSecondary>
              {isEditMode && (
                <ButtonSecondary
                  onClick={handleSave}
                  ClassName="bg-green-500 text-white hover:bg-green-600"
                >
                  ✅ Save
                </ButtonSecondary>
              )}
            </div>
            {/* <button
              onClick={() => {
                setSelectedText('Test text');
                setShowTextFormatting(true);
              }}
              className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm"
            >
              Test Toolbar
            </button> */}
          </>
        )}
      </div>
      <div className="flex-1 border rounded overflow-hidden shadow mt-12">
        <iframe
          ref={iframeRef}
          title="HTML Editor"
          className="w-full h-screen"
          sandbox={sandbox}
        />
        {/* <div className="editable">این div هم قابل ویرایش است</div> */}
      </div>

      <StyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        onApplyStyle={applyStyles}
        currentStyles={currentStyles || undefined}
      />

      {/* Text Formatting Toolbar */}
      {showTextFormatting && selectedText && (
        <div
          className="text-formatting-toolbar fixed bg-white border rounded-lg shadow-lg p-2 flex gap-2 z-50"
          style={{
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '2px solid #3b82f6',
          }}
        >
          <span className="text-sm text-gray-600 px-2 py-1">
            "{selectedText.substring(0, 20)}
            {selectedText.length > 20 ? '...' : ''}"
          </span>
          <button
            onClick={() => applyTextFormatting('bold')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => applyTextFormatting('italic')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm italic"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => applyTextFormatting('underline')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm underline"
            title="Underline"
          >
            U
          </button>
          <button
            onClick={() => {
              setShowTextFormatting(false);
              setSelectedText('');
            }}
            className="px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
            title="Cancel"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
