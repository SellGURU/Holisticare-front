/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import TextField from '../TextField';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import { Tooltip } from 'react-tooltip';
import Application from '../../api/app';
import SpinnerLoader from '../SpinnerLoader';
import { toast } from 'react-toastify';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [btnLoading, setbtnLoading] = useState(false);
  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({ current: '', new: '', confirm: '' });
  };
  console.log(errors);

  const validate = () => {
    let valid = true;
    const newErr = { current: '', new: '', confirm: '' };

    if (!currentPassword) {
      newErr.current = 'Current password is required.';
      valid = false;
    }

    if (!newPassword) {
      newErr.new = 'New password is required.';
      valid = false;
    } else if (newPassword.length < 8) {
      newErr.new = 'Password must be at least 8 characters.';
      valid = false;
    }

    if (confirmPassword !== newPassword) {
      newErr.confirm = 'Passwords do not match.';
      valid = false;
    }

    setErrors(newErr);
    return valid;
  };

  const handleUpdatePassword = async () => {
    if (!validate()) return;
    setbtnLoading(true);
    setErrors({ current: '', new: '', confirm: '' });

    try {
      await Application.verifyPassword({
        current_password: currentPassword,
      });
    } catch (err: any) {
         setbtnLoading(false);
      const apiError = err?.detail;
      if (typeof apiError === 'string') {
        setErrors((prev) => ({
          ...prev,
          current: apiError,
        }));
        return;
      }

      return;
    }

    try {
      await Application.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setbtnLoading(false);
      resetForm(); // all good, clear the form
      toast.success("Password changed successfully.")
    } catch (err: any) {
      const apiError = err?.detail;
      console.log(err);
      setbtnLoading(false);
      // Case A: simple string error
      if (typeof apiError === 'string') {
        if (apiError.includes('incorrect')) {
          // Same message as verify API

          setErrors((prev) => ({
            ...prev,
            current: apiError,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            new: apiError,
          }));
        }
        return;
      }

      if (typeof apiError === 'object') {
        const combined =
          (apiError.message || '') +
          (apiError.details ? ` — ${apiError.details}` : '');

        setErrors((prev) => ({
          ...prev,
          new: combined || 'Invalid password format.',
        }));

        return;
      }

      console.error(err);
    }
  };

  const isFormReady = useMemo(() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return false;
    }
    return true;
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <div className="bg-backgroundColor-Card h-fit min-h-[348px] border border-Gray-50 w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary ">
      <div className="text-sm font-medium ">Change Password</div>
      <div className="text-[10px] text-[#888888] my-4">
        Set a new password. It must be strong to ensure your security.
      </div>

      <div className="w-full flex justify-between gap-4">
        {/* CURRENT PASSWORD */}
        <div className="flex flex-col gap-2 text-xs font-medium w-full">
          Current Password
          <TextField
            placeholder="Enter current password"
            newStyle
            type="password"
            value={currentPassword}
            onChange={(e: any) => {
              setCurrentPassword(e.target.value);
              if (errors.current) setErrors({ ...errors, current: '' });
            }}
            inValid={!!errors.current}
            errorMessage={errors.current}
          />
        </div>

        {/* NEW PASSWORD */}
        <div className="flex flex-col gap-2 text-xs font-medium w-full">
          <div className="flex items-start gap-[2px]">
            New Password
            <img
              data-tooltip-id="new-password"
              src="/icons/info-circle.svg"
              alt=""
            />
            <Tooltip id="new-password">
              <ul className="list-disc text-[10px] w-full text-wrap ml-4 text-[#888888]">
                <li>
                  At least 8 characters (Use uppercase & lowercase letters,
                  numbers and special characters)
                </li>
                <li>Avoid using personal information or patterns.</li>
              </ul>
            </Tooltip>
          </div>

          <TextField
            placeholder="Enter new password"
            newStyle
            type="password"
            value={newPassword}
            onChange={(e: any) => {
              setNewPassword(e.target.value);
              if (errors.new) setErrors({ ...errors, new: '' });
            }}
            inValid={!!errors.new}
            errorMessage={errors.new}
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="flex flex-col gap-2 text-xs font-medium w-full">
          Re-enter new password
          <TextField
            placeholder="Re-enter new password"
            newStyle
            type="password"
            value={confirmPassword}
            onChange={(e: any) => {
              setConfirmPassword(e.target.value);
              if (errors.confirm) setErrors({ ...errors, confirm: '' });
            }}
            inValid={!!errors.confirm}
            errorMessage={errors.confirm}
          />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-4">
        <div
          className={`font-medium text-sm ${
            !isFormReady
              ? 'text-[#c5c5c5] cursor-not-allowed'
              : 'text-[#005F73] cursor-pointer'
          }`}
          onClick={() => (isFormReady ? resetForm() : null)}
        >
          Discard Changes
        </div>

        <ButtonPrimary ClassName='min-w-[150px]' disabled={!isFormReady || btnLoading} onClick={handleUpdatePassword}>
          {btnLoading ? <SpinnerLoader></SpinnerLoader> : <> Update Password</>}
        </ButtonPrimary>
      </div>
    </div>
  );
};
