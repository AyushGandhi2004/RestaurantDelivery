const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-2',
  xl: 'h-16 w-16 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div
    className={`
      inline-block rounded-full border-gray-200 border-t-brand-600
      animate-spin ${sizes[size]} ${className}
    `}
  />
);

export default Spinner;