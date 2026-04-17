export const isValidEmail = (email) =>
  /^\S+@\S+\.\S+$/.test(email);

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

export const isValidPincode = (pin) =>
  /^\d{6}$/.test(pin);

export const isStrongPassword = (password) =>
  password.length >= 6 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);

export const passwordRules = {
  required: 'Password is required',
  minLength: { value: 6, message: 'At least 6 characters' },
  pattern: {
    value:   /^(?=.*[A-Z])(?=.*[0-9])/,
    message: 'Must include an uppercase letter and a number',
  },
};