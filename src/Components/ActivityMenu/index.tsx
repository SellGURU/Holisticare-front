// type MenuNames = 'Vital' | 'Blood Test' | 'Activity' | 'Client Profile' | "Weekly report"
type menuItem = {
  name: string;
  value?: number;
};
interface ActivityMenuProps {
  onChangeMenuAction: (activeMenu: string) => void;
  activeMenu: string;
  menus: menuItem[];
}
// import { Tooltip } from "react-tooltip";

const ActivityMenu: React.FC<ActivityMenuProps> = ({
  onChangeMenuAction,
  activeMenu,
  menus,
}) => {
  return (
    <>
      <div className="flex  max-w-[680px] overflow-x-auto pb-1 gap-1 bg-backgroundColor-Main px-2 py-1 rounded-[24px] border border-Gray-50 text-Text-Primary text-[8px] sm:text-[10px] md:text-xs justify-between ">
        {menus.map((menu) => {
          return (
            <>
              <div
                onClick={() => {
                  onChangeMenuAction(menu.name);
                }}
                data-tooltip-id="status"
                data-tooltip-content={menu.name}
                className={` ${
                  activeMenu === menu.name
                    ? 'bg-Primary-DeepTeal text-white '
                    : 'bg-Secondary-SelverGray'
                }  md:min-w-[105px] w-full md:w-[105px] h-[32px] md:h-[20px] flex items-center  justify-center cursor-pointer border border-Gray-50 rounded-[16px]    `}
              >
                {menu.name.length > 14
                  ? menu.name.substring(0, 14) + ' ...'
                  : menu.name}
                {menu.value && (
                  <div
                    className={`rounded-[16px]  w-4 h-4 text-[6px] sm:text-[7px]  md:text-[9px]  flex justify-center items-center ml-1 ${
                      activeMenu === menu.name
                        ? 'dark:bg-black-primary'
                        : 'dark:bg-main-border'
                    }`}
                  >
                    {menu.value}
                  </div>
                )}
                {/* <Tooltip id="status" /> */}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default ActivityMenu;
