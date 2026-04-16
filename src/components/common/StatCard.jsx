const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="stat-card animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-secondary-400 text-sm mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
