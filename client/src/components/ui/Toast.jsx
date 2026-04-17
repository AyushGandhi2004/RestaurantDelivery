import toast from 'react-hot-toast';

export const showToast = {
  success: (msg) => toast.success(msg, {
    style: { borderRadius: '10px', fontSize: '14px' },
  }),
  error: (msg) => toast.error(msg, {
    style: { borderRadius: '10px', fontSize: '14px' },
    duration: 4000,
  }),
  info: (msg) => toast(msg, {
    style: { borderRadius: '10px', fontSize: '14px' },
    icon: 'ℹ️',
  }),
  loading: (msg) => toast.loading(msg, {
    style: { borderRadius: '10px', fontSize: '14px' },
  }),
};

export default showToast;