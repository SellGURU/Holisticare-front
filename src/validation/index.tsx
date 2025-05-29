import * as yup from 'yup';

const YoupValidation = (type: string) => {
  if (type == 'email') {
    return yup
      .string()
      .required('This field is required')
      .email('Invalid email address. Please try again.');
  }
  if (type == 'password') {
    return yup
      .string()
      .required('This field is required')
      .test(
        'password-format',
        'Password must follow the described format.',
        function (value) {
          if (!value) return false;
          const hasMinLength = value.length >= 8;
          const hasLowerCase = /[a-z]/.test(value);
          const hasUpperCase = /[A-Z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[@$!%*?&#]/.test(value);

          return (
            hasMinLength &&
            hasLowerCase &&
            hasUpperCase &&
            hasNumber &&
            hasSpecialChar
          );
        },
      );
  }
  return yup.string();
};

export default YoupValidation;
