const PackagePage = () => {
  return (
    <>
      <div className="bg-backgroundColor-Card p-4 w-full h-[240px] rounded-[16px]">
        <div className=" flex justify-between items-center">
          <div className="text-Text-Primary text-sm font-medium">Packages</div>
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
        </div>
      </div>
    </>
  );
};

export default PackagePage;
