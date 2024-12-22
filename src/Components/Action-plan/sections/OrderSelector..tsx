import React from "react";

interface OrderSelectorProps {
  order: string;
  setOrder: React.Dispatch<React.SetStateAction<string>>;
}

const OrderSelector: React.FC<OrderSelectorProps> = ({ order, setOrder }) => {
  return (
    <div className="w-[270px] h-8 rounded-md border border-brand-primary-color flex items-center px-3 justify-between">
      <div
        onClick={() => setOrder("Manual Order")}
        className={`flex items-center gap-2 text-[10px] cursor-pointer ${
          order === "Manual Order" ? "text-brand-primary-color" : "text-primary-text"
        } `}
      >
        <img src="./Themes/Aurora/icons/edit4.svg" alt="Edit" />
        Manual Order
      </div>
      <div
        onClick={() => setOrder("Original Order")}
        className={`flex items-center gap-2 text-[10px] cursor-pointer ${
          order === "Original Order" ? "text-brand-primary-color" : "text-primary-text"
        } `}
      >
        <img src="./Themes/Aurora/icons/task-square.svg" alt="Task" />
        Original Order
      </div>
      <div className="w-px h-4 bg-brand-primary-color" />
      <img src="/public/Themes/Aurora/icons/tick-circle.svg" alt="Tick" />
    </div>
  );
};

export default OrderSelector;