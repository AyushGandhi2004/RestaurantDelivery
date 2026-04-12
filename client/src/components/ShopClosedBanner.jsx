import { Clock } from 'lucide-react';

const ShopClosedBanner = ({ settings }) => {
  if (!settings || settings.isOpen) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4
                    flex items-start gap-3 mb-6">
      <Clock className="text-red-500 mt-0.5 shrink-0" size={20} />
      <div>
        <p className="font-semibold text-red-800">We are currently closed</p>
        <p className="text-sm text-red-600 mt-0.5">
          We are open from{' '}
          <span className="font-medium">{settings.openTime}</span>
          {' '}to{' '}
          <span className="font-medium">{settings.closeTime}</span>.
          Please check back later.
        </p>
      </div>
    </div>
  );
};

export default ShopClosedBanner;