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
      <div className="flex  max-w-[680px] overflow-x-auto pb-1 gap-1 text-Text-Primary text-xs ">
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
                }  min-w-[105px] w-[105px] h-[20px] flex items-center  justify-center cursor-pointer border border-Gray-50 rounded-[16px]   `}
              >
                {menu.name.length > 12
                  ? menu.name.substring(0, 12) + ' ...'
                  : menu.name}
                {menu.value && (
                  <div
                    className={`rounded-[16px]  w-4 h-4 text-[9px]  flex justify-center items-center ml-1 ${
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
