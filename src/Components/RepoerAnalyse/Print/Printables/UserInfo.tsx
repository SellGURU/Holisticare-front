/* eslint-disable @typescript-eslint/no-explicit-any */
interface UserInfoProps {
    usrInfoData:any
}
const UserInfo:React.FC<UserInfoProps> = ({usrInfoData}) => {
  return (
    <>
        <div
            className="flex justify-start relative   items-center mt-4 gap-3"
            style={{ zIndex: 60 }}
        >
            <div
            style={{ fontSize: '14px', color: '#383838', fontWeight: 500 }}
            >
            {usrInfoData?.name}
            </div>
            <div className="flex justify-center items-center gap-1">
            <div
                className=""
                style={{ fontSize: '14px', color: '#888888' }}
            >
                <div>Gender: {usrInfoData?.sex} </div>
            </div>
            <div
                className=""
                style={{
                width: '1px',
                height: '12px',
                backgroundColor: '#B0B0B0',
                }}
            ></div>
            <div
                className=""
                style={{ fontSize: '14px', color: '#888888' }}
            >
                <div>Age: {usrInfoData?.age}</div>
            </div>
            </div>
        </div>    
    </>
  );
};

export default UserInfo;