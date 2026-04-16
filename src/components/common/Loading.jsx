import { FiLoader } from 'react-icons/fi';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <FiLoader className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
      {text && <p className="mt-3 text-secondary-500 text-sm">{text}</p>}
    </div>
  );
};

export default Loading;
