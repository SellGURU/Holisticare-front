import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import TextField from '../../Components/TextField';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import AdminApi from '../../api/admin';
import { storeAdminToken } from '../../store/adminToken';
import { BeatLoader } from 'react-spinners';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setUsernameError('');
    setPasswordError('');

    if (!username.trim()) {
      setUsernameError('Please enter admin username.');
      return;
    }
    if (!password) {
      setPasswordError('Please enter password.');
      return;
    }

    setLoading(true);
    AdminApi.login(username.trim(), password)
      .then((res) => {
        storeAdminToken(res.data.access_token);
        localStorage.setItem(
          'adminPermissions',
          JSON.stringify(res.data.permission || {}),
        );
        navigate('/admin/marketing');
      })
      .catch((err) => {
        const detail =
          err?.response?.data?.detail || err?.detail || 'Login failed.';
        if (String(detail).toLowerCase().includes('password')) {
          setPasswordError(String(detail));
        } else {
          setUsernameError(String(detail));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout>
      <div className="flex justify-center items-center mb-4">
        <img src="./icons/HolisticareLogo.svg" alt="" />
      </div>
      <div className="text-xl font-medium text-Text-Primary text-center">
        Admin Login
      </div>
      <div className="text-[12px] text-Text-Secondary text-center mt-2">
        Separate dashboard login for admin-only tools.
      </div>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) {
            submit();
          }
        }}
      >
        <TextField
          type="text"
          autoComplete="username"
          label="Admin Username"
          placeholder="Enter admin username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          inValid={!!usernameError}
          errorMessage={usernameError}
        />

        <TextField
          type="password"
          autoComplete="current-password"
          label="Password"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inValid={!!passwordError}
          errorMessage={passwordError}
        />

        <ButtonSecondary
          ClassName="rounded-[20px]"
          onClick={() => {
            if (!loading) {
              submit();
            }
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center w-full min-h-[18px]">
              <BeatLoader size={8} color="white" />
            </div>
          ) : (
            'Log in as admin'
          )}
        </ButtonSecondary>

        <div className="text-[12px] text-center text-Text-Secondary">
          Public users should continue using <span className="font-medium">/login</span>.
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
