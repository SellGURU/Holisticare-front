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
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(
        /[@$!%*?&#]/,
        'Password must contain at least one special character',
      );
  }
  return yup.string();
};

export default YoupValidation;
