import { ButtonSecondary } from "../../../Components/Button/ButtosSecondary";

const PackagePage = () => {
  return (
    <>
      <div className="bg-backgroundColor-Card p-4 w-full h-[240px] rounded-[16px]">
        <div className=" flex justify-between items-center">
          <div className="text-Text-Primary text-sm font-medium">Subscription</div>
          <div className="text-Text-Secondary text-[10px]">
            Last update: 2024/02/02
          </div>
        </div>

        <div className="grid grid-cols-2 w-full mt-8">
          <div className="border-r border-Boarder pr-[53px]">
            <div className="text-[12px] text-Text-Primary">Current Plan</div>
            <div className="text-[12px] text-Text-Secondary mt-2">
              You are currently on the free plan, which provides access to basic
              features and tools. For access to all features, you can upgrade.
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
                <div className="text-center">Free</div>
                <div className="text-[10px] text-center">
                  Exp Date: Jan 28, 2024
                </div>
              </div>
            </div>
          </div>

          <div className=" pl-[53px]">
            <div className="text-[12px] text-Text-Primary">Manage Subscription </div>
            <div className="text-[12px] text-Text-Secondary mt-7">
              Time to upgrade! Your free plan will expire in 3 days. To access more features, please upgrade through Stripe.
            </div>
            <div className="w-full mt-7">
              <ButtonSecondary ClassName="rounded-full w-full">
                Manage Your Subscription
              </ButtonSecondary>
            </div>
          </div>          
        </div>
      </div>
      <div className="bg-backgroundColor-Card mt-[27px] p-4 w-full  rounded-[16px]">
        <div className="text-Text-Primary text-sm font-medium">Packages</div>
        <div className="text-[10px] text-Text-Secondary opacity-[87%] mt-1">Explore our packages to support your wellness and achieve goals!</div>
        {/* table */}
      </div>
    </>
  );
};

export default PackagePage;
