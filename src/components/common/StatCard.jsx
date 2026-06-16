const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorClasses = {
    primary: 'bg-black text-white border border-black',
    green: 'bg-yellow-100 text-black border border-black',
    blue: 'bg-white text-black border border-black',
    yellow: 'bg-yellow-50 text-black border border-black',
    red: 'bg-black text-white border border-black',
    purple: 'bg-white text-black border border-black'
  };

  return (
    <div className="stat-card animate-popIn relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-black via-yellow-400 to-black" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/70 font-semibold">{title}</p>
          <p className="text-2xl font-bold text-black mt-2 leading-tight">{value}</p>
          {subtitle && (
            <p className="text-black text-sm mt-2">{subtitle}</p>
          )}
          {trend && (
            <p className="text-sm mt-2 font-medium text-black">
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]} transition-transform duration-200 hover:scale-105 shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
