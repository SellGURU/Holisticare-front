import { useEffect, useRef, useState } from 'react';

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
        doc.body.contentEditable = 'true';
        doc.designMode = 'on';

        doc.body.addEventListener('input', () => {
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
  }, [html, editable, onChange]);

  const handleReset = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(originalHtml);
    doc.close();

    if (editable && doc.body) {
      doc.body.contentEditable = 'true';
      doc.designMode = 'on';
    }
  };

  return (
    <div className={`w-full h-full flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2 absolute top-0 left-0">
        {editable && (
          <button
            onClick={handleReset}
            className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex-1 border rounded overflow-hidden shadow">
        <iframe
          ref={iframeRef}
          title="HTML Editor"
          className="w-full h-screen"
          sandbox={sandbox}
        />
      </div>
    </div>
  );
}
