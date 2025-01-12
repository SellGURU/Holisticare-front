import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Application from '../../../api/app';

export const ClientInfo = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    // const [error, setError] = useState<string | null>(null);
    // const [isLoading, setIsLoading] = useState<boolean>(true);

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            workOuts: "",
            Activity: "",
            expert: "",
            location: "",
        },
        onSubmit: () => {},
    });

    useEffect(() => {
        // setIsLoading(true);
        Application.getClientInfo({ member_id: id })
            .then((res) => {
                if (res.data && res.data.personal_info) {
                    const personalInfo = res.data.personal_info;
                    setData(personalInfo);
                    formik.setFieldValue("firstName", personalInfo["first_name"] || "");
                    formik.setFieldValue("lastName", personalInfo["last_name"] || "");
                    formik.setFieldValue("workOuts", personalInfo["total workouts"] || "");
                    formik.setFieldValue("Activity", personalInfo["total Cardio Activities"] || "");
                    formik.setFieldValue("expert", personalInfo["expert"] || "");
                    formik.setFieldValue("location", personalInfo["Location"] || "");
                } else {
                    throw new Error("Unexpected data format");
                }
            })
            .catch((err) => {
                console.error(err);
                // setError("Failed to fetch client data");
            })
            .finally(() => {
                // setIsLoading(false);
            });
    }, [id]);

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // if (error) {
    //     return <div className="text-red-500">{error}</div>;
    // }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[200px]">
                <img className="object-contain" src="/icons/document-text.svg" alt="" />
                <div className="text-[12px] text-[#383838]">No Data Found</div>
            </div>
        );
    }

    return (
        <div className="bg-backgroundColor-Card border rounded-md border-[#005F73] text-xs text-Text-Primary border-opacity-10 p-2 flex flex-col gap-5 pt-4">
            <div className="w-full flex justify-between items-center">
                <div className="text-Text-Secondary font-medium flex items-center gap-1">
                    <img src="/icons/workouts.svg" alt="" />
                    Total workouts
                </div>
                {data["total workouts"]}
            </div>
            <div className="w-full flex justify-between items-center">
                <div className="text-Text-Secondary font-medium flex items-center gap-1">
                    <img src="/icons/health.svg" alt="" />
                    Total Cardio Activities
                </div>
                {data["total Cardio Activities"]}
            </div>
            <div className="w-full flex justify-between items-center">
                <div className="text-Text-Secondary font-medium flex items-center gap-1">
                    <img src="/icons/frame.svg" alt="" />
                    Expert
                </div>
                {data["expert"]}
            </div>
            <div className="w-full flex justify-between items-center">
                <div className="text-Text-Secondary font-medium flex items-center gap-1">
                    <img src="/icons/location.svg" alt="" />
                    Location{" "}
                </div>
                {data["Location"]}
            </div>
            <div className="w-full flex justify-between items-center">
                <div className="text-Text-Secondary font-medium flex items-center gap-1">
                    <img src="/icons/sms.svg" alt="" />
                    Email{" "}
                </div>
                {data["email"]}
            </div>
            <div className="w-full flex justify-between items-center">
                <div className="text-Text-Secondary font-medium flex items-center gap-1">
                    <img src="/icons/call.svg" alt="" />
                    Phone
                </div>
                {data["phone number"]}
            </div>
        </div>
    );
};