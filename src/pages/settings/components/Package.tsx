/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext } from 'react';
import { MainModal } from '../../../Components';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Toggle from '../../../Components/Toggle';
import packagesData from './packagesMoch.json';
import { AppContext } from '../../../store/app';

const PackagePage = () => {
  const context = useContext(AppContext);
  const [showManagePackage, setShowManagePackage] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Monthly');
  const resolvePackageButtonName = (el: any) => {
    if (
      context.PackageManager.curentPackage.type == el.name &&
      el.name == 'Free'
    ) {
      return 'Purchase';
    }
    if (context.PackageManager.curentPackage.type == el.name) {
      return 'Cancel';
    }
    if (context.PackageManager.curentPackage?.access > el.access) {
      return 'Downgrade';
    }
    return 'Upgrade';
  };
  return (
    <>
      <div className="bg-backgroundColor-Card p-4 w-full h-[240px] rounded-[16px]">
        <div className=" flex justify-between items-center">
          <div className="text-Text-Primary text-sm font-medium">
            Subscription
          </div>
          <div className="text-Text-Secondary text-[10px]">
            Last update: {context.PackageManager.lastUpdate}
          </div>
        </div>

        <div className="grid grid-cols-2 w-full mt-8">
          <div className="border-r border-Boarder pr-[53px]">
            <div className="text-[12px] text-Text-Primary">Current Plan</div>
            <div className="text-[12px] text-justify min-h-[36px] text-Text-Secondary mt-2">
              {context.PackageManager.curentPackage.getDescription()}
            </div>
            <div
              style={{
                background:
                  'linear-gradient(to right, #005F73 25%, #6CC24A 100%)',
              }}
              className="w-full flex justify-center items-center mt-2 overflow-hidden relative h-[72px] rounded-[20px] "
            >
              <img
                className="absolute inset-0 w-full"
                src="/images/billingBg.svg"
                alt=""
              />
              <div className="text-[20px] text-white">
                <div className="text-center">
                  {context.PackageManager.curentPackage.type}
                </div>
                <div className="text-[10px] text-center">
                  Exp Date: {context.PackageManager.curentPackage.expiredDate}
                </div>
              </div>
            </div>
          </div>

          <div className=" pl-[53px]">
            <div className="text-[12px] text-Text-Primary">
              Manage Subscription{' '}
            </div>
            <div className="text-[12px] text-Text-Secondary text-justify mt-7">
              Time to upgrade! Your free plan will expire in 3 days. To access
              more features, please upgrade through Stripe.
            </div>
            <div className="w-full mt-7 flex items-center">
              {context.PackageManager.curentPackage.type != 'Free' && (
                <>
                  <div className="text-Text-Secondary w-[50%] text-center  text-[12px] font-medium">
                    <div className="cursor-pointer">Cancel Subscription</div>
                  </div>
                </>
              )}
              <ButtonSecondary
                onClick={() => {
                  setShowManagePackage(true);
                }}
                ClassName="rounded-full flex-grow"
              >
                Manage Your Subscription
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-backgroundColor-Card mt-[27px] p-4 w-full  rounded-[16px]">
        <div className="text-Text-Primary text-sm font-medium">Packages</div>
        <div className="text-[10px] text-Text-Secondary opacity-[87%] mt-1">
          Explore our packages to support your wellness and achieve goals!
        </div>
        {/* table */}
      </div>

      <MainModal
        isOpen={showManagePackage}
        onClose={() => {
          setShowManagePackage(false);
        }}
      >
        <div className="bg-white w-[664px] h-[512px] rounded-[20px] p-4">
          <div className="flex justify-between items-center">
            <div className="text-Text-Primary font-medium">
              Manage Your Subscription
            </div>
            <img
              onClick={() => {
                setShowManagePackage(false);
              }}
              src="./icons/close.svg"
              className="cursor-pointer"
              alt=""
            />
          </div>

          <div className=" flex justify-center mt-5">
            <Toggle
              active={activeMenu}
              value={['Monthly', 'Annual']}
              setActive={(value) => {
                setActiveMenu(value);
              }}
            ></Toggle>
          </div>

          <div className="grid grid-cols-3 mt-4">
            {packagesData.map((el) => {
              return (
                <>
                  <div className=" w-[200px] relative rounded-[16px] p-4 h-[384px] overflow-hidden bg-backgroundColor-Card border border-gray-50">
                    <img
                      src="./images/Vector.svg"
                      className="absolute scale-110 top-[-4px] left-[0px]"
                      alt=""
                    />
                    <div className="relative z-10">
                      <div className="text-[14px] font-medium text-Text-Primary">
                        {el.name}
                      </div>
                      <div className="text-Text-Secondary text-[8px]">
                        Up to {el.clients} Clients
                      </div>
                      <div className="mt-8">
                        <div className="text-[12px] text-Text-Secondary font-medium">
                          {el.featuresText}:
                        </div>
                        <div className="mt-2  grid gap-1">
                          {el.features.map((fe) => {
                            return (
                              <>
                                <div className="flex items-center justify-start gap-1">
                                  <img src="./icons/tick-circle.svg" alt="" />
                                  <div className="text-[10px] text-Text-Secondary">
                                    {fe}
                                  </div>
                                </div>
                              </>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-0 px-4 w-full">
                      <div className="flex justify-center gap-1 text-Text-Primary items-center mb-1">
                        <div className="text-[20px] font-medium">
                          £{el.price}
                        </div>
                        <div className="text-[14px] font-medium">/month</div>
                      </div>
                      <ButtonSecondary
                        disabled={
                          el.name == 'Free' &&
                          context.PackageManager.curentPackage.type == 'Free'
                        }
                        onClick={() => {
                          context.PackageManager.changePackage(el.name as any);
                          setShowManagePackage(false);
                        }}
                        ClassName="rounded-full w-full"
                      >
                        {resolvePackageButtonName(el)}
                        {/* {el.name == 'Free' && context.PackageManager.curentPackage.type=='Free' ? 'Purchase' : 'Upgrade'} */}
                      </ButtonSecondary>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default PackagePage;
