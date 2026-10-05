export function ChatDateSeparator({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="flex items-center gap-2 my-3 px-1"
    >
      <span className="flex-1 h-px bg-Gray-50" />
      <span className="text-[10px] font-medium text-Text-Quadruple uppercase tracking-wide">
        {label}
      </span>
      <span className="flex-1 h-px bg-Gray-50" />
    </div>
  );
}
