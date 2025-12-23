import React from 'react';
import ReactMarkdown from 'react-markdown';

type MarkdownTextProps = {
  text: string;
  className?: string;
};

const MarkdownText: React.FC<MarkdownTextProps> = ({ text, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          strong: ({ children }) => (
            <strong className="font-semibold">
              {children}
            </strong>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownText;
