const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center
                  py-16 text-center px-4">
    {Icon && (
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center
                      justify-center mb-4">
        <Icon size={32} className="text-gray-300" />
      </div>
    )}
    <p className="font-semibold text-gray-700 mb-1">{title}</p>
    {description && (
      <p className="text-sm text-gray-400 mb-5 max-w-xs">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;