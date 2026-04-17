import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({
  message = 'Something went wrong',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center
                    justify-center mb-3">
      <AlertCircle size={22} className="text-red-500" />
    </div>
    <p className="text-gray-700 font-medium mb-1">Oops!</p>
    <p className="text-sm text-gray-500 mb-4 max-w-xs">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-sm text-brand-600
                   hover:underline font-medium"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;