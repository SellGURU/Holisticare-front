import ReactJson from 'react-json-view';

const EditModal = () => {
  return (
    <>
      <div className=" w-[644px] p-4 max-w-[644px] relative bg-white min-h-[400px] h-[60%] rounded-[16px]">
        <div className="">
          <div className=" text-Text-Primary TextStyle-Headline-5">Edit</div>
          <div className="w-full h-1 border-b-2 mt-2 border-gray-50"></div>
        </div>

        <div className="h-[300px] overflow-y-auto">
          <ReactJson
            displayDataTypes={false} // hides data type labels
            enableClipboard={false} // disables clipboard icon
            displayObjectSize={false} // hides size info (e.g. "3 items")
            collapsed={false}
            src={{
              unit: 'ratio',
              Category: 'Cardiovascular Health',
              Biomarker: 'LDL/HDL Ratio',
              Definition:
                'The LDL to HDL Cholesterol (LDL/HDL) ratio is a marker for cardiovascular health. A lower ratio is desirable as it indicates a healthier lipid profile.',
              age_groups: [
                {
                  gender: 'male',
                  status: {
                    Good: {
                      condition: 'between',
                      threshold: [3.1, 4.0],
                    },
                    Excellent: {
                      condition: 'between',
                      threshold: [0, 3.0],
                    },
                    'Needs Focus': {
                      condition: 'between',
                      threshold: [4.1, 20],
                    },
                  },
                  max_age: 100,
                  min_age: 18,
                },
                {
                  gender: 'female',
                  status: {
                    Good: {
                      condition: 'between',
                      threshold: [3.1, 4.0],
                    },
                    Excellent: {
                      condition: 'between',
                      threshold: [0, 3.0],
                    },
                    'Needs Focus': {
                      condition: 'between',
                      threshold: [4.1, 20],
                    },
                  },
                  max_age: 100,
                  min_age: 18,
                },
              ],
              'Benchmark areas': 'Cardiovascular Risk',
              label_mapping_chart: {
                Good: 'Borderline High',
                Excellent: 'Normal',
                'Needs Focus': 'High',
              },
            }}
            onEdit={(e) => console.log(e.updated_src)}
            onAdd={(e) => console.log(e.updated_src)}
            onDelete={(e) => console.log(e.updated_src)}
          />
        </div>

        <div className=" w-full flex justify-end gap-4 items-center absolute bottom-4 right-4 ">
          <div className="TextStyle-Headline-5 cursor-pointer text-Disable">
            Cancel
          </div>
          <div className="TextStyle-Headline-5 cursor-pointer text-Primary-DeepTeal">
            Save
          </div>
        </div>
      </div>
    </>
  );
};

export default EditModal;
