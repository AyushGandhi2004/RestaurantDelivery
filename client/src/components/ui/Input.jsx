const Input = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-400
        focus:outline-none focus:ring-2 focus:border-transparent
        transition-all duration-200
        ${error
          ? 'border-red-400 focus:ring-red-400'
          : 'border-gray-300 focus:ring-brand-500'
        }
        ${className}
      `}
      {...props}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600">{error}</p>
    )}
  </div>
);

export default Input;