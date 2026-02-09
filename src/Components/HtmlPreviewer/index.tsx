import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import StyleModal, { ElementStyles } from './StyleModal';
import { useNavigate, useBlocker } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import ConfirmModal from '../confitmModal';
import { Edit } from 'lucide-react';

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
  sandbox = 'allow-scripts allow-same-origin allow-popups',
  className = '',
  onChange,
  onSave,
}: Props) {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadedRef = useRef(false);
  const originalHtmlRef = useRef(html);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null,
  );
  const [currentStyles, setCurrentStyles] = useState<ElementStyles | null>(
    null,
  );
  const [previewText, setPreviewText] = useState<string>('');
  const [, setIconsAdded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTextFormatting, setShowTextFormatting] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  // Update originalHtmlRef when html prop changes
  useEffect(() => {
    originalHtmlRef.current = html;
  }, [html]);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      showReset && currentLocation.pathname !== nextLocation.pathname,
  );

  // Handle blocked navigation
  useEffect(() => {
    if (blocker.state === 'blocked' && showReset) {
      setShowExitConfirm(true);
      setPendingNavigation(() => () => {
        blocker.proceed?.();
      });
    }
  }, [blocker, showReset]);

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
  // const handleTextSelection = (doc: Document) => {
  //   const selection = doc.getSelection();
  //   console.log('Selection detected:', selection?.toString()); // Debug log

  //   if (selection && selection.toString().trim().length > 0) {
  //     const selectedText = selection.toString().trim();
  //     console.log('Selected text:', selectedText); // Debug log
  //     setSelectedText(selectedText);
  //     setShowTextFormatting(true);
  //   } else {
  //     setSelectedText('');
  //     setShowTextFormatting(false);
  //   }
  // };

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
  const toggleEditMode = (skipReset: boolean = false) => {
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
        // editableElements.forEach((element) => {
        //   (element as HTMLElement).setAttribute('contenteditable', 'true');
        // });
        editableElements.forEach((element) => {
          (element as HTMLElement).removeAttribute('contenteditable');
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

        // Remove all edit icons - do this multiple times to ensure all are removed
        const removeAllIcons = () => {
          const existingIcons = doc.querySelectorAll('.edit-icon');
          existingIcons.forEach((icon) => icon.remove());
        };

        // Remove icons immediately
        removeAllIcons();

        // Reset to original HTML only if not saving
        if (!skipReset) {
          doc.open();
          doc.write(originalHtmlRef.current);
          doc.close();

          // Remove icons again after HTML reset (in case reset added any)
          setTimeout(() => {
            removeAllIcons();
            // Also remove from any newly created elements
            const newEditableElements = doc.querySelectorAll('.editable');
            newEditableElements.forEach((element) => {
              (element as HTMLElement).removeAttribute('contenteditable');
              const icon = (element as HTMLElement).querySelector('.edit-icon');
              if (icon) icon.remove();
            });
          }, 0);

          // Additional cleanup after DOM updates
          setTimeout(removeAllIcons, 50);
          setTimeout(removeAllIcons, 200);

          // Reset StyleModal states
          setSelectedElement(null);
          setCurrentStyles(null);
          setPreviewText('');
          setIsStyleModalOpen(false);
          setShowReset(false);
        } else {
          // Even when saving, ensure icons are removed after a delay
          setTimeout(removeAllIcons, 50);
          setTimeout(removeAllIcons, 200);
        }
      }
    }
  };

  const handleSave = async () => {
    if (isEditMode) {
      // Get the current HTML before toggling edit mode
      const doc =
        iframeRef.current?.contentDocument ||
        iframeRef.current?.contentWindow?.document;
      if (!doc) return;

      // Remove all edit icons from the document before saving
      // First pass: remove all icons directly
      const editIcons = doc.querySelectorAll('.edit-icon');
      editIcons.forEach((icon) => icon.remove());

      // Second pass: remove any icons that might be nested inside elements
      const allElements = doc.querySelectorAll('*');
      allElements.forEach((element) => {
        const nestedIcons = element.querySelectorAll('.edit-icon');
        nestedIcons.forEach((icon) => icon.remove());
      });

      // Third pass: remove icons by checking innerHTML of all elements
      const editableElements = doc.querySelectorAll('.editable');
      editableElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // Remove contenteditable attribute
        htmlElement.removeAttribute('contenteditable');

        // Remove any edit-icon from innerHTML if present
        if (htmlElement.innerHTML.includes('edit-icon')) {
          const tempDiv = doc.createElement('div');
          tempDiv.innerHTML = htmlElement.innerHTML;
          const iconsInContent = tempDiv.querySelectorAll('.edit-icon');
          iconsInContent.forEach((icon) => icon.remove());
          htmlElement.innerHTML = tempDiv.innerHTML;
        }
      });

      // Remove contenteditable attributes from all elements (including non-editable)
      const allEditableElements = doc.querySelectorAll('[contenteditable]');
      allEditableElements.forEach((element) => {
        (element as HTMLElement).removeAttribute('contenteditable');
      });

      // Get the HTML after DOM cleanup
      let currentHtml = doc.documentElement.outerHTML;

      // Clean the HTML string to remove any remaining icon references
      // Remove edit-icon divs from HTML string (multiple patterns)
      currentHtml = currentHtml.replace(
        /<div[^>]*class\s*=\s*["']?[^"']*edit-icon[^"']*["']?[^>]*>[\s\S]*?<\/div>/gi,
        '',
      );
      currentHtml = currentHtml.replace(
        /<div[^>]*class\s*=\s*["']?edit-icon["']?[^>]*>[\s\S]*?<\/div>/gi,
        '',
      );

      // Remove any SVG elements that might be part of icons
      currentHtml = currentHtml.replace(
        /<svg[^>]*viewBox\s*=\s*["']0\s+0\s+24\s+24["'][^>]*>[\s\S]*?<\/svg>/gi,
        (match) => {
          // Only remove if it's likely an edit icon (has specific paths)
          if (match.includes('M12 20h9') || match.includes('M16.5 3.5')) {
            return '';
          }
          return match;
        },
      );

      // Remove any remaining edit-icon class references
      currentHtml = currentHtml.replace(
        /class\s*=\s*["']?edit-icon["']?/gi,
        '',
      );
      currentHtml = currentHtml.replace(
        /class\s*=\s*["']([^"']*)\s*edit-icon\s*([^"']*)["']/gi,
        (_match, before, after) => {
          const newClass = (before + ' ' + after).trim().replace(/\s+/g, ' ');
          return newClass ? `class="${newClass}"` : '';
        },
      );
      currentHtml = currentHtml.replace(
        /class\s*=\s*["']([^"']*)\s*edit-icon\s*([^"']*)["']/gi,
        (_match, before, after) => {
          const newClass = (before + ' ' + after).trim().replace(/\s+/g, ' ');
          return newClass ? `class="${newClass}"` : '';
        },
      );

      // Remove empty class attributes
      currentHtml = currentHtml.replace(/class\s*=\s*["']\s*["']/gi, '');
      currentHtml = currentHtml.replace(/class\s*=\s*["']\s*["']/gi, '');

      // Remove any style attributes that might contain icon-related styles
      // (This is more aggressive, but ensures clean HTML)
      currentHtml = currentHtml.replace(
        /style\s*=\s*["'][^"']*position\s*:\s*absolute[^"']*right\s*:\s*-12px[^"']*["']/gi,
        '',
      );

      // Final cleanup: remove any empty divs that might be left
      currentHtml = currentHtml.replace(/<div[^>]*>\s*<\/div>/gi, '');

      // Toggle edit mode without resetting (skipReset = true)
      await toggleEditMode(true);

      // Save the cleaned HTML
      try {
        await onSave(currentHtml);

        // Update originalHtmlRef to the saved HTML so reset will use the new saved version
        originalHtmlRef.current = currentHtml;

        setShowReset(false); // Reset the flag after saving

        // Reset StyleModal states after saving
        setSelectedElement(null);
        setCurrentStyles(null);
        setPreviewText('');
        setIsStyleModalOpen(false);

        // Navigate back after successful save
        // navigate(-1);
      } catch (error) {
        console.error('Error saving HTML:', error);
        // Don't navigate if save failed
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
      editIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="#22C55E" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
        `;
      editIcon.contentEditable = 'false';
      editIcon.style.cssText = `
        position: absolute;
        right: -12px;
        top: -12px;
        width: 24px;
        height: 24px;
        background: #BBF7D0;
        color: white;
        border-radius: 8px;
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
        &:hover {
          background: #2563EB;
          color: white;
        }
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        -webkit-touch-callout: none;
        -webkit-user-drag: none;
        -khtml-user-select: none;
      `;

      // Only add the icon, don't modify any element styles
      // The icon uses absolute positioning and will position relative to nearest positioned ancestor
      htmlElement.appendChild(editIcon);

      // Add selection event listeners to the element itself
      // htmlElement.addEventListener('mouseup', () => {
      //   if (isEditMode) {
      //     setTimeout(() => {
      //       handleTextSelection(doc);
      //     }, 10);
      //   }
      // });

      // htmlElement.addEventListener('keyup', () => {
      //   if (isEditMode) {
      //     setTimeout(() => {
      //       handleTextSelection(doc);
      //     }, 10);
      //   }
      // });

      // Add click event to edit icon
      editIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Temporarily hide icon to avoid detecting its blue background
        editIcon.style.display = 'none';

        // Small delay to ensure icon is hidden before reading styles
        setTimeout(() => {
          setSelectedElement(htmlElement);

          // Get current styles from the element in iframe
          const computedStyle = doc.defaultView?.getComputedStyle(htmlElement);
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

          // Don't restore icon display - keep it hidden when modal opens
          // The useEffect will handle showing/hiding icons based on modal state
          setIsStyleModalOpen(true);

          // Get HTML content to preserve formatting (bold, italic, etc.)
          let htmlContent = htmlElement?.innerHTML || '';
          // Remove edit icon from HTML if present
          htmlContent = htmlContent.replace(
            /<div[^>]*class="edit-icon"[^>]*>.*?<\/div>/gi,
            '',
          );
          htmlContent = htmlContent.replace(/✏️/g, '');

          // Also get plain text for fallback
          const plainText =
            htmlElement?.innerText.replace(/✏️/g, '').trim() || '';

          // Use HTML if it contains formatting tags, otherwise use plain text
          const contentToSet = /<[^>]+>/g.test(htmlContent)
            ? htmlContent
            : plainText;
          setPreviewText(contentToSet);
        }, 50); // Small delay to ensure icon is hidden before reading styles
      });

      // Add hover effects
      // editIcon.addEventListener('mouseenter', () => {
      //   editIcon.style.transform = 'scale(1.1)';
      //   editIcon.style.background = '#2563eb';
      // });

      // editIcon.addEventListener('mouseleave', () => {
      //   editIcon.style.transform = 'scale(1)';
      //   editIcon.style.background = '#3b82f6';
      // });

      // Prevent text selection on the icon
      // editIcon.addEventListener('mousedown', (e) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      // });

      // editIcon.addEventListener('selectstart', (e) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      // });

      // editIcon.addEventListener('dragstart', (e) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      // });

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

      // Add CSS to prevent outline/border/background changes on editable elements
      if (!doc.getElementById('editable-styles')) {
        const styleTag = doc.createElement('style');
        styleTag.id = 'editable-styles';
        styleTag.textContent = `
          .editable {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            background-color: inherit !important;
            background: inherit !important;
          }
          .editable:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            background-color: inherit !important;
            background: inherit !important;
          }
          .editable:hover {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            background-color: inherit !important;
            background: inherit !important;
          }
          .editable[contenteditable="true"] {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            background-color: inherit !important;
            background: inherit !important;
          }
          .editable[contenteditable="true"]:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            background-color: inherit !important;
            background: inherit !important;
          }
          .editable[contenteditable="true"]:hover {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            background-color: inherit !important;
            background: inherit !important;
          }
        `;
        doc.head.appendChild(styleTag);
      }

      if (editable && doc.body && isEditMode) {
        // Make only elements with 'editable' class editable
        const editableElements = doc.querySelectorAll('.editable');
        editableElements.forEach((element) => {
          // if (isEditMode) {
          // (element as HTMLElement).setAttribute('contenteditable', 'true');
          // } else {
          (element as HTMLElement).removeAttribute('contenteditable');
          // }
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
        // doc.addEventListener('input', () => {
        //   if (onChange) onChange(doc.documentElement.outerHTML);
        // });

        // Add event listener for text selection
        // doc.addEventListener('mouseup', () => {
        //   if (isEditMode) {
        //     setTimeout(() => {
        //       handleTextSelection(doc);
        //     }, 10);
        //   }
        // });

        // doc.addEventListener('keyup', () => {
        //   if (isEditMode) {
        //     setTimeout(() => {
        //       handleTextSelection(doc);
        //     }, 10);
        //   }
        // });

        // Also listen for selection change
        // doc.addEventListener('selectionchange', () => {
        //   if (isEditMode) {
        //     setTimeout(() => {
        //       handleTextSelection(doc);
        //     }, 10);
        //   }
        // });

        // Hide formatting toolbar when clicking outside
        // doc.addEventListener('click', (e) => {
        //   const target = e.target as HTMLElement;
        //   if (!target.closest('.text-formatting-toolbar')) {
        //     setShowTextFormatting(false);
        //     setSelectedText('');
        //   }
        // });
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

    // Handle edit mode changes when iframe is already loaded
    const handleEditModeChange = () => {
      if (!loadedRef.current) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      if (!isEditMode) {
        // Remove all icons and contenteditable when exiting edit mode
        const editableElements = doc.querySelectorAll('.editable');
        editableElements.forEach((element) => {
          (element as HTMLElement).removeAttribute('contenteditable');
        });
        const existingIcons = doc.querySelectorAll('.edit-icon');
        existingIcons.forEach((icon) => icon.remove());
      }
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      if (!loadedRef.current) {
        handleLoad();
      } else {
        // If already loaded, just handle edit mode changes
        handleEditModeChange();
      }
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

  // Dedicated useEffect to remove icons when exiting edit mode
  useEffect(() => {
    if (!iframeRef.current || isEditMode) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Remove all edit icons when not in edit mode
    const removeIcons = () => {
      const existingIcons = doc.querySelectorAll('.edit-icon');
      existingIcons.forEach((icon) => icon.remove());

      // Also remove contenteditable attributes
      const editableElements = doc.querySelectorAll('.editable');
      editableElements.forEach((element) => {
        (element as HTMLElement).removeAttribute('contenteditable');
      });
    };

    // Remove icons immediately
    removeIcons();

    // Also remove after a short delay to catch any icons added asynchronously
    setTimeout(removeIcons, 50);
    setTimeout(removeIcons, 200);
    setTimeout(removeIcons, 500);
  }, [isEditMode]);

  // Hide/show edit icons when modal opens/closes
  useEffect(() => {
    if (!iframeRef.current || !isEditMode) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Add or update style tag in iframe document
    let styleTag = doc.getElementById(
      'hide-edit-icons-style',
    ) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'hide-edit-icons-style';
      doc.head.appendChild(styleTag);
    }

    if (isStyleModalOpen) {
      // Add CSS rule to hide all edit icons
      styleTag.textContent = `
        .edit-icon {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
      `;
    } else {
      // Remove the style to show icons again
      styleTag.textContent = '';
    }

    // Also directly hide/show icons as backup
    const hideShowIcons = () => {
      const editIcons = doc.querySelectorAll('.edit-icon');
      editIcons.forEach((icon) => {
        const htmlIcon = icon as HTMLElement;
        if (isStyleModalOpen) {
          // Completely hide icons when modal is open
          htmlIcon.style.setProperty('display', 'none', 'important');
          htmlIcon.style.setProperty('visibility', 'hidden', 'important');
          htmlIcon.style.setProperty('opacity', '0', 'important');
          htmlIcon.style.setProperty('pointer-events', 'none', 'important');
          htmlIcon.style.setProperty('z-index', '-1', 'important');
        } else {
          // Show icons when modal is closed
          htmlIcon.style.removeProperty('display');
          htmlIcon.style.removeProperty('visibility');
          htmlIcon.style.removeProperty('opacity');
          htmlIcon.style.removeProperty('pointer-events');
          htmlIcon.style.removeProperty('z-index');
        }
      });
    };

    // Apply immediately
    hideShowIcons();

    // Also apply after a short delay to catch any icons added asynchronously
    if (isStyleModalOpen) {
      setTimeout(hideShowIcons, 50);
      setTimeout(hideShowIcons, 200);
      setTimeout(hideShowIcons, 500);
    }
  }, [isStyleModalOpen, isEditMode]);

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
  const updatePreviewText = (text: string) => {
    if (!selectedElement) return;

    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const editableElements = doc.querySelectorAll('.editable');
    let targetElement: HTMLElement | null = null;

    editableElements.forEach((element) => {
      if (element === selectedElement) {
        targetElement = element as HTMLElement;
      }
    });

    if (targetElement) {
      // Check if text contains HTML tags
      const hasHtml = /<[^>]+>/g.test(text);
      if (hasHtml) {
        (targetElement as HTMLElement).innerHTML = text;
      } else {
        (targetElement as HTMLElement).innerText = text;
      }

      if (onChange) {
        onChange(doc.documentElement.outerHTML);
      }
      const tryAddIcons = () => {
        const editableElements = doc.querySelectorAll('.editable');
        if (editableElements.length > 0) {
          addEditIcons(doc);
        } else {
          // Retry after a short delay
          setTimeout(tryAddIcons, 200);
        }
      };
      setTimeout(tryAddIcons, 200);
    }
  };

  // Handle browser back/close with beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showReset) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showReset]);

  const handleBackClick = () => {
    if (showReset) {
      setShowExitConfirm(true);
      setPendingNavigation(() => () => {
        navigate(-1);
      });
    } else {
      navigate(-1);
    }
  };

  const handleConfirmExit = () => {
    setShowReset(false);
    setShowExitConfirm(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavigation(null);
    if (blocker.state === 'blocked') {
      blocker.reset?.();
    }
  };

  const handleReset = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    setShowReset(false);

    // Reset StyleModal states
    setSelectedElement(null);
    setCurrentStyles(null);
    setPreviewText('');
    setIsStyleModalOpen(false);

    doc.open();
    doc.write(originalHtmlRef.current);
    doc.close();

    // Make only elements with 'editable' class editable
    const editableElements = doc.querySelectorAll('.editable');
    editableElements.forEach((element) => {
      (element as HTMLElement).removeAttribute('contenteditable');
    });

    // Reset icons added state and remove existing icons
    setIconsAdded(false);
    const existingIcons = doc.querySelectorAll('.edit-icon');
    existingIcons.forEach((icon) => icon.remove());

    // If still in edit mode, re-add edit icons after reset
    if (isEditMode && editable) {
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

      // Multiple fallback attempts to ensure icons are added
      setTimeout(() => addEditIcons(doc), 100);
      setTimeout(() => addEditIcons(doc), 500);
      setTimeout(() => addEditIcons(doc), 1000);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2 absolute top-2 left-0 w-full justify-between items-center px-4">
        {editable && (
          <>
            <ButtonSecondary
              onClick={handleBackClick}
              size="small"
              ClassName="bg-gray-200 !text-Primary-DeepTeal hover:bg-gray-300"
            >
              <img className="w-4 h-4" src="/icons/arrow-back.svg" alt="back" />
              Back
            </ButtonSecondary>
            <div className="flex gap-2">
              <ButtonSecondary
                onClick={() => {
                  toggleEditMode(false);
                }}
                ClassName={`${isEditMode ? 'bg-gray-200 !text-Primary-DeepTeal hover:bg-gray-300' : 'bg-[#2563EB] text-white hover:bg-[#3B82F6]'}`}
              >
                <Edit size={16} />
                {isEditMode ? ' Exit Editing' : ' Edit'}
              </ButtonSecondary>
              {showReset && isEditMode && (
                <ButtonSecondary
                  onClick={handleReset}
                  ClassName="bg-red-500 text-white hover:bg-red-600"
                >
                  <RotateCcw size={16} /> Reset
                </ButtonSecondary>
              )}
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
        lastHtml={html}
        onClose={() => setIsStyleModalOpen(false)}
        onApplyStyle={applyStyles}
        currentStyles={currentStyles || undefined}
        selectedText={previewText || ''}
        onUpdatePreviewText={updatePreviewText}
        setShowReset={() => setShowReset(true)}
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

      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        heading="Unsaved Changes"
        message="You have unsaved changes that will be lost if you leave this page. Are you sure you want to exit?"
        confirmText="Yes, Exit"
        cancelText="Cancel"
      />
    </div>
  );
}
