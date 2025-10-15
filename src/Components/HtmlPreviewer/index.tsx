import { useEffect, useRef, useState, useCallback } from 'react';
import StyleModal, { ElementStyles } from './StyleModal';

type Props = {
  html: string;
  editable?: boolean;
  sandbox?: string;
  className?: string;
  onChange?: (html: string) => void;
};

export default function HtmlEditor({
  html,
  editable = false,
  sandbox = 'allow-scripts allow-same-origin',
  className = '',
  onChange,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadedRef = useRef(false);
  const [originalHtml] = useState(html);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [currentStyles, setCurrentStyles] = useState<ElementStyles | null>(null);
  const [, setIconsAdded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Function to get current styles from an element
  const getElementStyles = (element: HTMLElement): ElementStyles => {
    const computedStyle = window.getComputedStyle(element);
    return {
      fontWeight: computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700 ? 'bold' : 'normal',
      fontStyle: computedStyle.fontStyle === 'italic' ? 'italic' : 'normal',
      textDecoration: computedStyle.textDecoration.includes('underline') ? 'underline' : 
                     computedStyle.textDecoration.includes('line-through') ? 'line-through' : 'none',
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      textAlign: computedStyle.textAlign as 'left' | 'center' | 'right' | 'justify',
    };
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (!doc) return;

      const editableElements = doc.querySelectorAll('.editable');
      
      if (newEditMode) {
        // Enable edit mode
        editableElements.forEach(element => {
          (element as HTMLElement).contentEditable = 'true';
        });
        
        // Add edit icons
        setTimeout(() => {
          addEditIcons(doc);
        }, 100);
      } else {
        // Disable edit mode
        editableElements.forEach(element => {
          (element as HTMLElement).contentEditable = 'false';
        });
        
        // Remove all edit icons
        const existingIcons = doc.querySelectorAll('.edit-icon');
        existingIcons.forEach(icon => icon.remove());
      }
    }
  };

  // Function to add edit icons to editable elements
  const addEditIcons = useCallback((doc: Document) => {
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
      `;

      // Make the editable element itself relatively positioned and inline-block
      htmlElement.style.position = 'relative';
      htmlElement.style.display = 'inline-block';
      htmlElement.appendChild(editIcon);

      // Add click event to edit icon
      editIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElement(htmlElement);
        setCurrentStyles(getElementStyles(htmlElement));
        setIsStyleModalOpen(true);
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
      
      iconsAddedCount++;
    });
    
    console.log('Icons added:', iconsAddedCount);
    setIconsAdded(true);
  }, []);

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

      if (editable && doc.body) {
        // Make only elements with 'editable' class editable
        const editableElements = doc.querySelectorAll('.editable');
        editableElements.forEach(element => {
          (element as HTMLElement).contentEditable = isEditMode ? 'true' : 'false';
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
      // Apply styles
      (targetElement as HTMLElement).style.fontWeight = styles.fontWeight;
      (targetElement as HTMLElement).style.fontStyle = styles.fontStyle;
      (targetElement as HTMLElement).style.textDecoration = styles.textDecoration;
      (targetElement as HTMLElement).style.color = styles.color;
      (targetElement as HTMLElement).style.backgroundColor = styles.backgroundColor === 'transparent' ? 'transparent' : styles.backgroundColor;
      (targetElement as HTMLElement).style.fontSize = styles.fontSize;
      (targetElement as HTMLElement).style.textAlign = styles.textAlign;

      // Trigger onChange to update parent component
      if (onChange) {
        onChange(doc.documentElement.outerHTML);
      }
    }
  };

  const handleReset = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(originalHtml);
    doc.close();

    if (editable && doc.body) {
      // Make only elements with 'editable' class editable
      const editableElements = doc.querySelectorAll('.editable');
      editableElements.forEach(element => {
        (element as HTMLElement).contentEditable = 'true';
      });
      
      // Reset icons added state and remove existing icons
      setIconsAdded(false);
      const existingIcons = doc.querySelectorAll('.edit-icon');
      existingIcons.forEach(icon => icon.remove());
      
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
      <div className="flex gap-2 absolute top-0 left-0">
        {editable && (
          <>
            <button
              onClick={toggleEditMode}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isEditMode 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isEditMode ? '✏️ Exit Edit' : '✏️ Edit Mode'}
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
            >
              Reset
            </button>
          </>
        )}
      </div>
      <div className="flex-1 border rounded overflow-hidden shadow">
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
    </div>
  );
}
