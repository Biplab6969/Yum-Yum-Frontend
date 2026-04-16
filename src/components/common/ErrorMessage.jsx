import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-secondary-800 mb-2">Error</h3>
      <p className="text-secondary-500 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
