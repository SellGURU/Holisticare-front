/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useState } from 'react';
import MainModal from '../../Components/MainModal';
import Application from '../../api/app'; // مسیر درستشو بزن
import { SelectBoxField, TextField } from '../../Components/UnitComponents';
import SpinnerLoader from '../../Components/SpinnerLoader';
import { toast } from 'react-toastify';
// import Select from "../../Components/Select";

type AddPlayGroundProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmited: () => void;
};

type FieldSchema = {
  field_name: string;
  type: 'string' | 'list';
  options?: string[];
};

const AddPlayGround: FC<AddPlayGroundProps> = ({
  isOpen,
  onClose,
  onSubmited,
}) => {
  const [schema, setSchema] = useState<FieldSchema[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadingCall, setLoadingCall] = useState(false);
  const [variables, setVariables] = useState<any[]>([]);
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Application.getInputPlayGround()
        .then((res) => {
          setSchema(res.data);

          // مقادیر اولیه برای فرم
          const initialValues = res.data.reduce(
            (acc: Record<string, any>, field: FieldSchema) => {
              acc[field.field_name] = field.type === 'list' ? [] : '';
              return acc;
            },
            {},
          );
          setFormValues(initialValues);
        })
        .finally(() => setLoading(false));
      Application.getInputPlayGroundVariables()
        .then((res) => {
          setVariables(res.data.map((item: any) => item.name));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setLoadingCall(true);
    Application.setPlaygroundList(formValues)
      .then(() => {
        setLoadingCall(false);
        onSubmited();
        onClose();
      })
      .catch(() => {
        toast.error('invalid form');
        setLoadingCall(false);
      });
  };

  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div className="w-[450px] relative min-h-[450px] bg-white rounded-2xl p-6 flex flex-col">
        <h2 className="text-[14px] font-medium text-Text-Primary">
          Add Playground
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 hidden-scrollbar flex-1 overflow-y-auto"
          >
            {schema.map((field) => (
              <div key={field.field_name} className="space-y-1">
                {field.type === 'string' && (
                  <TextField
                    label={field.field_name}
                    placeholder={field.field_name}
                    value={formValues[field.field_name] || ''}
                    isValid={true}
                    validationText={''}
                    onChange={(e) =>
                      handleChange(field.field_name, e.target.value)
                    }
                  ></TextField>
                  //   <input
                  //     type="text"
                  //     className="w-full border rounded-md p-2"
                  //     value={formValues[field.field_name] || ""}
                  //     onChange={(e) => handleChange(field.field_name, e.target.value)}
                  //   />
                )}

                {/* type list با options → select */}
                {field.type === 'list' && (
                  <SelectBoxField
                    label={field.field_name}
                    options={field.options ? field.options : variables}
                    value={formValues[field.field_name] || ''}
                    onChange={(e) => handleChange(field.field_name, e)}
                    placeholder={field.field_name}
                  ></SelectBoxField>
                )}
              </div>
            ))}

            <div className="flex absolute right-6 bottom-4 justify-end gap-2 pt-4">
              <div
                onClick={() => {
                  handleSubmit();
                }}
                className={`text-Primary-DeepTeal text-[14px] cursor-pointer font-medium`}
              >
                {!loadingCall ? <>save</> : <SpinnerLoader color="#005F73" />}
              </div>
            </div>
          </form>
        )}
      </div>
    </MainModal>
  );
};

export default AddPlayGround;
