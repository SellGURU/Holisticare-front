/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Application from '../../api/app';
import Auth from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks';
const AuthWithGoogle = ({ mode }: { mode: 'login' | 'register' }) => {
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
    Application.LoginWithGooglge(data).then((res) => {
      appContext.login(res.data.access_token, res.data.permission);
      navigate('/');
    });
  };

  const Signup = (data: any) => {
    Auth.signup(undefined, undefined, undefined, data).then(() => {
      Login(data);
    });
  };
  return (
    <>
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
