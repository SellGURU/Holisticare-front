import { useEffect, useRef, useState } from 'react';

interface ExpandableTextProps {
  text: string;
  lines?: number; // how many lines when collapsed
  className?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  lines = 2,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const calculate = () => {
      const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);

      const maxHeight = lineHeight * lines;
      const fullHeight = el.scrollHeight;

      setCollapsedHeight(maxHeight);
      setCanExpand(fullHeight > maxHeight + 4);
    };

    calculate();

    const observer = new ResizeObserver(calculate);
    observer.observe(el);

    return () => observer.disconnect();
  }, [text, lines]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          maxHeight: expanded ? 'none' : (collapsedHeight ?? 'none'),
          overflow: expanded ? 'visible' : 'hidden',
        }}
        className={`transition-all text-justify duration-300 ease-in-out ${className}`}
      >
        {text}
      </div>

      {canExpand && (
        <span
          onClick={() => setExpanded((p) => !p)}
          className="mt-1 inline-block cursor-pointer text-Primary-DeepTeal underline font-medium text-xs"
        >
          {expanded ? 'See less' : 'See more'}
        </span>
      )}
    </div>
  );
};

export default ExpandableText;
