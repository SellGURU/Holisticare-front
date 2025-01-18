// import {useRef} from 'react';
// import { Button } from 'symphony-ui';
// import useModalAutoClose from '@/hooks/UseModalAutoClose';
// type ConfirmModalProps = {
//   onConfirm: () => void;
//   onCancel: () => void;
// };

// const ConfirmModal: React.FC<ConfirmModalProps> = ({ onConfirm, onCancel }) => {
//     const showModalRefrence = useRef(null);

//     useModalAutoClose({
//         refrence: showModalRefrence,

//         close: () => {
//          onCancel()
//         },
//       });
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-70 z-[99] flex items-center justify-center">
//       <div ref={showModalRefrence} className="bg-black-primary p-6 rounded-lg shadow-lg">
//         <h3 className="text-base font-medium text-primary-text text-center mb-4">Confirm Delete</h3>
//         <p className='text-sm font-normal text-secondary-text text-justify'>Are you sure you want to delete this card?</p>
//         <div className="flex justify-center gap-2 mt-4">
//             <Button theme='Aurora-pro' onClick={onCancel} >Cancel</Button>
//             <Button onClick={onConfirm} theme='Aurora'>Delete</Button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConfirmModal;
