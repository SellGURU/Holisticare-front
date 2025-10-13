/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Application from '../../api/app';
import Auth from '../../api/auth';
import { useApp } from '../../hooks';
const AuthWithGoogle = ({ mode }: { mode: 'login' | 'register' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const appContext = useApp();
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );
        if (mode == 'login') {
          Login(userInfo.data);
        } else {
          Signup(userInfo.data);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    },
    onError: (error) => {
      console.log('Login Failed:', error);
    },
  });

  const Login = (data: any) => {
    Application.LoginWithGooglge(data)
      .then((res) => {
        appContext.login(res.data.access_token, res.data.permission);
        if (mode == 'login') {
          navigate('/');
        } else {
          navigate('/register-profile');
        }
      })
      .catch((err) => {
        setMessage(err.detail);
        setIsOpen(true);
      });
  };

  const Signup = (data: any) => {
    Auth.signup(undefined, undefined, undefined, data)
      .then(() => {
        Login(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      {isOpen && (
        <div className="flex absolute top-5 right-5 z-50 w-[317px] h-[60px] rounded-2xl border border-Red bg-white gap-2 pt-2 pb-3 px-4">
          <img
            src="/icons/info-circle-red-n.svg"
            alt=""
            className="w-4 h-4 mt-1"
          />
          <div className="text-Text-Primary text-[10px] text-wrap leading-5">
            {message}
          </div>
          <img
            src="/icons/close-black.svg"
            alt=""
            onClick={() => setIsOpen(false)}
            className="w-4 h-4 mt-1 cursor-pointer"
          />
        </div>
      )}
      <div
        onClick={() => {
          handleGoogleLogin();
        }}
        className="w-full h-[29px] flex justify-center gap-1 cursor-pointer items-center border border-Primary-DeepTeal rounded-[20px]"
      >
        <img src="./Google.svg" alt="" />
        <div className="text-Primary-DeepTeal text-xs font-medium">
          {mode == 'login' ? 'Log in' : 'Sign up'} with Google
        </div>
      </div>
    </>
  );
};

export default AuthWithGoogle;
