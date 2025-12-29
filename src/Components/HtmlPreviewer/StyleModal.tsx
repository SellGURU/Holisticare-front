import { useState, useEffect, useRef } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from 'lucide-react';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (styles: ElementStyles) => void;
  currentStyles?: ElementStyles;
  selectedText: string;
  onUpdatePreviewText: (text: string) => void;
  setShowReset: () => void;
  lastHtml: string;
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
  lastHtml,
}: StyleModalProps) {
  console.log('lastHtml', lastHtml);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [styles, setStyles] = useState<ElementStyles>(currentStyles);
  const [, setPreviewText] = useState(selectedText);
  const [previewHtml, setPreviewHtml] = useState(selectedText);
  const [fontSizeInput, setFontSizeInput] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);
  const originalTextRef = useRef<string>(selectedText);
  const originalHtmlRef = useRef<string>(selectedText);

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

    // Store original text and HTML when selectedText changes
    originalTextRef.current = selectedText;
    originalHtmlRef.current = hasHtml ? selectedText : selectedText || '';

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
      setFontSizeInput(parseInt(currentStyles.fontSize).toString());
    }
  }, [currentStyles]);

  // Update fontSizeInput when styles.fontSize changes
  useEffect(() => {
    setFontSizeInput(parseInt(styles.fontSize).toString());
  }, [styles.fontSize]);

  // Initialize editor content when modal opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      // Always set content when modal opens to ensure HTML is preserved
      const hasHtml = /<[^>]+>/g.test(selectedText);
      const htmlContent = hasHtml ? selectedText : selectedText || '';

      // Store original HTML when modal opens
      originalHtmlRef.current = htmlContent;
      originalTextRef.current = selectedText;

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

  // Update iframe with live preview - only show the selected element
  useEffect(() => {
    if (!iframeRef.current || !isOpen || !lastHtml) return;

    const iframe = iframeRef.current;
    let timeoutId: NodeJS.Timeout;

    const updatePreview = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Clean the original content for comparison
      const originalContent = originalHtmlRef.current
        .replace(/<div[^>]*class="edit-icon"[^>]*>.*?<\/div>/gi, '')
        .replace(/✏️/g, '')
        .trim();
      const originalText = originalTextRef.current.trim();

      // Create a temporary iframe to get computed styles
      const tempIframe = document.createElement('iframe');
      tempIframe.style.position = 'absolute';
      tempIframe.style.left = '-9999px';
      tempIframe.style.width = '1px';
      tempIframe.style.height = '1px';
      document.body.appendChild(tempIframe);

      const tempIframeDoc =
        tempIframe.contentDocument || tempIframe.contentWindow?.document;
      if (!tempIframeDoc) {
        document.body.removeChild(tempIframe);
        return;
      }

      tempIframeDoc.open();
      tempIframeDoc.write(lastHtml);
      tempIframeDoc.close();

      // Wait for styles to load
      setTimeout(() => {
        try {
          // Find all editable elements in the temp iframe
          const editableElements = tempIframeDoc.querySelectorAll('.editable');
          let targetElement: HTMLElement | null = null;

          // Find the element that matches the original content
          for (const element of Array.from(editableElements)) {
            const htmlElement = element as HTMLElement;
            const cleanInnerHTML = htmlElement.innerHTML
              .replace(/<div[^>]*class="edit-icon"[^>]*>.*?<\/div>/gi, '')
              .replace(/✏️/g, '')
              .trim();
            const cleanInnerText = htmlElement.innerText
              .replace(/✏️/g, '')
              .trim();

            if (
              cleanInnerHTML === originalContent ||
              cleanInnerText === originalText ||
              (originalContent && cleanInnerHTML.includes(originalContent)) ||
              (originalText && cleanInnerText.includes(originalText))
            ) {
              targetElement = htmlElement;
              break;
            }
          }

          // If not found, use the first editable element
          if (!targetElement && editableElements.length > 0) {
            targetElement = editableElements[0] as HTMLElement;
          }

          let containerElement: HTMLElement | null = null;

          if (targetElement) {
            // Find the parent container that has border or shadow using computed styles
            let parent = targetElement.parentElement;
            const containerTags = [
              'section',
              'div',
              'article',
              'aside',
              'main',
              'header',
              'footer',
              'nav',
            ];

            while (
              parent &&
              parent !== tempIframeDoc.body &&
              parent !== tempIframeDoc.documentElement
            ) {
              if (containerTags.includes(parent.tagName.toLowerCase())) {
                const computedStyle =
                  tempIframeDoc.defaultView?.getComputedStyle(
                    parent as HTMLElement,
                  );

                if (computedStyle) {
                  const border =
                    computedStyle.border || computedStyle.borderWidth;
                  const boxShadow = computedStyle.boxShadow;
                  const borderWidth = computedStyle.borderWidth;

                  // Check if element has border or shadow
                  const hasBorder =
                    (border &&
                      border !== 'none' &&
                      border !== '0px' &&
                      border !== 'medium none') ||
                    (borderWidth &&
                      borderWidth !== '0px' &&
                      parseFloat(borderWidth) > 0);

                  const hasShadow =
                    boxShadow &&
                    boxShadow !== 'none' &&
                    boxShadow !== 'rgba(0, 0, 0, 0)';

                  if (hasBorder || hasShadow) {
                    containerElement = parent as HTMLElement;
                    break;
                  }
                }
              }
              parent = parent.parentElement;
            }

            // If no container found with border/shadow, use the direct parent
            if (
              !containerElement &&
              targetElement.parentElement &&
              targetElement.parentElement !== tempIframeDoc.body
            ) {
              containerElement = targetElement.parentElement as HTMLElement;
            }
          }

          // Get the container HTML
          const elementToShow = containerElement || targetElement;
          if (!elementToShow) {
            document.body.removeChild(tempIframe);
            return;
          }

          // Clone the element
          const clonedElement = elementToShow.cloneNode(true) as HTMLElement;

          // Find the editable element inside the cloned element and update it
          const clonedEditable = clonedElement.querySelector(
            '.editable',
          ) as HTMLElement;
          if (clonedEditable) {
            const hasHtml = /<[^>]+>/g.test(previewHtml);
            if (hasHtml) {
              clonedEditable.innerHTML = previewHtml;
            } else {
              clonedEditable.textContent = previewHtml;
            }

            // Apply current styles to the editable element
            clonedEditable.style.fontWeight = styles.fontWeight;
            clonedEditable.style.fontStyle = styles.fontStyle;
            clonedEditable.style.textDecoration = styles.textDecoration;
            clonedEditable.style.color = styles.color;
            clonedEditable.style.fontSize = styles.fontSize;
            clonedEditable.style.textAlign = styles.textAlign;

            // Remove edit icons if any
            const editIcons = clonedElement.querySelectorAll('.edit-icon');
            editIcons.forEach((icon) => icon.remove());
          }

          // Extract all styles and links from the temp iframe (which has loaded all CSS)
          const styleTags = tempIframeDoc.querySelectorAll('style');
          const linkTags = tempIframeDoc.querySelectorAll(
            'link[rel="stylesheet"]',
          );

          let extractedStyles = '';
          styleTags.forEach((style) => {
            extractedStyles += style.innerHTML + '\n';
          });

          let extractedLinks = '';
          linkTags.forEach((link) => {
            const href = link.getAttribute('href');
            const integrity = link.getAttribute('integrity');
            const crossorigin = link.getAttribute('crossorigin');
            const media = link.getAttribute('media');

            if (href) {
              // Convert relative URLs to absolute if needed
              let absoluteHref = href;
              if (href.startsWith('/')) {
                // If it's an absolute path, use it as is
                absoluteHref = href;
              } else if (
                !href.startsWith('http://') &&
                !href.startsWith('https://') &&
                !href.startsWith('//')
              ) {
                // Relative URL - try to make it absolute based on current location
                const baseUrl = window.location.origin;
                absoluteHref = new URL(href, baseUrl).href;
              }

              let linkTag = `<link rel="stylesheet" href="${absoluteHref}"`;
              if (integrity) linkTag += ` integrity="${integrity}"`;
              if (crossorigin) linkTag += ` crossorigin="${crossorigin}"`;
              if (media) linkTag += ` media="${media}"`;
              linkTag += `>\n`;

              extractedLinks += linkTag;
            }
          });

          // Also get any @import statements from style tags
          styleTags.forEach((style) => {
            const styleContent = style.innerHTML;
            const importMatches = styleContent.match(/@import[^;]+;/g);
            if (importMatches) {
              extractedStyles =
                importMatches.join('\n') + '\n' + extractedStyles;
            }
          });

          // Wait for CSS to load in temp iframe before creating preview
          const waitForCSS = () => {
            // Create HTML document with extracted styles
            const htmlContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  ${extractedLinks}
                  <style>
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }
                    body {
                      padding: 20px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                    }
                    .preview-container {
                      width: 100%;
                      max-width: 100%;
                    }
                    ${extractedStyles}
                  </style>
                </head>
                <body>
                  <div class="preview-container">
                    ${clonedElement.outerHTML}
                  </div>
                </body>
              </html>
            `;

            doc.open();
            doc.write(htmlContent);
            doc.close();

            // Wait a bit for styles to apply in the preview iframe
            setTimeout(() => {
              // Force a reflow to ensure styles are applied
              if (doc.body) {
                void doc.body.offsetHeight; // Force reflow
              }
            }, 100);
          };

          // If all links are already loaded, proceed immediately
          if (
            linkTags.length === 0 ||
            Array.from(linkTags).every((link) => {
              const sheet = (link as HTMLLinkElement).sheet;
              return sheet !== null;
            })
          ) {
            waitForCSS();
          } else {
            // Wait for stylesheets to load
            let loadedCount = 0;
            linkTags.forEach((link) => {
              const linkEl = link as HTMLLinkElement;
              if (linkEl.sheet) {
                loadedCount++;
                if (loadedCount === linkTags.length) {
                  waitForCSS();
                }
              } else {
                linkEl.addEventListener('load', () => {
                  loadedCount++;
                  if (loadedCount === linkTags.length) {
                    waitForCSS();
                  }
                });
                linkEl.addEventListener('error', () => {
                  loadedCount++;
                  if (loadedCount === linkTags.length) {
                    waitForCSS();
                  }
                });
              }
            });

            // Fallback timeout
            setTimeout(waitForCSS, 1000);
          }
        } catch (error) {
          console.error('Error updating preview:', error);
        } finally {
          // Clean up temporary iframe
          if (document.body.contains(tempIframe)) {
            document.body.removeChild(tempIframe);
          }
        }
      }, 200); // Wait a bit longer for styles to load
    };

    // Debounce updates to prevent lag
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updatePreview, 150);
    };

    // Initial load
    if (iframe.contentDocument?.readyState === 'complete') {
      debouncedUpdate();
    } else {
      iframe.addEventListener('load', debouncedUpdate, { once: true });
    }

    // Update on changes
    debouncedUpdate();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [previewHtml, styles, isOpen, lastHtml, selectedText]);

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

  // Check if HTML content has changed
  const hasTextChanged = previewHtml !== originalHtmlRef.current;

  const isResetButtonDisabled =
    currentStyles?.backgroundColor == styles?.backgroundColor &&
    currentStyles?.color == styles?.color &&
    currentStyles?.fontWeight == styles?.fontWeight &&
    currentStyles?.fontStyle == styles?.fontStyle &&
    currentStyles?.textDecoration == styles?.textDecoration &&
    currentStyles?.fontSize == styles?.fontSize &&
    currentStyles?.textAlign == styles?.textAlign &&
    !hasTextChanged; // Check if text/HTML has changed

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
        className={`bg-white rounded-l-lg w-[85%] h-full max-h-screen transform transition-transform duration-300 ease-in-out flex ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* html preview */}
        <div>
          <iframe
            sandbox="allow-scripts allow-same-origin"
            ref={iframeRef}
            className="w-[500px] h-full"
          />
        </div>
        {/* Preview Panel */}
        <div className="w-1/2 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Edit Text</h4>

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
        <div className="w-1/3 p-6 pt-4 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg font-semibold  text-gray-700">Edit Style</h3>
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

            {/* Font Weight & Style */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Style
              </label>
              <div className="flex gap-1 border border-gray-300 rounded p-1 bg-gray-50">
                <button
                  onClick={() =>
                    handleStyleChange(
                      'fontWeight',
                      styles.fontWeight === 'bold' ? 'normal' : 'bold',
                    )
                  }
                  className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                    styles.fontWeight === 'bold'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-200'
                  }`}
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() =>
                    handleStyleChange(
                      'fontStyle',
                      styles.fontStyle === 'italic' ? 'normal' : 'italic',
                    )
                  }
                  className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                    styles.fontStyle === 'italic'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-200'
                  }`}
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Color
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <input
                    type="color"
                    value={styles.color}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-10 h-8 border rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-8 h-8 border-2 border-gray-300 rounded"
                    style={{ backgroundColor: styles.color }}
                  />
                  <input
                    type="text"
                    value={styles.color}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        handleStyleChange('color', value);
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        handleStyleChange('color', '#000000');
                      }
                    }}
                    className="flex-1 px-2 py-1.5 border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Size
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={parseInt(styles.fontSize)}
                    onChange={(e) =>
                      handleStyleChange('fontSize', `${e.target.value}px`)
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <input
                      type="number"
                      min="8"
                      max="72"
                      value={fontSizeInput}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setFontSizeInput(inputValue);
                        const value = parseInt(inputValue);
                        if (!isNaN(value) && value >= 8 && value <= 72) {
                          handleStyleChange('fontSize', `${value}px`);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 8) {
                          handleStyleChange('fontSize', '8px');
                          setFontSizeInput('8');
                        } else if (value > 72) {
                          handleStyleChange('fontSize', '72px');
                          setFontSizeInput('72');
                        } else {
                          handleStyleChange('fontSize', `${value}px`);
                          setFontSizeInput(value.toString());
                        }
                      }}
                      className="w-16 px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">px</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {styles.fontSize}
                </div>
              </div>
            </div>

            {/* Text Align & Decoration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Alignment & Decoration
              </label>
              <div className="space-y-2">
                <div className="flex gap-1 border border-gray-300 rounded p-1 bg-gray-50">
                  <button
                    onClick={() => handleStyleChange('textAlign', 'left')}
                    className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                      styles.textAlign === 'left'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-200'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleStyleChange('textAlign', 'center')}
                    className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                      styles.textAlign === 'center'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-200'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() => handleStyleChange('textAlign', 'right')}
                    className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                      styles.textAlign === 'right'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-200'
                    }`}
                    title="Align Right"
                  >
                    <AlignRight size={16} />
                  </button>
                  <button
                    onClick={() => handleStyleChange('textAlign', 'justify')}
                    className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                      styles.textAlign === 'justify'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-200'
                    }`}
                    title="Justify"
                  >
                    <AlignJustify size={16} />
                  </button>
                </div>
                <div className="flex gap-1 border border-gray-300 rounded p-1 bg-gray-50">
                  <button
                    onClick={() =>
                      handleStyleChange(
                        'textDecoration',
                        styles.textDecoration === 'underline'
                          ? 'none'
                          : 'underline',
                      )
                    }
                    className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                      styles.textDecoration === 'underline'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-200'
                    }`}
                    title="Underline"
                  >
                    <Underline size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleStyleChange(
                        'textDecoration',
                        styles.textDecoration === 'line-through'
                          ? 'none'
                          : 'line-through',
                      )
                    }
                    className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
                      styles.textDecoration === 'line-through'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-200'
                    }`}
                    title="Strikethrough"
                  >
                    <Strikethrough size={16} />
                  </button>
                </div>
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
                  // Reset styles to original
                  setStyles(currentStyles || defaultStyles);

                  // Reset text to original
                  setPreviewText(originalTextRef.current);
                  setPreviewHtml(originalHtmlRef.current);

                  // Reset editor content to original HTML
                  if (editorRef.current) {
                    editorRef.current.innerHTML = originalHtmlRef.current;
                  }
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
