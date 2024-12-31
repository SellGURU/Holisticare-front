import { useEffect, useRef } from "react";
interface ReferenceItem {
  [key: string]: {
    content: string;
  };
}
interface ConfirmModalProps {
  reference: ReferenceItem[];
  isOpen: boolean;
  onClose: () => void;
}
const RefrenceModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  reference,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center  border   text-primary-text px-10 lg:px-0">
        <div
          ref={modalRef}
          className="bg-white border border-gray-50 shadow-500 z-50 dark:bg-black-secondary rounded p-4 w-full max-w-[1260px] max-h-[463px] overflow-y-scroll overflow-x-hidden relative"
        >
          <div className="flex w-full   justify-between text-sm font-medium ">
            Reference Documents{" "}
            <button onClick={onClose}>
              <img className="Aurora-icons-close"></img>
            </button>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {reference.map((ref, index) => (
              <div
                key={index}
                className="dark:bg-black-third rounded-md px-6 py-5"
              >
                {Object.entries(ref).map(([key, value]) => (
                  <>
                    <div className="border-b dark:border-main-border pb-2 w-full font-medium">
                      {key}
                    </div>
                    <div className="mt-6">{value.content}</div>
                  </>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RefrenceModal;
